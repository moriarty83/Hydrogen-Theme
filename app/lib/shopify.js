const COLLECTION_FEATURE_PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment CollectionFeatureMoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionFeatureProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...CollectionFeatureMoneyProductItem
      }
      maxVariantPrice {
        ...CollectionFeatureMoneyProductItem
      }
    }
  }
`;

const COLLECTION_FEATURE_QUERY = `#graphql
  ${COLLECTION_FEATURE_PRODUCT_ITEM_FRAGMENT}
  query CollectionFeature(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      image {
        id
        url
        altText
        width
        height
      }
      products(first: 8) {
        nodes {
          ...CollectionFeatureProductItem
        }
      }
    }
  }
`;

const FEATURED_COLLECTIONS_QUERY = `#graphql
  query FeaturedCollections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
    $namespace: String!
    $key: String!
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        description
        image {
          id
          url
          altText
          width
          height
        }
        metafield(namespace: $namespace, key: $key) {
          value
          type
        }
      }
    }
  }
`;

/**
 * Returns collections where metafield `collection.featured` is true.
 * @param {import('@shopify/hydrogen').Storefront} storefront
 * @param {{first?: number, namespace?: string, key?: string}} [options]
 */
export async function getFeaturedCollections(storefront, options = {}) {
  const {first = 50, namespace = 'collection', key = 'featured'} = options;

  const data = await storefront.query(FEATURED_COLLECTIONS_QUERY, {
    variables: {first, namespace, key},
  });

  const collections = data?.collections?.nodes ?? [];
  return collections.filter((collection) => {
    const raw = collection?.metafield?.value;
    if (typeof raw !== 'string') return false;
    const normalized = raw.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  });
}

/**
 * Collection metadata + up to 8 products for CollectionFeature (banner + carousel).
 * @param {import('@shopify/hydrogen').Storefront} storefront
 * @param {string} handle Collection handle
 * @returns {Promise<{ collection: { handle: string; title: string; image: unknown } | null; products: unknown[] }>}
 */
export async function getCollectionFeatureData(storefront, handle) {
  const data = await storefront.query(COLLECTION_FEATURE_QUERY, {
    variables: {handle},
  });
  const node = data?.collection;
  if (!node?.handle) {
    return {collection: null, products: []};
  }

  return {
    collection: {
      handle: node.handle,
      title: node.title ?? '',
      image: node.image ?? null,
    },
    products: node.products?.nodes ?? [],
  };
}
