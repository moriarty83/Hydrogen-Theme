import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';

/**
 * Export a fetch handler in module format.
 */
export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} executionContext
   * @return {Promise<Response>}
   */
  async fetch(request, env, executionContext) {
    try {
      const sanityOptions = env.SANITY_PROJECT_ID
        ? {
            client: {
              projectId: env.SANITY_PROJECT_ID,
              dataset: env.SANITY_DATASET || 'production',
              apiVersion: 'v2024-03-01',
              useCdn: process.env.NODE_ENV === 'production',
            },
          }
        : undefined;

      const hydrogenContext = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
        sanityOptions,
      );

      /**
       * Create a Hydrogen request handler that internally
       * delegates to React Router for routing and rendering.
       * `getLoadContext` must return the Hydrogen router context instance — do not spread it into a
       * plain object (middleware requires a `RouterContextProvider` instance).
       */
      const handleRequest = createRequestHandler({
        build: serverBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      const response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        return storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
