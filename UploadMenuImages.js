// upload-menu-images.js
// Reads donut images from your local project's `image/` folder and uploads
// each one to Strapi, automatically linking it to the matching Menu Item entry.
//
// HOW TO USE:
// 1. Make sure this file sits in the SAME folder as your `image/` folder
//    (e.g. E:\Y2-ITE\Y2S2-ITE\WTC\MIDTERM\Donut\image\STRAWBERRYRUSH.png etc.)
// 2. Paste the same API token you used before into API_TOKEN below.
// 3. Make sure Strapi is running (npm run develop).
// 4. Run:  node upload-menu-images.js
//
// This script:
//   - Fetches all Menu Item entries from Strapi (to get their IDs)
//   - Matches each entry's `name` to a donut in the map below
//   - Uploads the matching image file and links it to that entry's `image` field
//
// If an entry has no matching filename below, or the file doesn't exist on
// disk, it will be skipped with a warning — everything else still runs.

const fs = require("fs");
const path = require("path");

const API_TOKEN = "85940eb11ea94474df0f0e274efa0334651a26b1f977c413f0c271c42a399d525631c8f9ccd8ae3e4956a858a4dfa01176325521cb72ea12316d11bfc3f86f2d43af0b2648243ee22e682ca8e469d2c51368f587136ed7a0ea4414b1067567787376e682bebd558881e59e20652eece89bbee92c12d9bd8d277fa20674760253";
const BASE_URL = "http://localhost:1337";
const IMAGE_FOLDER = path.join(__dirname, "image");

// Maps each donut's Strapi "name" field to its image filename in /image
const imageMap = {
  "Strawberry Rush": "STRAWBERRYRUSH.png",
  "Ola Pandan": "OLAPANDAN.png",
  "Crispy Choco": "CRISPYCHOCO.png",
  "Taro Dream": "TARODREAM.png",
  "Berry Bliss": "BerryBliss.png",
  "Crispy Taro": "CRISPYTARO.png",
  "Californian Almond": "CalifornianAlmond.png",
  "Captain Nuts": "CaptainNuts.png",
  "Chocoholic": "Chocoholic.png",
  "Chocomel": "Chocomel.png",
  "Creamo Cheese": "CreamoCheese.png",
  "D-Rex": "DRex.png",
  "De Vinci": "DeVinci.png",
  "Donutella": "Donutella.png",
  "Hey Cheese": "HeyCheese.png",
  "Hey Nutty": "HeyNutty.png",
  "Hunky Chunk": "HunkyhunkChunk.png",
  "Misme": "Misme.png",
  "Nestella": "Nestella.png",
  "Oh-Hazel": "OhHazel.png",
  "Oh-Ono Oreo": "OnoOreo.png",
  "Pink Twister": "PinkTwister.png",
  "Stella Nutella": "StellaNutella.png",
  "Super Cluster": "SuperCluster.png",
  "The Alien": "TheAlien.png",
  "Tira Cinno": "TiraCinno.png",
};

async function getAllMenuItems() {
  const res = await fetch(`${BASE_URL}/api/menu-items?pagination[pageSize]=100`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch menu items: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.data; // array of { id, name, ... }
}

async function uploadImageForEntry(entryId, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const form = new FormData();
  form.append("files", new Blob([fileBuffer]), fileName);
  form.append("ref", "api::menu-item.menu-item");
  form.append("refId", entryId);
  form.append("field", "image");

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
}

async function run() {
  if (API_TOKEN === "PASTE_YOUR_TOKEN_HERE") {
    console.error("❌ Please paste your Strapi API token into API_TOKEN before running this script.");
    process.exit(1);
  }

  if (!fs.existsSync(IMAGE_FOLDER)) {
    console.error(`❌ Could not find an "image" folder next to this script at: ${IMAGE_FOLDER}`);
    console.error("   Move this script into the same folder that contains your image/ folder, then try again.");
    process.exit(1);
  }

  console.log("Fetching menu items from Strapi...");
  const entries = await getAllMenuItems();
  console.log(`Found ${entries.length} entries.\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const entry of entries) {
    const name = entry.name;
    const filename = imageMap[name];

    if (!filename) {
      console.warn(`⚠️  Skipped: "${name}" — no image mapping found.`);
      skipCount++;
      continue;
    }

    const filePath = path.join(IMAGE_FOLDER, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Skipped: "${name}" — file not found: ${filePath}`);
      skipCount++;
      continue;
    }

    try {
      await uploadImageForEntry(entry.id, filePath);
      console.log(`✅ Uploaded image for: ${name}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed for "${name}": ${err.message}`);
      failCount++;
    }
  }

  console.log(`\nDone. ${successCount} uploaded, ${skipCount} skipped, ${failCount} failed.`);
}

run();