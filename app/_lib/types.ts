export type ProductImage = { url: string; width: number; height: number; alt: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  /** Short merchandising label, e.g. "Nouveau". */
  badge: string | null;
  description: string;
  size: string;
  price: number;
  notes: string[];
  soldOut: boolean;
  image: ProductImage;
};

export type Pack = {
  id: string;
  name: string;
  description: string;
  badge: string | null;
  /** 0.15 = −15 % */
  discount: number;
  items: string[];
};

export type Shipping = {
  freeFrom: number | null;
  cities: { name: string; fee: number }[];
};

export type Settings = {
  whatsappNumber: string;
  phoneDisplay: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  announcement: string | null;
};

export type ReviewMedia =
  | { key: string; type: "image"; url: string; width: number; height: number }
  | { key: string; type: "video"; url: string };

export type Review = {
  id: string;
  author: string;
  city: string | null;
  /** yyyy-mm-dd */
  date: string;
  rating: number;
  title: string | null;
  body: string;
  product: string;
  verified: boolean;
  reply: string | null;
  helpful: number;
  media: ReviewMedia[];
};

export type Faq = { id: string; question: string; answer: string };

export type Catalog = {
  products: Product[];
  packs: Pack[];
  shipping: Shipping;
  whatsappNumber: string;
};
