# Sapelo House SEO and AI Discovery Implementation

## Implemented on site

- Seven crawlable HTML pages with unique titles, descriptions, canonical URLs, one H1, semantic landmarks, and descriptive internal links.
- A linked Schema.org `@graph` on every page connecting the `WebSite`, `LodgingBusiness`, `WebPage`, `BreadcrumbList`, and primary `ImageObject` entities.
- `FAQPage` markup on the FAQ page, using the same questions and answers visitors can read on the page.
- Open Graph and X metadata with page-specific property photography, image dimensions, image type, and image alt text.
- Explicit indexing directives with large-image previews enabled.
- A crawlable image sitemap containing all 30 property photographs on the Gallery URL and the relevant hero image on every other page.
- Explicit `robots.txt` access for Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, and GPTBot.
- Root-level `llms.txt` and `llms-full.txt` files containing a concise entity summary, confirmed facts, canonical page directory, FAQ answers, and explicit limits on unknown facts.
- Responsive 960px and 1600px WebP variants for all 30 photographs, with `srcset`, `sizes`, intrinsic dimensions, lazy loading, and asynchronous decoding below the hero.
- Preloaded page-specific hero photography and dependency-free static HTML for fast first rendering.

## Structured data decision

The site uses `LodgingBusiness`, which accurately describes Sapelo House with the facts currently available. It intentionally does not claim Google's vacation-rental rich-result eligibility. Google's `VacationRental` implementation requires details that have not been supplied, including a stable property identifier, precise latitude and longitude, occupancy, and a full physical address. Eligibility also involves Google Hotel Center access.

Add the more specific markup only after those fields are owner-confirmed and the property is eligible for Google's vacation-rental integration.

## Launch checklist

1. Serve the site over HTTPS at `https://sapelohouse.com/` and permanently redirect every HTTP, `www`, mixed-case, and duplicate URL variant to that canonical host.
2. Verify the domain in Google Search Console and Bing Webmaster Tools, then submit `https://sapelohouse.com/sitemap.xml`.
3. Confirm the production CDN or firewall allows Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, and GPTBot instead of challenging or blocking them.
4. Use Search Console URL Inspection after launch to test the Home, Location, Gallery, and FAQ pages and request initial indexing.
5. Connect privacy-appropriate analytics and track referrals containing `utm_source=chatgpt.com` separately.
6. Add the final booking destination, owner-approved contact information, policies, address details, and verified property facts as they become available.
7. Earn relevant, accurate mentions and links from established coastal Georgia, Darien-area, travel, and fishing resources. On-site optimization cannot substitute for independent authority signals.
8. Monitor indexed pages, search queries, Core Web Vitals, crawl errors, image indexing, inquiry conversions, and ChatGPT referral traffic after launch.

## Content guardrails

Do not add ratings, reviews, prices, availability, room counts, guest capacity, precise location, access claims, or policies until the owner supplies and approves them. Structured data must match visible page content and must never be used to make unsupported claims.
