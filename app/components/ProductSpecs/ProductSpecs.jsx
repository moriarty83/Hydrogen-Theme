import './productSpecs.css';
import dimensionsIcon from '~/assets/product/dimensions-icon.svg';
import supportIcon from '~/assets/product/support-icon.svg';
import mediaIcon from '~/assets/product/media-icon.svg';

/**
 * @param {{
 *   product: {
 *     dimensions?: {value?: string | null} | null;
 *     support?: {value?: string | null} | null;
 *     media?: {value?: string | null} | null;
 *   } | null;
 * }}
 */
export function ProductSpecs({product}) {
  const dimensions = product?.dimensions?.value?.trim();
  const support = product?.support?.value?.trim();
  const media = product?.media?.value?.trim();
  if (!dimensions && !support && !media) return null;

  return (
    <section className="product-specs" aria-label="Product specifications">
      <div className="product-specs__list">
        {media ? (
          <div className="product-specs__item" aria-label="Media">
            <img
              className="product-specs__icon"
              src={mediaIcon}
              alt=""
              aria-hidden="true"
            />
            <span>{media}</span>
          </div>
        ) : null}

        {support ? (
          <div className="product-specs__item" aria-label="Support">
            <img
              className="product-specs__icon"
              src={supportIcon}
              alt=""
              aria-hidden="true"
            />
            <span>{support}</span>
          </div>
        ) : null}

        {dimensions ? (
          <div className="product-specs__item" aria-label="Dimensions">
            <img
              className="product-specs__icon"
              src={dimensionsIcon}
              alt=""
              aria-hidden="true"
            />
            <span>{dimensions}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
