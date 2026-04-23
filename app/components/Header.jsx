import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {SearchForm} from '~/components/SearchForm';
import accountIcon from '~/assets/header/account-icon.svg';
import searchIcon from '~/assets/header/search-icon.svg';
import cartIcon from '~/assets/header/cart-icon.svg';
import menuIcon from '~/assets/header/menu-icon.svg';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {menu} = header;
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" className="header-logo" end>
        <span className="header-logo__title text-accent">Watercolors</span>
        <span className="header-logo__subtitle">by Kathy Greve</span>
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas cart={cart} />
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <>
          <div className="header-menu-search">
            <SearchForm onSubmit={close}>
              {({inputRef}) => (
                <>
                  <input
                    name="q"
                    placeholder="Search…"
                    ref={inputRef}
                    type="search"
                  />
                  <button type="submit">Search</button>
                </>
              )}
            </SearchForm>
          </div>
        </>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
      {viewport === 'mobile' ? (
        <>
          <div className="header-menu-divider" aria-hidden="true" />
          <NavLink
            className="header-menu-item header-menu-accountLink"
            onClick={close}
            prefetch="intent"
            to="/account"
          >
            Account
          </NavLink>
        </>
      ) : null}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function HeaderCtas({cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink
        aria-label="Account"
        className="header-cta-link header-cta-iconLink header-cta--desktopOnly"
        prefetch="intent"
        to="/account"
      >
        <span className="header-cta-iconWrap" aria-hidden="true">
          <img className="header-cta-icon" src={accountIcon} alt="" />
        </span>
        <span className="header-cta-label">Account</span>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open, close, type} = useAside();
  const isOpen = type === 'mobile';
  return (
    <button
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className={`header-menu-mobile-toggle header-cta--menu reset${
        isOpen ? ' is-active' : ''
      }`}
      onClick={() => (isOpen ? close() : open('mobile'))}
    >
      <span className="header-cta-iconWrap" aria-hidden="true">
        <img className="header-cta-icon" src={menuIcon} alt="" />
      </span>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      aria-label="Search"
      className="header-cta-link header-cta-iconLink header-cta--desktopOnly reset"
      type="button"
      onClick={() => open('search')}
    >
      <span className="header-cta-iconWrap" aria-hidden="true">
        <img className="header-cta-icon" src={searchIcon} alt="" />
      </span>
      <span className="header-cta-label">Search</span>
    </button>
  );
}

/**
 * @param {{count: number}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      aria-label={`Cart (items: ${count})`}
      className="header-cta-link header-cta-iconLink header-cta--cart"
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <span className="header-cta-iconWrap" aria-hidden="true">
        <img className="header-cta-icon" src={cartIcon} alt="" />
        {count > 0 ? (
          <span className="header-cta-badge" aria-hidden="true">
            {count}
          </span>
        ) : null}
      </span>
      <span className="header-cta-label">Cart</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
