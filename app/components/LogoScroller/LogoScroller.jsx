import {useEffect, useMemo, useState} from 'react';

import './logoScroller.css';

const DESKTOP_BREAKPOINT = 720;

/**
 * @param {{
 *   logoScroller: {
 *     title?: string | null;
 *     logos?: Array<{
 *       _id?: string;
 *       title?: string | null;
 *       imageUrl?: string | null;
 *     }> | null;
 *   } | null;
 * }} props
 */
export function LogoScroller({logoScroller}) {
  const logos = (logoScroller?.logos ?? []).filter((logo) => logo?.imageUrl);
  const showLogoTitles = Boolean(logoScroller?.showLogoTitles);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT - 1}px)`);
    const sync = () => setIsMobile(media.matches);
    sync();

    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const shouldScroll = isMobile ? logos.length > 2 : logos.length > 4;
  const renderedLogos = useMemo(
    () => (shouldScroll ? [...logos, ...logos] : logos),
    [logos, shouldScroll],
  );

  if (!logos.length) return null;

  return (
    <section className="logo-scroller" aria-label={logoScroller?.title || 'Logo scroller'}>
      {logoScroller?.title ? (
        <h2 className="logo-scroller__title">{logoScroller.title}</h2>
      ) : null}

      <div
        className={`logo-scroller__viewport ${shouldScroll ? 'is-scrolling' : ''}`}
      >
        <ul className="logo-scroller__track">
          {renderedLogos.map((logo, index) => (
            <li
              className="logo-scroller__item"
              key={`${logo._id || logo.title || 'logo'}-${index}`}
            >
              <img
                src={logo.imageUrl}
                alt={logo.title?.trim() || 'Brand logo'}
                width={220}
                height={120}
                loading="lazy"
                decoding="async"
              />
              {showLogoTitles && logo.title ? (
                <p className="logo-scroller__logo-title">{logo.title}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

