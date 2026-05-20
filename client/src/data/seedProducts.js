// client/src/data/seedProducts.js

export const TSHIRT_PRICE = 40;

const defaultColors = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#ffffff" },
  { name: "Sand", hex: "#d6c1a3" },
  { name: "Navy", hex: "#172554" }
];

const defaultSizes = ["S", "M", "L", "XL", "2XL"];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildVariants(productKey, style = "Unisex Tee") {
  return defaultColors.flatMap((color) =>
    defaultSizes.map((size) => ({
      sku: `TEEPOP-${productKey.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${color.name
        .toUpperCase()
        .replace(/\s+/g, "")}-${size}`,
      style,
      color: color.name,
      colorHex: color.hex,
      size,
      price: TSHIRT_PRICE,
      stock: 20,
      active: true
    }))
  );
}

function createProduct({
  id,
  name,
  description,
  category,
  tags,
  image,
  featured = false,
  sortOrder,
  style = "Unisex Tee"
}) {
  const slug = slugify(id || name);

  return {
    id: slug,
    name,
    slug,
    description,
    price: TSHIRT_PRICE,
    category,
    tags,
    active: true,
    featured,
    sortOrder,

    mainImageUrl: image,
    imageUrl: image,
    image,

    videoUrl: "",
    product_video_url: "",
    gifUrl: "",
    gif_url: "",

    galleryImages: [image],
    rotationImages: [image],

    colors: defaultColors,
    sizes: defaultSizes,
    variants: buildVariants(slug, style)
  };
}

const originalProducts = [
  createProduct({
    id: "covered-by-grace-tee",
    name: "Covered By Grace Tee",
    description:
      "Premium Christian DTF shirt with a bold Covered By Grace design. Printed in-house by TeePoP.",
    category: "Faith",
    tags: ["faith", "christian", "grace", "dtf"],
    image: "/shirts/coveredbygrace.jfif",
    featured: true,
    sortOrder: 1
  }),
  createProduct({
    id: "dog-prayer-tee",
    name: "Dog Prayer Tee",
    description:
      "Funny wholesome DTF shirt for dog lovers with a playful faith-inspired design.",
    category: "Funny",
    tags: ["funny", "dog", "prayer", "dtf"],
    image: "/shirts/dog.jfif",
    featured: true,
    sortOrder: 2
  }),
  createProduct({
    id: "faith-over-fear-tee",
    name: "Faith Over Fear Tee",
    description:
      "Faith Over Fear Christian shirt with a powerful inspirational DTF design.",
    category: "Faith",
    tags: ["faith", "christian", "fear", "dtf"],
    image: "/shirts/faithoverfear.jfif",
    featured: true,
    sortOrder: 3
  }),
  createProduct({
    id: "i-paused-my-game-tee",
    name: "I Paused My Game Tee",
    description:
      "Funny gamer shirt with a bold DTF design for anyone who paused their game to be here.",
    category: "Funny",
    tags: ["funny", "gaming", "gamer", "dtf"],
    image: "/shirts/ipaused.jfif",
    featured: true,
    sortOrder: 4
  }),
  createProduct({
    id: "jesus-saves-tee",
    name: "Jesus Saves Tee",
    description:
      "Bold Jesus Saves Christian DTF shirt with a clean premium streetwear look.",
    category: "Faith",
    tags: ["faith", "jesus", "christian", "dtf"],
    image: "/shirts/jesussaves.jfif",
    featured: true,
    sortOrder: 5
  }),
  createProduct({
    id: "mentally-at-the-beach-tee",
    name: "Mentally At The Beach Tee",
    description:
      "Fun vacation-style DTF shirt for beach lovers and summer energy.",
    category: "Funny",
    tags: ["funny", "beach", "summer", "dtf"],
    image: "/shirts/mentally.jfif",
    featured: false,
    sortOrder: 6
  }),
  createProduct({
    id: "powered-by-coffee-and-prayer-tee",
    name: "Powered By Coffee And Prayer Tee",
    description:
      "Cute and funny DTF shirt for coffee lovers who run on coffee and prayer.",
    category: "Funny",
    tags: ["funny", "coffee", "prayer", "dtf"],
    image: "/shirts/powered.jfif",
    featured: false,
    sortOrder: 7
  }),
  createProduct({
    id: "god-is-my-strength-tee",
    name: "God Is My Strength Tee",
    description:
      "God Is My Strength Christian DTF shirt with a peaceful inspirational design.",
    category: "Faith",
    tags: ["faith", "strength", "christian", "dtf"],
    image: "/shirts/god-strength.jfif",
    featured: false,
    sortOrder: 8
  }),
  createProduct({
    id: "tacos-love-language-tee",
    name: "Tacos Love Language Tee",
    description:
      "Funny taco lover shirt with a colorful DTF print. Perfect for casual wear.",
    category: "Funny",
    tags: ["funny", "tacos", "food", "dtf"],
    image: "/shirts/tacos.jfif",
    featured: false,
    sortOrder: 9
  }),
  createProduct({
    id: "walk-by-faith-tee",
    name: "Walk By Faith Tee",
    description:
      "Walk By Faith Christian DTF shirt with a clean and modern faith design.",
    category: "Faith",
    tags: ["faith", "christian", "walk by faith", "dtf"],
    image: "/shirts/walkbyfaith.jfif",
    featured: false,
    sortOrder: 10
  })
];

const brasilFolder = "/shirts/Brasil-collection-world-cup-2026";

const brasilCollectionProducts = [
  createProduct({
    id: "fueled-by-coffee-and-chaos-tee",
    name: "Fueled By Coffee And Chaos Tee",
    description:
      "Funny DTF shirt with coffee energy and chaotic mom-life style.",
    category: "Funny",
    tags: ["funny", "coffee", "chaos", "dtf"],
    image: `${brasilFolder}/fueled_by_coffee_and_chaos.png`,
    featured: true,
    sortOrder: 11
  }),
  createProduct({
    id: "holy-but-still-hungry-tee",
    name: "Holy But Still Hungry Tee",
    description:
      "Funny faith-inspired DTF shirt with playful hungry energy.",
    category: "Faith Funny",
    tags: ["faith", "funny", "hungry", "dtf"],
    image: `${brasilFolder}/holy_but_still_hungry_graphic_tee.png`,
    featured: true,
    sortOrder: 12
  }),
  createProduct({
    id: "i-survived-another-meeting-tee",
    name: "I Survived Another Meeting Tee",
    description:
      "Office humor DTF shirt for anyone who survived another meeting.",
    category: "Funny",
    tags: ["funny", "office", "meeting", "dtf"],
    image: `${brasilFolder}/i_survived_another_meeting_tee.png`,
    featured: true,
    sortOrder: 13
  }),
  createProduct({
    id: "mama-needs-cafito-tee",
    name: "Mama Needs Cafito Tee",
    description:
      "Cute coffee mom DTF shirt with fun cafecito-inspired style.",
    category: "Funny",
    tags: ["funny", "mama", "coffee", "cafecito", "dtf"],
    image: `${brasilFolder}/mama_needs_cafito_with_style.png`,
    featured: true,
    sortOrder: 14
  }),
  createProduct({
    id: "not-today-adulting-tee",
    name: "Not Today Adulting Tee",
    description:
      "Funny DTF shirt for days when adulting can wait.",
    category: "Funny",
    tags: ["funny", "adulting", "humor", "dtf"],
    image: `${brasilFolder}/not_today_adulting_graphic_tee.png`,
    featured: false,
    sortOrder: 15
  }),
  createProduct({
    id: "running-late-is-my-cardio-tee",
    name: "Running Late Is My Cardio Tee",
    description:
      "Funny lifestyle DTF shirt with running late cardio humor.",
    category: "Funny",
    tags: ["funny", "cardio", "late", "dtf"],
    image: `${brasilFolder}/running_late_is_my_cardio_shirt.png`,
    featured: false,
    sortOrder: 16
  }),
  createProduct({
    id: "saved-by-grace-and-iced-coffee-tee",
    name: "Saved By Grace And Iced Coffee Tee",
    description:
      "Faith and coffee DTF shirt with a cute inspirational style.",
    category: "Faith Funny",
    tags: ["faith", "coffee", "grace", "dtf"],
    image: `${brasilFolder}/saved_by_grace_and_iced_coffee.png`,
    featured: false,
    sortOrder: 17
  }),
  createProduct({
    id: "snack-dealer-tee",
    name: "Snack Dealer Tee",
    description:
      "Funny snack-lover DTF shirt with bold playful style.",
    category: "Funny",
    tags: ["funny", "snack", "food", "dtf"],
    image: `${brasilFolder}/snack_dealer_graphic_tee_design.png`,
    featured: false,
    sortOrder: 18
  }),
  createProduct({
    id: "brasil-2026-soccer-shirt",
    name: "Brasil 2026 Soccer Shirt",
    description:
      "Brazil soccer-inspired DTF shirt for the 2026 season.",
    category: "Brasil 2026",
    tags: ["brazil", "brasil", "soccer", "2026", "dtf"],
    image: `${brasilFolder}/teepop_clean_shirt_01_brazil_2026_soccer_shirt_design.png`,
    featured: true,
    sortOrder: 19
  }),
  createProduct({
    id: "brazilian-soccer-samba-shirt",
    name: "Brazilian Soccer Samba Shirt",
    description:
      "Brazilian soccer and samba DTF shirt with colorful energy.",
    category: "Brasil 2026",
    tags: ["brazil", "samba", "soccer", "dtf"],
    image: `${brasilFolder}/teepop_clean_shirt_02_brazilian_soccer_with_samba_design.png`,
    featured: true,
    sortOrder: 20
  }),
  createProduct({
    id: "road-to-2026-graphic-tee",
    name: "Road To 2026 Graphic Tee",
    description:
      "Brazil football DTF shirt for the road to 2026.",
    category: "Brasil 2026",
    tags: ["brazil", "football", "2026", "dtf"],
    image: `${brasilFolder}/teepop_clean_shirt_03_road_to_2026_graphic_tee.png`,
    featured: true,
    sortOrder: 21
  }),
  createProduct({
    id: "celebratory-soccer-tee",
    name: "Celebratory Soccer Tee",
    description:
      "Celebratory soccer-themed DTF mockup shirt for Brazil fans.",
    category: "Brasil 2026",
    tags: ["brazil", "soccer", "celebration", "dtf"],
    image: `${brasilFolder}/teepop_clean_shirt_04_celebratory_soccer_themed_graphic_tee_mockup.png`,
    featured: false,
    sortOrder: 22
  }),
  createProduct({
    id: "retro-brasil-graphic-tee",
    name: "Retro Brasil Graphic Tee",
    description:
      "Retro Brazil soccer-inspired DTF shirt with vintage style.",
    category: "Brasil 2026",
    tags: ["brazil", "retro", "soccer", "dtf"],
    image: `${brasilFolder}/teepop_clean_shirt_05_retro_brasil_soccer_graphic_tee.png`,
    featured: false,
    sortOrder: 23
  }),
  createProduct({
    id: "soccer-north-america-2026-tee",
    name: "Soccer North America 2026 Tee",
    description:
      "North America 2026 soccer DTF shirt with bold fan energy.",
    category: "Brasil 2026",
    tags: ["soccer", "north america", "2026", "dtf"],
    image: `${brasilFolder}/teepop_clean_shirt_06_soccer_in_north_america_2026_design.png`,
    featured: false,
    sortOrder: 24
  }),
  createProduct({
    id: "bold-2026-season-shield-tee",
    name: "Bold 2026 Season Shield Tee",
    description:
      "Bold 2026 soccer season shield DTF shirt design.",
    category: "Brasil 2026",
    tags: ["soccer", "2026", "shield", "dtf"],
    image: `${brasilFolder}/teepop_clean_shirt_07_bold_2026_season_shield_t_shirt_design.png`,
    featured: false,
    sortOrder: 25
  }),
  createProduct({
    id: "game-day-splash-soccer-tee",
    name: "Game Day Splash Soccer Tee",
    description:
      "Bright game-day soccer DTF shirt with colorful splash design.",
    category: "Brasil 2026",
    tags: ["soccer", "game day", "brazil", "dtf"],
    image: `${brasilFolder}/teepop_clean_shirt_08_game_day_splash_soccer_tee.png`,
    featured: false,
    sortOrder: 26
  }),
  createProduct({
    id: "global-football-2026-tee",
    name: "Global Football 2026 Tee",
    description:
      "Global football 2026 DTF shirt with clean fan style.",
    category: "Brasil 2026",
    tags: ["football", "soccer", "2026", "dtf"],
    image: `${brasilFolder}/teepop_clean_shirt_09_global_football_2026_shirt_design.png`,
    featured: false,
    sortOrder: 27
  }),
  createProduct({
    id: "tiny-but-spicy-chili-tee",
    name: "Tiny But Spicy Chili Tee",
    description:
      "Funny spicy chili DTF shirt with bold colorful attitude.",
    category: "Funny",
    tags: ["funny", "spicy", "chili", "dtf"],
    image: `${brasilFolder}/tiny_but_spicy_chili_graphic_tee.png`,
    featured: false,
    sortOrder: 28
  }),
  createProduct({
    id: "tropical-humor-black-shirt",
    name: "Tropical Humor Black Shirt",
    description:
      "Tropical funny DTF shirt with bold summer humor.",
    category: "Funny",
    tags: ["funny", "tropical", "summer", "dtf"],
    image: `${brasilFolder}/tropical_humor_on_black_t_shirt.png`,
    featured: false,
    sortOrder: 29
  })
];

const modelosFolder = "/shirts/modelos";

const modeloProducts = [
  createProduct({
    id: "teepop-model-tee-01",
    name: "TeePoP Model Tee 01",
    description:
      "Premium TeePoP DTF model shirt preview with lifestyle product photography.",
    category: "Models",
    tags: ["models", "model", "dtf", "teepop", "shirt"],
    image: `${modelosFolder}/3fb8a4cd-555b-48b5-861f-ae7ce9b550fd.jfif`,
    featured: false,
    sortOrder: 30
  }),
  createProduct({
    id: "teepop-model-tee-02",
    name: "TeePoP Model Tee 02",
    description:
      "Premium TeePoP DTF model shirt preview with lifestyle product photography.",
    category: "Models",
    tags: ["models", "model", "dtf", "teepop", "shirt"],
    image: `${modelosFolder}/5a23247e-b78f-481b-bf0d-60b6599d1c9a.jfif`,
    featured: false,
    sortOrder: 31
  }),
  createProduct({
    id: "teepop-model-tee-03",
    name: "TeePoP Model Tee 03",
    description:
      "Premium TeePoP DTF model shirt preview with lifestyle product photography.",
    category: "Models",
    tags: ["models", "model", "dtf", "teepop", "shirt"],
    image: `${modelosFolder}/61ecd618-757d-4315-8862-730b8e2d3152.jfif`,
    featured: false,
    sortOrder: 32
  }),
  createProduct({
    id: "teepop-model-tee-04",
    name: "TeePoP Model Tee 04",
    description:
      "Premium TeePoP DTF model shirt preview with lifestyle product photography.",
    category: "Models",
    tags: ["models", "model", "dtf", "teepop", "shirt"],
    image: `${modelosFolder}/4852bf37-87b2-4ee7-bf6c-f20f5d1d4430.jfif`,
    featured: false,
    sortOrder: 33
  }),
  createProduct({
    id: "teepop-model-tee-05",
    name: "TeePoP Model Tee 05",
    description:
      "Premium TeePoP DTF model shirt preview with lifestyle product photography.",
    category: "Models",
    tags: ["models", "model", "dtf", "teepop", "shirt"],
    image: `${modelosFolder}/a785726e-0a00-495f-88b2-b1552732cf61.jfif`,
    featured: false,
    sortOrder: 34
  }),
  createProduct({
    id: "teepop-model-tee-06",
    name: "TeePoP Model Tee 06",
    description:
      "Premium TeePoP DTF model shirt preview with lifestyle product photography.",
    category: "Models",
    tags: ["models", "model", "dtf", "teepop", "shirt"],
    image: `${modelosFolder}/d7270cb4-d4b6-4bf8-ad66-783cd2ae5973.jfif`,
    featured: false,
    sortOrder: 35
  }),
  createProduct({
    id: "teepop-model-tee-07",
    name: "TeePoP Model Tee 07",
    description:
      "Premium TeePoP DTF model shirt preview with lifestyle product photography.",
    category: "Models",
    tags: ["models", "model", "dtf", "teepop", "shirt"],
    image: `${modelosFolder}/f1a9c286-0da3-4b42-8df1-c02a7ab1d3f9.jfif`,
    featured: false,
    sortOrder: 36
  })
];

export const seedProducts = [
  ...originalProducts,
  ...brasilCollectionProducts,
  ...modeloProducts
];