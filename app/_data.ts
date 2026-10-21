// Static brand copy. Catalogue, prices, delivery, reviews and FAQ live in Sanity.

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function formatDh(value: number) {
  return `${Math.round(value)} DH`;
}

export const ritual = [
  {
    step: "01",
    title: "Nettoyer",
    text: "Matin et soir, le Face Wash sur peau humide. Masser, rincer. La peau reste souple, jamais tiraillée.",
    product: "Face Wash Miel & B5",
  },
  {
    step: "02",
    title: "Exfolier",
    text: "Une à deux fois par semaine, le Gommage en mouvements circulaires pour lisser et raviver l’éclat.",
    product: "Gommage Visage",
  },
  {
    step: "03",
    title: "Sublimer",
    text: "Quelques gouttes de Sérum sur cheveux ou barbe. Brillance, douceur et coiffage facilité.",
    product: "Sérum Cheveux & Barbe",
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
