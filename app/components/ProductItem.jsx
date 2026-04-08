import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 *   preserveImageAspectRatio?: boolean;
 *   imageContainerClassName?: string;
 * }}
 */
export function ProductItem({
  product,
  loading,
  preserveImageAspectRatio = false,
  imageContainerClassName,
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const aspectRatio =
    preserveImageAspectRatio && image?.width && image?.height
      ? `${image.width}/${image.height}`
      : '1/1';
  const imageEl = image ? (
    <Image
      alt={image.altText || product.title}
      aspectRatio={aspectRatio}
      data={image}
      loading={loading}
      sizes="(min-width: 45em) 400px, 100vw"
      style={
        preserveImageAspectRatio
          ? {width: 'auto', maxWidth: 'calc(100% - 12px)'}
          : undefined
      }
    />
  ) : null;
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {image &&
        (imageContainerClassName ? (
          <div className={imageContainerClassName}>{imageEl}</div>
        ) : (
          imageEl
        ))}
      <h4>{product.title}</h4>
      <small>
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
