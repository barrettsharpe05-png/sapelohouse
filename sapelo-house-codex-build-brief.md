# Sapelo House Website Build Brief for Codex

## Role

You are Codex acting as an elite web designer, front-end engineer, conversion copywriter, SEO strategist, local SEO specialist, accessibility reviewer, and AI search optimization specialist.

Your job is to build a finished, visually stunning, production-quality website for **SapeloHouse.com**, a vacation rental home near the Sapelo River in coastal Georgia.

The website must sell primarily through its visual aesthetic. The design should make visitors feel the water, the screened porch, the quiet mornings, the coastal air, the fishing, the home itself, and the rare nature of staying near the Sapelo River.

## Project Location

The project folder is:

```text
sapelo-house
```

Inside the `sapelo-house` folder is a zip file containing photos for the site.

Before building anything:

1. Inspect the `sapelo-house` folder.
2. Locate the photo zip file.
3. Extract the images into a clearly organized assets folder.
4. Review the existing project structure, if any.
5. Use the existing stack if one is already present.
6. If no usable stack exists, choose a simple, modern, maintainable static or front-end setup suitable for a fast marketing website.

## Non-Hallucination Rules

Do not invent facts, amenities, policies, bedroom counts, bathroom counts, prices, square footage, exact address, booking rules, pet policies, dock access, boat access, waterfront ownership, private beach access, accessibility features, or availability unless they are explicitly provided or clearly visible in the photos.

Use only these confirmed facts unless the photos clearly support additional descriptions:

- Property name: Sapelo House
- Domain: SapeloHouse.com
- It is a vacation rental home similar to a VRBO-style stay
- It is located across from the Sapelo River
- It is about 1 hour south of Savannah, Georgia
- It is about 17 minutes from Darien, Georgia
- It is less than 1 hour from St. Simons Island
- It is about 1 hour from Jekyll Island
- Guests can wake up and watch dolphins from the screened porch
- There are excellent fishing opportunities nearby
- The home has a screened porch
- The home has a back deck with chairs and a grill
- The home has a pool table
- The home has a large living room
- The home has a large kitchen
- The home has a dining room
- The setting is peaceful and coastal

When describing photo-based amenities, phrase descriptions carefully:

- Use "visible in the photos" or natural descriptive language only when the detail is actually visible.
- If something appears likely but is not certain, do not state it as fact.
- If a detail is important but missing, leave a clearly marked TODO in the code or content notes rather than guessing.

## If Information Is Missing

Do not get stuck. Make the best safe decision and continue.

Use this fallback order:

1. If the fact is visually obvious in the photos, use it.
2. If the fact is provided in this brief, use it.
3. If the fact is needed but unknown, write neutral copy that avoids the detail.
4. If the detail must be filled later, add a small TODO comment in a content notes file.
5. Never block the build over missing exact address, pricing, availability, bedroom count, bathroom count, or booking engine.

Examples:

- If no booking engine is provided, create a polished inquiry form.
- If final hero images are not provided yet, use the strongest available images from the zip as temporary hero backgrounds.
- If an exact address is not provided, use broader location language such as "near the Sapelo River in coastal Georgia" and "near Darien, Georgia."
- If bedroom or bathroom counts are unknown, do not mention them.

## Photo Workflow

The photos are the visual foundation of the site.

After extracting the zip:

1. Review every image.
2. Identify the strongest images for hero backgrounds.
3. Identify images for gallery groups.
4. Rename or organize images only if doing so improves maintainability.
5. Optimize images for web performance.
6. Preserve good-quality originals or source copies when possible.
7. Write descriptive alt text based on what each image actually shows.

Create a simple photo inventory file, such as:

```text
PHOTO-INVENTORY.md
```

Include:

- Image filename
- What the image appears to show
- Recommended use, such as homepage hero, house hero, gallery, porch, kitchen, deck, living room, view, or fallback
- Alt text draft
- Any uncertainty

## Hero Image Requirement

Every page must have a full-width photographic hero background image.

Set up the hero image system so the owner can easily replace the hero images later without redesigning the site.

At minimum, support these hero slots:

- `home`
- `house`
- `experience`
- `location`
- `gallery`
- `booking` or `contact`
- `faq`

If final hero-specific images are not provided yet:

1. Choose the strongest available images from the zip as temporary hero backgrounds.
2. Use clear filenames, constants, configuration entries, or content data labels.
3. Add notes explaining where to replace each hero image later.

Every hero must:

- Use a real property or location image from the provided photos
- Have readable text over the image
- Include a tasteful overlay or gradient if needed
- Work on desktop, tablet, and mobile
- Avoid awkward cropping of important image subjects
- Avoid text overlap or unreadable contrast

## Primary Goal

Build a breathtaking, emotionally persuasive, high-converting website that makes Sapelo House feel like more than a rental.

It should feel like a rare coastal Georgia escape:

- Peaceful
- Scenic
- Comfortable
- Warm
- Memorable
- Worth booking

The site should look premium without feeling cold or fake. It should feel cinematic, refined, coastal, Southern, welcoming, and grounded in real place.

## Design Direction

Use immersive photography, elegant typography, generous spacing, strong visual rhythm, polished interactions, and a refined coastal color palette inspired by the actual photos.

Avoid:

- Generic vacation rental templates
- Cluttered booking-site layouts
- Fake luxury language
- Stock-photo aesthetics
- Cheesy beach graphics
- Excessive icons
- Excessive decorative gradients
- Placeholder copy
- Unsupported claims
- Overcrowded text

The first viewport of the homepage must immediately communicate:

- This is Sapelo House
- It is a coastal Georgia vacation rental
- It is connected to the Sapelo River experience
- It is visually beautiful and emotionally desirable

## Required Site Structure

Build a complete responsive website. A multi-page site is preferred if the stack supports it cleanly. If a single-page site is more appropriate for the project, it must still contain clear, crawlable sections and anchor navigation.

Required pages or major sections:

1. Home
2. The House
3. The Experience
4. Location
5. Gallery
6. Booking or Contact
7. FAQ

## Page Requirements

### Home

Include:

- Full-width photographic hero background
- Emotionally powerful H1
- Short supporting copy
- Primary call to action
- Secondary call to action
- Immediate visual proof of the property and setting
- Strong internal links to The House, Gallery, Location, and Booking or Contact

Suggested CTA labels:

- Check Availability
- Plan Your Stay
- Ask About Dates
- See the House
- Explore the Location

### The House

Include:

- Hero background image
- Story-driven overview of the home
- Photo-led amenity sections
- Screened porch
- Back deck with chairs and grill
- Large living room
- Large kitchen
- Dining room
- Pool table
- Any additional amenities clearly visible in the photos

Do not invent bedroom count, bathroom count, sleeping capacity, or private access details unless provided.

### The Experience

Include:

- Hero background image
- Morning coffee on the screened porch
- Watching dolphins
- Fishing nearby
- Slow coastal evenings
- Family and friend gatherings
- Playing pool
- Cooking and dining together
- Day trips to Darien, Savannah, St. Simons Island, and Jekyll Island

Write this page emotionally, but keep claims factual.

### Location

Include:

- Hero background image
- Sapelo River setting
- Coastal Georgia context
- Darien proximity, about 17 minutes
- Savannah proximity, about 1 hour south
- St. Simons Island, less than 1 hour
- Jekyll Island, about 1 hour
- Fishing opportunities nearby
- Travel-oriented copy that helps both humans and search engines understand the location

Do not provide an exact map pin unless an exact address is provided.

### Gallery

Include:

- Hero background image
- Beautiful organized gallery
- Group images by likely category where possible:
  - Exterior or setting
  - Screened porch
  - Deck
  - Kitchen and dining
  - Living room
  - Recreation or pool table
  - Views or river setting
- Descriptive alt text for every image
- Responsive image layout
- No broken image paths

### Booking or Contact

Include:

- Hero background image
- Clear booking inquiry CTA
- Trust-building copy
- Inquiry form

The form should include:

- Name
- Email
- Phone
- Desired dates
- Number of guests
- Message

If no form backend is available, make the form visually complete and either:

- Use a safe static-site form placeholder pattern, or
- Add a clear implementation note for connecting the final form handler.

Do not pretend that a booking was submitted if there is no backend.

### FAQ

Include:

- Hero background image or strong photo-led header
- Search-optimized questions and answers
- Clear answers for humans, search engines, and AI assistants

FAQ topics should include:

- What is Sapelo House?
- Where is Sapelo House located?
- How far is Sapelo House from Savannah?
- How far is it from Darien?
- How far is it from St. Simons Island?
- How far is it from Jekyll Island?
- Can guests see dolphins?
- Is Sapelo House good for fishing trips?
- What amenities are available?
- Is it good for families or groups?
- How do guests inquire about availability?

Keep answers accurate and avoid unknown specifics.

## Copywriting Direction

Write in a warm, sensory, elegant, emotionally resonant, specific, and trustworthy voice.

The copy should help visitors imagine:

- Waking up near the Sapelo River
- Sitting on the screened porch with coffee
- Watching dolphins move through the morning water
- Returning from a fishing day
- Grilling on the back deck
- Playing pool in the evening
- Gathering in the kitchen, dining room, and living room
- Taking easy day trips to Darien, Savannah, St. Simons Island, and Jekyll Island

Avoid:

- Unsupported superlatives
- Vague luxury claims
- Overused rental cliches
- "Hidden gem" unless used sparingly
- Claims that require proof
- Exact numbers not provided

Make the property feel rare through concrete details, not hype.

## SEO Requirements

Implement strong technical and on-page SEO:

- Clean semantic HTML
- One clear H1 per page
- Unique title tags
- Unique meta descriptions
- Open Graph metadata
- Descriptive image alt text
- Crawlable navigation
- Internal links between pages
- Fast-loading optimized images
- FAQ content aligned with real search intent
- Local terms used naturally
- No keyword stuffing

Use relevant search phrases naturally, including:

- Sapelo House
- SapeloHouse.com
- Sapelo River vacation rental
- coastal Georgia vacation rental
- Darien GA vacation rental
- Georgia fishing getaway
- Sapelo River house rental
- Savannah day trip rental
- St. Simons Island day trip
- Jekyll Island day trip
- riverfront coastal Georgia stay
- coastal Georgia fishing trip

## AI Search and LLM Readability

Build the website so AI assistants and search engines can clearly understand and recommend Sapelo House.

Include clear factual statements about:

- What Sapelo House is
- Where it is
- Who it is best for
- What experiences it offers
- What amenities are available
- What nearby destinations are within approximate driving distance
- What makes the Sapelo River setting special
- Why this rental is different from ordinary vacation homes

Use:

- Clear headings
- Concise summaries
- Entity-rich copy
- FAQ answers
- Structured data
- Descriptive link text

Avoid vague marketing language that an AI assistant cannot confidently interpret.

## Structured Data

Add valid Schema.org JSON-LD where appropriate.

Include:

- `WebSite`
- `LodgingBusiness` or the most appropriate lodging/vacation rental schema available
- `FAQPage` for the FAQ page
- `BreadcrumbList` if multiple pages are used
- `ImageObject` references where useful

Do not include unknown information in schema. If a field is unknown, omit it rather than guessing.

Do not invent:

- Exact street address
- Aggregate rating
- Review count
- Price range
- Check-in time
- Check-out time
- Number of rooms
- Pet policy
- Amenities not confirmed

## Accessibility Requirements

Implement accessibility best practices:

- Semantic landmarks
- Keyboard-friendly navigation
- Visible focus states
- Form labels
- Descriptive alt text
- Good color contrast
- Readable text over images
- No text trapped inside images
- Responsive typography
- No layout overlap

## Performance Requirements

The site should feel fast and polished.

Do:

- Optimize images
- Use responsive image sizes where practical
- Avoid unnecessarily heavy dependencies
- Lazy-load below-the-fold gallery images if supported
- Keep CSS and JavaScript clean
- Test on mobile and desktop viewports

## Implementation Flow

Follow this order so the build does not stall:

1. Inspect the project folder.
2. Identify the stack and available scripts.
3. Locate and unzip the photo archive.
4. Create or update a photo inventory.
5. Select temporary hero images for every required page.
6. Define the site structure and content data.
7. Build shared layout, navigation, footer, and hero components.
8. Build all pages or sections.
9. Add gallery and image alt text.
10. Add metadata and structured data.
11. Add inquiry form UI.
12. Polish responsive design.
13. Run the app locally.
14. Inspect the site visually on desktop and mobile.
15. Fix broken images, layout issues, copy issues, and contrast problems.
16. Run build or validation checks.
17. Provide a concise final summary with any remaining TODOs.

## Quality Bar

The final site should feel like a premium, emotionally resonant website for a distinctive Sapelo River vacation rental.

It should be:

- Beautiful
- Photo-led
- Clear
- Trustworthy
- Fast
- Mobile polished
- SEO-ready
- AI-readable
- Easy to update
- Built to convert visitors into booking inquiries

## Final QA Checklist

Before finishing, verify:

- Every page has a photographic hero background
- All hero text is readable
- The homepage immediately sells the visual experience
- The navigation works
- The gallery images load
- Image paths are not broken
- Mobile layout is polished
- Desktop layout is polished
- No text overlaps
- No placeholder copy remains
- No unsupported claims remain
- The form is labeled and visually complete
- SEO metadata exists
- Open Graph metadata exists
- Structured data is valid JSON-LD
- FAQ content is accurate
- Photo alt text is descriptive
- The site can be run locally
- The build or validation command passes if available

## Final Response Requirements

When finished, report:

- What was built
- Which stack was used
- Where the photo assets were placed
- Which images were assigned to each hero slot
- How future hero images can be replaced
- What SEO and structured data were added
- What checks were run
- Any remaining TODOs caused by missing owner-provided information

Keep the final summary concise and practical.
