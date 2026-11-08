import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Battery, Check, ChevronDown, CircleHelp,
  Cog, Disc3, Droplets, Filter, Heart, Lamp, Minus, Moon, Package, Plus, Search, ShieldCheck,
  LogOut, ShoppingBag, ShoppingCart, SlidersHorizontal, Sparkles, Sun, Trash2, Truck, UserRound, Wrench, X, Zap,
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { origins, type OriginId, type Product } from './data/catalog';
import { fetchProducts, getSupabaseClient, placeOrder } from './lib/supabase';
import type { TranslationKey } from './data/translations';

const queryClient = new QueryClient();
type CartEntry = { id: string; quantity: number };
type CheckoutField = 'name' | 'phone' | 'city' | 'address';
type Toast = { id: number; text: string };

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
};

function price(value: number, language: 'en' | 'ar') {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(value);
}

function ArtIcon({ product, size = 66 }: { product: Product; size?: number }) {
  const shared = { size, strokeWidth: 1.45, color: product.color, 'aria-hidden': true as const };
  if (product.art === 'brake') return <Disc3 {...shared} />;
  if (product.art === 'filter') return <Filter {...shared} />;
  if (product.art === 'battery') return <Battery {...shared} />;
  if (product.art === 'spark') return <Zap {...shared} />;
  if (product.art === 'shock') return <Cog {...shared} />;
  if (product.art === 'lamp') return <Lamp {...shared} />;
  if (product.art === 'belt') return <Wrench {...shared} />;
  return <Droplets {...shared} />;
}

function Storefront() {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogFailed, setCatalogFailed] = useState(false);
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(() => readStorage('jms-favorites', []));
  const [cart, setCart] = useState<CartEntry[]>(() => readStorage('jms-cart', []));
  const [query, setQuery] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [originFilter, setOriginFilter] = useState<OriginId | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [saleOnly, setSaleOnly] = useState(false);
  const [sort, setSort] = useState('featured');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderFailed, setOrderFailed] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authFeedback, setAuthFeedback] = useState('');
  const [authFeedbackIsError, setAuthFeedbackIsError] = useState(false);
  const [form, setForm] = useState<Record<CheckoutField, string>>({ name: '', phone: '', city: '', address: '' });
  const [errors, setErrors] = useState<Partial<Record<CheckoutField, string>>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [finder, setFinder] = useState({ origin: '', brand: '', model: '', year: '' });
  const [mobileSearch, setMobileSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem('jms-favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('jms-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    setCatalogFailed(false);
    fetchProducts()
      .then((loadedProducts) => {
        if (active) setProducts(loadedProducts);
      })
      .catch((error: unknown) => {
        console.error('Could not load the Supabase catalog.', error);
        if (active) setCatalogFailed(true);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => { active = false; };
  }, [catalogRetry]);
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setCurrentUserEmail(session?.user.email ?? null);
        if (session) {
          setAuthOpen(false);
          setAuthFeedback('');
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
      void supabase.auth.getSession()
        .then(({ data: sessionData, error }) => {
          if (!active) return;
          if (error) {
            console.error('Could not restore the Supabase session.', error);
            return;
          }
          setCurrentUserEmail(sessionData.session?.user.email ?? null);
        })
        .catch((error: unknown) => {
          if (active) console.error('Could not restore the Supabase session.', error);
        });
    } catch (error) {
      console.error('Could not initialize Supabase authentication.', error);
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        setModalProduct(null);
        setCheckoutOpen(false);
        setAuthOpen(false);
        setSuggestionsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const notify = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, text }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3000);
  };
  const jumpTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const toggleFavorite = (product: Product) => {
    const exists = favorites.includes(product.id);
    setFavorites((current) => exists ? current.filter((id) => id !== product.id) : [...current, product.id]);
    notify(t(exists ? 'favoriteRemoved' : 'favoriteAdded'));
  };
  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === product.id);
      return existing ? current.map((entry) => entry.id === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { id: product.id, quantity: 1 }];
    });
    notify(t('added'));
    setDrawerOpen(true);
  };
  const changeQuantity = (id: string, delta: number) => setCart((current) => current.map((entry) => entry.id === id ? { ...entry, quantity: Math.max(1, entry.quantity + delta) } : entry));
  const removeFromCart = (id: string) => setCart((current) => current.filter((entry) => entry.id !== id));
  const cartItems = useMemo(() => cart.map((entry) => ({ ...entry, product: products.find((product) => product.id === entry.id) })).filter((entry): entry is CartEntry & { product: Product } => !!entry.product), [cart]);
  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const cartTotal = cartItems.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  const suggestions = useMemo(() => {
    if (query.trim().length < 1) return [];
    const needle = query.toLocaleLowerCase();
    return products.filter((product) => [product.name.en, product.name.ar, product.brand, product.categoryName.en, product.categoryName.ar, ...product.models].some((value) => value.toLocaleLowerCase().includes(needle))).slice(0, 5);
  }, [query]);

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const filtered = products.filter((product) => {
      const matchesQuery = !needle || [product.name.en, product.name.ar, product.brand, product.categoryName.en, product.categoryName.ar, ...product.models].some((value) => value.toLocaleLowerCase().includes(needle));
      const matchesOrigin = originFilter === 'all' || product.origin === originFilter;
      const matchesBrand = brandFilter === 'all' || product.brand === brandFilter;
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesOffer = !saleOnly || product.oldPrice > product.price;
      const matchesPrice = priceFilter === 'all' || (priceFilter === 'under1000' ? product.price < 1000 : priceFilter === '1000to2500' ? product.price >= 1000 && product.price <= 2500 : product.price > 2500);
      const matchesFavorite = !favoritesOnly || favorites.includes(product.id);
      const matchesFinder = !finder.model || (product.models.includes(finder.model) && (!finder.brand || product.brand === finder.brand) && (!finder.origin || product.origin === finder.origin) && (!finder.year || product.years.includes(Number(finder.year))));
      return matchesQuery && matchesOrigin && matchesBrand && matchesCategory && matchesOffer && matchesPrice && matchesFavorite && matchesFinder;
    });
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [query, originFilter, brandFilter, categoryFilter, saleOnly, priceFilter, favoritesOnly, favorites, finder, sort]);

  const clearFilters = () => {
    setOriginFilter('all'); setBrandFilter('all'); setCategoryFilter('all'); setPriceFilter('all');
    setSaleOnly(false); setFavoritesOnly(false); setQuery(''); setFinder({ origin: '', brand: '', model: '', year: '' });
  };
  const runFinder = () => {
    if (!finder.model) {
      notify(t('modelYear'));
      return;
    }
    setFavoritesOnly(false);
    setOriginFilter('all'); setBrandFilter('all'); setCategoryFilter('all'); setSaleOnly(false);
    jumpTo('catalog');
    notify(t('filterApplied'));
  };
  const categoryNames = Array.from(new Map(products.map((product) => [product.category, product.categoryName[language]])).entries());
  const productYears = Array.from(new Set(products.flatMap((product) => product.years))).sort((a, b) => b - a);
  const finderBrands = origins.find((item) => item.id === finder.origin)?.brands ?? origins.flatMap((item) => item.brands);
  const finderModels = Array.from(new Set(products.filter((product) => (!finder.origin || product.origin === finder.origin) && (!finder.brand || product.brand === finder.brand)).flatMap((product) => product.models))).sort();
  const catalogBrands = origins.find((item) => item.id === originFilter)?.brands ?? origins.flatMap((item) => item.brands);

  const applySuggestion = (product: Product) => {
    setQuery(product.name[language]);
    setSuggestionsOpen(false);
    setFavoritesOnly(false);
    jumpTo('catalog');
  };

  const validate = () => {
    const next: Partial<Record<CheckoutField, string>> = {};
    (['name', 'phone', 'city', 'address'] as CheckoutField[]).forEach((field) => {
      if (!form[field].trim()) next[field] = t('required');
    });
    if (form.phone.trim() && !/^[+()\d\s-]{8,18}$/.test(form.phone.trim())) next.phone = t('phoneInvalid');
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setOrderSubmitting(true);
    setOrderFailed(false);
    try {
      await placeOrder({
        customerName: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        language,
        items: cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      });
      setCart([]);
      setCheckoutSuccess(true);
      setErrors({});
    } catch (error) {
      console.error('Could not save the JMS order.', error);
      setOrderFailed(true);
    } finally {
      setOrderSubmitting(false);
    }
  };
  const openAuth = () => {
    setAuthMode('signIn');
    setAuthFeedback('');
    setAuthFeedbackIsError(false);
    setAuthOpen(true);
  };
  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = authEmail.trim();
    if (!email || !authPassword) {
      setAuthFeedback(t('authRequired'));
      setAuthFeedbackIsError(true);
      return;
    }
    if (authPassword.length < 6) {
      setAuthFeedback(t('authPasswordShort'));
      setAuthFeedbackIsError(true);
      return;
    }

    setAuthBusy(true);
    setAuthFeedback('');
    setAuthFeedbackIsError(false);
    try {
      const auth = getSupabaseClient().auth;
      if (authMode === 'signUp') {
        const { data, error } = await auth.signUp({ email, password: authPassword });
        if (error) throw error;
        setAuthPassword('');
        if (data.session) {
          setCurrentUserEmail(data.user?.email ?? email);
          setAuthOpen(false);
        } else {
          setAuthFeedback(t('authConfirmEmail'));
        }
      } else {
        const { data, error } = await auth.signInWithPassword({ email, password: authPassword });
        if (error) throw error;
        setCurrentUserEmail(data.user.email ?? email);
        setAuthPassword('');
        setAuthOpen(false);
      }
    } catch (error) {
      console.error('Supabase authentication failed.', error);
      setAuthFeedback(authMode === 'signUp' ? t('authSignUpError') : t('authSignInError'));
      setAuthFeedbackIsError(true);
    } finally {
      setAuthBusy(false);
    }
  };
  const signOut = async () => {
    setAuthBusy(true);
    try {
      const { error } = await getSupabaseClient().auth.signOut();
      if (error) throw error;
      setCurrentUserEmail(null);
    } catch (error) {
      console.error('Supabase sign out failed.', error);
      notify(t('authSignOutError'));
    } finally {
      setAuthBusy(false);
    }
  };
  const openCheckout = () => {
    setCheckoutSuccess(false);
    setOrderFailed(false);
    setCheckoutOpen(true);
    setDrawerOpen(false);
  };
  const closeCheckout = () => {
    setCheckoutOpen(false);
    if (checkoutSuccess) {
      setForm({ name: '', phone: '', city: '', address: '' });
      setCheckoutSuccess(false);
    }
  };
  const openFavorites = () => { setFavoritesOnly(true); setSaleOnly(false); jumpTo('catalog'); };
  const toggleSearchMobile = () => {
    setMobileSearch((current) => !current);
    window.setTimeout(() => searchRef.current?.focus(), 0);
    jumpTo('top');
  };
  const productTitle = (product: Product) => product.name[language];
  const originLabel = (id: OriginId) => t(id);

  return (
    <div className="page-shell" id="top">
      <div className="top-strip"><div className="container" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', gap: 12 }}><span>{t('announcement')}</span><span>{t('samplePrices')}</span></div></div>
      <header className="site-header">
        <div className="container nav-wrap">
          <a href="#top" className="brandmark" aria-label="JMS home" data-testid="link-jms-home">
            <span className="brand-emblem"><Cog size={23} strokeWidth={2.5} /></span>
            <span><span className="brandmark-word">JMS</span><small style={{ display: 'block', fontSize: 8, fontWeight: 800, color: 'hsl(var(--muted-foreground))', letterSpacing: '.12em', marginTop: 2 }}>{t('tagline')}</small></span>
          </a>
          <nav className="nav-links" aria-label="Main navigation">
            <a href="#top" data-testid="link-nav-home">{t('home')}</a>
            <a href="#origins" data-testid="link-nav-origins">{t('origins')}</a>
            <a href="#catalog" data-testid="link-nav-catalog">{t('catalog')}</a>
            <a href="#offers" data-testid="link-nav-offers">{t('offers')}</a>
          </nav>
          <div className="search-box">
            <Search size={16} />
            <input ref={searchRef} type="search" aria-label={t('search')} placeholder={t('search')} value={query} onChange={(event) => { setQuery(event.target.value); setFavoritesOnly(false); setSuggestionsOpen(true); }} onFocus={() => setSuggestionsOpen(true)} onKeyDown={(event) => { if (event.key === 'Enter') { setSuggestionsOpen(false); jumpTo('catalog'); } }} data-testid="input-product-search" />
            {suggestionsOpen && query && <div className="suggestions" role="listbox" aria-label={t('search')}>
              {suggestions.length ? suggestions.map((product) => <button key={product.id} className="suggestion-item" type="button" onClick={() => applySuggestion(product)} data-testid={`button-search-suggestion-${product.id}`}><span>{productTitle(product)}</span><small>{product.brand}</small></button>) : <div className="suggestion-item">{t('emptyTitle')}</div>}
            </div>}
          </div>
          <div className="nav-actions">
            {currentUserEmail && <span className="account-email" title={currentUserEmail}>{t('signedIn')}: {currentUserEmail}</span>}
            <button type="button" className="auth-trigger" onClick={currentUserEmail ? signOut : openAuth} aria-label={currentUserEmail ? t('signOut') : t('account')} title={currentUserEmail ? currentUserEmail : t('account')} disabled={authBusy} data-testid="button-account">
              {currentUserEmail ? <LogOut size={16} /> : <UserRound size={16} />}<span>{currentUserEmail ? t('signOut') : t('account')}</span>
            </button>
            <button type="button" className="lang-toggle" onClick={toggleLanguage} aria-label="Switch language" data-testid="button-language">{language === 'en' ? 'عربي' : 'English'}</button>
            <button type="button" className="icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} data-testid="button-theme">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button type="button" className="icon-button desktop-action" onClick={openFavorites} aria-label={t('favorites')} data-testid="button-header-favorites"><Heart size={17} />{favorites.length > 0 && <span className="count-dot">{favorites.length}</span>}</button>
            <button type="button" className="icon-button" onClick={() => setDrawerOpen(true)} aria-label={t('cart')} data-testid="button-header-cart"><ShoppingCart size={17} />{cartCount > 0 && <span className="count-dot">{cartCount}</span>}</button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">{t('heroEyebrow')}</div>
            <h1 id="hero-title">{t('heroTitleA')}<br /><span>{t('heroTitleB')}</span></h1>
            <p>{t('heroText')}</p>
            <div className="hero-ctas">
              <button type="button" className="primary-btn" onClick={() => jumpTo('catalog')} data-testid="button-hero-shop">{t('shopParts')} {language === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</button>
              <button type="button" className="secondary-btn" onClick={() => jumpTo('finder')} data-testid="button-hero-finder"><SlidersHorizontal size={15} />{t('findFit')}</button>
            </div>
          </div>
          <div className="hero-art" aria-label="Wheel and automotive part illustration" role="img">
            <div className="hero-wheel" />
            <div className="hero-callout"><ShieldCheck size={19} />{t('reliable')}</div>
          </div>
        </section>
        <div className="trust-row" aria-label="JMS service promises">
          {[
            { icon: <ShieldCheck size={21} />, title: t('reliable'), sub: t('reliableSub') },
            { icon: <Sparkles size={21} />, title: t('fair'), sub: t('fairSub') },
            { icon: <Truck size={21} />, title: t('cod'), sub: t('codSub') },
            { icon: <CircleHelp size={21} />, title: t('help'), sub: t('helpSub') },
          ].map((item, index) => <div className="trust-item" key={item.title} data-testid={`text-service-promise-${index}`}><span className="trust-icon">{item.icon}</span><span><strong>{item.title}</strong><small>{item.sub}</small></span></div>)}
        </div>

        <section id="origins" className="section">
          <div className="section-head"><div><div className="section-kicker">{t('originsKicker')}</div><h2 className="section-title">{t('originsTitle')}</h2><p className="section-subtitle">{t('originsText')}</p></div></div>
          <div className="origin-grid">
            {origins.map((origin) => <button type="button" className={`origin-card ${originFilter === origin.id ? 'selected' : ''}`} key={origin.id} onClick={() => { setOriginFilter(originFilter === origin.id ? 'all' : origin.id); setBrandFilter('all'); setFavoritesOnly(false); jumpTo('catalog'); }} data-testid={`button-origin-${origin.id}`} aria-pressed={originFilter === origin.id}>
              <span className={`origin-icon origin-flag-${origin.id}`} aria-hidden="true"><Cog size={22} /></span>
              <span><strong>{originLabel(origin.nameKey)}</strong><small>{origin.brands.length} {t('makes')}</small></span>
              {language === 'ar' ? <ArrowLeft size={16} className="origin-arrow" /> : <ArrowRight size={16} className="origin-arrow" />}
            </button>)}
          </div>
        </section>

        <section id="finder" className="section">
          <div className="section-head"><div><div className="section-kicker">{t('finderKicker')}</div><h2 className="section-title">{t('finderTitle')}</h2><p className="section-subtitle">{t('finderText')}</p></div></div>
          <div className="finder">
            <label><span className="field-label">{t('origin')}</span><select className="select-field" value={finder.origin} onChange={(event) => setFinder({ origin: event.target.value, brand: '', model: '', year: '' })} data-testid="select-finder-origin"><option value="">{t('chooseOrigin')}</option>{origins.map((item) => <option value={item.id} key={item.id}>{originLabel(item.nameKey)}</option>)}</select></label>
            <label><span className="field-label">{t('brand')}</span><select className="select-field" value={finder.brand} onChange={(event) => setFinder((current) => ({ ...current, brand: event.target.value, model: '', year: '' }))} data-testid="select-finder-brand"><option value="">{t('chooseBrand')}</option>{finderBrands.map((brand) => <option key={brand}>{brand}</option>)}</select></label>
            <label><span className="field-label">{t('model')}</span><select className="select-field" value={finder.model} onChange={(event) => setFinder((current) => ({ ...current, model: event.target.value, year: '' }))} data-testid="select-finder-model"><option value="">{t('chooseModel')}</option>{finderModels.map((model) => <option key={model}>{model}</option>)}</select></label>
            <label><span className="field-label">{t('year')}</span><select className="select-field" value={finder.year} onChange={(event) => setFinder((current) => ({ ...current, year: event.target.value }))} data-testid="select-finder-year"><option value="">{t('chooseYear')}</option>{productYears.map((year) => <option key={year}>{year}</option>)}</select></label>
            <button type="button" className="primary-btn" onClick={runFinder} data-testid="button-finder-submit">{t('showMatches')} {language === 'ar' ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}</button>
          </div>
        </section>

        <section id="catalog" className="section">
          <div className="section-head"><div><div className="section-kicker">{favoritesOnly ? t('favoriteList') : saleOnly ? t('offers') : t('catalogKicker')}</div><h2 className="section-title">{favoritesOnly ? t('favoriteList') : t('catalogTitle')}</h2><p className="section-subtitle">{favoritesOnly ? t('noFavoritesText') : t('catalogText')}</p></div>
            <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }} data-testid="text-product-count">{visibleProducts.length} {t('productsFound')}</span>
          </div>
          <div className="filter-row" aria-label="Catalog filters">
            <button type="button" className={`filter-chip ${!saleOnly && !favoritesOnly ? 'active' : ''}`} onClick={() => { setSaleOnly(false); setFavoritesOnly(false); }} data-testid="button-filter-all">{t('allParts')}</button>
            <button type="button" className={`filter-chip ${saleOnly ? 'active' : ''}`} onClick={() => { setSaleOnly((current) => !current); setFavoritesOnly(false); }} data-testid="button-filter-offers">{t('onOffer')}</button>
            {favorites.length > 0 && <button type="button" className={`filter-chip ${favoritesOnly ? 'active' : ''}`} onClick={() => setFavoritesOnly((current) => !current)} data-testid="button-filter-favorites"><Heart size={13} />{t('favorites')}</button>}
            <label><span className="sr-only">{t('brand')}</span><select className="filter-select" value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} data-testid="select-filter-brand"><option value="all">{t('brand')}: {t('allParts')}</option>{catalogBrands.map((brand) => <option key={brand}>{brand}</option>)}</select></label>
            <label><span className="sr-only">{t('category')}</span><select className="filter-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} data-testid="select-filter-category"><option value="all">{t('allCategories')}</option>{categoryNames.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></label>
            <label><span className="sr-only">{t('priceLow')}</span><select className="filter-select" value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)} data-testid="select-filter-price"><option value="all">{t('sort')}: {t('allParts')}</option><option value="under1000">{language === 'ar' ? 'أقل من ١٬٠٠٠ ج.م' : 'Under 1,000 EGP'}</option><option value="1000to2500">{language === 'ar' ? '١٬٠٠٠–٢٬٥٠٠ ج.م' : '1,000–2,500 EGP'}</option><option value="over2500">{language === 'ar' ? 'أكثر من ٢٬٥٠٠ ج.م' : 'Over 2,500 EGP'}</option></select></label>
            <span className="filter-spacer" />
            <label><span className="sr-only">{t('sort')}</span><select className="filter-select" value={sort} onChange={(event) => setSort(event.target.value)} data-testid="select-sort-products"><option value="featured">{t('featured')}</option><option value="price-asc">{t('priceLow')}</option><option value="price-desc">{t('priceHigh')}</option></select></label>
            {(originFilter !== 'all' || brandFilter !== 'all' || categoryFilter !== 'all' || priceFilter !== 'all' || query || favoritesOnly || finder.model) && <button type="button" className="filter-chip" onClick={clearFilters} data-testid="button-clear-filters">{t('clearFilters')} <X size={12} /></button>}
          </div>
          <div className="product-grid">
            {catalogLoading ? <div className="empty-state" role="status"><div className="empty-state-icon"><Package size={24} /></div><p>{t('catalogLoading')}</p></div>
              : catalogFailed ? <div className="empty-state" role="alert"><div className="empty-state-icon"><Package size={24} /></div><h3>{t('catalogLoadError')}</h3><button type="button" className="primary-btn" onClick={() => setCatalogRetry((attempt) => attempt + 1)}>{t('retry')}</button></div>
              : visibleProducts.length === 0 ? <div className="empty-state">
              <div className="empty-state-icon"><Package size={24} /></div>
              <h3>{favoritesOnly && favorites.length === 0 ? t('noFavorites') : t('emptyTitle')}</h3>
              <p>{favoritesOnly && favorites.length === 0 ? t('noFavoritesText') : t('emptyText')}</p>
              <button type="button" className="primary-btn" onClick={clearFilters} data-testid="button-empty-clear">{t(favoritesOnly ? 'browseParts' : 'clearAll')}</button>
            </div> : visibleProducts.map((product) => {
              const isFavorite = favorites.includes(product.id);
              const discount = Math.round((1 - product.price / product.oldPrice) * 100);
              return <article className="product-card" key={product.id} data-testid={`card-product-${product.id}`}>
                <div className="product-visual" role="img" aria-label={`${productTitle(product)} illustration`} style={{ '--part-color': product.color } as React.CSSProperties}>
                  <span className="origin-badge">{originLabel(product.origin)}</span><span className="discount-badge">-{discount}%</span>
                  <button type="button" className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`} aria-label={isFavorite ? t('favoriteRemoved') : t('favoriteAdded')} aria-pressed={isFavorite} onClick={() => toggleFavorite(product)} data-testid={`button-favorite-${product.id}`}><Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /></button>
                  <ArtIcon product={product} />
                  <button type="button" className="quick-view" onClick={() => setModalProduct(product)} data-testid={`button-quick-view-${product.id}`}>{t('quickView')}</button>
                </div>
                <div className="product-info">
                  <div className="product-brand">{product.brand}</div>
                  <h3 className="product-title" data-testid={`text-product-name-${product.id}`}>{productTitle(product)}</h3>
                  <div className="product-fit">{t('compatible')}: {product.models.slice(0, 2).join(' · ')} · {product.years[0]}–{product.years[product.years.length - 1]}</div>
                  <span className="product-category">{product.categoryName[language]}</span>
                  <div className="product-bottom"><span><span className="price-current" data-testid={`text-product-price-${product.id}`}>{price(product.price, language)}</span> <small className="currency">{t('currency')}</small><span className="price-old">{price(product.oldPrice, language)}</span></span>
                    <button type="button" className="add-btn" aria-label={`${t('addCart')}: ${productTitle(product)}`} onClick={() => addToCart(product)} data-testid={`button-add-cart-${product.id}`}><Plus size={18} /></button>
                  </div>
                </div>
              </article>;
            })}
          </div>
        </section>

        <section id="offers" className="section">
          <div className="offer-banner">
            <div><h2>{t('offerTitle')}</h2><p>{t('offerText')}</p></div>
            <button type="button" className="secondary-btn" onClick={() => { setSaleOnly(true); setFavoritesOnly(false); jumpTo('catalog'); }} data-testid="button-offer-view">{t('viewOffers')} {language === 'ar' ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}</button>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div><a href="#top" className="brandmark" aria-label="JMS home"><span className="brand-emblem"><Cog size={22} /></span><span className="brandmark-word">JMS</span></a><p>{t('footerNote')}</p></div>
            <div className="footer-links"><a href="#catalog">{t('footerShop')}</a><a href="#finder">{t('findFit')}</a><a href="#offers">{t('offers')}</a><a href="#top">{t('support')}</a></div>
          </div>
          <div className="footer-bottom"><span>© JMS Auto Parts · {new Date().getFullYear()}</span><span>{t('samplePrices')}</span></div>
        </div>
      </footer>

      <a className="whatsapp-link" href={`https://wa.me/?text=${encodeURIComponent(t('whatsappMessage'))}`} target="_blank" rel="noreferrer" aria-label={t('helpLink')} title={t('helpLink')} data-testid="link-whatsapp-help"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.3 3.7A11.5 11.5 0 0 0 2.2 17.6L.7 23l5.5-1.4a11.5 11.5 0 0 0 5.5 1.4h.1a11.5 11.5 0 0 0 8.5-19.3Z" stroke="currentColor" strokeWidth="1.7"/><path d="M8.1 7.3c-.2-.5-.5-.5-.8-.5h-.7c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.1 3.4 5.2 4.6 2.6 1 3.1.8 3.7.7.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.7-.4-.4-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.4-.8 1-1 1.2-.2.2-.4.3-.8.1-.4-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.4-.2-.4 0-.6.1-.8.2-.2.4-.5.6-.7.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3Z" fill="currentColor"/></svg></a>
      <button type="button" className="back-top" onClick={() => jumpTo('top')} aria-label={t('backTop')} title={t('backTop')} data-testid="button-back-to-top"><ArrowUp size={18} /></button>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button type="button" className="active" onClick={() => jumpTo('top')} data-testid="button-mobile-home"><Cog size={18} />{t('mobileHome')}</button>
        <button type="button" onClick={() => jumpTo('origins')} data-testid="button-mobile-categories"><Package size={18} />{t('mobileCategories')}</button>
        <button type="button" onClick={toggleSearchMobile} data-testid="button-mobile-search"><Search size={18} />{t('mobileSearch')}</button>
        <button type="button" onClick={() => setDrawerOpen(true)} data-testid="button-mobile-cart"><ShoppingBag size={18} />{t('mobileCart')}{cartCount > 0 && <span className="count-dot">{cartCount}</span>}</button>
        <button type="button" onClick={openFavorites} data-testid="button-mobile-favorites"><Heart size={18} />{t('mobileFavorites')}{favorites.length > 0 && <span className="count-dot">{favorites.length}</span>}</button>
      </nav>

      {drawerOpen && <><button type="button" className="drawer-backdrop" aria-label={t('close')} onClick={() => setDrawerOpen(false)} data-testid="button-cart-backdrop" /><aside className={`side-drawer ${drawerOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="cart-title" data-testid="drawer-cart">
        <div className="drawer-head"><h2 id="cart-title">{t('cartTitle')} {cartCount > 0 && <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>({cartCount})</span>}</h2><button type="button" className="icon-button" onClick={() => setDrawerOpen(false)} aria-label={t('close')} data-testid="button-cart-close"><X size={18} /></button></div>
        <div className="drawer-body">{cartItems.length === 0 ? <div className="empty-state" style={{ padding: '42px 14px' }}><div className="empty-state-icon"><ShoppingCart size={23} /></div><h3>{t('cartEmpty')}</h3><p>{t('cartEmptyText')}</p><button type="button" className="primary-btn" onClick={() => { setDrawerOpen(false); jumpTo('catalog'); }} data-testid="button-cart-browse">{t('browseParts')}</button></div> : cartItems.map(({ product, quantity }) => <div className="cart-line" key={product.id} data-testid={`row-cart-item-${product.id}`}>
          <div className="cart-thumbnail"><ArtIcon product={product} size={28} /></div><div><div className="cart-title">{productTitle(product)}</div><div className="cart-price">{price(product.price, language)} <small className="currency">{t('currency')}</small></div><div className="qty-controls"><button type="button" aria-label="Decrease quantity" onClick={() => changeQuantity(product.id, -1)} data-testid={`button-quantity-minus-${product.id}`}><Minus size={12} /></button><span data-testid={`text-quantity-${product.id}`}>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => changeQuantity(product.id, 1)} data-testid={`button-quantity-plus-${product.id}`}><Plus size={12} /></button></div></div><button type="button" className="remove-btn" aria-label={`${t('remove')} ${productTitle(product)}`} onClick={() => removeFromCart(product.id)} data-testid={`button-remove-cart-${product.id}`}><Trash2 size={16} /></button>
        </div>)}</div>
        {cartItems.length > 0 && <div className="drawer-foot"><div className="subtotal-row"><span>{t('subtotal')}</span><strong>{price(cartTotal, language)} {t('currency')}</strong></div><div className="subtotal-row"><span>{t('delivery')}</span><span style={{ color: 'hsl(var(--muted-foreground))' }}>{t('calculated')}</span></div><div className="subtotal-row total"><span>{t('total')}</span><span>{price(cartTotal, language)} {t('currency')}</span></div><button type="button" className="primary-btn" onClick={openCheckout} data-testid="button-open-checkout">{t('checkout')} {language === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</button></div>}
      </aside></>}

      {modalProduct && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalProduct(null); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="quick-modal-title" data-testid="modal-quick-view">
        <div className="modal-head"><h2 id="quick-modal-title">{t('details')}</h2><button type="button" className="icon-button" onClick={() => setModalProduct(null)} aria-label={t('close')} data-testid="button-quick-view-close"><X size={18} /></button></div>
        <div className="modal-content quick-detail"><div className="quick-detail-art" role="img" aria-label={`${productTitle(modalProduct)} illustration`}><ArtIcon product={modalProduct} size={94} /></div><div><div className="product-brand">{modalProduct.brand} · {originLabel(modalProduct.origin)}</div><h3 style={{ fontSize: 20, margin: '8px 0' }}>{productTitle(modalProduct)}</h3><span className="product-category">{modalProduct.categoryName[language]}</span><ul className="detail-list"><li><strong>{t('compatible')}:</strong> {modalProduct.models.join(', ')}</li><li><strong>{t('years')}:</strong> {modalProduct.years[0]}–{modalProduct.years[modalProduct.years.length - 1]}</li><li><strong>{t('partOrigin')}:</strong> {originLabel(modalProduct.origin)}</li></ul><div style={{ marginBottom: 15 }}><span className="price-current">{price(modalProduct.price, language)}</span> <small className="currency">{t('currency')}</small> <span className="price-old">{price(modalProduct.oldPrice, language)}</span></div><button type="button" className="primary-btn" onClick={() => { addToCart(modalProduct); setModalProduct(null); }} data-testid={`button-quick-add-${modalProduct.id}`}><ShoppingCart size={16} />{t('addCart')}</button></div></div>
      </section></div>}

      {checkoutOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCheckout(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="checkout-title" data-testid="modal-checkout">
        <div className="modal-head"><h2 id="checkout-title">{checkoutSuccess ? t('orderSuccess') : t('checkoutTitle')}</h2><button type="button" className="icon-button" onClick={closeCheckout} aria-label={t('close')} data-testid="button-checkout-close"><X size={18} /></button></div>
        {checkoutSuccess ? <div className="modal-content" style={{ textAlign: 'center', padding: '38px 26px' }}><div className="empty-state-icon"><Check size={26} /></div><h3>{t('orderSuccess')}</h3><p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.7, fontSize: 13 }}>{t('successText')}</p><button type="button" className="primary-btn" onClick={closeCheckout} data-testid="button-order-success-close">{t('continueShopping')}</button></div> : <form className="modal-content" onSubmit={submitOrder} noValidate>
          <div className="checkout-form">
            {(['name', 'phone', 'city', 'address'] as CheckoutField[]).map((field) => <label key={field} className={field === 'address' ? 'full' : ''}><span className="field-label">{t(field)} *</span><input className="text-field" type={field === 'phone' ? 'tel' : 'text'} autoComplete={field === 'name' ? 'name' : field === 'phone' ? 'tel' : field === 'city' ? 'address-level2' : 'street-address'} placeholder={t(`${field}Placeholder` as TranslationKey)} value={form[field]} onChange={(event) => { setForm((current) => ({ ...current, [field]: event.target.value })); setErrors((current) => ({ ...current, [field]: undefined })); }} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `error-${field}` : undefined} data-testid={`input-checkout-${field}`} />{errors[field] && <span className="form-error" id={`error-${field}`} role="alert">{errors[field]}</span>}</label>)}
            <div className="full cod-note"><Truck size={18} /><span><strong>{t('cashOnly')}</strong><br />{t('cashText')}</span></div>
            <div className="checkout-summary full"><strong>{t('orderSummary')}</strong>{cartItems.map(({ product, quantity }) => <div key={product.id} className="checkout-summary-row"><span>{productTitle(product)} × {quantity}</span><span>{price(product.price * quantity, language)} {t('currency')}</span></div>)}<div className="checkout-summary-row" style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 6, paddingTop: 8, fontWeight: 800 }}><span>{t('total')}</span><span>{price(cartTotal, language)} {t('currency')}</span></div></div>
            {orderFailed && <p className="form-error full" role="alert">{t('orderError')}</p>}
            <button type="submit" className="primary-btn full" disabled={orderSubmitting} data-testid="button-submit-order">{orderSubmitting ? t('placingOrder') : t('placeOrder')} {language === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</button>
          </div>
        </form>}
      </section></div>}

      {authOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }}><section className="modal-card auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" data-testid="modal-auth">
        <div className="modal-head"><h2 id="auth-title">{t(authMode === 'signIn' ? 'signIn' : 'signUp')}</h2><button type="button" className="icon-button" onClick={() => setAuthOpen(false)} aria-label={t('close')} data-testid="button-auth-close"><X size={18} /></button></div>
        <form className="modal-content auth-form" onSubmit={submitAuth}>
          <label><span className="field-label">{t('authEmail')}</span><input className="text-field" type="email" autoComplete="email" required maxLength={254} value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} data-testid="input-auth-email" /></label>
          <label><span className="field-label">{t('authPassword')}</span><input className="text-field" type="password" autoComplete={authMode === 'signUp' ? 'new-password' : 'current-password'} required minLength={6} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} aria-describedby="auth-password-hint" data-testid="input-auth-password" /><small id="auth-password-hint" className="auth-hint">{t('authPasswordHint')}</small></label>
          {authFeedback && <p className={`auth-feedback ${authFeedbackIsError ? 'is-error' : ''}`} role={authFeedbackIsError ? 'alert' : 'status'}>{authFeedback}</p>}
          <button type="submit" className="primary-btn full" disabled={authBusy} data-testid="button-auth-submit">{authBusy ? t('authWorking') : t(authMode === 'signIn' ? 'signIn' : 'signUp')}</button>
          <button type="button" className="auth-mode-toggle" disabled={authBusy} onClick={() => { setAuthMode((mode) => mode === 'signIn' ? 'signUp' : 'signIn'); setAuthFeedback(''); setAuthFeedbackIsError(false); }} data-testid="button-auth-mode">{t(authMode === 'signIn' ? 'authSwitchToSignUp' : 'authSwitchToSignIn')}</button>
        </form>
      </section></div>}

      <div className="toast-stack" aria-live="polite" aria-atomic="false">{toasts.map((toast) => <div className="toast-message" key={toast.id} role="status" data-testid="status-toast"><Check size={16} />{toast.text}</div>)}</div>
    </div>
  );
}

function Home() {
  return <LanguageProvider><ThemeProvider><Storefront /></ThemeProvider></LanguageProvider>;
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><Router /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
