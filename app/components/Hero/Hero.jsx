import {useEffect, useId, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {
  A11y,
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from 'swiper/modules';

import './hero.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

/**
 * @param {{
 *   carousel: {
 *     title?: string | null;
 *     slides?: Array<{
 *       title?: string | null;
 *       copy?: string | null;
 *       cta_text?: string | null;
 *       cta_url?: string | null;
 *       imageUrl?: string | null;
 *     }> | null;
 *   } | null;
 * }}
 */
export function Hero({carousel}) {
  const slides = carousel?.slides?.filter((s) => s?.imageUrl) ?? [];
  if (slides.length === 0) return null;

  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);

  const headingId = useId();
  const label = carousel?.title?.trim() || 'Featured';

  return (
    <section
      className="hero"
      aria-labelledby={headingId}
      aria-roledescription="carousel"
    >
      <h2 id={headingId} className="hero__visually-hidden">
        {label}
      </h2>

      {!client ? (
        <HeroSlide slide={slides[0]} priority />
      ) : (
        <Swiper
          className="hero-swiper"
          modules={[A11y, Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          fadeEffect={{crossFade: true}}
          speed={700}
          slidesPerView={1}
          loop={slides.length > 1}
          autoplay={
            slides.length > 1
              ? {delay: 6500, disableOnInteraction: false}
              : false
          }
          pagination={{clickable: true}}
          navigation
          a11y={{
            prevSlideMessage: 'Previous slide',
            nextSlideMessage: 'Next slide',
            paginationBulletMessage: 'Go to slide {{index}}',
          }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={`${slide.title ?? 'slide'}-${index}`}>
              <HeroSlide slide={slide} priority={index === 0} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}

/**
 * @param {{
 *   slide: {
 *     title?: string | null;
 *     copy?: string | null;
 *     cta_text?: string | null;
 *     cta_url?: string | null;
 *     imageUrl?: string | null;
 *   };
 *   priority?: boolean;
 * }}
 */
function HeroSlide({slide, priority = false}) {
  const alt = slide.title?.trim() || 'Hero image';

  return (
    <div className="hero-slide">
      <div className="hero-slide__media">
        <img
          src={slide.imageUrl}
          alt={alt}
          width={1920}
          height={1080}
          sizes="100vw"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
        />
      </div>
      <div className="hero-slide__overlay">
        <div className="hero-slide__inner">
          {slide.title ? (
            <p className="hero-slide__title">{slide.title}</p>
          ) : null}
          {slide.copy ? <p className="hero-slide__copy">{slide.copy}</p> : null}
          {slide.cta_text && slide.cta_url ? (
            <a className="hero-slide__cta" href={slide.cta_url}>
              {slide.cta_text}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
