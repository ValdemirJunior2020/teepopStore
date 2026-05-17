// client/src/lib/dtfApi.js

const localDtfImages = [
  {
    id: "covered-by-grace",
    title: "Covered By Grace",
    category: "Faith",
    tags: ["faith", "christian", "grace", "dtf"],
    imageUrl: "/shirts/coveredbygrace.jfif",
    source: "local"
  },
  {
    id: "dog-prayer",
    title: "Dog Prayer",
    category: "Funny",
    tags: ["funny", "dog", "prayer", "dtf"],
    imageUrl: "/shirts/dog.jfif",
    source: "local"
  },
  {
    id: "faith-over-fear",
    title: "Faith Over Fear",
    category: "Faith",
    tags: ["faith", "christian", "fear", "dtf"],
    imageUrl: "/shirts/faithoverfear.jfif",
    source: "local"
  },
  {
    id: "i-paused-my-game",
    title: "I Paused My Game",
    category: "Funny",
    tags: ["funny", "gaming", "gamer", "dtf"],
    imageUrl: "/shirts/ipaused.jfif",
    source: "local"
  },
  {
    id: "jesus-saves",
    title: "Jesus Saves",
    category: "Faith",
    tags: ["faith", "jesus", "christian", "dtf"],
    imageUrl: "/shirts/jesussaves.jfif",
    source: "local"
  },
  {
    id: "mentally-at-the-beach",
    title: "Mentally At The Beach",
    category: "Funny",
    tags: ["funny", "beach", "summer", "dtf"],
    imageUrl: "/shirts/mentally.jfif",
    source: "local"
  },
  {
    id: "powered-by-coffee-and-prayer",
    title: "Powered By Coffee And Prayer",
    category: "Funny",
    tags: ["funny", "coffee", "prayer", "dtf"],
    imageUrl: "/shirts/powered.jfif",
    source: "local"
  },
  {
    id: "god-is-my-strength",
    title: "God Is My Strength",
    category: "Faith",
    tags: ["faith", "strength", "christian", "dtf"],
    imageUrl: "/shirts/god-strength.jfif",
    source: "local"
  },
  {
    id: "tacos-love-language",
    title: "Tacos Love Language",
    category: "Funny",
    tags: ["funny", "tacos", "food", "dtf"],
    imageUrl: "/shirts/tacos.jfif",
    source: "local"
  },
  {
    id: "walk-by-faith",
    title: "Walk By Faith",
    category: "Faith",
    tags: ["faith", "christian", "walk by faith", "dtf"],
    imageUrl: "/shirts/walkbyfaith.jfif",
    source: "local"
  }
];

export async function getDtfImages({ search = "", category = "all" } = {}) {
  const searchText = search.trim().toLowerCase();
  const selectedCategory = category.trim().toLowerCase();

  let images = [...localDtfImages];

  if (searchText) {
    images = images.filter((item) => {
      const text = `${item.title} ${item.category} ${(item.tags || []).join(" ")}`.toLowerCase();
      return text.includes(searchText);
    });
  }

  if (selectedCategory && selectedCategory !== "all") {
    images = images.filter(
      (item) => String(item.category || "").toLowerCase() === selectedCategory
    );
  }

  return {
    ok: true,
    images,
    count: images.length,
    apiConnected: false
  };
}