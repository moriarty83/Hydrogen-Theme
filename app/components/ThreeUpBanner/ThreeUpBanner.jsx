import {useLayoutEffect, useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

import './threeUpBanner.css';

/**
 * @param {{
 *   threeUpBanner: {
 *     headline?: string | null;
 *     subheadline?: string | null;
 *     sections?: Array<{
 *       heading?: string | null;
 *       subheading?: string | null;
 *       imageUrl?: string | null;
 *       image?: {asset?: {url?: string | null} | null} | null;
 *     }> | null;
 *     cta?: {text?: string | null; url?: string | null} | null;
 *   } | null;
 * }} props
 */
export function ThreeUpBanner({threeUpBanner}) {
  const rootRef = useRef(null);
  const sections = (threeUpBanner?.sections ?? []).slice(0, 3);
  if (!sections.length) return null;

  useLayoutEffect(() => {
    if (!rootRef.current || !sections.length) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.three-up-banner__section');

      if (!cards.length) return;

      gsap.fromTo(
        cards,
        {y: 64, opacity: 0},
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
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
  }, [sections.length]);

  return (
    <section
      ref={rootRef}
      className="three-up-banner"
      aria-label={threeUpBanner?.headline || 'Three up banner'}
    >
      {threeUpBanner?.headline || threeUpBanner?.subheadline ? (
        <header className="three-up-banner__header">
          {threeUpBanner?.headline ? (
            <h2 className="three-up-banner__headline">
              {threeUpBanner.headline}
            </h2>
          ) : null}
          {threeUpBanner?.subheadline ? (
            <p className="three-up-banner__subheadline">
              {threeUpBanner.subheadline}
            </p>
          ) : null}
        </header>
      ) : null}

      <div className="three-up-banner__sections">
        {sections.map((section, index) => {
          const imageUrl =
            section?.imageUrl ?? section?.image?.asset?.url ?? null;

          return (
            <article
              className="three-up-banner__section"
              key={`${section.heading ?? 'section'}-${index}`}
            >
              {section?.heading ? (
                <p className="three-up-banner__heading">{section.heading}</p>
              ) : null}
              <div className="three-up-banner__media">
                <div className="three-up-banner__image-wrap">
                  <div className="three-up-banner__image-clip">
                    {imageUrl ? (
                      <img
                        className={`three-up-banner__image ${
                          typeof imageUrl === 'string' &&
                          imageUrl.toLowerCase().includes('.svg')
                            ? 'three-up-banner__image--svg'
                            : ''
                        }`}
                        src={imageUrl}
                        alt={section?.heading?.trim() || 'Section image'}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="three-up-banner__image three-up-banner__image--placeholder" />
                    )}
                  </div>

                  {section?.subheading ? (
                    <div
                      className="three-up-banner__sub-overlay"
                      aria-hidden="true"
                    >
                      <p className="three-up-banner__subheading">
                        {section.subheading}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {threeUpBanner?.cta?.text && threeUpBanner?.cta?.url ? (
        <div className="three-up-banner__cta-wrap">
          <a className="three-up-banner__cta" href={threeUpBanner.cta.url}>
            {threeUpBanner.cta.text}
          </a>
        </div>
      ) : null}
    </section>
  );
}
