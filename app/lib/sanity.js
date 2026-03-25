export const HERO_CAROUSEL_QUERY = `
  *[_type == "hero_carousel" && slug.current == $slug][0]{
    title,
    "slides": slides[]->{
      title,
      copy,
      cta_text,
      cta_url,
      "imageUrl": image.asset->url
    }
  }
`;

export const TWO_UP_BANNER_QUERY = `
  *[_type == "two_up_banner" && slug.current == $slug][0]{
    title,
    "items": [
      {
        "title": left.heading,
        "subtitle": left.subheading,
        "copy": left.text,
        "imageUrl": left.media[_type == "image"][0].asset->url,
        "videoUrl": left.media[_type == "file"][0].asset->url
      },
      {
        "title": right.heading,
        "subtitle": right.subheading,
        "copy": right.text,
        "imageUrl": right.media[_type == "image"][0].asset->url,
        "videoUrl": right.media[_type == "file"][0].asset->url
      }
    ]
  }
`;

export const LOGO_SCROLLER_QUERY = `
  *[_type == "logo_scroller" && slug.current == $slug][0]{
    title,
    heading,
    subheading,
    showLogoTitles,
    "logos": logos[]{
      _key,
      title,
      "imageUrl": image.asset->url
    }
  }
`;

/**
 * Fetch a carousel by its slug
 * @param {Object} sanity - The sanity context from the loader
 * @param {string} slug - The slug string (e.g., 'homepage-hero')
 * @returns {Promise<object|null>} Carousel document or null if missing or on query failure
 */
export async function getHeroCarousel(sanity, slug) {
  try {
    return await sanity.query(HERO_CAROUSEL_QUERY, {slug});
  } catch (error) {
    console.error('[getHeroCarousel]', {slug, error});
    return null;
  }
}

/**
 * Fetch a two-up banner by slug
 * @param {Object} sanity - The sanity context from the loader
 * @param {string} slug - The slug string (e.g., 'homepage')
 * @returns {Promise<object|null>} Banner document or null on query failure
 */
export async function getTwoUpBanner(sanity, slug) {
  try {
    if (sanity?.client?.fetch) {
      return (await sanity.client.fetch(TWO_UP_BANNER_QUERY, {slug})) ?? null;
    }

    return (await sanity.query(TWO_UP_BANNER_QUERY, {slug})) ?? null;
  } catch (error) {
    console.error('[getTwoUpBanner]', {slug, error});
    return null;
  }
}

/**
 * Fetch a logo scroller by slug
 * @param {Object} sanity - The sanity context from the loader
 * @param {string} slug - The slug string (e.g., 'homepage-logos')
 * @returns {Promise<object|null>} Logo scroller document or null on query failure
 */
export async function getLogoScroller(sanity, slug) {
  try {
    if (sanity?.client?.fetch) {
      return (await sanity.client.fetch(LOGO_SCROLLER_QUERY, {slug})) ?? null;
    }

    return (await sanity.query(LOGO_SCROLLER_QUERY, {slug})) ?? null;
  } catch (error) {
    console.error('[getLogoScroller]', {slug, error});
    return null;
  }
}
