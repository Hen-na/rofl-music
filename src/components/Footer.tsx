import { ArrowUp } from 'lucide-react';
import { Logo } from './Logo';
import { navItems, site, socialLinks } from '../data/site';
import './Footer.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <a className="footer__logo" href="#top" aria-label={`${site.name} — наверх`}>
          <Logo />
        </a>

        <nav aria-label="Навигация в подвале">
          <ul className="footer__list">
            {navItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="footer__list" aria-label="Соцсети">
          {socialLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="footer__bottom">
          <p>
            © {year} {site.name}
          </p>
          <a className="footer__top" href="#top">
            наверх <ArrowUp aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
