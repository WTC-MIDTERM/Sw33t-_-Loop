// seed-hero-slides.js
// Creates all 3 Sw33t Loop hero slides in Strapi AND uploads their images,
// same combined approach as the team members script.
//
// HOW TO USE:
// 1. Make sure this file sits in the SAME folder as your `image/` folder
//    (e.g. E:\Y2-ITE\Y2S2-ITE\WTC\MIDTERM\Donut\image\original.png etc.)
// 2. Paste your API token into API_TOKEN below.
// 3. Make sure Strapi is running (npm run develop).
// 4. Run:  node seed-hero-slides.js
//
// Entries are created as PUBLISHED directly — no separate publish step needed.

const fs = require("fs");
const path = require("path");

const API_TOKEN = "85940eb11ea94474df0f0e274efa0334651a26b1f977c413f0c271c42a399d525631c8f9ccd8ae3e4956a858a4dfa01176325521cb72ea12316d11bfc3f86f2d43af0b2648243ee22e682ca8e469d2c51368f587136ed7a0ea4414b1067567787376e682bebd558881e59e20652eece89bbee92c12d9bd8d277fa20674760253";
const BASE_URL = "http://localhost:1337";
const IMAGE_FOLDER = path.join(__dirname, "image");

const heroSlides = [
  { caption: "Original", order: 1, image: "original.png" },
  { caption: "Chocolate", order: 2, image: "chocolate.png" },
  { caption: "Matcha", order: 3, image: "matcha.png" },
];

async function createHeroSlide(slide) {
  const res = await fetch(`${BASE_URL}/api/hero-slides`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({
      data: {
        caption: slide.caption,
        order: slide.order,
        publishedAt: new Date().toISOString(),
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Create failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.data.id;
}

async function uploadImage(entryId, filename) {
  const filePath = path.join(IMAGE_FOLDER, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("files", new Blob([fileBuffer]), filename);
  form.append("ref", "api::hero-slide.hero-slide");
  form.append("refId", entryId);
  form.append("field", "image");

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  }
}

async function run() {
  if (API_TOKEN === "PASTE_YOUR_TOKEN_HERE") {
    console.error("❌ Please paste your Strapi API token into API_TOKEN before running this script.");
    process.exit(1);
  }

  if (!fs.existsSync(IMAGE_FOLDER)) {
    console.error(`❌ Could not find an "image" folder next to this script at: ${IMAGE_FOLDER}`);
    process.exit(1);
  }

  console.log(`Creating ${heroSlides.length} hero slides...\n`);

  for (const slide of heroSlides) {
    try {
      const id = await createHeroSlide(slide);
      console.log(`✅ Created: ${slide.caption} (id ${id})`);

      await uploadImage(id, slide.image);
      console.log(`   📷 Image uploaded and linked.`);
    } catch (err) {
      console.error(`❌ Failed for ${slide.caption}: ${err.message}`);
    }
  }

  console.log("\nDone. Check Content Manager -> Hero Slide in Strapi to verify.");
}

run();