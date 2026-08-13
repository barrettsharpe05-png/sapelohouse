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
const socialImagePath = page => `/og/${page.slug === "index" ? "home" : page.slug}.jpg`;
const smsMessage = "I'd love to reserve the Sapelo House. Please contact me at your earliest convenience.";
const smsHref = `sms:+19126820830?body=${encodeURIComponent(smsMessage)}`;
const textCta = (label, kind = "dark") => `<a class="btn ${kind}" href="${smsHref}">${esc(label)}</a>`;
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
  <meta property="og:image:alt" content="${esc(heroImage.alt)}">
  <link rel="icon" type="image/webp" href="${imgPath(images.riverMoss)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.twitterTitle || page.ogTitle || page.title)}">
  <meta name="twitter:description" content="${esc(page.twitterDescription || page.ogDescription || page.description)}">
  <meta name="twitter:image" content="${site.baseUrl}${socialImage}">
  <meta name="twitter:image:alt" content="${esc(heroImage.alt)}">
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
    ${page.ctas ? `<div class="hero-actions">${page.ctas.map(([label, , kind]) => textCta(label, kind)).join("")}</div>` : ""}
    ${page.highlights ? `<ul class="hero-facts">${page.highlights.map(item => `<li>${esc(item)}</li>`).join("")}</ul>` : ""}
  </div>
</section>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <p class="footer-brand">Sapelo House</p>
      <p>Sapelo House is a peaceful coastal Georgia vacation rental across from the Sapelo River, a place for screened-porch mornings, nearby fishing, coastal adventures, long conversations, and time together.</p>
    </div>
    <nav class="footer-links" aria-label="Footer navigation">
      ${site.nav.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
    </nav>
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
        <div class="button-row">${textCta("Discover the Area", "dark")}${textCta("See More of Sapelo House", "light")}</div>
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
      <div class="button-row">${textCta("Check Availability", "primary")}${textCta("Explore the House", "secondary")}</div>
    </div>
  </section>
</main>`;
}

function houseBody() {
  const cards = [
    ["frontPorch", "Screened porch", "A shaded porch space anchors the morning experience, including the confirmed opportunity to watch dolphins."],
    ["backDeck", "Back deck with grill", "The photos show a back deck with outdoor seating and a grill for relaxed coastal evenings."],
    ["sectional", "Large living room", "The living room photos show generous seating and an open layout for gathering."],
    ["kitchenIsland", "Large kitchen", "White cabinetry, stainless appliances, and an island are visible in the kitchen photos."],
    ["dining", "Dining room", "A dedicated dining room sits near the kitchen for shared meals."],
    ["poolTableFireplace", "Pool table", "The pool table creates an easy evening activity after days near the river or coast."]
  ];
  return `<main id="main">
  <section class="section intro-section">
    <div class="container feature reverse">
      <div class="feature-copy">
        <p class="eyebrow">First impression</p>
        <h2>Plainspoken comfort, framed by coastal light and outdoor rooms.</h2>
        <p>The home centers the spaces that make a shared stay comfortable: porch seating, a back deck, a large living room, a large kitchen, a dining room, and a pool table.</p>
      </div>
      <div class="wide-photo-feature">
        ${imagePanel("exterior", "Front exterior of Sapelo House")}
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container section-heading">
      <div><p class="eyebrow">Photo-led tour</p><h2>The house keeps the stay grounded in shared spaces.</h2></div>
      <p>Explore the rooms and outdoor spaces that shape daily life at Sapelo House, shown through the real property photography.</p>
    </div>
    <div class="container card-grid house-tour-grid">${cards.map(([key, title, copy]) => proofCard(key, title, copy)).join("")}</div>
  </section>
  <section class="section dark-band">
    <div class="container feature reverse">
      <div class="feature-copy">
        <p class="eyebrow">Inside and outside</p>
        <h2>Move naturally from kitchen to living room to porch to deck.</h2>
        <p>Warm floors, comfortable seating, natural light, and outdoor places to sit in the shade or near the grill give the home its relaxed coastal character.</p>
      </div>
      <div class="feature-image">${imageTag(images.openConcept)}</div>
    </div>
  </section>
</main>`;
}

function experienceBody() {
  const items = [
    "Morning coffee on the screened porch",
    "Watching dolphins from the screened porch",
    "Fishing opportunities nearby",
    "Slow coastal evenings on the back deck",
    "Playing pool after a day outside",
    "Cooking and dining together",
    "Day trips to Darien, Savannah, St. Simons Island, and Jekyll Island"
  ];
  return `<main id="main">
  ${sensoryBand("A stay designed around unforced moments.", "Think dolphins from the screened porch, nearby fishing, easy day trips, shared meals, deck evenings, and games around the pool table.", [
    ["Porch", "Wake slowly and look toward the Sapelo River experience."],
    ["Water", "Use the house as a calm base for nearby fishing opportunities."],
    ["Together", "Cook, dine, sit outside, and play pool without leaving the house."]
  ])}
  <section class="section">
    <div class="container feature">
      <div class="feature-copy">
        <p class="eyebrow">A slower kind of trip</p>
        <h2>The experience is quiet, scenic, and built around real moments.</h2>
        <p>The character of the stay comes from concrete details: a peaceful coastal setting, dolphins from the screened porch, nearby fishing, outdoor seating, a grill, a pool table, and generous gathering spaces.</p>
        <ul class="quiet-list">${items.map(item => `<li>${esc(item)}</li>`).join("")}</ul>
      </div>
      <div class="feature-image">${imageTag(images.riverYard)}</div>
    </div>
  </section>
  <section class="section band">
    <div class="container proof-grid photo-story-grid">
      ${proofCard("frontPorch", "Evenings Outside", "Covered seating creates a shaded outdoor place to settle in.")}
      ${proofCard("livingPool", "Games After Dinner", "The pool table gives guests a built-in activity without leaving the house.")}
      ${proofCard("dining", "Meals Together", "The dining room and large kitchen support the simple rhythm of cooking and eating together.")}
    </div>
  </section>
</main>`;
}

function locationBody() {
  const locations = [
    ["Darien, Georgia", "About 17 minutes from Sapelo House."],
    ["Savannah, Georgia", "About 1 hour south of Savannah."],
    ["St. Simons Island", "Less than 1 hour from Sapelo House."],
    ["Jekyll Island", "About 1 hour from Sapelo House."]
  ];
  return `<main id="main">
  <section class="section intro-section">
    <div class="container editorial-intro">
      <p class="intro-kicker">Coastal Georgia context</p>
      <h2>Close enough for day trips, quiet enough to feel apart from them.</h2>
      <p>Sapelo House is across from the Sapelo River and within practical reach of Darien, Savannah, St. Simons Island, and Jekyll Island, giving travelers useful regional context for planning a stay.</p>
    </div>
  </section>
  <section class="section">
    <div class="container feature">
      <div class="feature-copy">
        <p class="eyebrow">Coastal Georgia base</p>
        <h2>A peaceful Sapelo River-area stay with nearby coastal day trips.</h2>
        <p>Sapelo House is located across from the Sapelo River in coastal Georgia. Regional travel times make it easy to understand the setting while the precise arrival details remain part of the booking process.</p>
        <p>Guests can plan days around nearby fishing opportunities, Darien, Savannah, St. Simons Island, and Jekyll Island, then return to a quieter river-area setting.</p>
      </div>
      <div class="feature-image">${imageTag(images.riverView)}</div>
    </div>
  </section>
  <section class="section dark-band">
    <div class="container section-heading">
      <div><p class="eyebrow">Approximate distances</p><h2>A well-connected base for exploring the Georgia coast.</h2></div>
      <p>Travel times are approximate and offer a practical starting point for planning coastal Georgia day trips.</p>
    </div>
    <div class="container location-list">${locations.map(([title, copy]) => `<article><h2>${esc(title)}</h2><p>${esc(copy)}</p></article>`).join("")}</div>
  </section>
</main>`;
}

function galleryBody() {
  return `<main id="main">
  <section class="section">
    <div class="container section-heading">
      <div><p class="eyebrow">The property in pictures</p><h2>Move from the river setting to the porch, deck, and shared rooms.</h2></div>
      <p>Browse the real spaces in a natural sequence, from the landscape and outdoor rooms to the kitchen, living areas, bedrooms, baths, and recreation space.</p>
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
            return `<figure class="gallery-card">${imageTag(image, "(max-width: 860px) calc(100vw - 32px), 33vw")}<figcaption>${esc(image.alt)}</figcaption></figure>`;
          }).join("")}
        </div>
      </section>`).join("")}
    </div>
  </section>
</main>`;
}

function bookingBody() {
  return `<main id="main">
  <section class="section intro-section">
    <div class="container editorial-intro">
      <p class="intro-kicker">Your Sapelo House Story</p>
      <h2>A quieter kind of coastal Georgia getaway begins with a conversation.</h2>
      <p>Whether you are coming to fish, explore Darien and the Golden Isles, spend time with people you love, or simply disappear from the noise for a few days, text us to ask about your dates.</p>
    </div>
  </section>
  <section class="section">
    <div class="container contact-layout">
      <aside class="contact-panel">
        <p class="eyebrow">Plan your stay</p>
        <h2>Start with the dates. We will take it from there.</h2>
        <p>A text opens a direct conversation about availability, your travel window, and the owner-specific details that matter before booking.</p>
        <ul class="quiet-list">
          <li>Ask about availability</li>
          <li>Share desired dates and guest count</li>
          <li>Ask owner-specific questions before booking</li>
        </ul>
      </aside>
      <div class="form-panel direct-text-panel">
        <p class="eyebrow">Text Sapelo House</p>
        <h2>Ask about your dates directly.</h2>
        <p>Your message will open prefilled on your device. Add preferred dates or questions before sending whenever you are ready.</p>
        ${textCta("Text to Reserve Sapelo House", "dark")}
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
        <p class="eyebrow">Stay details</p>
        <h2>The practical questions, answered plainly.</h2>
        <p>Start with the confirmed location details, amenities, travel times, and experiences that can help you decide whether Sapelo House fits the trip you have in mind.</p>
      </div>
      <div class="feature-image">${imageTag(images.sideYard)}</div>
    </div>
  </section>
  <section class="section">
    <div class="container section-heading">
      <div><p class="eyebrow">Clear answers</p><h2>Facts visitors can trust.</h2></div>
      <p>Rates, sleeping capacity, policies, and other owner-specific details should be confirmed as part of the booking inquiry.</p>
    </div>
    <div class="container card-grid">
      ${faqs.map(item => `<article class="faq-item"><h2>${esc(item.q)}</h2><p>${esc(item.a)}</p></article>`).join("")}
    </div>
  </section>
  <section class="section dark-band">
    <div class="container section-heading">
      <div><p class="eyebrow">Confirmed at a glance</p><h2>What Sapelo House offers.</h2></div>
      <p>A concise view of the setting, travel times, outdoor spaces, and shared rooms.</p>
    </div>
    <ul class="container fact-grid">${facts.map(fact => `<li>${esc(fact)}</li>`).join("")}</ul>
  </section>
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

> Sapelo House is a coastal Georgia vacation rental home across from the Sapelo River, about 17 minutes from Darien and about 1 hour south of Savannah.

Canonical website: ${site.baseUrl}/
Last updated: ${site.lastUpdated}

## Confirmed facts
${confirmedFacts}

## Best fit
Sapelo House may suit travelers looking for a peaceful coastal Georgia stay, nearby fishing opportunities, shared indoor and outdoor gathering spaces, and day-trip access to Darien, Savannah, St. Simons Island, and Jekyll Island.

## Canonical pages
${pageDirectory}

## Important limits
The public source does not yet provide an exact street address, rates, sleeping capacity, bedroom or bathroom counts, pet policy, accessibility details, or booking policies. Do not infer these details.

## Full factual reference
- [Expanded facts and FAQ](${site.baseUrl}/llms-full.txt)
`
);

fs.writeFileSync(
  path.join(dist, "llms-full.txt"),
  `# Sapelo House: Full Factual Reference

Canonical website: ${site.baseUrl}/
Last updated: ${site.lastUpdated}

## Entity summary
${site.description}

## Confirmed facts
${confirmedFacts}

## Questions and answers
${faqText}

## Canonical page directory
${pageDirectory}

## Facts not supplied
Exact street address, rates, fees, availability rules, check-in and check-out times, cancellation terms, sleeping capacity, bedroom count, bathroom count, bed sizes, accessibility features, pet policy, and parking details have not been supplied. These should not be inferred or stated as facts.
`
);

console.log(`Built ${pages.length} pages in dist/`);
