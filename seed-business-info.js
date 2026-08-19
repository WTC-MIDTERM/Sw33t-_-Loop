// seed-business-info.js
// Fills in the Business Info single type in Strapi using data pulled
// straight from your site's footer (about.html, contact.html, etc).
//
// HOW TO USE:
// 1. Paste your API token into API_TOKEN below.
// 2. Make sure Strapi is running (npm run develop).
// 3. Run:  node seed-business-info.js
//
// NOTE: Single types use PUT (not POST) since there's only ever one entry —
// this creates it if it doesn't exist yet, or updates it if it does.
//
// If you added an "open hours" repeatable component field when building the
// schema, its field name might not be "hours" — check your schema and let
// me know the exact field/component names if you want me to add that too.
// This script only fills in the plain text fields for now.

const API_TOKEN = "85940eb11ea94474df0f0e274efa0334651a26b1f977c413f0c271c42a399d525631c8f9ccd8ae3e4956a858a4dfa01176325521cb72ea12316d11bfc3f86f2d43af0b2648243ee22e682ca8e469d2c51368f587136ed7a0ea4414b1067567787376e682bebd558881e59e20652eece89bbee92c12d9bd8d277fa20674760253";
const BASE_URL = "http://localhost:1337";

const businessInfo = {
  phone: "+855 123 456 789",
  email: "sw33tloop@gmail.com",
  address: "Phnom Penh",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
};

async function run() {
  if (API_TOKEN === "PASTE_YOUR_TOKEN_HERE") {
    console.error("❌ Please paste your Strapi API token into API_TOKEN before running this script.");
    process.exit(1);
  }

  console.log("Saving Business Info...\n");

  try {
    const res = await fetch(`${BASE_URL}/api/business-info`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          ...businessInfo,
          publishedAt: new Date().toISOString(),
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${await res.text()}`);
    }

    console.log("✅ Business Info saved and published successfully.");
  } catch (err) {
    console.error(`❌ Failed: ${err.message}`);
  }
}

run();