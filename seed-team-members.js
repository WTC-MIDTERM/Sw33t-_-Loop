// seed-team-members.js
// Creates all 3 Sw33t Loop team members in Strapi AND uploads their photos,
// all in one script (unlike the menu items, which needed two separate scripts).
//
// HOW TO USE:
// 1. Make sure this file sits in the SAME folder as your `image/` folder
//    (e.g. E:\Y2-ITE\Y2S2-ITE\WTC\MIDTERM\Donut\image\blossom.jpg etc.)
// 2. Paste your API token into API_TOKEN below (same token as before works,
//    since you set it to Unlimited duration).
// 3. Make sure Strapi is running (npm run develop).
// 4. Run:  node seed-team-members.js
//
// This creates entries as PUBLISHED directly (unlike the menu item script,
// which created drafts) — no separate publish step needed afterward.

const fs = require("fs");
const path = require("path");

const API_TOKEN = "85940eb11ea94474df0f0e274efa0334651a26b1f977c413f0c271c42a399d525631c8f9ccd8ae3e4956a858a4dfa01176325521cb72ea12316d11bfc3f86f2d43af0b2648243ee22e682ca8e469d2c51368f587136ed7a0ea4414b1067567787376e682bebd558881e59e20652eece89bbee92c12d9bd8d277fa20674760253";
const BASE_URL = "http://localhost:1337";
const IMAGE_FOLDER = path.join(__dirname, "image");

const teamMembers = [
  { name: "Blossom", role: "CO-FOUNDER", position: "Board of Directors", photo: "blossom.jpg" },
  { name: "Bubble", role: "CO-FOUNDER", position: "Chief of Executive", photo: "bubble.jpg" },
  { name: "Buttercup", role: "CO-FOUNDER", position: "Board of Directors", photo: "buttercup.png" },
];

async function createTeamMember(member) {
  const res = await fetch(`${BASE_URL}/api/team-members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({
      data: {
        name: member.name,
        role: member.role,
        position: member.position,
        publishedAt: new Date().toISOString(), // publish immediately
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Create failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.data.id;
}

async function uploadPhoto(entryId, filename) {
  const filePath = path.join(IMAGE_FOLDER, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("files", new Blob([fileBuffer]), filename);
  form.append("ref", "api::team-member.team-member");
  form.append("refId", entryId);
  form.append("field", "photo");

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

  console.log(`Creating ${teamMembers.length} team members...\n`);

  for (const member of teamMembers) {
    try {
      const id = await createTeamMember(member);
      console.log(`✅ Created: ${member.name} (id ${id})`);

      await uploadPhoto(id, member.photo);
      console.log(`   📷 Photo uploaded and linked.`);
    } catch (err) {
      console.error(`❌ Failed for ${member.name}: ${err.message}`);
    }
  }

  console.log("\nDone. Check Content Manager -> Team Member in Strapi to verify.");
}

run();