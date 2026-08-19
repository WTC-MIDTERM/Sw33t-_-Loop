// seed-menu-items.js
// Bulk-creates all Sw33t Loop menu items in Strapi via the REST API.
//
// HOW TO USE:
// 1. Get an API token from Strapi:
//    Settings -> API Tokens -> Create new API Token
//    Name: "Seed Script", Token type: "Full access", Duration: "7 days" (or unlimited)
//    Copy the token immediately (it's only shown once).
// 2. Paste that token into API_TOKEN below.
// 3. Make sure Strapi is running (npm run develop) in another terminal.
// 4. Run this file with:  node seed-menu-items.js
//
// NOTE: This creates entries as DRAFTS. After running, go into Content Manager
// and click "Publish" on each one (or bulk-select all and publish together),
// since draft entries won't show up in the public API.
//
// Images are NOT uploaded by this script (that needs actual image files and
// multipart uploads, which is more complex). Add each donut's photo manually
// afterward by clicking into the entry -> image field -> upload.

const API_TOKEN = "85940eb11ea94474df0f0e274efa0334651a26b1f977c413f0c271c42a399d525631c8f9ccd8ae3e4956a858a4dfa01176325521cb72ea12316d11bfc3f86f2d43af0b2648243ee22e682ca8e469d2c51368f587136ed7a0ea4414b1067567787376e682bebd558881e59e20652eece89bbee92c12d9bd8d277fa20674760253";
const BASE_URL = "http://localhost:1337/api/menu-items";

const menuItems = [
  { name: "Strawberry Rush", desc: "Delightful strawberry chocolate glaze, sprinkle biscuit in bae style, drizzle with white chocolate and strawberry cheese fresh cream as topping.", price: 2.20 },
  { name: "Ola Pandan", desc: "Pandan chocolate glaze with desiccated coconut and fresh cream.", price: 2.30 },
  { name: "Crispy Choco", desc: "Crispy chocolate spread and crunchy bits decor with lines of dark chocolate top with chocolate fresh cream.", price: 2.20 },
  { name: "Taro Dream", desc: "Sweet potato cream on the inside, glaze in sweet taro chocolate finished with white chocolate line.", price: 2.50 },
  { name: "Berry Bliss", desc: "Sweet potato cream on the inside, glaze in sweet taro chocolate finished with white chocolate line.", price: 2.00 },
  { name: "Crispy Taro", desc: "White chocolate glaze dip in desiccated coconut decor with sweet taro line and sweet potato fresh cream.", price: 2.40 },
  { name: "Californian Almond", desc: "Crunchy sliced almonds with white chocolate.", price: 2.60 },
  { name: "Captain Nuts", desc: "Hazelnut chocolate with sliced of crunchy almond & lines of white chocolate, finished with chocolate topping.", price: 2.20 },
  { name: "Chocoholic", desc: "Dark chocolate topping with white chocolate, filled with chocolate.", price: 2.50 },
  { name: "Chocomel", desc: "White chocolate with caramel biscuit topping and chocolate filling, accented with a dark chocolate glaze.", price: 2.60 },
  { name: "Creamo Cheese", desc: "Blueberry fruit topped on white chocolate, filled with cream cheese fresh cream.", price: 2.30 },
  { name: "D-Rex", desc: "Dark chocolate topping with white chocolate lines, filled with banana choc fresh cream.", price: 2.80 },
  { name: "De Vinci", desc: "Hazelnut chocolate topping with white chocolate decors, filled with coffee fresh cream.", price: 2.70 },
  { name: "Donutella", desc: "White chocolate with crunchy roasted peanuts & dark chocolate lines, topped with chocolate.", price: 2.30 },
  { name: "Hey Cheese", desc: "Grated cheddar cheese on white chocolate.", price: 2.20 },
  { name: "Hey Nutty", desc: "Coat of crunchy roasted peanuts on hazelnut chocolate topping, filled with crunchy peanut butter.", price: 2.30 },
  { name: "Hunky Chunk", desc: "Crunchy roasted peanuts & hazelnut linings with white chocolate.", price: 2.40 },
  { name: "Misme", desc: "Tiramisu chocolate glaze with caramel biscuit and peanut butter filling, finished with white and dark chocolate lines.", price: 2.80 },
  { name: "Nestella", desc: "Tiramisu chocolate topping with half crunchy nestum and hazelnut linings, filled with nutella cream.", price: 2.75 },
  { name: "Oh-Hazel", desc: "Hazelnut chocolate topped with dark chocolate shreds & lines, filled with hazelnut fresh cream.", price: 2.55 },
  { name: "Oh-Ono Oreo", desc: "Oreo powder covered on white chocolate, finished with vanilla fresh cream.", price: 2.30 },
  { name: "Pink Twister", desc: "Strawberry chocolate topping white chocolate lines, filled with strawberry fresh cream.", price: 2.25 },
  { name: "Stella Nutella", desc: "Dark chocolate topped with chips of white chocolate & hazelnut lines, filled with caramel fresh cream.", price: 2.10 },
  { name: "Super Cluster", desc: "Dark chocolate chips with dextrose on dark chocolate.", price: 2.20 },
  { name: "The Alien", desc: "Alien chocolate topping with dark chocolate flakes & strawberry chocolate lines, filled with alien chocolate.", price: 2.60 },
  { name: "Tira Cinno", desc: "Sprinkles of cocoa powder on tiramisu chocolate topping, filled with coffee fresh cream.", price: 2.60 },
];

async function seed() {
  if (API_TOKEN === "PASTE_YOUR_TOKEN_HERE") {
    console.error("❌ Please paste your Strapi API token into API_TOKEN before running this script.");
    process.exit(1);
  }

  console.log(`Seeding ${menuItems.length} menu items into Strapi...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const item of menuItems) {
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({ data: item }),
      });

      if (res.ok) {
        console.log(`✅ Created: ${item.name}`);
        successCount++;
      } else {
        const errText = await res.text();
        console.error(`❌ Failed: ${item.name} — ${res.status} ${errText}`);
        failCount++;
      }
    } catch (err) {
      console.error(`❌ Error creating ${item.name}:`, err.message);
      failCount++;
    }
  }

  console.log(`\nDone. ${successCount} created, ${failCount} failed.`);
  console.log("Next: go to Content Manager -> Menu Item in Strapi and Publish each entry (or bulk-publish).");
}

seed();