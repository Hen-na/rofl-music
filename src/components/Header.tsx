import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { RollText } from './SplitText';
import { navItems, socialLinks } from '../data/site';
import { useActiveSection } from '../hooks/useActiveSection';
import { createClickCounter } from '../lib/party';
import './Header.css';

const DESKTOP_QUERY = '(min-width: 800px)';

/** Маленький LED-индикатор активного пункта: переезжает между ссылками. */
function NavMeter() {
  return (
    <motion.span
      layoutId="nav-meter"
      className="nav__meter"
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ '--i': i } as CSSProperties} />
      ))}
    </motion.span>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = useActiveSection(navItems.map((item) => item.id));
  const countLogoClick = useMemo(() => createClickCounter(), []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      setIsScrolled(window.scrollY > 24);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => mq.matches && setIsOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('is-locked');
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('is-locked');
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <header className={`header${isScrolled || isOpen ? ' header--solid' : ''}${isOpen ? ' header--open' : ''}`}>
      <div className="container header__inner">
        <a
          className="header__logo"
          href="#top"
          onClick={() => {
            close();
            countLogoClick();
          }}
        >
          <Logo />
        </a>

        <nav className="nav" aria-label="Основная навигация">
          <ul className="nav__list">
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    className={`nav__link${isActive ? ' is-active' : ''}`}
                    href={`#${item.id}`}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    {isActive && <NavMeter />}
                    <RollText text={item.label} />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className={`header__toggle${isOpen ? ' is-open' : ''}`}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className="burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <span className="header__progress" aria-hidden="true">
        <span ref={progressRef} />
      </span>

      <div
        ref={menuRef}
        id="mobile-menu"
        className={`menu${isOpen ? ' menu--open' : ''}`}
        inert={!isOpen}
      >
        <nav aria-label="Мобильная навигация">
          <ol className="menu__list">
            {navItems.map((item, i) => (
              <li key={item.id} style={{ '--i': i } as CSSProperties}>
                <a
                  className={`menu__link${active === item.id ? ' is-active' : ''}`}
                  href={`#${item.id}`}
                  onClick={close}
                >
                  <span className="menu__index" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <ul className="menu__socials" aria-label="Мы в соцсетях">
          {socialLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
