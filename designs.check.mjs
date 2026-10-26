// Run with: node designs.check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function element(dataset = {}) {
  const values = {};
  return { dataset, attributes: {}, events: {}, rect: {top: 0, bottom: 100, height: 100}, style: { values, setProperty(k, v) { values[k] = v; } },
    classList: { values: {}, toggle(k, v) { this.values[k] = v; }, add(k) { this.values[k] = true; }, remove(k) { delete this.values[k]; } },
    setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return this.attributes[k]; }, removeAttribute(k) { delete this.attributes[k]; },
    contains(node) { return node != null && (this === node || this.link === node); },
    focus() { context.document.activeElement = this; },
    getBoundingClientRect() { return this.rect; }, addEventListener(k, v) { this.events[k] = v; }, removeEventListener(k, v) { if (this.events[k] === v) delete this.events[k]; },
    replaceChildren(...children) { this.children = children; },
    scrollIntoView(options) { this.scrolled = options; }, scrollBy(options) { this.scrollOptions = options; }
  };
}
// Deliberately omit retired worlds, chooser, comparison header, dock, tabs and slab.
const ids = Object.fromEntries(['design-note', 'retry-content', 'main', 'liquid-top', 'liquid-city', 'liquid-story', 'liquid-join', ...['events', 'programs', 'app', 'team', 'speakers', 'sponsors', 'connect', 'contact'].map(name => `glass-${name}`)].map(id => [id, element()]));
const profileParts = Object.fromEntries(['name', 'avatar', 'bio', 'link'].map(name => [`[data-profile-${name}]`, element()]));
const dialog = ids['profile-dialog'] = {...element(), open: false, closest: () => null, querySelector: selector => profileParts[selector],
  showModal() { this.open = true; }, close() { this.open = false; this.events.close(); }};
const extraQueryNodes = {};
const story = element();
const storyPin = {...element(), scrollHeight: 560};
const cityScene = element();
const storyCards = Array.from({length: 3}, () => element());
const storySteps = Array.from({length: 3}, (_, index) => element({storyStep: String(index)}));
storyCards.forEach((card, index) => { ids[['story-learn', 'story-build', 'story-belong'][index]] = card; });
const menuSummary = element();
const menu = {...element(), open: false, querySelector: () => menuSummary};
const navigation = {offsetHeight: 72, querySelector: () => menu};
const status = element();
const statusText = element();
status.querySelector = () => statusText;
const contentTypes = ['events', 'programs', 'team', 'speakers', 'sponsors', 'connect', 'contact', 'app'];
const containers = Object.fromEntries(contentTypes.map(type => [type, [{
  dataset: {}, closest: () => ({id: 'world-glass'}), innerHTML: ''
}]]));
const description = element();
const communityLinks = ['whatsapp', 'luma', 'email', 'speak'].map(link => element({link}));
const sponsor = element();
const root = element();
const body = {dataset: {}};
const windowEvents = {};
const documentEvents = {};
const motionPreference = {matches: false, events: {}, addEventListener(type, callback) { this.events[type] = callback; }};
let failedRequest = '', eventOverride, speakerOverride;
const requested = [];
const source = type => JSON.parse(readFileSync(new URL(`./${type}.json`, import.meta.url), 'utf8'));
const location = {};
function visit(path) {
  const url = new URL(path, 'https://example.github.io/community/');
  Object.assign(location, {href: url.href, search: url.search, hash: url.hash});
}
visit('?design=unknown#old');
let lastURL;
const context = {
  URL, URLSearchParams, location,
  fetch: async path => { requested.push(path); return {ok: path !== failedRequest, json: async () => path === 'speakers.json' && speakerOverride ? speakerOverride : path === 'events.json' && eventOverride ? eventOverride : source(path.replace('.json', ''))}; },
  document: {
    body, documentElement: root,
    addEventListener(type, callback) { documentEvents[type] = callback; },
    removeEventListener(type, callback) { if (documentEvents[type] === callback) delete documentEvents[type]; },
    createElement: () => element(),
    querySelectorAll: selector => extraQueryNodes[selector] || ({'.story-card': storyCards, '[data-story-step]': storySteps, '[data-community-description]': [description], '[data-link]': communityLinks, '.sponsor-mail-link': [sponsor]})[selector] || containers[selector.match(/^\[data-content="(.+)"\]$/)?.[1]] || [],
    querySelector: selector => ({'.content-status': status, '.liquid-story': story, '.story-pin': storyPin, '.liquid-nav': navigation, '[data-cityscape]': cityScene})[selector] || null,
    getElementById: id => ids[id] || null
  },
  history: {replaceState(_state, _title, url) { lastURL = url; visit(url); }},
  matchMedia: () => motionPreference,
  innerWidth: 1280, innerHeight: 900, scrollY: 0,
  requestAnimationFrame() {},
  cancelAnimationFrame() {},
  window: {scrollY: 0, scrollTo(options) { this.scrolled = options; }, addEventListener(type, callback) { windowEvents[type] = callback; }, removeEventListener(type, callback) { if (windowEvents[type] === callback) delete windowEvents[type]; }}
};
runInNewContext(readFileSync(new URL('./designs.js', import.meta.url), 'utf8'), context);
assert.equal(body.dataset.design, 'glass');
assert.equal(lastURL.searchParams.get('design'), 'glass');
assert.equal(lastURL.hash, '#liquid-top');
assert.equal(context.selectDesign, undefined, 'Comparison controller must stay retired');
assert.equal(context.selectRoom, undefined, 'Retired tabs must not initialize');
assert.equal(context.observeCityReveals, undefined, 'Retired reveal observer must not initialize');
for (const [hash, expected] of [
  ['editorial-events', 'glass-events'], ['aurora-team', 'glass-team'], ['editorial-app', 'glass-app'],
  ['aurora-programs', 'glass-programs'], ['aurora-sponsors', 'glass-sponsors'], ['editorial-contact', 'glass-contact'],
  ['aurora-connect', 'glass-connect'], ['mag-gatherings', 'glass-programs'], ['aurora-city', 'liquid-city'],
  ['lounge-top', 'liquid-top'], ['lounge-room', 'liquid-top'], ['mag-top', 'liquid-top'],
  ['glass-team', 'glass-team'], ['glass-speakers', 'glass-speakers'], ['liquid-story', 'liquid-story'], ['main', 'main'], ['glass-features', 'glass-features'],
  ['team', 'glass-team'], ['speakers', 'glass-speakers'], ['app', 'glass-app'],
  ['app/feature-1', 'glass-features'], ['contact', 'glass-contact'], ['support', 'glass-contact'],
  ['%E0%A4%A', 'liquid-top']
]) {
  visit(`?design=aurora&preview=6#${hash}`);
  context.syncLiquidLocation();
  assert.equal(lastURL.searchParams.get('design'), 'glass');
  assert.equal(lastURL.searchParams.get('preview'), '6');
  assert.equal(lastURL.hash, `#${expected}`);
  assert.equal(lastURL.pathname, '/community/', 'Keep hosting project subpaths');
}
visit('?design=editorial#editorial-events');
windowEvents.hashchange();
assert.equal(location.hash, '#glass-events');
assert.equal(ids['glass-events'].scrolled.block, 'start');
visit('?design=aurora#aurora-city');
windowEvents.popstate();
assert.equal(location.hash, '#liquid-city');
assert.equal(ids['liquid-city'].scrolled.behavior, 'instant');
visit('?design=glass');
context.syncLiquidLocation();
assert.equal(location.hash, '');

story.rect = {top: -414, height: 1800, bottom: 1386};
cityScene.rect = {top: -1000, height: 600, bottom: -400};
context.innerWidth = 390;
context.updateMotion();
assert.equal(cityScene.style.values['--city-drift'], '12.00px', 'Atmosphere drift stays within 12px');
assert.equal(root.style.values['--nav-height'], '72px');
assert.ok(storyCards.every(card => !card.inert), 'Every story link remains keyboard-accessible on phones without scrolling');
navigation.offsetHeight = 88;
motionPreference.matches = true;
motionPreference.events.change();
context.updateMotion();
assert.equal(cityScene.style.values['--city-drift'], '0.00px', 'Reduced motion clears atmosphere drift');
assert.equal(root.style.values['--nav-height'], '88px', 'Nav height updates even when motion is reduced');
assert.ok(storyCards.every(card => !card.inert), 'All story cards remain readable with reduced motion');
context.innerWidth = 1280;
motionPreference.matches = false;
context.updateMotion();
assert.equal(story.dataset.pinned, 'true');
const setStoryProgress = progress => {
  story.rect = {height: 1800, top: navigation.offsetHeight - progress * (1800 - (context.innerHeight - navigation.offsetHeight))};
  context.updateMotion();
};
for (const [progress, expected] of [[-.2, 0], [0, 0], [.32, 0], [.34, 1], [.5, 1], [.67, 2], [1, 2], [1.2, 2], [.5, 1], [0, 0]]) {
  setStoryProgress(progress);
  assert.deepEqual(storyCards.map(card => !card.inert), storyCards.map((_, index) => index === expected), `One accessible chapter at progress ${progress}, in either direction`);
  assert.equal(storySteps[expected].attributes['aria-pressed'], 'true');
  assert.ok(storyCards.every(card => card.inert === (card.attributes['aria-hidden'] === 'true')));
}
const chapterVisuals = () => storyCards.map(card => ({
  opacity: Number(card.style.values['--chapter-opacity']),
  copyOpacity: Number(card.style.values['--chapter-copy-opacity']),
  y: parseFloat(card.style.values['--chapter-y']),
  scale: Number(card.style.values['--chapter-scale'])
}));
for (const [progress, outgoing, incoming] of [[1 / 3, 0, 1], [2 / 3, 1, 2]]) {
  setStoryProgress(progress);
  const visuals = chapterVisuals();
  assert.ok(Math.abs(visuals[outgoing].opacity - .5) < .0001, 'Outgoing chapter is half faded at the handoff');
  assert.ok(Math.abs(visuals[incoming].opacity - .5) < .0001, 'Incoming chapter fades in before the outgoing one disappears');
  assert.ok(visuals[outgoing].y < 0 && visuals[incoming].y > 0, 'Chapters travel in opposite directions through the blend');
  assert.equal(storyCards.filter(card => card.dataset.visible === 'true').length, 2);
  assert.ok(visuals.every(visual => visual.copyOpacity === 0), 'Lettering clears at the handoff instead of doubling');
}
let previous;
const forwardVisuals = [];
for (let step = 0; step <= 100; step++) {
  setStoryProgress(step / 100);
  const visuals = chapterVisuals();
  assert.ok(Math.abs(visuals.reduce((sum, visual) => sum + visual.opacity, 0) - 1) < .0002, 'No empty frame or third overlapping chapter');
  assert.ok(visuals.filter(visual => visual.copyOpacity > 0).length <= 1, 'Only one chapter exposes lettering during a crossfade');
  visuals.forEach((visual, index) => {
    assert.ok(visual.opacity >= 0 && visual.opacity <= 1 && visual.copyOpacity >= 0 && visual.copyOpacity <= 1 && Math.abs(visual.y) <= 40 && visual.scale >= .96 && visual.scale <= 1);
    if (previous) assert.ok(Math.abs(visual.opacity - previous[index].opacity) < .08, 'Opacity changes gradually across chapter boundaries');
  });
  forwardVisuals.push(visuals);
  previous = visuals;
}
for (let step = 100; step >= 0; step--) {
  setStoryProgress(step / 100);
  assert.deepEqual(chapterVisuals(), forwardVisuals[step], 'Reverse scrolling retraces the exact same visual state');
}
context.updateMotion();
assert.deepEqual(chapterVisuals(), forwardVisuals[0], 'Stopping scroll preserves the current frame');
storyCards[0].link = {};
context.document.activeElement = storyCards[0].link;
setStoryProgress(.8);
assert.equal(storyCards[0].inert, false, 'Scrolling never hides a focused chapter link');
assert.deepEqual(chapterVisuals().map(visual => visual.opacity), [1, 0, 0], 'A focused chapter remains fully legible');
assert.equal(chapterVisuals()[0].copyOpacity, 1);
context.document.activeElement = null;
context.updateMotion();
assert.equal(storyCards[2].inert, false, 'Chapter selection resumes after focus leaves');
const chapterTarget = {closest: selector => selector === '[data-story-step]' ? storySteps[1] : null};
documentEvents.click({target: chapterTarget});
assert.equal(context.document.activeElement, storySteps[1], 'Chapter control owns focus before changing scenes');
assert.equal(context.window.scrolled.behavior, 'smooth', 'Chapter buttons scrub through intermediate states using native smooth scrolling');
assert.equal(context.window.scrolled.top, context.window.scrollY + story.rect.top - navigation.offsetHeight + (1800 - (context.innerHeight - navigation.offsetHeight)) * .5);
visit('#story-belong');
context.scrollToCurrentAnchor();
assert.equal(context.window.scrolled.behavior, 'instant', 'Direct chapter hashes land without an animated detour');
assert.ok(context.window.scrolled.top > context.window.scrollY + story.rect.top - navigation.offsetHeight);
visit('');
for (const fallback of ['mobile', 'short', 'overflow', 'reduced']) {
  context.innerWidth = fallback === 'mobile' ? 390 : 1280;
  context.innerHeight = fallback === 'short' ? 600 : 900;
  storyPin.scrollHeight = fallback === 'overflow' ? 1200 : 560;
  motionPreference.matches = fallback === 'reduced';
  context.updateMotion();
  assert.equal(story.dataset.pinned, 'false', `${fallback} uses ordinary flow`);
  assert.ok(storyCards.every(card => !card.inert && !card.attributes['aria-hidden']), `${fallback} exposes every chapter`);
  assert.ok(chapterVisuals().every(visual => visual.opacity === 1 && visual.copyOpacity === 1 && visual.y === 0 && visual.scale === 1), `${fallback} clears partial blends`);
}
context.innerWidth = 1280; context.innerHeight = 900; storyPin.scrollHeight = 560; motionPreference.matches = false;
context.updateMotion();
assert.equal(story.dataset.pinned, 'true', 'Pinning returns when viewport and motion preference allow it');

await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'ready');
assert.ok(!requested.includes('stats.json'), 'Community content does not request disputed annual totals');
assert.equal(status.hidden, true);
assert.equal((containers.team[0].innerHTML.match(/class="community-member"/g) || []).length, source('team').members.length);
assert.equal((containers.speakers[0].innerHTML.match(/class="community-member"/g) || []).length, source('speakers').speakers.length);
assert.equal((containers.speakers[0].innerHTML.match(/class="profile-photo"/g) || []).length, source('speakers').speakers.filter(speaker => speaker.image).length);
assert.ok(!containers.team[0].innerHTML.includes('profile-photo'), 'Team cards keep their initials');
const gokulHTML = context.contentHTML('speakers', {speakers: [source('speakers').speakers.find(speaker => speaker.name === 'Gokul Nair')]}, 'glass');
assert.ok(gokulHTML.includes('GN</span>') && !gokulHTML.includes('profile-photo'), 'Gokul remains initials-only');
assert.ok(containers.speakers[0].innerHTML.includes('Meet all 30 speakers'));
assert.ok(containers.team[0].innerHTML.includes('Meet all 20 team members'));
assert.ok(containers.speakers[0].innerHTML.includes('Dharmesh Avaiya') && !containers.team[0].innerHTML.includes('Dharmesh Avaiya'));
assert.equal((containers.app[0].innerHTML.match(/class="app-feature"/g) || []).length, source('app').features.length);
assert.equal((containers.events[0].innerHTML.match(/class="event-entry"/g) || []).length, source('events').events.length);
assert.ok(containers.contact[0].innerHTML.includes('helloswiftahmedabad@gmail.com'));
assert.ok(containers.connect[0].innerHTML.includes('discord.gg'));
assert.ok(containers.sponsors[0].innerHTML.includes('Space-O Technologies'));
assert.ok(!containers.sponsors[0].innerHTML.includes('host-number'), 'Sponsors need names, not serial numbers');
assert.equal((containers.programs[0].innerHTML.match(/class="community-program"/g) || []).length, source('programs').programs.length);
assert.equal(description.textContent, source('links').community.description);
assert.ok(communityLinks.every(link => link.href));
assert.ok(sponsor.href.includes('?subject=') && sponsor.href.includes('&body='));
assert.ok(requested.every(path => /^[a-z-]+\.json$/.test(path)), 'Content requests stay relative under a project subpath');
for (const unsafe of ['javascript:alert(1)', 'data:text/html,test', 'file:///etc/passwd', '', null]) assert.throws(() => context.safeURL(unsafe));
assert.equal(context.safeURL('./privacy-policy.html'), 'https://example.github.io/community/privacy-policy.html');
const maliciousTeam = {members:[{name:'<script>alert(1)</script>', about:'<img onerror=alert(1)>', linkedIn:'https://example.com/?x="test"'}]};
const rendered = context.contentHTML('team', maliciousTeam, 'glass');
assert.ok(!rendered.includes('<script>') && !rendered.includes('<img onerror'));
assert.ok(rendered.includes('&lt;script&gt;'));
const renderedSpeaker = context.contentHTML('speakers', {speakers: maliciousTeam.members}, 'glass');
assert.ok(renderedSpeaker.includes('&lt;script&gt;') && !renderedSpeaker.includes('<img onerror'));
assert.throws(() => context.contentHTML('speakers', {speakers: [{...maliciousTeam.members[0], linkedIn: 'javascript:alert(1)'}]}, 'glass'));
for (const image of ['https://example.com/photo.png', 'data:image/png,test', 'assets/speakers/../photo.png', 'assets/speakers/photo.svg', 'assets/speakers/photo.png" onerror="alert(1)']) assert.throws(() => context.contentHTML('speakers', {speakers: [{...maliciousTeam.members[0], image}]}, 'glass'));
const photoHTML = context.contentHTML('speakers', {speakers: [{...maliciousTeam.members[0], image: 'assets/speakers/RatneshJain.png'}]}, 'glass');
assert.ok(photoHTML.includes('loading="lazy"') && photoHTML.includes('alt=""') && photoHTML.includes('&lt;script&gt;'));
let failedPhotoRemoved = false;
documentEvents.error({target: {matches: selector => selector === '.profile-photo', remove() { failedPhotoRemoved = true; }}});
assert.equal(failedPhotoRemoved, true, 'A failed portrait reveals its initials');
documentEvents.error({target: {}});
failedRequest = 'team.json';
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'partial');
assert.equal(status.hidden, false);
assert.equal(ids['retry-content'].hidden, false);
assert.ok(containers.events[0].innerHTML.includes('July'));
failedRequest = '';
await ids['retry-content'].events.click();
assert.equal(root.dataset.contentReady, 'ready');
assert.equal(status.hidden, true);

failedRequest = 'speakers.json';
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'partial');
assert.equal(ids['retry-content'].hidden, false);
assert.ok(containers.team[0].innerHTML.includes('Kajal Seth'));
failedRequest = '';
await ids['retry-content'].events.click();
assert.equal(root.dataset.contentReady, 'ready');
assert.equal((containers.speakers[0].innerHTML.match(/class="community-member"/g) || []).length, 30);

const gallery = element();
gallery.clientWidth = 390;
gallery.scrollWidth = 1170;
gallery.scrollLeft = 0;
ids['glass-features'] = gallery;
const galleryButton = element({galleryStep: '1'});
galleryButton.attributes['aria-controls'] = 'glass-features';
const galleryTarget = {closest: selector => selector === '[data-gallery-step]' ? galleryButton : null};
documentEvents.click({target: galleryTarget});
assert.equal(gallery.scrollOptions.left, 390);
assert.equal(gallery.scrollOptions.behavior, 'smooth');
motionPreference.matches = true;
documentEvents.click({target: galleryTarget});
assert.equal(gallery.scrollOptions.behavior, 'instant');
const cardGallery = {...gallery, dataset: {gallery: 'cards'}, children: [40, 362, 684, 1006].map(offsetLeft => ({offsetLeft}))};
assert.equal(context.galleryTarget(cardGallery, 1), 322, 'Event buttons advance one rendered card');
cardGallery.scrollLeft = 190;
assert.equal(context.galleryTarget(cardGallery, -1), 0, 'Previous from a partial drag finds the previous snap');
assert.equal(context.galleryTarget(cardGallery, 1), 322);
cardGallery.scrollLeft = 644;
assert.equal(context.galleryTarget(cardGallery, 1), 780, 'Last card clamps to the real end');
cardGallery.clientWidth = 900;
assert.equal(context.galleryTarget(cardGallery, 1), 270, 'Resizing uses current bounds instead of stale indices');
gallery.id = 'glass-features';
extraQueryNodes['[data-gallery-step]'] = [galleryButton];
gallery.scrollLeft = 780;
context.updateGalleryControls(gallery);
assert.equal(galleryButton.getAttribute('aria-disabled'), 'true');
gallery.scrollOptions = null;
documentEvents.click({target: galleryTarget});
assert.equal(gallery.scrollOptions, null, 'Unavailable controls do not scroll');
gallery.scrollLeft = 0;
context.updateGalleryControls(gallery);
assert.equal(galleryButton.getAttribute('aria-disabled'), 'false');
delete extraQueryNodes['[data-gallery-step]'];
menu.open = true;
menu.link = {closest: () => null};
documentEvents.click({target: menu.link});
assert.equal(menu.open, true, 'Clicking inside the menu keeps it open');
documentEvents.keydown({key: 'Tab'});
assert.equal(menu.open, true, 'Ordinary keyboard navigation keeps the menu open');
documentEvents.keydown({key: 'Escape'});
assert.equal(menu.open, false, 'Escape dismisses the mobile menu');
assert.equal(context.document.activeElement, menuSummary, 'Escape returns focus to the menu control');
menu.open = true;
documentEvents.click({target: {closest: () => null}});
assert.equal(menu.open, false, 'Clicking outside dismisses the menu');
menu.open = true;
documentEvents.click({target: {closest: selector => selector === '.section-menu a' ? menu.link : null}});
assert.equal(menu.open, false, 'Following a menu link closes the menu');

// Check parsed source, so retained theme comments do not count as active DOM.
const activeHTML = readFileSync(new URL('./index.html', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
assert.match(activeHTML, /src="designs\.js\?[^\"]+"/, 'The homepage loads the Liquid Night renderer');
const legacyHTML = readFileSync(new URL('./designs.html', import.meta.url), 'utf8');
assert.match(legacyHTML, /http-equiv="refresh" content="0;url=\.\/"/, 'Legacy design URL has a native redirect fallback');
for (const prefix of ['/', '/community/']) {
  const oldURL = new URL(`${prefix}designs.html?preview=feedback#story-build`, 'https://example.github.io');
  let redirected;
  runInNewContext(legacyHTML.match(/<script>([\s\S]*?)<\/script>/)[1], {
    location: {search: oldURL.search, hash: oldURL.hash, replace(path) { redirected = new URL(path, oldURL); }}
  });
  assert.equal(redirected.pathname, prefix, 'Legacy redirect retains hosting project subpaths');
  assert.equal(redirected.search, oldURL.search, 'Legacy redirect retains query parameters');
  assert.equal(redirected.hash, oldURL.hash, 'Legacy redirect retains section links');
}
assert.ok(!/data-stat=|data-year|data-content="stats"|class="liquid-impact"/.test(activeHTML), 'The active page omits both annual statistics blocks');
assert.deepEqual([...activeHTML.matchAll(/id="world-([^"]+)"/g)].map(match => match[1]), ['glass']);
assert.ok(!/data-choice|class="comparison"|id="studio-fill"/.test(activeHTML));
assert.ok(!/assets\/designs\/(?:studio|city-of-swift|aurora)/.test(activeHTML));
assert.ok(activeHTML.indexOf('id="glass-events"') < activeHTML.indexOf('id="liquid-story"'), 'Events precede optional storytelling');
assert.match(activeHTML, /class="liquid-button" href="https:\/\/lu.ma\/user\/swiftahmedabad"[^>]*data-link="luma">Find your next meetup/, 'Hero CTA goes directly to the calendar');
// Verified chronology stays local, uses Ahmedabad dates, and never mutates profiles.
const speakers = source('speakers').speakers, events = source('events').events;
const profileBytes = JSON.stringify(speakers);
const ordered = context.orderSpeakers(speakers, events, '2026-10-25');
assert.deepEqual(Array.from(ordered.slice(0, 4), speaker => speaker.name), ['Kanishka Chaudhry', 'Pradip Sutariya', 'Rahul Parmar', 'Ratnesh Jain']);
assert.equal(JSON.stringify(speakers), profileBytes);
assert.equal(context.ahmedabadDate(new Date('2026-03-13T18:30:00Z')), '2026-03-14', 'Calendar boundaries use Ahmedabad rather than UTC');
const march = events.find(event => event.source?.includes('/10.'));
assert.equal(march.date, '2026-03-14', 'Approved correction survives the upstream folder year');
assert.ok(march.speakerIds.includes(speakers.find(speaker => speaker.name === 'Ratnesh Jain').id), 'Named community updates count');
assert.ok(!events[0].date && !events[0].speakerIds, 'Year-only WWDC26 does not invent speaking evidence');
const pair = [{id:'b', name:'Zed'}, {id:'a', name:'Amy'}, {id:'c', name:'Unknown'}];
const appearance = {date:'2026-03-14', status:'Past event', source:march.source, speakerIds:['b', 'a', 'a']};
assert.deepEqual(Array.from(context.orderSpeakers(pair, [appearance], '2026-10-25'), p => p.id), ['a','b','c'], 'Ties are alphabetical; missing dates trail; duplicate relations are harmless');
assert.deepEqual(Array.from(context.orderSpeakers(pair, [appearance, {...appearance,date:'2026-04-01',speakerIds:['b']}], '2026-10-25'), p => p.id), ['b','a','c'], 'A new verified appearance changes the order');
for (const invalid of [{...appearance,date:'2026-02-30'}, {...appearance,source:''}, {...appearance,speakerIds:['missing']}]) assert.throws(() => context.orderSpeakers(pair, [invalid]));
for (const excluded of [{...appearance,date:'2030-01-01'}, {...appearance,status:'Upcoming event'}, {...appearance,status:'Cancelled'}, {...appearance,status:'Unverified'}]) {
  assert.deepEqual(Array.from(context.orderSpeakers(pair, [excluded], '2026-10-25'), p => p.id), ['a','c','b']);
}
failedRequest = 'events.json';
await context.loadCommunityContent();
assert.ok(containers.speakers[0].innerHTML.includes('recency is unavailable'));
assert.ok(containers.team[0].innerHTML.includes('Kajal Seth'));
failedRequest = '';
eventOverride = {events:[{...march,date:'2025-02-30'}]};
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'partial');
assert.ok(containers.speakers[0].innerHTML.includes('recency is unavailable'));
eventOverride = null;
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'ready');
assert.ok(!containers.speakers[0].innerHTML.includes('recency is unavailable'));
for (const broken of [{speakers:null},{speakers:[{id:'bad',name:'Unsafe',about:'Example',linkedIn:'javascript:alert(1)'}]}]) {
  speakerOverride = broken;
  await context.loadCommunityContent();
  assert.equal(root.dataset.contentReady, 'partial', 'Invalid deferred speaker data preserves the retry/error path');
  assert.ok(containers.team[0].innerHTML.includes('Kajal Seth'));
}
speakerOverride = null;
await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'ready');

// Exercise the real dialog/overflow functions, without implementing a fake focus trap.
const bioButton = {...element(), hidden:true, isConnected:true};
const preview = {...element(), clientWidth:220, clientHeight:81, scrollHeight:300, textContent:'First <script> paragraph.\nSecond paragraph.'};
const avatar = {cloneNode: () => ({avatar:true})};
const card = {...element(), querySelector: selector => ({'h3':{textContent:'Example speaker'}, '.member-initials':avatar, '.bio-preview':preview, '.profile-link':{href:'https://example.com/profile'}, '[data-read-bio]':bioButton})[selector]};
bioButton.closest = preview.closest = () => card;
extraQueryNodes['.bio-preview'] = [preview];
context.initContentUI();
assert.equal(bioButton.hidden, false, 'Only overflowing previews expose Read bio');
context.openProfile(bioButton);
assert.equal(dialog.open, true);
assert.equal(profileParts['[data-profile-name]'].textContent, 'Example speaker');
assert.equal(context.document.activeElement, profileParts['[data-profile-name]']);
assert.deepEqual(Array.from(profileParts['[data-profile-bio]'].children, p => p.textContent), ['First <script> paragraph.', 'Second paragraph.'], 'Biographies create text paragraphs, never HTML');
dialog.close();
assert.equal(context.document.activeElement, bioButton);
assert.equal(root.classList.values['profile-open'], undefined);
preview.scrollHeight = 81;
context.initContentUI();
assert.equal(bioButton.hidden, false, 'A focused action is not removed during resizing');
context.document.activeElement = null;
context.initContentUI();
assert.equal(bioButton.hidden, true, 'Short biographies do not open redundant dialogs');
delete extraQueryNodes['.bio-preview'];
assert.match(activeHTML, /class="community-section contact-panel" id="glass-contact"/);
assert.match(activeHTML, /<dialog[^>]+aria-labelledby="profile-dialog-name"/);
assert.match(activeHTML, /class="profile-dialog-body"[^>]+tabindex="0"[^>]+role="region"/, 'Long biographies remain keyboard-scrollable in Safari');
assert.match(activeHTML, /src="headline-glass\.mjs\?/);
assert.ok(!/src="story-glass\.mjs/.test(activeHTML), 'Retired WebGL renderer stays inactive');
assert.ok(!/<a\s[^>]*class="community-member"/.test(containers.speakers[0].innerHTML), 'Profile cards do not nest buttons in external links');
console.log('PASS: homepage, chronology/provenance/local dates, bio dialog/overflow/focus, card/page gallery navigation/bounds, content safety, retries and preserved story/navigation');

/* RETIRED THEMES: comparison, City of Swift dock/reveals and keyboard room tests.
for (const choice of ['editorial', 'aurora', 'glass', '__proto__']) {
  context.selectDesign(choice, true);
  const expected = choice === '__proto__' ? 'glass' : choice;
  assert.equal(body.dataset.design, expected);
  assert.equal(worlds.filter(world => !world.hidden).length, 1);
  assert.equal(worlds.find(world => !world.hidden).id, `world-${expected}`);
  assert.equal(lastURL.searchParams.get('design'), expected);
  assert.equal(lastURL.hash, '');
  assert.equal(scrollOptions.top, 0);
  assert.equal(choices.filter(button => button.attributes['aria-pressed'] === 'true').length, 1);
}
context.selectDesign('aurora');
motionPreference.matches = false;
cityHero.rect = {top: 160, height: 1000, bottom: 1160};
citySections['aurora-events'].rect.top = 1300;
citySections['lounge-room'].rect.top = 2400;
context.updateMotion();
assert.equal(cityHero.style.values['--city-progress'], '0.0000');
assert.equal(cityDock.hidden, true);
assert.equal(cityDock.inert, true);
cityHero.rect = {top: -800, height: 1000, bottom: 200};
citySections['aurora-events'].rect.top = 210;
context.updateMotion();
assert.equal(cityHero.style.values['--city-progress'], '0.8640');
assert.equal(cityDock.hidden, false);
assert.equal(cityDock.inert, false);
assert.equal(cityDockLinks[0].attributes['aria-current'], 'location');
citySections['lounge-room'].rect.top = 200;
context.updateMotion();
assert.equal(cityDockLinks[0].attributes['aria-current'], undefined);
assert.equal(cityDockLinks[1].attributes['aria-current'], 'location');
cityHero.rect = {top: -5000, height: 1000, bottom: -4000};
context.updateMotion();
assert.equal(cityHero.style.values['--city-progress'], '1.0000');
context.observeCityReveals();
const revealObserver = observers.at(-1);
assert.ok(revealObserver.observed.has(revealCard));
const entry = {target: revealCard, isIntersecting: true, boundingClientRect: {bottom: 500}};
revealObserver.callback([entry]);
revealObserver.callback([entry]);
assert.equal(revealCard.animations.length, 1, 'Scrolling back must not replay a reveal');
assert.equal(revealObserver.observed.has(revealCard), false);
motionPreference.matches = true;
motionPreference.events.change();
context.updateMotion();
assert.equal(cityHero.style.values['--city-progress'], '0');
assert.equal(cityDock.hidden, false, 'Navigation must work with reduced motion');
assert.ok(animationCancelled);
context.selectDesign('glass');
context.updateMotion();
assert.equal(cityDock.hidden, true, 'The dock must not appear in another theme');
assert.equal(cityDock.inert, true);
for (const name of ['meet', 'build', 'share']) {
  context.selectRoom(name);
  assert.equal(tabs.filter(tab => tab.attributes['aria-selected'] === 'true').length, 1);
  assert.equal(tabs.filter(tab => tab.tabIndex === 0).length, 1);
  assert.equal(ids[`room-${name}`].hidden, false);
  assert.equal(['meet', 'build', 'share'].filter(room => !ids[`room-${room}`].hidden).length, 1);
}
let prevented = false;
tabs[2].events.keydown({ key: 'ArrowRight', preventDefault() { prevented = true; } });
assert.ok(prevented);
assert.equal(tabs[0].focused, true);
assert.equal(ids['room-meet'].hidden, false);
tabs[0].events.keydown({ key: 'ArrowUp', preventDefault() {} });
assert.equal(ids['room-share'].hidden, false);
tabs[2].events.keydown({ key: 'ArrowDown', preventDefault() {} });
assert.equal(ids['room-meet'].hidden, false);
context.selectRoom('__proto__');
assert.equal(ids['room-meet'].hidden, false);

*/
