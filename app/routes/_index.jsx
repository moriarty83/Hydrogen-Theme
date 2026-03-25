import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {FeaturedCollections} from '~/components/FeaturedCollections/FeaturedCollections';
import {LogoScroller} from '~/components/LogoScroller/LogoScroller';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import {Hero} from '~/components/Hero/Hero';
import {TwoUpBanner} from '~/components/TwoUpBanner/TwoUpBanner';
import {getFeaturedCollections} from '~/lib/shopify';
import {getHeroCarousel, getLogoScroller, getTwoUpBanner} from '~/lib/sanity';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const [featuredCollections, sanityCarousel, twoUpBanner, logoScroller] =
    await Promise.all([
      getFeaturedCollections(context.storefront),
      context.sanity
        ? getHeroCarousel(context.sanity, 'homepage')
        : Promise.resolve(null),
      context.sanity
        ? getTwoUpBanner(context.sanity, 'about-the-artist')
        : Promise.resolve(null),
      context.sanity
        ? getLogoScroller(context.sanity, 'previous-hangings')
        : Promise.resolve(null),
    ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollections,
    heroCarousel: sanityCarousel, // Add it to the returned object
    twoUpBanner,
    logoScroller,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  console.log('data', data);
  return (
    <div className="home">
      <Hero carousel={data.heroCarousel} />
      <TwoUpBanner twoUpBanner={data.twoUpBanner} />
      <LogoScroller logoScroller={data.logoScroller} />
      {data.isShopLinked ? null : <MockShopNotice />}
      <FeaturedCollections collections={data.featuredCollections} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <section
      className="recommended-products"
      aria-labelledby="recommended-products"
    >
      <h2 id="recommended-products">Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </section>
  );
}

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
