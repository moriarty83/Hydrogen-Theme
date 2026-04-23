import {useEffect, useId} from 'react';
import {Link, useFetcher} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Swiper, SwiperSlide} from 'swiper/react';
import {A11y, Navigation, Pagination} from 'swiper/modules';

import {ProductItem} from '~/components/ProductItem';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './collectionFeature.css';

/**
 * @param {{
 *   collectionHandle?: string | null | undefined;
 *   subheading?: string | null;
 *   data?: {
 *     collection: {
 *       handle: string;
 *       title: string;
 *       image?: import('storefrontapi.generated').Image | null;
 *     } | null;
 *     products: import('storefrontapi.generated').ProductItemFragment[];
 *   } | null;
 * }} props
 */
export function CollectionFeature({
  collectionHandle,
  subheading = 'Featured collection',
  data: serverData,
}) {
  const fetcher = useFetcher();
  const handle =
    typeof collectionHandle === 'string' ? collectionHandle.trim() : '';

  const navId = useId().replace(/:/g, '');
  const prevNavId = `cf-nav-prev-${navId}`;
  const nextNavId = `cf-nav-next-${navId}`;

  useEffect(() => {
    if (serverData != null || !handle) return;
    const qs = new URLSearchParams({handle});
    fetcher.load(`/api/collection-products?${qs.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when handle changes
  }, [handle, serverData]);

  const payload = serverData ?? fetcher.data;
  const collection = payload?.collection;
  const products = payload?.products;

  if (collection == null || products == null) return null;

  if (products.length === 0) return null;

  const loading =
    serverData == null && fetcher.state === 'loading' && !fetcher.data;
  const settled =
    serverData != null ||
    (fetcher.state === 'idle' && fetcher.data !== undefined);

  const titleBase = (collection?.title ?? '').trim();
  const title = titleBase ? `${titleBase} Collection` : 'Collection';
  const collectionUrl = `/collections/${collection?.handle ?? handle}`;
  const headingId = `collection-feature-${(
    collection?.handle ??
    handle ??
    'section'
  ).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  return (
    <div className="collection-feature-block">
      <section className="collection-feature" aria-labelledby={headingId}>
        <div className="collection-feature__media">
          {collection ? (
            <Link
              className="collection-feature__media-link"
              to={collectionUrl}
              aria-label={`View ${title} collection`}
            >
              {loading ? (
                <div
                  className="collection-feature__media-placeholder"
                  aria-hidden
                />
              ) : collection?.image?.url ? (
                <Image
                  data={collection.image}
                  sizes="100vw"
                  alt={collection.image.altText || title}
                />
              ) : (
                <div
                  className="collection-feature__media-placeholder"
                  aria-hidden
                />
              )}
            </Link>
          ) : (
            <div
              className="collection-feature__media-placeholder"
              aria-hidden
            />
          )}
        </div>

        <div className="collection-feature__aside">
          <div className="collection-feature__heading-group">
            <p className="collection-feature__subheading">{subheading}</p>
            {collection ? (
              <h2 id={headingId} className="collection-feature__title">
                <Link
                  className="collection-feature__title-link"
                  to={collectionUrl}
                >
                  {loading ? '…' : title}
                </Link>
              </h2>
            ) : (
              <h2 id={headingId} className="collection-feature__title">
                Collection
              </h2>
            )}
          </div>

          <div className="collection-feature__content">
            {loading ? (
              <p className="collection-feature__loading">Loading products…</p>
            ) : null}

            {collection ? (
              <div className="collection-feature__carousel">
                <button
                  type="button"
                  id={prevNavId}
                  className="swiper-button-prev"
                  aria-label="Previous products"
                />
                <button
                  type="button"
                  id={nextNavId}
                  className="swiper-button-next"
                  aria-label="Next products"
                />
                <Swiper
                  className="collection-feature__swiper"
                  modules={[A11y, Navigation, Pagination]}
                  spaceBetween={16}
                  slidesPerView={1}
                  loop={products.length > 1}
                  navigation={{
                    prevEl: `#${prevNavId}`,
                    nextEl: `#${nextNavId}`,
                  }}
                  pagination={{clickable: true}}
                  breakpoints={{
                    480: {slidesPerView: 1, spaceBetween: 16},
                    720: {slidesPerView: 1, spaceBetween: 16},
                    960: {slidesPerView: 1, spaceBetween: 16},
                  }}
                  a11y={{
                    prevSlideMessage: 'Previous products',
                    nextSlideMessage: 'Next products',
                    paginationBulletMessage: 'Go to slide {{index}}',
                  }}
                >
                  {products.map((product, index) => (
                    <SwiperSlide key={product.id}>
                      <ProductItem
                        product={product}
                        preserveImageAspectRatio
                        imageContainerClassName="collection-feature__product-image"
                        loading={index < 2 ? 'eager' : undefined}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : null}

            {!collection && !loading ? (
              <p className="collection-feature__empty">
                {handle && !settled
                  ? 'Loading collection…'
                  : !handle
                    ? 'Connect a primary collection on this product to show items here.'
                    : 'No collection found for that handle.'}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
