import {Image} from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';

const MODAL_CLOSE_DURATION_MS = 220;

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const closeBtnRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const openerRef = useRef(/** @type {HTMLElement | null} */ (null));

  const openModal = () => {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsModalClosing(false);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalClosing(true);

  useEffect(() => {
    if (!isModalClosing) return;
    const t = window.setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
      openerRef.current?.focus();
    }, MODAL_CLOSE_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [isModalClosing]);

  useEffect(() => {
    if (!isModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isModalOpen]);

  if (!image) {
    return <div className="product-image" />;
  }

  return (
    <div className="product-image">
      <button
        type="button"
        className="product-image__trigger"
        onClick={openModal}
        aria-label="Open full-size product image"
      >
        <div className="product-image__frame">
          <Image
            alt={image.altText || 'Product Image'}
            aspectRatio="1/1"
            data={image}
            key={image.id}
            sizes="(min-width: 45em) 50vw, 100vw"
          />
        </div>
      </button>

      {isModalOpen ? (
        <div
          className={[
            'product-image-modal',
            isModalClosing ? 'is-closing' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="dialog"
          aria-modal="true"
          aria-label="Product image viewer"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="product-image-modal__panel">
            <button
              ref={closeBtnRef}
              type="button"
              className="product-image-modal__close"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            <img
              className="product-image-modal__img"
              src={image.url}
              alt={image.altText || 'Product Image'}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
