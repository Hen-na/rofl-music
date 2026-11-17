import { MotionConfig } from 'motion/react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Artists } from './components/Artists';
import { Releases } from './components/Releases';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Marquee } from './components/Marquee';
import { navItems, site } from './data/site';
import { releases } from './data/releases';
import { useParty, usePartyShortcut } from './lib/party';

// тексты бегущих строк собираются только из реальных данных сайта
const MARQUEE_MAIN = [site.name, ...navItems.slice(1, 3).map((item) => item.label), 'демо'];
const MARQUEE_TYPES = Array.from(new Set(releases.map((r) => r.type)));
const MARQUEE_CONTACT = ['присылайте демо', site.contact.email];

export default function App() {
  usePartyShortcut();
  const party = useParty();

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Перейти к содержанию
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Marquee items={MARQUEE_MAIN} tone="red" tilt={-3} />
        <About />
        <Artists />
        <Marquee items={MARQUEE_TYPES} tone="outline" tilt={2} reverse speed={50} />
        <Releases />
        <Marquee items={MARQUEE_CONTACT} tone="teal" tilt={-2} speed={60} />
        <Contact />
      </main>
      <Footer />
      <div className={`party-toast${party ? ' is-on' : ''}`} role="status">
        {party ? 'party mode' : ''}
      </div>
    </MotionConfig>
  );
}
