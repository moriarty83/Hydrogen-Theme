import {Link} from 'react-router';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import {
  buildLookbookCarouselSlides,
  lookbookPlacementToGridStyle,
} from './lookbook.js';
import './lookbook.css';

/** @typedef {Record<string, string | number>} CSSProperties */

/**
 * @param {{imageUrl?: string, alt?: string} | null} image
 * @param {string} heading
 * @param {boolean} eager
 */
function LookbookImg({image, heading, eager}) {
  if (!image?.imageUrl) {
    return <div className="lookbook-slide__cell-placeholder" />;
  }

  return (
    <img
      src={image.imageUrl}
      alt={image.alt ?? heading}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

/**
 * @param {any} imageLike
 * @returns {{imageUrl?: string, alt?: string} | null}
 */
function normalizeLookbookImage(imageLike) {
  if (!imageLike) return null;
  if (typeof imageLike === 'string') return {imageUrl: imageLike};

  if (typeof imageLike.imageUrl === 'string')
    return {imageUrl: imageLike.imageUrl, alt: imageLike.alt};

  const url = imageLike?.asset?.url ?? imageLike?.image?.asset?.url;
  if (typeof url === 'string')
    return {imageUrl: url, alt: imageLike.title ?? imageLike.alt};

  if (imageLike?.url && imageLike?.alt)
    return {imageUrl: imageLike.url, alt: imageLike.alt};

  return null;
}

/** @param {string} str */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** @param {number} seed */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @type {CSSProperties} */
const SOLO_CELL_STYLE = {gridColumn: '1 / 5', gridRow: '1 / 2'};

/**
 * @param {string} heading
 * @param {import('./lookbook.js').LookbookCarouselSlide} slide
 */
function lookbookSlideKey(heading, slide) {
  if (slide.type === 'solo') {
    const u =
      slide.image &&
      typeof slide.image === 'object' &&
      'imageUrl' in slide.image &&
      typeof slide.image.imageUrl === 'string'
        ? slide.image.imageUrl
        : '';
    return `${heading}-solo-${u}`;
  }

  const sig = slide.placements
    .map((p) => {
      const u =
        p.image &&
        typeof p.image === 'object' &&
        'imageUrl' in p.image &&
        typeof p.image.imageUrl === 'string'
          ? p.image.imageUrl
          : '';
      return `${p.row},${p.col},${p.shape.id},${u}`;
    })
    .join('|');

  return `${heading}-grid-${hashString(sig)}`;
}

/**
 * @param {({imageUrl?: string, alt?: string} | null)} image
 * @param {string} heading
 * @param {boolean} eagerTop
 */
function renderSoloSlide(image, heading, eagerTop) {
  return (
    <div className="lookbook-slide__cell" style={SOLO_CELL_STYLE}>
      <LookbookImg image={image} heading={heading} eager={eagerTop} />
    </div>
  );
}

/**
 * @param {Extract<import('./lookbook.js').LookbookCarouselSlide, {type: 'grid'}>} slide
 * @param {string} heading
 * @param {boolean} eagerTop
 */
function renderGridSlide(slide, heading, eagerTop) {
  const {placements, occupied} = slide;
  const nodes = [];
  let key = 0;
  let eagerBudget = eagerTop ? 4 : 0;

  const nextEager = () => {
    if (eagerBudget <= 0) return false;
    eagerBudget--;
    return true;
  };

  for (const p of placements) {
    const style = lookbookPlacementToGridStyle({
      row: p.row,
      col: p.col,
      rowSpan: p.shape.rowSpan,
      colSpan: p.shape.colSpan,
    });
    const image = /** @type {{imageUrl?: string, alt?: string} | null} */ (
      p.image
    );

    nodes.push(
      <div key={`c-${key++}`} className="lookbook-slide__cell" style={style}>
        <LookbookImg image={image} heading={heading} eager={nextEager()} />
      </div>,
    );
  }

  for (let row = 0; row < occupied.length; row++) {
    const rowOcc = occupied[row];
    if (!rowOcc) continue;
    for (let col = 0; col < rowOcc.length; col++) {
      if (rowOcc[col]) continue;
      const style = lookbookPlacementToGridStyle({
        row,
        col,
        rowSpan: 1,
        colSpan: 1,
      });
      nodes.push(
        <div
          key={`e-${row}-${col}`}
          className="lookbook-slide__cell lookbook-slide__cell--empty"
          style={style}
          aria-hidden
        />,
      );
    }
  }

  return nodes;
}

/**
 * @param {{
 *   lookbook: {
 *     title?: string | null;
 *     headline?: string | null;
 *     subheadline?: string | null;
 *     images?: any[] | null;
 *     cta?: {text?: string | null; url?: string | null} | null;
 *   } | null;
 *   layoutShuffleSeed?: string | null;
 * }} props
 */
export function Lookbook({lookbook, layoutShuffleSeed}) {
  const imagesRaw = lookbook?.images ?? [];
  const images = (imagesRaw ?? []).map(normalizeLookbookImage).filter(Boolean);

  if (!images.length) return null;

  const heading = lookbook?.headline ?? lookbook?.title ?? 'Lookbook';
  const seedString = `${layoutShuffleSeed ?? ''}\n${heading}\n${images.map((i) => i?.imageUrl ?? '').join('\0')}`;
  const baseSeed = hashString(seedString);

  const slides = buildLookbookCarouselSlides(images, {
    rngForSlide: (slideIndex) =>
      mulberry32((baseSeed ^ hashString(`lb-grid:${slideIndex}`)) >>> 0),
  });

  if (!slides.length) return null;

  return (
    <section className="lookbook" aria-label={heading}>
      <header className="lookbook__header">
        <h2 className="lookbook__title">{heading}</h2>
        {lookbook?.subheadline ? (
          <p className="lookbook__subheadline">{lookbook.subheadline}</p>
        ) : null}
      </header>

      <Swiper
        className="lookbook__swiper"
        modules={[Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        navigation
        pagination={{clickable: true}}
        loop={slides.length > 1}
      >
        {slides.map((slide, slideIndex) => {
          const isSolo = slide.type === 'solo';
          return (
            <SwiperSlide
              key={lookbookSlideKey(heading, slide)}
              className={[
                'lookbook-slide',
                isSolo ? 'lookbook-slide--solo' : '',
                isSolo ? '' : 'lookbook-slide--randomGrid',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isSolo
                ? renderSoloSlide(
                    /** @type {{imageUrl?: string, alt?: string} | null} */ (
                      slide.image
                    ),
                    heading,
                    slideIndex === 0,
                  )
                : renderGridSlide(slide, heading, slideIndex === 0)}
            </SwiperSlide>
          );
        })}
      </Swiper>

      {lookbook?.cta?.text && lookbook?.cta?.url ? (
        <div className="lookbook__cta-wrap">
          {/^https?:\/\//i.test(lookbook.cta.url) ? (
            <a className="lookbook__cta" href={lookbook.cta.url}>
              {lookbook.cta.text}
            </a>
          ) : (
            <Link className="lookbook__cta" to={lookbook.cta.url}>
              {lookbook.cta.text}
            </Link>
          )}
        </div>
      ) : null}
    </section>
  );
}
