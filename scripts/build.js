import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { faqs, facts, galleryGroups, heroImages, images, pages, site } from "../src/site-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const imageSource = path.join(root, "public", "sapelo-house-webp-seo", "images");
const imageDest = path.join(dist, "images");
const socialSource = path.join(root, "public", "og");
const socialDest = path.join(dist, "og");
const pagesBasePath = (process.env.PAGES_BASE_PATH || "").replace(/\/$/, "");
const portraitImages = new Set([
  "sapelo-house-back-deck-outdoor-lounge.webp",
  "sapelo-house-bedroom-tv-armoire-reading-chair.webp",
  "sapelo-house-covered-back-deck-seating.webp",
  "sapelo-house-covered-porch-seating.webp",
  "sapelo-house-game-room-pool-table-fireplace.webp",
  "sapelo-house-guest-bathroom-coastal-decor.webp",
  "sapelo-house-laundry-room-washer-dryer.webp",
  "sapelo-house-primary-bath-tub-and-shower.webp",
  "sapelo-house-primary-bath-vanity-and-tub.webp",
  "sapelo-house-primary-bedroom-large-bed.webp",
  "sapelo-house-primary-bedroom-sitting-area.webp",
  "sapelo-house-screened-front-door-entry.webp",
  "sapelo-house-side-yard-live-oaks-exterior.webp"
]);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(imageDest, { recursive: true });
fs.cpSync(imageSource, imageDest, { recursive: true });
fs.cpSync(socialSource, socialDest, { recursive: true });
fs.copyFileSync(path.join(root, "src", "styles.css"), path.join(dist, "styles.css"));
fs.copyFileSync(path.join(root, "src", "main.js"), path.join(dist, "main.js"));

const esc = value =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const imgPath = image => `${site.imageBase}${image.file}`;
const responsiveImgPath = (image, width) => `${site.imageBase}responsive/${image.file.replace(/\.webp$/, `-${width}.webp`)}`;
const imageDimensions = image => portraitImages.has(image.file)
  ? { width: 1800, height: 2400 }
  : { width: 2400, height: 1800 };
const imageTag = (image, sizes = "(max-width: 860px) calc(100vw - 32px), 50vw") => {
  const { width, height } = imageDimensions(image);
  return `<img src="${responsiveImgPath(image, 960)}" srcset="${responsiveImgPath(image, 960)} 960w, ${responsiveImgPath(image, 1600)} 1600w, ${imgPath(image)} ${width}w" sizes="${sizes}" width="${width}" height="${height}" alt="${esc(image.alt)}" loading="lazy" decoding="async">`;
};
const pageOut = page => page.slug === "index" ? path.join(dist, "index.html") : path.join(dist, page.slug, "index.html");
const canonical = page => `${site.baseUrl}${page.url === "/" ? "/" : page.url}`;
const active = (page, href) => page.url === href ? ' aria-current="page"' : "";
const socialImagePath = page => page.socialImage || `/og/${page.slug === "index" ? "home" : page.slug}.jpg`;
const smsMessage = "I'd love to reserve the Sapelo House. Please contact me at your earliest convenience.";
const smsHref = `sms:+19126820830?body=${encodeURIComponent(smsMessage)}`;
const textCta = (label, kind = "dark") => `<a class="btn ${kind}" href="${smsHref}">${esc(label)}</a>`;
const heroCta = ([label, href, kind]) => href === "/house/"
  ? `<a class="btn ${kind}" href="${href}">${esc(label)}</a>`
  : textCta(label, kind);
const paragraphs = copy => (Array.isArray(copy) ? copy : [copy]).map(item => `<p>${esc(item)}</p>`).join("");
const applyPagesBasePath = html => pagesBasePath
  ? html
      .replaceAll('href="/', `href="${pagesBasePath}/`)
      .replaceAll('src="/', `src="${pagesBasePath}/`)
      .replaceAll('srcset="/', `srcset="${pagesBasePath}/`)
      .replaceAll(", /images/", `, ${pagesBasePath}/images/`)
      .replaceAll("url('/images/", `url('${pagesBasePath}/images/`)
  : html;

const pageTopics = page => ({
  index: ["Sapelo House", "coastal Georgia vacation rental", "Sapelo River vacation rental", "Darien Georgia vacation rental"],
  house: ["Sapelo House amenities", "screened porch", "back deck and grill", "pool table", "large kitchen"],
  experience: ["Sapelo River dolphins", "coastal Georgia fishing trip", "screened porch mornings", "coastal Georgia getaway"],
  location: ["Sapelo River", "Darien Georgia", "Savannah day trip", "St. Simons Island day trip", "Jekyll Island day trip"],
  gallery: ["Sapelo House photos", "coastal Georgia vacation rental photos", "Sapelo River setting"],
  booking: ["Sapelo House availability", "coastal Georgia vacation rental inquiry"],
  faq: ["Sapelo House FAQ", "Sapelo River vacation rental questions", "coastal Georgia rental amenities"]
}[page.slug]);

const schemaFor = page => {
  const pageUrl = canonical(page);
  const heroImage = heroImages[page.heroKey];
  const { width, height } = imageDimensions(heroImage);
  const pageEntity = {
    "@type": page.slug === "faq" ? ["WebPage", "FAQPage"] : "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.title,
    headline: page.h1,
    description: page.description,
    inLanguage: "en-US",
    dateModified: site.lastUpdated,
    isPartOf: { "@id": `${site.baseUrl}/#website` },
    about: { "@id": `${site.baseUrl}/#sapelo-house` },
    primaryImageOfPage: { "@id": `${pageUrl}#primaryimage` },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    keywords: pageTopics(page).join(", ")
  };

  if (page.slug === "faq") {
    pageEntity.mainEntity = faqs.map(item => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }));
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.baseUrl}/#website`,
        url: `${site.baseUrl}/`,
        name: site.name,
        description: site.description,
        inLanguage: "en-US",
        publisher: { "@id": `${site.baseUrl}/#sapelo-house` }
      },
      {
        "@type": "LodgingBusiness",
        "@id": `${site.baseUrl}/#sapelo-house`,
        name: site.name,
        url: `${site.baseUrl}/`,
        description: site.description,
        mainEntityOfPage: { "@id": `${site.baseUrl}/#webpage` },
        image: Object.values(images).map(image => `${site.baseUrl}${imgPath(image)}`),
        address: {
          "@type": "PostalAddress",
          addressRegion: "Georgia",
          addressCountry: "US"
        },
        amenityFeature: [
          "Screened porch",
          "Back deck with chairs and grill",
          "Pool table",
          "Large living room",
          "Large kitchen",
          "Dining room"
        ].map(name => ({ "@type": "LocationFeatureSpecification", name, value: true }))
      },
      pageEntity,
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.baseUrl}/` },
          ...(page.url === "/" ? [] : [{ "@type": "ListItem", position: 2, name: page.navLabel, item: pageUrl }])
        ]
      },
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}#primaryimage`,
        url: `${site.baseUrl}${imgPath(heroImage)}`,
        contentUrl: `${site.baseUrl}${imgPath(heroImage)}`,
        width,
        height,
        caption: heroImage.alt,
        representativeOfPage: true
      }
    ]
  };
};

function head(page) {
  const schema = schemaFor(page);
  const heroImage = heroImages[page.heroKey];
  const socialImage = socialImagePath(page);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="theme-color" content="#17211c">
  <link rel="canonical" href="${canonical(page)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${site.locale}">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(page.ogTitle || page.title)}">
  <meta property="og:description" content="${esc(page.ogDescription || page.description)}">
  <meta property="og:url" content="${canonical(page)}">
  <meta property="og:image" content="${site.baseUrl}${socialImage}">
  <meta property="og:image:secure_url" content="${site.baseUrl}${socialImage}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(page.socialImageAlt || heroImage.alt)}">
  <link rel="icon" type="image/webp" href="${imgPath(images.riverMoss)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.twitterTitle || page.ogTitle || page.title)}">
  <meta name="twitter:description" content="${esc(page.twitterDescription || page.ogDescription || page.description)}">
  <meta name="twitter:image" content="${site.baseUrl}${socialImage}">
  <meta name="twitter:image:alt" content="${esc(page.socialImageAlt || heroImage.alt)}">
  <link rel="preload" as="image" type="image/webp" href="${responsiveImgPath(heroImage, 1600)}" fetchpriority="high">
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>`;
}

function header(page) {
  return `<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="nav-shell">
    <a class="brand" href="/">Sapelo House</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="nav-links" aria-label="Main navigation">
      ${site.nav.map(([label, href]) => `<a href="${href}"${active(page, href)}>${label}</a>`).join("")}
    </nav>
  </div>
</header>`;
}

function hero(page) {
  const heroImage = heroImages[page.heroKey];
  const positions = {
    home: "center 58%",
    house: "center 58%",
    experience: "center 62%",
    location: "center 60%",
    gallery: "center 55%",
    booking: "center 62%",
    faq: "center 58%"
  };
  return `<section class="hero hero-${page.slug}" style="--hero-image: image-set(url('${responsiveImgPath(heroImage, 1600)}') 1x, url('${imgPath(heroImage)}') 2x); --hero-position: ${positions[page.heroKey]};">
  <div class="hero-content">
    <p class="eyebrow">${esc(page.eyebrow)}</p>
    <h1>${esc(page.h1)}</h1>
    <div class="hero-copy">${paragraphs(page.intro)}</div>
    ${page.ctas ? `<div class="hero-actions">${page.ctas.map(heroCta).join("")}</div>` : ""}
    ${page.highlights ? `<ul class="hero-facts">${page.highlights.map(item => `<li>${esc(item)}</li>`).join("")}</ul>` : ""}
  </div>
</section>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container footer-inner">
    <a class="footer-brand" href="/">Sapelo House</a>
    <p class="footer-summary">A peaceful coastal Georgia stay across from the Sapelo River, made for porch mornings, coastal days, and unhurried time together.</p>
    <nav class="footer-links" aria-label="Footer navigation">
      ${site.nav.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
    </nav>
    <p class="footer-credit">Site Architecture by <a href="https://barrettsharpe.com">Barrett Sharpe</a></p>
  </div>
</footer>
<script src="/main.js" defer></script>
</body>
</html>`;
}

function proofCard(key, title, copy) {
  const image = images[key];
  return `<article class="proof-card">
    ${imageTag(image, "(max-width: 860px) calc(100vw - 32px), 33vw")}
    <div><h3>${esc(title)}</h3><p>${esc(copy)}</p></div>
  </article>`;
}

function imagePanel(key, caption) {
  const image = images[key];
  return `<figure class="image-panel">
    ${imageTag(image, "(max-width: 860px) calc(100vw - 32px), 38vw")}
    <figcaption>${esc(caption)}</figcaption>
  </figure>`;
}

function sensoryBand(title, copy, items) {
  return `<section class="section sensory-band">
    <div class="container sensory-grid">
      <div>
        <p class="eyebrow">The feeling</p>
        <h2>${esc(title)}</h2>
        <p>${esc(copy)}</p>
      </div>
      <div class="sensory-list">
        ${items.map(item => `<article><span>${esc(item[0])}</span><p>${esc(item[1])}</p></article>`).join("")}
      </div>
    </div>
  </section>`;
}

function bookingInvitation(eyebrow, title, copy) {
  return `<section class="section booking-cta-band">
    <div class="container booking-cta-inner">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h2>${esc(title)}</h2>
      <p>${esc(copy)}</p>
      <div class="button-row">${textCta("Reserve The Sapelo House", "primary")}</div>
    </div>
  </section>`;
}

const galleryCaptions = {
  riverView: "The Sapelo River across the way, framed by the trees that set the pace here.",
  riverYard: "A long view through live oaks, palms, and Spanish moss toward the river.",
  riverMoss: "Spanish moss, still water, and a horizon that asks nothing of you.",
  sideYard: "The side lawn beneath mature live oaks.",
  exterior: "Sapelo House, waiting at the end of a coastal Georgia day.",
  porchSeating: "A shaded seat for the first cup of coffee or the last conversation of the evening.",
  frontPorch: "The covered porch, where a slow morning can stay slow.",
  screenedEntry: "The screened entry between the house and the coastal air outside.",
  backDeck: "The back deck: chairs, a grill, and no dinner reservation required.",
  coveredBackDeck: "Covered outdoor seating for the part of the evening nobody wants to end.",
  kitchenIsland: "The kitchen island, where plans are made and changed over breakfast.",
  kitchenOpen: "An open kitchen that keeps the cook in the conversation.",
  kitchenWhite: "White cabinetry, warm wood, and room to make more than a quick meal.",
  dining: "The dining table, ready for breakfast, dinner, or one more story before everyone gets up.",
  livingPool: "Living space and pool table within easy reach of each other.",
  sectional: "A generous sectional for the quiet hour after a day out.",
  livingSeating: "Comfortable seating when nobody feels like going anywhere else.",
  openConcept: "Kitchen, dining, living, and play all sharing the same easy rhythm.",
  openLivingKitchen: "The gathering spaces flow together, so people tend to do the same.",
  poolTableFireplace: "The pool table, where the person who does not really play may suddenly care very much about winning.",
  primaryBedroom: "A calm room waiting at the end of a full day.",
  primaryBedroomSitting: "A bedroom sitting area with soft window light.",
  bedroomArmoire: "A reading chair and quiet corner away from the shared rooms.",
  guestBedroomDresser: "A guest bedroom with warm wood tones and simple comfort.",
  guestBedroomTv: "A guest room with its own place to settle in.",
  brightBedroom: "Morning light in one of the guest bedrooms.",
  primaryBathVanity: "A double vanity and soaking tub in the primary bathroom.",
  primaryBathTub: "The primary bath with tub, walk-in shower, and storage.",
  guestBath: "A guest bathroom with clean coastal details.",
  laundry: "A full-size washer and dryer for the practical side of a longer stay."
};

function homeBody() {
  return `<main id="main">
  <section class="section intro-section">
    <div class="container editorial-intro">
      <p class="intro-kicker">Welcome to Sapelo House</p>
      <h2>Some places give you somewhere to stay. Others give you a story to take home.</h2>
      <div class="story-copy">${paragraphs([
        "There is a moment when you arrive on this part of the Georgia coast when everything seems to change.",
        "The roads become quieter. Live oaks begin stretching over the landscape. Spanish moss moves gently in the breeze. And somewhere beyond the trees, tidal water winds through a world that seems to operate on its own clock.",
        "Sapelo House belongs to that world.",
        "Across from the Sapelo River, it is a comfortable place to gather, cook, laugh, play pool, sit outside, explore the coast, and remember how good it feels when nobody is rushing you toward the next thing.",
        "Wake up with coffee on the screened porch and watch the river setting come alive. Spend the afternoon fishing nearby or exploring Darien, St. Simons Island, Jekyll Island, or Savannah. Then come home, fire up the grill, settle into the back deck, and let evening arrive without much of a plan.",
        "Because sometimes the trips we remember most are not the ones where we did everything. They are the ones where we finally had time for each other."
      ])}</div>
    </div>
    <div class="container wide-photo-feature">
      ${imagePanel("riverMoss", "Sapelo River scenery framed by Spanish moss")}
    </div>
  </section>
  <section class="section">
    <div class="container section-heading">
      <div>
        <p class="eyebrow">Why Sapelo House</p>
        <h2>Come for coastal Georgia. Stay for the way it feels here.</h2>
      </div>
      <p>Sapelo House brings together two things that are surprisingly difficult to find in the same getaway: a beautiful coastal setting and a home with enough comfortable gathering spaces to actually enjoy the people you came with. From the screened porch and outdoor spaces to the large kitchen, dining room, living room, and pool table, everyone has room to settle in without losing the feeling of being together.</p>
    </div>
    <div class="container proof-grid photo-story-grid">
      ${proofCard("riverMoss", "The River Sets the Pace", "Look through the live oaks and Spanish moss and the Sapelo River becomes part of the backdrop to your stay. It is the kind of view that makes you stand still for a second. After a few mornings here, standing still starts to feel like a very good idea.")}
      ${proofCard("frontPorch", "Mornings Worth Waking Up For", "Bring your coffee to the screened porch before the day gets busy. Look toward the river. Watch for dolphins. Talk about what you might do today, or decide there is nowhere you particularly need to be.")}
      ${proofCard("openLivingKitchen", "A House Made for Being Together", "The kitchen, dining area, living spaces, and pool table naturally pull people back together. Cook something. Challenge somebody to a game. Tell stories, laugh too loudly, and stay up later than you planned.")}
    </div>
  </section>
  <section class="section band">
    <div class="container feature">
      <div class="feature-copy">
        <p class="eyebrow">Find Your Coastal Rhythm</p>
        <h2>There is no itinerary required here.</h2>
        <div class="story-copy compact">${paragraphs([
          "Maybe you wake early and go fishing. Maybe you head toward Darien and spend the day discovering one of Georgia's historic coastal communities. Maybe St. Simons Island or Jekyll Island becomes today's adventure. Maybe Savannah calls for a longer day trip. Or maybe nobody wants to leave the house at all.",
          "There is something wonderfully freeing about staying in a place where the day does not have to be optimized. Explore as much of coastal Georgia as you want and still know that, at the end of it, Sapelo House is waiting.",
          "Come back. Put something on the grill. Find a chair outside. Pour a drink. Play another game of pool. Watch the light fade through the trees. Tomorrow can figure itself out tomorrow."
        ])}</div>
      </div>
      <div class="feature-image">${imageTag(images.backDeck)}</div>
    </div>
  </section>
  ${sensoryBand("The best thing about Sapelo House may be what happens when nothing is happening.", "Rooms, furniture, appliances, and amenities matter. But years later, you remember the morning everybody stayed at the table talking, the dolphin seen from the porch, dinner outside, the pool game that got competitive, the quiet, the laughter, and realizing you had not checked the time in hours.", [
    ["Morning", "Let the river wake up first. Step onto the screened porch with your coffee, look through the moss-draped trees, watch for dolphins, and give the day a chance to arrive slowly."],
    ["Day", "Follow the coast wherever it leads. Go fishing nearby, explore Darien, spend the day on St. Simons Island or Jekyll Island, make Savannah part of the adventure, or simply wander."],
    ["Evening", "Come home before the day is over. Take a seat on the back deck, put dinner on the grill, then wander inside for conversation or a game of pool."]
  ])}
  <section class="section emotional-break">
    <div class="container editorial-intro">
      <p class="intro-kicker">The Part You Cannot Put on an Amenities List</p>
      <h2>You may come here to see coastal Georgia. You may leave missing the porch.</h2>
      <div class="story-copy">${paragraphs([
        "That is the funny thing about places like Sapelo House. The grand adventures are wonderful. But when the trip is over, sometimes the things people miss are surprisingly small.",
        "The chair where they drank their coffee. The trees moving in the morning breeze. The sound of everyone laughing inside. That familiar walk back through the door after a long day exploring.",
        "For a few days, a vacation house starts feeling less like somewhere you rented and more like somewhere you belong. That is the experience we hope you find here."
      ])}</div>
    </div>
  </section>
  <section class="section booking-cta-band">
    <div class="container booking-cta-inner">
      <p class="eyebrow">Your Sapelo House Story</p>
      <h2>Someday, this trip will be a story you tell.</h2>
      <p>Maybe it becomes the weekend everybody keeps talking about. Maybe it is the family trip that finally gets everyone in the same place. Maybe it is a few quiet days you did not realize how badly you needed. Whatever brings you to coastal Georgia, Sapelo House gives you a beautiful place to begin. The river is here. The porch is waiting. And your dates may still be open.</p>
    </div>
  </section>
</main>`;
}

function houseBody() {
  const cards = [
    ["frontPorch", "Coffee Before Everyone Wakes Up", "The screened porch earns its place in the day early. Bring out a mug, listen before the house stirs, look toward the Sapelo River, and watch for dolphins beyond the trees."],
    ["kitchenIsland", "The Room Everyone Finds Eventually", "Breakfast begins here. So do conversations about fishing, Darien, the islands, and whether anyone actually wants a plan. The island keeps whoever is cooking close to all of it."],
    ["dining", "Stay at the Table a Little Longer", "The dining room gives shared meals their own place. Nobody needs the table back in ninety minutes. There is time for another helping and the story someone forgot to finish."],
    ["sectional", "A Soft Place to Land", "After a day near the water or out along the Georgia coast, the large living room asks very little: drop what you are carrying, choose a seat, and let the house become home base again."],
    ["poolTableFireplace", "One More Game Before Bed", "The pool table changes the energy. One game becomes five. The person who said they do not really play begins studying every angle. Bedtime quietly loses the argument."],
    ["backDeck", "Dinner Does Not Need a Reservation", "The back deck has chairs and a grill, which is sometimes all an evening needs. Food cooks outside. Conversation carries on. Nobody is waiting to turn the table."]
  ];
  return `<main id="main">
  <section class="section intro-section">
    <div class="container feature reverse">
      <div class="feature-copy">
        <p class="eyebrow">Arrive and settle in</p>
        <h2>The house reveals itself through the way people use it.</h2>
        <div class="story-copy compact">${paragraphs([
          "At first, you notice the setting. The live oaks. Spanish moss. The sense that the Sapelo River is part of the day even when you are still unpacking.",
          "Then the house begins doing what a good vacation house should. Bags disappear into bedrooms. Someone opens the porch door. Somebody else finds the kitchen. Before long, people have spread out without feeling separated.",
          "That balance matters here. There are quiet corners when you want one and shared rooms that make being together feel unplanned."
        ])}</div>
      </div>
      <div class="wide-photo-feature">
        ${imagePanel("exterior", "Front exterior of Sapelo House")}
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container section-heading">
      <div><p class="eyebrow">A day inside the house</p><h2>Every room has a practical purpose. The good ones become something more.</h2></div>
      <p>A porch becomes the place you go before breakfast. A kitchen becomes command central. A pool table becomes the reason everyone is still awake.</p>
    </div>
    <div class="container card-grid house-tour-grid">${cards.map(([key, title, copy]) => proofCard(key, title, copy)).join("")}</div>
  </section>
  <section class="section dark-band">
    <div class="container feature reverse">
      <div class="feature-copy">
        <p class="eyebrow">When the day winds down</p>
        <h2>The bedrooms wait quietly beyond the shared rooms.</h2>
        <p>Eventually the pool game ends. The kitchen gets quieter. People peel away toward bedrooms and baths, tired in the satisfying way that follows a day outside. Laundry is there when a longer stay calls for it. Tomorrow can begin on the porch all over again.</p>
      </div>
      <div class="feature-image">${imageTag(images.openConcept)}</div>
    </div>
  </section>
  ${bookingInvitation("Come See How It Feels", "The house makes more sense once everyone is in it.", "If Sapelo House feels like the right setting for your people, ask about the dates you have in mind.")}
</main>`;
}

function experienceBody() {
  return `<main id="main">
  ${sensoryBand("The day has room to become whatever it becomes.", "There is no single correct way to spend a day at Sapelo House. The pleasure is having several good choices and no pressure to choose quickly.", [
    ["Early", "The first sound may be the porch door. Coffee follows. Through the live oaks and Spanish moss, the Sapelo River comes slowly into view. Watch for dolphins. Let everyone else sleep."],
    ["Later", "Fishing may pull you out early. Darien may be the plan. St. Simons Island, Jekyll Island, or Savannah may claim the day. Staying put remains a perfectly respectable decision."],
    ["Home", "Whatever happened out there, coming back is part of the pleasure: shoes off, something cold to drink, one person drifting toward the kitchen and another toward a chair outside."]
  ])}
  <section class="section">
    <div class="container feature">
      <div class="feature-copy">
        <p class="eyebrow">The pleasure of coming back</p>
        <h2>The best part of going out may be returning to the house.</h2>
        <div class="story-copy compact">${paragraphs([
          "Most trips are described by the places you leave the house to see. That leaves out something important.",
          "It leaves out coming through the door after a day along the Georgia coast. Dropping everything. Hearing someone ask what is for dinner. Finding the light different on the deck than it was when you left.",
          "Sapelo House becomes familiar quickly. By the second return, you already know where you want to sit."
        ])}</div>
      </div>
      <div class="feature-image">${imageTag(images.riverYard)}</div>
    </div>
  </section>
  <section class="section band">
    <div class="container proof-grid photo-story-grid">
      ${proofCard("backDeck", "Dinner Moves Outside", "Put something on the grill and let the evening happen around it. There is no reservation time, no dress code, and no reason to leave when the conversation gets good.")}
      ${proofCard("livingPool", "The Night Finds Its Own Entertainment", "After dinner, somebody suggests pool. Someone else says one game. This is how perfectly ordinary evenings become the part of a trip people keep retelling.")}
      ${proofCard("frontPorch", "Tomorrow Can Wait Until Morning", "The day ends without the normal world pressing in. Sit outside a little longer. Make plans if you want them. Leave the next day open if you do not.")}
    </div>
  </section>
  ${bookingInvitation("A Few Days at a Different Pace", "You do not need a full itinerary. You only need the dates.", "If this is how you want your next coastal Georgia getaway to feel, start the conversation with a text.")}
</main>`;
}

function locationBody() {
  const locations = [
    ["Darien, Georgia", "About 17 minutes away, Darien is the nearest of the coastal destinations that can shape a day beyond the house."],
    ["St. Simons Island", "Less than 1 hour away, close enough for an island day before returning to the quiet near the Sapelo River."],
    ["Jekyll Island", "About 1 hour away, another direction the day can take when the coast is calling."],
    ["Savannah, Georgia", "Sapelo House is about 1 hour south of Savannah, making the city possible without making it the setting of the entire stay."]
  ];
  return `<main id="main">
  <section class="section intro-section">
    <div class="container editorial-intro">
      <p class="intro-kicker">The quiet side of the Georgia coast</p>
      <h2>You can go find people when you want them. And come back to quiet when you have had enough.</h2>
      <div class="story-copy">${paragraphs([
        "Coastal Georgia changes character from one place to the next. A city day in Savannah feels different from an island day on St. Simons or Jekyll. Darien brings the scale back down. The roads between them pass through a landscape shaped by tidal water, live oaks, marsh, and sky.",
        "Sapelo House offers a way to know several sides of that coast without sleeping in the middle of its busiest one.",
        "Across from the Sapelo River, the house feels removed in the right way. Interesting places remain within reach. So does fishing near the river. But every outing ends with the road leading back to Spanish moss, porch chairs, and a quieter evening."
      ])}</div>
    </div>
  </section>
  <section class="section">
    <div class="container feature">
      <div class="feature-copy">
        <p class="eyebrow">The Sapelo River setting</p>
        <h2>The landscape changes the way the day feels.</h2>
        <p>Live oaks and Spanish moss frame the view toward the Sapelo River. The water is across from the house, part of the setting rather than a promise of private access. It is enough to slow the eye down.</p>
        <p>Fishing opportunities nearby give early risers a reason to leave before breakfast. Everyone else can take the morning at porch speed.</p>
      </div>
      <div class="feature-image">${imageTag(images.riverView)}</div>
    </div>
  </section>
  <section class="section dark-band">
    <div class="container section-heading">
      <div><p class="eyebrow">Choose a direction</p><h2>Four different coastal days, all within reach.</h2></div>
      <p>Travel times are approximate. What matters more is the choice: go out when curiosity wins, then come back when quiet sounds better.</p>
    </div>
    <div class="container location-list">${locations.map(([title, copy]) => `<article><h2>${esc(title)}</h2><p>${esc(copy)}</p></article>`).join("")}</div>
  </section>
  ${bookingInvitation("Your Coastal Georgia Base", "See the coast. Then leave the crowds behind.", "Ask about a stay near the Sapelo River, with Darien, the islands, Savannah, and nearby fishing ready when you want them.")}
</main>`;
}

function galleryBody() {
  return `<main id="main">
  <section class="section">
    <div class="container section-heading">
      <div><p class="eyebrow">Look slowly</p><h2>Do not just look at the rooms. Look for the moments that might happen in them.</h2></div>
      <p>The porch before breakfast. Everyone drifting toward the kitchen. Dinner outside. One last pool game. The quieter rooms after the day is done.</p>
    </div>
    <div class="container wide-photo-feature gallery-feature">
      ${imagePanel("riverView", "River view from the Sapelo House lawn")}
    </div>
    <div class="container">
      ${galleryGroups.map(group => `<section class="gallery-group" aria-labelledby="${group.title.toLowerCase().replaceAll(" ", "-")}">
        <h2 id="${group.title.toLowerCase().replaceAll(" ", "-")}">${esc(group.title)}</h2>
        <p>${esc(group.description)}</p>
        <div class="gallery-grid">
          ${group.keys.map(key => {
            const image = images[key];
            return `<figure class="gallery-card">${imageTag(image, "(max-width: 860px) calc(100vw - 32px), 33vw")}<figcaption>${esc(galleryCaptions[key] || image.alt)}</figcaption></figure>`;
          }).join("")}
        </div>
      </section>`).join("")}
    </div>
  </section>
  ${bookingInvitation("Seen Enough to Wonder", "The next picture could have your people in it.", "If the house and its setting feel right, ask whether your dates are still open.")}
</main>`;
}

function bookingBody() {
  return `<main id="main">
  <section class="section intro-section">
    <div class="container editorial-intro">
      <p class="intro-kicker">The next step is simple</p>
      <h2>You do not need to have the whole trip figured out.</h2>
      <div class="story-copy">${paragraphs([
        "Start with the dates you are considering. If they are flexible, say that. If you already know exactly when you want to come, say that too.",
        "A text opens a direct conversation about availability and the practical details of the stay. No elaborate form. No pressure to make a decision before your questions are answered."
      ])}</div>
    </div>
  </section>
  <section class="section">
    <div class="container contact-layout">
      <aside class="contact-panel">
        <p class="eyebrow">What to include</p>
        <h2>Tell us what you know so far.</h2>
        <p>Your first text can be brief. The most useful details are the ones that help begin the right conversation.</p>
        <ul class="quiet-list">
          <li>The dates or general travel window you are considering</li>
          <li>How many people may be coming</li>
          <li>Any questions that matter before you book</li>
        </ul>
      </aside>
      <div class="form-panel direct-text-panel">
        <p class="eyebrow">Text Sapelo House</p>
        <h2>See if your dates are available.</h2>
        <p>The button opens a prefilled message on your device. Add your dates, group size, or questions before sending it.</p>
        ${textCta("Reserve The Sapelo House", "dark")}
        <p class="form-note">Text <a href="tel:+19126820830">912-682-0830</a>. Standard messaging rates may apply.</p>
      </div>
    </div>
  </section>
</main>`;
}

function faqBody() {
  return `<main id="main">
  <section class="section intro-section">
    <div class="container feature">
      <div class="feature-copy">
        <p class="eyebrow">Straight answers</p>
        <h2>Start with what matters most to your stay.</h2>
        <p>Sapelo House is across from the Sapelo River, with shared indoor and outdoor spaces, nearby fishing, and several coastal Georgia destinations within reach. The details below cover the questions most guests ask first.</p>
      </div>
      <div class="feature-image">${imageTag(images.sideYard)}</div>
    </div>
  </section>
  <section class="section">
    <div class="container section-heading">
      <div><p class="eyebrow">Before you book</p><h2>Useful details, without the runaround.</h2></div>
      <p>For rates, sleeping capacity, policies, arrival information, and questions specific to your group, text 912-682-0830.</p>
    </div>
    <div class="container card-grid">
      ${faqs.map(item => `<article class="faq-item"><h2>${esc(item.q)}</h2><p>${esc(item.a)}</p></article>`).join("")}
    </div>
  </section>
  <section class="section dark-band">
    <div class="container section-heading">
      <div><p class="eyebrow">At a glance</p><h2>The setting, spaces, and coast around you.</h2></div>
      <p>The essentials behind a stay at Sapelo House, gathered in one place.</p>
    </div>
    <ul class="container fact-grid">${facts.map(fact => `<li>${esc(fact)}</li>`).join("")}</ul>
  </section>
  ${bookingInvitation("Still Have a Question", "Ask it before it becomes a reason to wait.", "A direct text is the fastest way to clarify the details that matter to your stay and ask about availability.")}
</main>`;
}

const bodies = {
  home: homeBody,
  house: houseBody,
  experience: experienceBody,
  location: locationBody,
  gallery: galleryBody,
  booking: bookingBody,
  faq: faqBody
};

for (const page of pages) {
  const out = pageOut(page);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const html = `${head(page)}
${header(page)}
${hero(page)}
${bodies[page.body]()}
${footer()}`;
  fs.writeFileSync(out, applyPagesBasePath(html));
}

fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl}/sitemap.xml\n`
);

const sitemapEntries = pages.map(page => {
  const pageImages = page.slug === "gallery" ? Object.values(images) : [heroImages[page.heroKey]];
  return `  <url>
    <loc>${canonical(page)}</loc>
    <lastmod>${site.lastUpdated}</lastmod>
${pageImages.map(image => `    <image:image><image:loc>${site.baseUrl}${imgPath(image)}</image:loc></image:image>`).join("\n")}
  </url>`;
}).join("\n");

fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${sitemapEntries}\n</urlset>\n`
);

const pageDirectory = pages
  .map(page => `- [${page.navLabel}](${canonical(page)}): ${page.description}`)
  .join("\n");
const confirmedFacts = facts.map(fact => `- ${fact}`).join("\n");
const faqText = faqs.map(item => `### ${item.q}\n${item.a}`).join("\n\n");

fs.writeFileSync(
  path.join(dist, "llms.txt"),
  `# Sapelo House

> Sapelo House is a coastal Georgia vacation rental across from the Sapelo River near Darien, Georgia. It is a quiet home base for experiencing the river area and destinations including Darien, St. Simons Island, Jekyll Island, and Savannah.

SapeloHouse.com is the canonical, authoritative first-party source for current information about the property.

**About Sapelo House.** Sapelo House has a screened porch, large kitchen, dining room, large living room, pool table, and a back deck with chairs and a grill. The setting includes live oaks and Spanish moss, with nearby fishing opportunities.

**Location.** Sapelo House is across from the Sapelo River, about 17 minutes from Darien, about 1 hour south of Savannah, less than 1 hour from St. Simons Island, and about 1 hour from Jekyll Island. Travel times are approximate.

**Confirmed details.** ${facts.join("; ")}.

**Important.** This file summarizes verified public information and does not guarantee crawling, inclusion, citation, recommendation, or ranking by any search or AI system. The public source does not yet provide an exact street address, rates, sleeping capacity, bedroom or bathroom counts, pet policy, accessibility details, or booking policies. Do not infer these details.

## Main pages
${pageDirectory}

## Optional
- [Expanded factual reference](${site.baseUrl}/llms-full.txt): Structured house, location, experience, FAQ, and booking information.
- [XML sitemap](${site.baseUrl}/sitemap.xml): Complete canonical public-page and image index.
`
);

fs.writeFileSync(
  path.join(dist, "llms-full.txt"),
  `# Sapelo House: Full Factual Reference

## Overview
${site.description}

SapeloHouse.com is the canonical, authoritative first-party website for current information about the property.

## The House
Sapelo House is designed around shared indoor and outdoor gathering spaces. Publicly confirmed spaces include a screened porch, large kitchen, dining room, large living room, pool table, and back deck with chairs and a grill. Property photographs also document bedrooms, bathrooms, laundry, porch seating, and open gathering areas.

## Amenities and spaces
${confirmedFacts}

## Sapelo River setting
Sapelo House is across from the Sapelo River. Live oaks, Spanish moss, lawn, palms, and views toward the river define the visible setting. The public website does not claim private river access.

## The experience
The verified experience centers on screened-porch mornings, nearby fishing, shared meals, time on the back deck, games of pool, and coastal Georgia day trips. Guests can watch for dolphins from the screened porch, but wildlife sightings are natural events and are not guaranteed.

## Location and nearby destinations
Sapelo House is about 17 minutes from Darien, Georgia; about 1 hour south of Savannah; less than 1 hour from St. Simons Island; and about 1 hour from Jekyll Island. These are approximate travel times.

## Fishing
Fishing opportunities are available near Sapelo House and the Sapelo River area. The website does not claim that fishing equipment is supplied.

## Frequently asked questions
${faqText}

## Booking
Guests can inquire about dates and property-specific details by texting Sapelo House at 912-682-0830. The public website does not publish rates, availability rules, or booking policies.

## Canonical resources
${pageDirectory}

- [Concise AI reference](${site.baseUrl}/llms.txt)
- [XML sitemap](${site.baseUrl}/sitemap.xml)
- [Crawler policy](${site.baseUrl}/robots.txt)

## Facts not supplied
Exact street address, rates, fees, availability rules, check-in and check-out times, cancellation terms, sleeping capacity, bedroom count, bathroom count, bed sizes, accessibility features, pet policy, and parking details have not been supplied. These should not be inferred or stated as facts.

Last updated: ${site.lastUpdated}
`
);

console.log(`Built ${pages.length} pages in dist/`);
