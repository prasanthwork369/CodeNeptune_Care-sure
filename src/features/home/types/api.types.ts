export interface ApiHero {
  image: string;
  title: string;
  labelImage: string;
  status_text: string;
  highlighted_text: string[];
}

export interface ApiBanner {
  alt: string;
  link: string;
  imageUrl: string;
}

export interface ApiPromiseItem {
  label: string;
  iconUrl: string;
}

export interface ApiPromise {
  title: string;
  items: ApiPromiseItem[];
}

export interface ApiFooterLabel {
  icon: string;
  text: string;
}

export interface ApiFooter {
  title: string;
  labels: ApiFooterLabel[];
  iconUrl: string;
  imageUrl: string;
}

export interface ApiAppContent {
  hero?: ApiHero;
  banners: ApiBanner[];
  promise: ApiPromise;
  footer: ApiFooter;
}

export interface AppContentResponse {
  success: boolean;
  data: ApiAppContent;
}
