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
