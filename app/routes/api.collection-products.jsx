import {getCollectionFeatureData} from '~/lib/shopify';

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const handle = url.searchParams.get('handle')?.trim();
  if (!handle) {
    return Response.json({collection: null, products: []});
  }

  try {
    const payload = await getCollectionFeatureData(context.storefront, handle);
    return Response.json(payload);
  } catch (error) {
    console.error('Collection feature products:', error);
    return Response.json({collection: null, products: []});
  }
}

/** Resource route: JSON only. */
export default function ApiCollectionProducts() {
  return null;
}

/** @typedef {import('./+types/api.collection-products').Route} Route */
