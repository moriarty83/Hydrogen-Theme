import {Image} from '@shopify/hydrogen';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useLayoutEffect, useRef} from 'react';
import {Link} from 'react-router';
import {Swiper, SwiperSlide} from 'swiper/react';
import {A11y, Navigation, Pagination} from 'swiper/modules';

import './featuredCollections.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * @param {{
 *   collections: Array<{
 *     id: string;
 *     handle: string;
 *     title?: string | null;
 *     image?: {
 *       id?: string;
 *       url?: string;
 *       altText?: string | null;
 *       width?: number;
 *       height?: number;
 *     } | null;
 *   }>;
 * }}
 */
export function FeaturedCollections({collections}) {
  const rootRef = useRef(null);
  if (!collections?.length) return null;

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.featured-collections__item');

      gsap.fromTo(
        cards,
        {y: 64, opacity: 0},
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, [collections]);

  return (
    <section
      ref={rootRef}
      className="featured-collections"
      aria-label="Featured collections"
      aria-roledescription="carousel"
    >
      <Swiper
        className="featured-collections__swiper"
        modules={[A11y, Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        slidesPerGroup={1}
        navigation
        pagination={{clickable: true}}
        breakpoints={{
          720: {
            slidesPerView: 3,
            slidesPerGroup: 1,
            spaceBetween: 24,
          },
        }}
        a11y={{
          prevSlideMessage: 'Previous collections',
          nextSlideMessage: 'Next collections',
          paginationBulletMessage: 'Go to group {{index}}',
        }}
      >
        {collections.map((collection) => (
          <SwiperSlide key={collection.id}>
            <Link
              className="featured-collections__item"
              to={`/collections/${collection.handle}`}
            >
              <div className="featured-collections__image-wrap">
                {collection.image ? (
                  <Image
                    data={collection.image}
                    sizes="(min-width: 45em) 33vw, 100vw"
                    alt={
                      collection.image.altText ||
                      collection.title ||
                      'Collection'
                    }
                  />
                ) : (
                  <div className="featured-collections__image-placeholder" />
                )}
                <div className="featured-collections__overlay" />
                <h3 className="featured-collections__title">
                  {collection.title}
                </h3>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
