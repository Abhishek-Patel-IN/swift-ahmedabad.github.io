// Run with: node designs.check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function element(dataset = {}) {
  const values = {};
  return { dataset, attributes: {}, events: {}, rect: {top: 0, bottom: 100, height: 100}, style: { values, setProperty(k, v) { values[k] = v; } },
    classList: { values: {}, toggle(k, v) { this.values[k] = v; } },
    setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return this.attributes[k]; },
    getBoundingClientRect() { return this.rect; }, addEventListener(k, v) { this.events[k] = v; },
    scrollIntoView(options) { this.scrolled = options; }, scrollBy(options) { this.scrollOptions = options; }
  };
}
// Deliberately omit retired worlds, chooser, comparison header, dock, tabs and slab.
const ids = Object.fromEntries(['design-note', 'retry-content', 'main', 'liquid-top', 'liquid-city', 'liquid-story', 'liquid-join', ...['events', 'programs', 'app', 'team', 'sponsors', 'connect', 'contact'].map(name => `glass-${name}`)].map(id => [id, element()]));
const story = element();
const cityScene = element();
const storyCards = Array.from({length: 3}, () => element());
const navigation = {offsetHeight: 72};
const status = element();
const statusText = element();
status.querySelector = () => statusText;
const contentTypes = ['events', 'programs', 'team', 'sponsors', 'stats', 'connect', 'contact', 'app'];
const containers = Object.fromEntries(contentTypes.map(type => [type, [{
  dataset: {}, closest: () => ({id: 'world-glass'}), innerHTML: ''
}]]));
const statNodes = ['totalEvents', 'totalParticipants', 'averageParticipants', 'totalSpeakers', 'topicsCovered', 'totalVenues', 'totalSponsors'].map(stat => element({stat}));
const yearNodes = [element()];
const description = element();
const communityLinks = ['whatsapp', 'luma', 'email', 'speak'].map(link => element({link}));
const sponsor = element();
const root = element();
const body = {dataset: {}};
const windowEvents = {};
const documentEvents = {};
const motionPreference = {matches: false, events: {}, addEventListener(type, callback) { this.events[type] = callback; }};
let failedRequest = '';
const requested = [];
const source = type => JSON.parse(readFileSync(new URL(`./${type}.json`, import.meta.url), 'utf8'));
const location = {};
function visit(path) {
  const url = new URL(path, 'https://example.github.io/community/designs.html');
  Object.assign(location, {href: url.href, search: url.search, hash: url.hash});
}
visit('?design=unknown#old');
let lastURL;
const context = {
  URL, URLSearchParams, location,
  fetch: async path => { requested.push(path); return {ok: path !== failedRequest, json: async () => source(path.replace('.json', ''))}; },
  document: {
    body, documentElement: root,
    addEventListener(type, callback) { documentEvents[type] = callback; },
    querySelectorAll: selector => ({'.story-card': storyCards, '[data-stat]': statNodes, '[data-year]': yearNodes, '[data-community-description]': [description], '[data-link]': communityLinks, '.sponsor-mail-link': [sponsor]})[selector] || containers[selector.match(/^\[data-content="(.+)"\]$/)?.[1]] || [],
    querySelector: selector => ({'.content-status': status, '.liquid-story': story, '.liquid-nav': navigation, '[data-cityscape]': cityScene})[selector] || null,
    getElementById: id => ids[id] || null
  },
  history: {replaceState(_state, _title, url) { lastURL = url; visit(url); }},
  matchMedia: () => motionPreference,
  innerWidth: 1280, innerHeight: 900, scrollY: 0,
  requestAnimationFrame() {},
  window: {addEventListener(type, callback) { windowEvents[type] = callback; }}
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
  ['glass-team', 'glass-team'], ['liquid-story', 'liquid-story'], ['main', 'main'], ['glass-features', 'glass-features'],
  ['%E0%A4%A', 'liquid-top']
]) {
  visit(`?design=aurora&preview=6#${hash}`);
  context.syncLiquidLocation();
  assert.equal(lastURL.searchParams.get('design'), 'glass');
  assert.equal(lastURL.searchParams.get('preview'), '6');
  assert.equal(lastURL.hash, `#${expected}`);
  assert.equal(lastURL.pathname, '/community/designs.html', 'Keep GitHub Pages project subpaths');
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
assert.ok(storyCards.every(card => !card.inert));

await context.loadCommunityContent();
assert.equal(root.dataset.contentReady, 'ready');
assert.equal(status.hidden, true);
assert.equal((containers.team[0].innerHTML.match(/class="community-member"/g) || []).length, source('team').members.length);
assert.equal((containers.app[0].innerHTML.match(/class="app-feature"/g) || []).length, source('app').features.length);
assert.equal((containers.events[0].innerHTML.match(/class="event-entry"/g) || []).length, source('events').events.length);
assert.ok(containers.contact[0].innerHTML.includes('helloswiftahmedabad@gmail.com'));
assert.ok(containers.connect[0].innerHTML.includes('discord.gg'));
assert.ok(containers.sponsors[0].innerHTML.includes('Space-O Technologies'));
assert.ok(!containers.sponsors[0].innerHTML.includes('host-number'), 'Sponsors need names, not serial numbers');
assert.equal((containers.programs[0].innerHTML.match(/class="community-program"/g) || []).length, source('programs').programs.length);
assert.equal(statNodes[1].textContent, source('stats').stats.totalParticipants);
assert.ok(yearNodes.every(node => node.textContent === source('stats').year));
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

const gallery = element();
gallery.clientWidth = 390;
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
const menu = {open: true};
documentEvents.click({target: {closest: selector => selector === '.section-menu a' ? {closest: () => menu} : null}});
assert.equal(menu.open, false);

// Check parsed source, so retained theme comments do not count as active DOM.
const activeHTML = readFileSync(new URL('./designs.html', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
assert.deepEqual([...activeHTML.matchAll(/id="world-([^"]+)"/g)].map(match => match[1]), ['glass']);
assert.ok(!/data-choice|class="comparison"|id="studio-fill"/.test(activeHTML));
assert.ok(!/assets\/designs\/(?:studio|city-of-swift|aurora)/.test(activeHTML));
assert.ok(activeHTML.indexOf('id="glass-events"') < activeHTML.indexOf('id="liquid-story"'), 'Events precede optional storytelling');
assert.match(activeHTML, /class="liquid-button" href="https:\/\/lu.ma\/user\/swiftahmedabad"[^>]*data-link="luma">Find your next meetup/, 'Hero CTA goes directly to the calendar');
console.log('PASS: single-theme DOM, legacy URLs, nav offsets, lower story, reduced motion, real content, safe URLs, escaped text, retries, gallery and project subpaths');

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
