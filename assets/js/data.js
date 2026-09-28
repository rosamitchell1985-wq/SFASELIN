/* SFASELIN.SHOP — product catalogue (USD) */
const SF_PRODUCTS = [
  {
    id: "aurelia-layered-necklace",
    name: "Aurelia Layered Coin Necklace",
    category: "Necklaces",
    price: 18, mrp: 26,
    img: "assets/img/necklace-layered.jpg",
    tag: "Bestseller",
    rating: 4.8, reviews: 214,
    finish: "14K Gold Plated",
    material: "Brass alloy, anti-tarnish coating",
    desc: "Three delicate gold-plated strands finished with a hand-stamped coin pendant. Layered in one clasp — no tangling, no fuss. The piece our customers reorder the most.",
    featured: true
  },
  {
    id: "rajwada-kundan-choker",
    name: "Rajwada Kundan Choker Set",
    category: "Necklace Sets",
    price: 34, mrp: 54,
    img: "assets/img/choker-kundan.jpg",
    tag: "Bestseller",
    rating: 4.9, reviews: 186,
    finish: "Gold Tone, Kundan Stones",
    material: "Copper alloy, glass kundan, shell pearls",
    desc: "A regal kundan choker with hand-set polki-style stones, pearl drops and matching jhumka earrings. Made for celebrations, worn long after.",
    featured: true
  },
  {
    id: "mira-pearl-drops",
    name: "Mira Pearl Drop Earrings",
    category: "Earrings",
    price: 9, mrp: 14,
    img: "assets/img/earrings-pearl.jpg",
    tag: "New",
    rating: 4.7, reviews: 98,
    finish: "Gold Plated Hooks",
    material: "Shell pearls, brass alloy",
    desc: "Lustrous shell pearls on feather-light gold-plated hooks. Office to evening in one small, decisive move.",
    featured: true
  },
  {
    id: "stella-ad-studs",
    name: "Stella Crystal Stud Earrings",
    category: "Earrings",
    price: 6, mrp: 11,
    img: "assets/img/studs-cz.jpg",
    tag: "",
    rating: 4.6, reviews: 167,
    finish: "Gold Plated, Prong Set",
    material: "Cubic zirconia, brass alloy",
    desc: "High-grade cubic zirconia in a classic four-prong setting. Catches light like the real thing — because the sparkle is real.",
    featured: false
  },
  {
    id: "heer-bangle-set",
    name: "Heer Engraved Bangles — Set of 6",
    category: "Bangles & Bracelets",
    price: 14, mrp: 21,
    img: "assets/img/bangles-gold.jpg",
    tag: "Bestseller",
    rating: 4.8, reviews: 243,
    finish: "Micro Gold Plated",
    material: "Brass alloy, fine engraving",
    desc: "Six slim bangles with fine hand-guided engraving. Wear all six for a celebration, two for a Tuesday.",
    featured: true
  },
  {
    id: "banjara-jhumkas",
    name: "Banjara Oxidized Jhumkas",
    category: "Earrings",
    price: 8, mrp: 12,
    img: "assets/img/jhumka-oxidized.jpg",
    tag: "",
    rating: 4.7, reviews: 132,
    finish: "Oxidized Silver Tone",
    material: "German silver alloy",
    desc: "Boho-inspired oxidized jhumkas with intricate bell work and dancing bead drops. Pairs fearlessly with denim and silk alike.",
    featured: true
  },
  {
    id: "rosette-charm-bracelet",
    name: "Rosette Heart Charm Bracelet",
    category: "Bangles & Bracelets",
    price: 8, mrp: 14,
    img: "assets/img/bracelet-rosegold.jpg",
    tag: "New",
    rating: 4.6, reviews: 74,
    finish: "Rose Gold Plated",
    material: "Copper alloy, anti-tarnish coat",
    desc: "A whisper-thin rose-gold chain carrying a single polished heart. Adjustable, stackable, quietly romantic.",
    featured: false
  },
  {
    id: "verde-cocktail-ring",
    name: "Verde Emerald-Cut Cocktail Ring",
    category: "Rings",
    price: 10, mrp: 16,
    img: "assets/img/ring-cocktail.jpg",
    tag: "Limited",
    rating: 4.8, reviews: 89,
    finish: "Gold Plated, CZ Halo",
    material: "Brass alloy, green glass centre stone",
    desc: "An emerald-cut green centre stone ringed by a cubic-zirconia halo. Adjustable band. The ring people ask about.",
    featured: true
  },
  {
    id: "payal-anklets",
    name: "Payal Silver-Tone Anklets — Pair",
    category: "Anklets",
    price: 9, mrp: 15,
    img: "assets/img/anklet-silver.jpg",
    tag: "",
    rating: 4.5, reviews: 61,
    finish: "Silver Tone",
    material: "Alloy, tiny chime bells",
    desc: "A classic pair of anklets with a soft, musical chime. Sold as a pair, adjustable clasp, made for bare feet and long summer skirts.",
    featured: false
  },
  {
    id: "noor-maang-tikka",
    name: "Noor Kundan Hair Tikka",
    category: "Hair Jewelry",
    price: 8, mrp: 12,
    img: "assets/img/tikka-maang.jpg",
    tag: "",
    rating: 4.7, reviews: 53,
    finish: "Gold Tone, Kundan",
    material: "Copper alloy, glass stones, shell pearl",
    desc: "A delicate kundan hair tikka with a single pearl drop. Secures with a discreet hook — stays put through every dance.",
    featured: false
  },
  {
    id: "zaria-twisted-hoops",
    name: "Zaria Twisted Gold Hoops",
    category: "Earrings",
    price: 7, mrp: 11,
    img: "assets/img/hoops-gold.jpg",
    tag: "Bestseller",
    rating: 4.8, reviews: 201,
    finish: "Gold Plated",
    material: "Brass alloy, rope-twist texture",
    desc: "Medium hoops with a hand-twisted rope texture. Light enough for all day, warm enough for every skin tone.",
    featured: true
  },
  {
    id: "rubina-pendant-set",
    name: "Rubina Ruby-Tone Pendant Set",
    category: "Necklace Sets",
    price: 16, mrp: 27,
    img: "assets/img/pendant-set.jpg",
    tag: "",
    rating: 4.6, reviews: 92,
    finish: "Gold Plated, CZ Halo",
    material: "Brass alloy, ruby-tone glass, CZ",
    desc: "A ruby-tone pendant framed in sparkling CZ, with matching stud drops. Festive without shouting.",
    featured: false
  },
  {
    id: "gulnar-pearl-choker",
    name: "Gulnar Double Pearl Choker",
    category: "Necklace Sets",
    price: 15, mrp: 24,
    img: "assets/img/choker-pearl.jpg",
    tag: "New",
    rating: 4.7, reviews: 47,
    finish: "Gold Plated Clasp",
    material: "Shell pearls, brass alloy",
    desc: "Two strands of luminous shell pearls on a gold-plated clasp. Sits at the collarbone — the most flattering line there is.",
    featured: true
  }
];

const SF_CATEGORIES = [
  { name: "Earrings", img: "assets/img/earrings-pearl.jpg", note: "Studs · Hoops · Jhumkas" },
  { name: "Necklaces", img: "assets/img/necklace-layered.jpg", note: "Chains · Layers" },
  { name: "Necklace Sets", img: "assets/img/choker-kundan.jpg", note: "Chokers · Pendants" },
  { name: "Bangles & Bracelets", img: "assets/img/bangles-gold.jpg", note: "Stacks · Charms" },
  { name: "Rings", img: "assets/img/ring-cocktail.jpg", note: "Cocktail · Adjustable" },
  { name: "Anklets", img: "assets/img/anklet-silver.jpg", note: "Pairs · Chimes" }
];

const SF_COUPONS = {
  "SFASELIN10": { type: "pct", value: 10, label: "10% off your order" },
  "FIRSTGLOW":  { type: "flat", value: 5, min: 25, label: "$5 off orders over $25" }
};

const SF_FREE_SHIP = 35;
const SF_SHIP_FEE = 4.99;
