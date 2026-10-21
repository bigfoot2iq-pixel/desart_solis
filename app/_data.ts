// Static brand copy. Catalogue, prices, delivery, reviews and FAQ live in Sanity.

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function formatDh(value: number) {
  return `${Math.round(value)} DH`;
}

/** The four steps of the Desart Solis routine, by body area. */
export const ritual = [
  {
    step: "01",
    area: "Visage",
    title: "Nettoyer",
    text: "Matin et soir, le Face Wash sur peau humide. Masser, rincer. La peau reste souple, jamais tiraillée.",
    product: "Face Wash Miel & B5",
  },
  {
    step: "02",
    area: "Visage",
    title: "Exfolier",
    text: "Une à deux fois par semaine, le Gommage en mouvements circulaires pour lisser et raviver l’éclat.",
    product: "Gommage Visage",
  },
  {
    step: "03",
    area: "Cheveux & Barbe",
    title: "Sublimer",
    text: "Quelques gouttes de Sérum sur cheveux ou barbe. Brillance, douceur et coiffage facilité.",
    product: "Sérum Cheveux & Barbe",
  },
  {
    step: "04",
    area: "Corps",
    title: "Parfumer",
    text: "Sous la douche, le Gel Douche Caramel. Une mousse dense, un parfum chaud qui reste sur la peau.",
    product: "Gel Douche Caramel",
  },
];

export const ingredients = [
  {
    name: "Huile d’argan",
    origin: "Maroc",
    text: "Le cœur de chaque formule. Riche en vitamine E et acides gras, elle nourrit et protège.",
  },
  {
    name: "Miel",
    origin: "Naturel",
    text: "Apaisant et hydratant, il aide la peau à retenir son eau.",
  },
  {
    name: "Pro-vitamine B5",
    origin: "Panthénol",
    text: "Elle adoucit, calme les rougeurs et renforce le confort cutané.",
  },
  {
    name: "Kératine & protéine végétale",
    origin: "Fibre",
    text: "Gaine la fibre capillaire, dompte les frisottis et lisse la barbe.",
  },
];

/** Trust bar under the hero. */
export const promises = [
  { label: "Huile d’argan du Maroc", note: "Actif signature" },
  { label: "Formules douces", note: "Visage, corps & cheveux" },
  { label: "Paiement à la livraison", note: "Confirmation WhatsApp" },
  { label: "Livraison partout au Maroc", note: "Dès 300 DH, offerte" },
];

/** Brand pillars shown in the story section. */
export const values = [
  { title: "Douceur", text: "Des textures qui glissent, jamais de tiraillements." },
  { title: "Authenticité", text: "Des actifs simples, lisibles, sans jargon." },
  { title: "Transparence", text: "Ce qu’il y a dans le flacon, et rien d’autre." },
  { title: "Proximité", text: "Un humain au bout du message, du premier au dernier." },
];
