export interface NavItem {
  id: string;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  /** Ссылка на страницу артиста или стриминг. Необязательно. */
  href?: string;
  /** Фото артиста (например, '/artists/artist-01.webp' из папки public). Показывается в превью при наведении. */
  image?: string;
}

export type ReleaseType = 'Сингл' | 'EP' | 'Альбом';

export interface Release {
  id: string;
  title: string;
  artist: string;
  type: ReleaseType;
  year: string;
  /** Путь к обложке (например, '/covers/release-01.webp' из папки public). Без обложки показывается точечная заглушка. */
  cover?: string;
  href?: string;
}
