import {useLayoutEffect, useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import './twoUpBanner.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * @param {{
 *   twoUpBanner: {
 *     title?: string | null;
 *     "items"?: Array<{
 *       title?: string | null;
 *       subtitle?: string | null;
 *       copy?: string | null;
 *       imageUrl?: string | null;
 *       videoUrl?: string | null;
 *     }> | null;
 *   } | null;
 * }} props
 */
export function TwoUpBanner({twoUpBanner}) {
  const rootRef = useRef(null);
  const items = (twoUpBanner?.items ?? [])
    .filter(
      (item) =>
        item?.imageUrl ||
        item?.videoUrl ||
        item?.title ||
        item?.subtitle ||
        item?.copy,
    )
    .slice(0, 2);

  useLayoutEffect(() => {
    if (!rootRef.current || items.length === 0) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.two-up-banner__item');

      cards.forEach((card) => {
        const media = card.querySelector('img, video');
        const textElements = card.querySelectorAll(
          '.two-up-banner__title, .two-up-banner__subtitle, .two-up-banner__copy',
        );

        if (media) {
          gsap.fromTo(
            media,
            {autoAlpha: 0},
            {
              autoAlpha: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                once: true,
              },
            },
          );
        }

        if (textElements.length > 0) {
          gsap.fromTo(
            textElements,
            {y: 24, autoAlpha: 0},
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.65,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                once: true,
              },
            },
          );
        }
      });
    }, rootRef);

    return () => ctx.revert();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section
      ref={rootRef}
      className="two-up-banner"
      aria-label={twoUpBanner?.title || 'Promotions'}
    >
      {items.map((item, index) => (
        // Supports media cards and text-only cards from the same schema.
        <article
          className={`two-up-banner__item ${
            item.videoUrl || item.imageUrl
              ? 'two-up-banner__item--media'
              : 'two-up-banner__item--text-only'
          }`}
          key={`${item.title ?? 'item'}-${index}`}
        >
          {item.videoUrl ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              aria-label={item.title?.trim() || 'Banner video'}
            >
              <source src={item.videoUrl} />
            </video>
          ) : null}

          {!item.videoUrl && item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title?.trim() || 'Banner image'}
              width={960}
              height={640}
              loading="lazy"
              decoding="async"
            />
          ) : null}

          <div className="two-up-banner__content">
            {item.title ? (
              <h3 className="two-up-banner__title">{item.title}</h3>
            ) : null}
            {item.subtitle ? (
              <p className="two-up-banner__subtitle">{item.subtitle}</p>
            ) : null}
            {item.copy ? (
              <p className="two-up-banner__copy">{item.copy}</p>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
