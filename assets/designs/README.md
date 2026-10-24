# Liquid Night — connected city (current)

Only Liquid Night is active at `designs.html`. The current homepage is unchanged. Open Studio, City of Swift and the comparison chooser remain commented out. Older notes below are historical.

## Artwork and registration

Original illustrations generated with the built-in imagegen tool from the approved Option B hover sketch. [Complete prompts and source IDs](liquid-city-prompts.md).

| Layout | File | Dimensions | Transfer size |
| --- | --- | --- | --- |
| 768px and wider | `liquid-city-desktop-v3.webp` | 1672 × 941, approximately 16:9 | 519,008 bytes |
| Below 768px | `liquid-city-portrait-v3.webp` | 900 × 1200, 3:4 | 375,678 bytes |

RGB WebP exports, quality 88, method 6. Desktop preserves generated size; portrait resizes from 1086 × 1448 using Lanczos. These are artistic interpretations, not photographs or geographically accurate maps.

The base uses the inline SVG `liquid-city-glass` color matrix for smoky blue/silver. All eight masked color layers reuse the exact same master pixels. This deliberate simplification prevents silhouette drift and lets the browser reuse a single cached download per layout. Color layers still decode independently and retain individual failure handling. No eight additional full-size assets are needed; combined transfer stays within both initial and overlay budgets.

All art fills the same stage. Full `--region` mask polygons and matching `--hit` target polygons are in the connected-city geometry section of `designs.css`. Never reposition a region independently of the master. Replacing a composition requires re-tracing that layout. Small architectural openings stay inside the outer hit polygon (documented `ponytail:` limit); mobile stadium/Ashram hit areas extend to at least 44px without scaling artwork.

### Traced bounds: x, y, width, height (%)

| Landmark | Desktop | Portrait |
| --- | --- | --- |
| pol | 0, 10.4, 35.8, 55.4 | 0, 23.7, 37.2, 36.9 |
| jaali | 0, 27.2, 17.6, 38.6 | 0, 36.7, 21.4, 23.8 |
| gate | 36.2, 41.4, 21.7, 27.4 | 36.3, 43.3, 26, 18.7 |
| chabutra | 62.2, 29.8, 8.1, 28.2 | 61.6, 30.7, 14.8, 21.9 |
| stadium | 74.9, 40.6, 20.5, 11.6 | 74.6, 37.3, 25.4, 8.2 |
| ashram | 72.8, 56.6, 23.7, 12 | 67.1, 53.1, 32.9, 9 |
| stepwell | 1.3, 70.5, 27.7, 27.1 | 0, 67, 47, 26.1 |
| bridge | 30.4, 72, 69.6, 20.3 | 42.4, 72, 57.6, 16.9 |

## Interaction and accessibility

Layer order: master 0, atmosphere 1, color regions 2, river sheen 3, native buttons 4, HTML identity 5, shared popup 10; navigation above the hero. Decorative art stays hidden from assistive technology. Named buttons expose expanded state and panel relationships; one always-mounted polite status region announces selection.

`cityscape.mjs` owns one active landmark and input ownership. Mouse exit has 350ms grace to reach the popup. Latest deliberate mouse/keyboard/touch input wins. Touch toggles, outside tap/close/Escape dismiss, and offscreen exit clears selection. Close returns focus without reopening. Resize preserves keyboard/touch selection and changes responsive art/masks together.

Desktop popup tries above/right/left/below while avoiding identity, navigation, selected target and viewport edges; the reserved slot is the fallback. Phones always use the slot. Text-only zoom moves oversized heading text above the city. Atmosphere drift is clamped to 12px; artwork/hotspots remain locked. Reduced motion makes reveals immediate and decorations still.

A failed color layer keeps glass and story. A failed base shows the text landmark list. Optional source elements stay inert until the matching layout is chosen; the other layout does not download initially.

## Description references

- [Sidi Saiyyed jaali — Gujarat Tourism](https://gujarattourism.com/central-zone/ahmedabad/siddi-sayed-mosque.html)
- [Pols and community spaces — Gujarat Tourism](https://gujarattourism.com/accommodation/heritage-hotel/french-haveli.html)
- [Teen Darwaza's three arches — Gujarat Tourism](https://gujarattourism.com/central-zone/ahmedabad/jama--jumma--masjid.html)
- [Chabutra — Ahmedabad Municipal Corporation](https://heritage.ahmedabadcity.gov.in/details/30130/heritage_site/evening-walk/en), [bird-feeding tradition discussed by heritage officials](https://indianexpress.com/article/cities/ahmedabad/know-your-city-how-chabutros-ahmedabads-pol-culture-9013991/)
- [Narendra Modi Stadium — Gujarat Cricket Association](https://gujaratcricketassociation.com/narendra-modi-stadium/)
- [Hriday Kunj — Sabarmati Ashram](https://www.gandhiashramsabarmati.org/en/ashram-sites/ashramlocation/MTM1.html)
- [Adalaj Vav — Ahmedabad district](https://ahmedabad.nic.in/tourist-place/adalaj-vav/)
- [Atal Bridge — Gujarat Tourism](https://gujarattourism.com/central-zone/ahmedabad/atal-bridge.html)

## Restoring retired themes

Restore together: `RETIRED` chooser/world/SVG blocks in `designs.html`; archived selector branches in `designs.css`; comparison controller, Aurora dock/observer/room tabs and lifecycle hooks in `designs.js`; retired tests and three-world fixture in `designs.check.mjs`. Remove single-theme `syncLiquidLocation` initialization/listeners so they cannot fight the restored chooser. Restore comparison offsets and height measurements together. Retained assets currently have no active references.

## Verification and release

Run `node designs.check.mjs` and `node cityscape.check.mjs`. Tests cover single-theme markup, legacy URLs/anchors, JSON content/security/retries/gallery, reduced motion, state/input transitions, popup collision/travel, close/focus/Escape, hybrid touch, responsive loading, failed/slow assets, offscreen dismissal and image budgets.

Implementation QA: both Node checks passed again on 2026-10-12. Browser review covered Chromium at 320, 390, 768, 1024 and 1440px, keyboard selection of all eight landmarks, and Safari rendering with enlarged text. A locally served `/community/` project subpath loaded artwork and community data and resolved legacy theme URLs correctly. Touch transitions and image failures are covered by the event harness; physical iPhone interaction and spoken VoiceOver output still need device testing. The in-app browser was unavailable during the final continuation, so no fresh final screenshot was captured.

Publishing stays separate. Asset and JSON requests remain relative for GitHub Pages project subpaths. No build service, framework, API key or new dependency is required. Local Node checks are not part of the deployed runtime.

---

# Historical artwork and theme notes (retained)

# Design preview artwork

Generated with the built-in imagegen tool for the local design concepts. JPEG exports preserve the original composition. These are illustrative assets, not photographs of a Swift Ahmedabad event or venue.

## Liquid Night — independent landmarks

Liquid Night now uses eight independently positioned transparent landmarks, with the community mark, glass panels, labels, light trails and atmospheric background kept as HTML/SVG/CSS layers. Navigation, hero and community surfaces span the viewport with responsive internal gutters. The original dusk collage remains available for Theme 3.

Files: `liquid-jaali.webp`, `liquid-gate.webp`, `liquid-chabutra.webp`, `liquid-bridge.webp`, `liquid-pol.webp`, `liquid-ashram.webp`.

Generated using the built-in imagegen tool with `transparent_background: true`. The existing dusk collage was supplied as an architectural reference, not as the final composition. These are artistic interpretations, not accurate architectural models. WebP exports retain transparency.

Shared prompt, used once per subject below:

> Use case: stylized-concept. Asset type: individual transparent landmark asset for the Liquid Night Swift Ahmedabad website. Reference image is subject identity only, NOT its colors, background or composition. Render ONLY [subject]. Style: exquisite miniature architectural sculpture cast from translucent smoky optical glass and polished silver, restrained icy-blue and soft violet rim lighting, realistic beveled edges, physically convincing glass refractions, crisp detailed silhouette. Match a premium Apple-inspired dark #060609 interface, monochrome silver/periwinkle/indigo palette, restrained illumination with dark interiors. No warm sandstone, orange, pink, green or multicolored painted surfaces. No scene, skyline, backdrop, floor, sky, water, reflection plane, fog, surrounding objects, typography, logo or UI. Genuine transparent background including openings, ample tight clear margin around a complete uncropped single subject. Architectural identity recognisable; illustration, not a photograph. Asset must work independently from other landmarks.

Subjects:

- `jaali`: Sidi Saiyyed's Tree of Life jaali: one broad arched stone window with intricate branching tree lattice, framed by a clean substantial architectural arch. Front three-quarter view.
- `gate`: Teen Darwaza in Ahmedabad: a single freestanding historic gateway with THREE tall pointed arch openings, ornate parapet and carved facade. Wide horizontal three-quarter view.
- `chabutra`: Ahmedabad's traditional chabutra: one tall slender carved column supporting an ornate octagonal bird-feeding pavilion with columns and a pyramidal roof and finial, on a small stepped base. Full object from base to finial.
- `bridge`: Ahmedabad's Atal pedestrian Bridge: an elegant long low sweeping white tubular triangular truss footbridge with kite-inspired inset canopy panels and two slender piers. Entire bridge, wide horizontal three-quarter side view. No river or ground.
- `pol`: One small cluster of THREE Ahmedabad old-city pol houses with ornate carved wooden balconies, traditional facade windows and flat rooftops, compact frontal three-quarter view. No trees, ground or surrounding buildings.
- `ashram`: Sabarmati Ashram's Hriday Kunj: one modest single-storey house with distinctive low tiled sloped hip roof, open shaded verandah supported by simple columns, minimalist facade. Front three-quarter view. Full house isolated.

GitHub Pages compatibility: the preview is static HTML/CSS/JavaScript, with same-origin relative JSON and asset paths. Publish `designs.html`, `designs.css`, `designs.js`, the referenced JSON files and assets together to serve `/designs.html?design=glass`. The existing `index.html` is still the homepage; promoting Liquid Night to the root homepage is a separate release step.

## Open Studio

Theme 2 now follows the community-home pattern from [Swift Pune](https://swiftpune.org/): logo-led split hero, warm neutral surfaces, three program cards, a crew directory, a host note and history, community channels, and a grouped footer. It uses Ahmedabad’s own mark and existing JSON content. The previous illustration is retained as an unused concept asset.

File: `birds-in-flight.jpg`

Prompt:

> Use case: stylized-concept. Asset type: art-directed hero illustration for a modern Swift developer community event website, a clean white-and-coral event magazine. Create an exceptional sculptural 3D still-life on a solid vivid coral vermilion background #fa583d. Three beautiful abstract folded paper birds in offwhite / warm ivory, one large in center in flight, two smaller around it, strongly angular dynamic shapes evoking a swift bird without text or logos. A large offwhite sculptural hollow ring stands vertically at slight diagonal, with birds flying through it; small coral spheres, graphic cream shadow. Physical materials matte paper and smooth ceramic. Strong directional studio light, clean architectural shadows, playful contemporary art gallery installation. Frame full scene with generous but not excessive coral negative space. Sophisticated eye-catching composition, limited palette coral and cream only, no gradients as background, no metallic reflections, no text or letters, no frames, no UI, no watermark. Wide landscape ratio 3:2.

## City of Swift

Theme 3 takes visual inspiration from [Swift Bharat](https://swiftbharat.org/): bold dimensional type, a peach, lavender, ivory, copper, and midnight-blue dusk palette, an illustrated city collage, ticket-shaped event cards, and community tabs. All events, team members, links, and app content remain Ahmedabad's existing content.

File: `ahmedabad-landmarks-dusk.png` — the original illustration edited with the built-in imagegen tool to replace the lime sky with an Ahmedabad sunset. The earlier `ahmedabad-landmarks.png` is retained as an unused iteration. This is an artistic collage of Ahmedabad landmarks, not a photograph or a geographic reconstruction. The community's existing chabutra-and-bird mark remains in the navigation, welcome badge, and footer treatments. No Swift Bharat artwork was copied.

Landmark references: [Sidi Saiyyed's Tree of Life jaali](https://gujarattourism.com/central-zone/ahmedabad/siddi-sayed-mosque.html), [Ahmedabad heritage and pols](https://gujarattourism.com/central-zone/ahmedabad.html), [Atal Bridge](https://gujarattourism.com/central-zone/ahmedabad/atal-bridge.html), and [kite-inspired bridge design](https://www.sabarmatiriverfront.com/gujarati/atal-bridge.html).

Original illustration prompt:

> Use case: illustration-story. Asset type: original panoramic Ahmedabad city illustration for a bold Swift developer community website. Create an art-directed maximalist Indian city festival poster illustration, detailed hand-painted gouache and crisp screenprint collage, architectural silhouettes with intricate fine line detail. Landscape 3:2 composition. Background perfectly flat electric chartreuse lime #e6ff59. Composition: colourful Ahmedabad landmarks form a continuous wide skyline in the LOWER TWO THIRDS, with generous empty lime sky in the upper third for HTML lettering. At far LEFT a large sandstone arched Sidi Saiyyed Tree of Life jaali, recognisable delicate intertwining tree branches carved in the stone arched window, accompanied by colourful old-city pol wooden havelis with carved balconies. Slightly left of centre Teen Darwaza: historic Ahmedabad pale warm sandstone RECTANGULAR gateway with THREE equal pointed arch openings and short crenellated parapet, no domed towers. At centre a traditional Ahmedabad chabutra octagonal elevated bird feeder pavilion on a slim decorated pillar, with a pitched canopy and tiny flying swifts, prominent but not a logo. At RIGHT more Ahmedabad pol architecture, vivid blue/pink/yellow/terracotta havelis and the low red-tiled veranda of Sabarmati Ashram. In the FOREGROUND a sweeping cyan-blue Sabarmati river #7ccbeb with Atal pedestrian bridge spanning diagonally from centre-left to right, recognisable white curved tubular steel framework with interlocking leaf/diamond-shaped trusses and red, orange, yellow and turquoise kite-inspired canopy panels, NOT a suspension bridge, no tall pylons, no boats. A few tiny colourful diamond Uttarayan kites with looping strings float over the skyline at sides. Limited vivid festival palette: lime, indigo #303787, azure, warm terracotta, sandstone, saffron, magenta, forest teal. Strong physical paper texture within buildings, clean flat background sky, richly layered but legible and deliberate, believable landmark forms while clearly an artistic collage rather than a geographic panorama or photograph. Edge-to-edge skyline and cyan river along bottom edge. No words, letters, dates, logos, UI, frames or watermark. Do not include Mumbai Gateway of India, Sea Link, Mumbai domes, ferries, Delhi monuments or generic skyscrapers. Beautiful, confident, playful cultural identity. Make specifically Ahmedabad, Gujarat.

Sunset edit prompt (built-in imagegen, using the original local illustration as the reference):

> Edit the supplied Ahmedabad illustration, keeping the exact composition, architecture, landmark positions, bridge, river, birds, colorful kites and meticulous illustrated detail. The user loves this image but dislikes the fluorescent lime green sky. Replace all lime green sky and lime sky openings between architecture with a beautiful, sophisticated Ahmedabad dusk: a seamless pastel gradient from dusky periwinkle and muted lavender at the very top, through soft dusty rose, to luminous peach and pale warm apricot near the horizon. No green or chartreuse in the sky. A warm, dreamy twilight, rich but tasteful, with subtle atmospheric texture and soft golden light catching the sandstone. Preserve colorful historic pol houses, the Sidi Saiyyed tree lattice, Teen Darwaza, chabutra, Sabarmati Ashram, and Atal Bridge exactly. Keep foliage naturally green. Gently tune the river reflections to peach, lavender and blue from the new sky while retaining the vibrant turquoise water and kite-colored reflections. Avoid a dark night scene; this should remain bright, joyful and readable with beautiful contrast. Preserve original full frame and proportions. Do not add text, logos, new architecture, objects or borders.

## Previous lounge concept (unused)

File: `community-lounge.jpg`

Prompt:

> Use case: stylized-concept. Asset type: hero artwork for a sophisticated Swift developer community website called Swift Ahmedabad, dark forest-green and copper visual theme. Create a very high-end editorial 3D still life of a welcoming developer lounge, miniature architectural diorama, not a photograph of a real event. Wide landscape composition. A beautiful round rich walnut communal table with two slim open aluminum laptops, small ceramic coffee cups, a notebook, one small plant, comfortable moss green sculptural chairs, set in a deep forest green architectural space with large rounded arch alcoves, subtle carved architectural detail inspired by Ahmedabad. Warm copper sunlight enters diagonally from upper right making beautiful shadows, textured plaster and wood. Art-directed premium furniture catalog meets modern technology brand. Eye-level elevated three-quarter view, scene fills frame, no people. Right side dominated by glowing amber arch and table, left fades into deep forest green shadow. Colors: deep #132d28, muted sage, dark walnut, cream, copper #c99972. No text, no letters, no logo, no UI, no frames or watermarks. Make scene intimate, tactile, refined, welcoming, and stunning with exceptional material texture. Landscape ratio 3:2.

## Swift Ahmedabad mark

File: `ahmedabad-mark.png` — transparent monochrome adaptation of the existing `assets/swiftAhmedabad.jpg`, edited with the built-in imagegen tool. The site's SVG mask applies white/iridescent, muted rose/amber, or copper color to this same mark for each theme.

Prompt:

> Edit target: attached original Swift Ahmedabad community icon. Precise background extraction only. Remove the solid orange background completely and produce genuine transparent pixels there. Preserve EXACT original composition, square framing, Ahmedabad chabutra tower architectural silhouette, all tower line details and flying swift bird at upper right. Convert the entire existing foreground artwork (tower and bird) to a clean single white monochrome mark on transparency. Preserve visible linework and silhouette by making darker orange outlines transparent so the mark has the same negative-space architectural detail. Do not redesign, redraw, replace with Apple Swift logo, add text, move, simplify, or crop away any tower or bird. Output transparent PNG, original proportions, sharp clean antialiased edges. The final graphic will be tinted with CSS to fit three website color themes.

## Real event artwork

The event cover images are the public covers from Swift Ahmedabad's own Luma listings:

- `wwdc-2026.jpg`: [WWDC26 Watch Party](https://luma.com/b08evqjf)
- `july-2025-meetup.jpg`: [July 2025 Meetup](https://luma.com/fu6yaqfs)

The February 2025 listing links to [the original event](https://luma.com/ghp1rm2g). Its date graphic is a website treatment, not a claimed original event poster.

## Content maintenance

The active Liquid Night page uses these local content sources:

- `links.json`: community identity, descriptions, email, and nine social/community destinations.
- `stats.json`: the year and all seven community statistics.
- `programs.json`: program names, descriptions, statuses, and destinations.
- `team.json`: the complete team directory and LinkedIn profiles.
- `speakers.json`: 30 Ahmedabad speaker profiles in a separate section, with pinned Talks source URLs. Names and two recovered YAML links follow the user's confirmations; biographies reflect event submissions. Source-verified portraits live in `assets/speakers/`, with `imageSource` and `imageSha` provenance in each photo record. Original bytes are preserved; photos load lazily and failed images reveal initials. Gokul remains initials-only. The user confirmed the Nishchal Visavadiya, Tushar Thakar and Riddhi Khunti filename-spelling mappings; 29 speakers have approved portraits. Future unclear identity mappings require confirmation before use.
- `sponsors.json`: past hosts and the invitation to host.
- `app.json`: app identity, App Store/TestFlight destinations, and all 14 feature screenshots.
- `contact.json` and `sponsorship-email.json`: speaker submissions, email contacts, and the existing sponsorship email draft.
- `events.json`: curated published event history, with direct source links. This is an editable archive, not a live Luma API feed. New events should be added here; the upcoming-event links always go to the community's Luma calendar.

Shared files also feed the homepage, whose speaker and team tabs remain separate. Serve the site over HTTP; content files are fetched from the same origin. Verify with `node designs.check.mjs` and `node navigation.check.mjs`; inspect both pages after shared profile changes.

## Interactive Liquid Night cityscape

`cityscape.mjs` owns one active landmark. Names and descriptions live on the eight HTML controls; CSS positions artwork independently from hotspots. The bridge uses a broad polygon hit area matching its diagonal foreground span. Artwork is decorative; the buttons and shared live information panel provide accessible identification. Last deliberate input wins. Mouse exit has a 350 ms grace period to reach the panel. Keyboard focus reveals, Escape dismisses without moving focus, and touch/pen taps toggle. Blank-space presses dismiss. Resize clears hover selection and preserves keyboard/touch selection.

Desktop uses a panoramic collage; 761–1000 px adjusts its proportions, and 760 px and below uses a portrait composition. Reduced motion uses the site's existing global override. Eight optional `liquid-*-color.webp` images load independently near the scene after their glass counterpart loads. Failed color loads retain glass and usable controls/stories. Both versions stay in the same fixed artwork container; no node replacement or scale animation occurs.

Color counterparts were generated by editing each original transparent glass image. Export canvas dimensions match their source: jaali/gate/pol/ashram 900×600, chabutra 600×900, bridge 900×300. Generated architecture may have small local contour differences; these are illustrative material variants, not pixel-identical texture substitutions. Future asset replacement must preserve transparent canvas, crop, orientation and registration and be checked during the crossfade, not just at its endpoints.

Shared edit prompt:

> Edit this exact landmark cutout. Change ONLY surface materials and colors to its natural Ahmedabad appearance. Preserve exactly the input camera, silhouette, every architectural detail, original canvas aspect ratio, crop, object coordinates, margins, size and orientation. No geometry changes, no repositioning or zoom. Replace violet metallic glass appearance with warm realistic material colors in soft daylight. Same independent miniature illustration, no scene, people, additional objects, floor, shadow plane or background. Preserve transparent background and openings. This image will be opacity-overlaid on the original, so exact registration is critical.

Material directions: honey sandstone jaali; buff sandstone gateway; golden-brown wood/stone chabutra; white steel bridge with orange/red/turquoise/yellow panels; carved wood pol houses with turquoise/ochre/muted pink; cream plaster, brown columns and terracotta roof for the Ashram.

Include `cityscape.mjs` and all eight color assets alongside the existing preview files when publishing to GitHub Pages. No backend, build step or package dependency is required. Run `node cityscape.check.mjs` for interaction and asset checks and `node designs.check.mjs` for existing theme regressions. Visual checks should cover the connected composition, all eight reveals, focus outlines, hotspot overlap, 390 px portrait, tablet and desktop. A real touch-device and screen-reader pass remains useful before public release.


### Stadium, Stepwell and Riverfront expansion

New files: `liquid-stadium.webp`, `liquid-stadium-color.webp`, `liquid-stepwell.webp`, `liquid-stepwell-color.webp`, `liquid-riverfront.webp`. Stadium and Stepwell pairs use 900×600 transparent canvases. Riverfront uses 1200×400 and remains decorative, outside the paired-image loader. No numbered landmark markers remain. Invisible clipped buttons follow outer architecture outlines, with separate focus-outline wrappers so clipping cannot erase keyboard focus. Shared placement variables keep artwork and controls together; independently authored polygons exclude broad empty image margins.

Subjects use an elevated three-quarter miniature view. Stadium shows an open oval cricket bowl, roof ring and seating. Stepwell is an artistic cutaway of descending stairs, carved galleries and an octagonal well, not an architectural survey. Riverfront is a low two-level promenade with broad stairs, railings and sparse trees. Images are generated illustrations, not venue photographs.

Generation direction: exquisite detailed miniature sculpture of each subject made of smoky optical glass and polished silver, icy-blue/violet rim light, dark recesses; restrained silver/periwinkle palette; transparent background and openings; no labels, people, ground plane or surrounding buildings. Color edits preserve camera, geometry, canvas, crop, object coordinates and orientation: Stadium gains offwhite roof, orange/blue seating and green cricket field; Stepwell gains honey sandstone and softly shaded galleries. Compressed transparent WebP exports preserve the generated alpha.

Content/reference sources:
- [Gujarat Cricket Association: Narendra Modi Stadium](https://gujaratcricketassociation.com/narendra-modi-stadium/)
- [Gujarat Tourism: Adalaj ni Vav](https://gujarattourism.com/central-zone/gandhinagar/adalaj-ni-vav.html)
- [Sabarmati Riverfront](https://sabarmatiriverfront.com/)

Repositioning remains an artistic collage. Desktop/tablet separate the Stepwell from the jaali's main lattice; portrait places it below the jaali. Maintain eight keyboard controls and no numbered marker spans. Test at 320/390 px portrait, 820 px tablet and desktop, including empty-space and overlapping-architecture hit areas.
