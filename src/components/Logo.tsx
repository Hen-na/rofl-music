import logoFull from '../assets/brand/logo-rofl.svg';
import logoShort from '../assets/brand/logo-rfl.svg';
import { site } from '../data/site';

interface LogoProps {
  /** responsive — RFL на узких экранах, ROFL на широких; full — всегда ROFL */
  variant?: 'responsive' | 'full';
  className?: string;
}

export function Logo({ variant = 'responsive', className }: LogoProps) {
  if (variant === 'full') {
    return <img className={className} src={logoFull} alt={site.name} width={887} height={231} />;
  }

  return (
    <picture>
      <source media="(min-width: 600px)" srcSet={logoFull} width={887} height={231} />
      <img className={className} src={logoShort} alt={site.name} width={739} height={231} />
    </picture>
  );
}
