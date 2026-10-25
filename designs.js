/* RETIRED THEMES: comparison controller retained for restoration.
const choices = [...document.querySelectorAll('[data-choice]')];
const worlds = [...document.querySelectorAll('.world')];
const notes = {glass: 'Liquid Night', editorial: 'Open Studio', aurora: 'City of Swift'};

function selectDesign(design, resetScroll = false) {
  if (!Object.hasOwn(notes, design)) design = 'glass';
  document.body.dataset.design = design;
  worlds.forEach(world => { world.hidden = world.id !== `world-${design}`; });
  choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.choice === design)));
  document.getElementById('design-note').textContent = `Swift Ahmedabad · ${notes[design]}`;
  const url = new URL(location.href);
  url.searchParams.set('design', design);
  if (resetScroll) url.hash = '';
  history.replaceState(null, '', url);
  if (resetScroll) window.scrollTo({top: 0, behavior: 'instant'});
  scheduleMotion();
}

*/
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const links = {};

function currentAnchor(hash) {
  if (!hash) return '';
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return 'liquid-top'; }
  if (/^(?:team|speakers|app|contact)$/.test(id)) id = `glass-${id}`;
  else if (id.startsWith('app/')) id = 'glass-features';
  else if (id === 'support') id = 'glass-contact';
  const legacySections = /^(?:editorial|aurora)-(events|programs|app|team|sponsors|connect|contact)$/;
  if (legacySections.test(id)) id = `glass-${id.match(legacySections)[1]}`;
  else if (id === 'mag-gatherings') id = 'glass-programs';
  else if (id === 'aurora-city') id = 'liquid-city';
  // The feature gallery is inserted after its JSON request finishes.
  return document.getElementById(id) || id === 'glass-features' ? id : 'liquid-top';
}

function syncLiquidLocation() {
  document.body.dataset.design = 'glass';
  const note = document.getElementById('design-note');
  if (note) note.textContent = 'Swift Ahmedabad · Liquid Night';
  const url = new URL(location.href);
  url.searchParams.set('design', 'glass');
  url.hash = currentAnchor(url.hash);
  if (url.href !== location.href) history.replaceState(null, '', url);
}

function scrollToCurrentAnchor() {
  const target = document.getElementById(currentAnchor(location.hash));
  const chapter = storyCards.indexOf(target);
  if (chapter !== -1) {
    updateStoryMotion(navigation?.offsetHeight || 0);
    if (story.dataset.pinned === 'true') return scrollToStoryStep(chapter);
  }
  if (target) target.scrollIntoView({block: 'start', behavior: 'instant'});
}

/* RETIRED THEMES / HERO: detached glass slab and City of Swift motion.
const slab = document.querySelector('.slab-front');
const art = document.querySelector('.liquid-art');
const cityWorld = document.getElementById('world-aurora');
const cityHero = document.querySelector('.lounge-hero');
const cityDock = document.querySelector('.city-dock');
const cityDockLinks = [...document.querySelectorAll('.city-dock a[href^="#"]:not(.city-dock-home)')];
const citySections = cityDockLinks.map(link => document.getElementById(link.getAttribute('href').slice(1)));
let cityRevealObserver;
*/
const navigation = document.querySelector('.liquid-nav');
const sectionMenu = navigation?.querySelector('.section-menu');
const cityScene = document.querySelector('[data-cityscape]');
const story = document.querySelector('.liquid-story');
const storyPin = document.querySelector('.story-pin');
const storyCards = [...document.querySelectorAll('.story-card')];
const storySteps = [...document.querySelectorAll('[data-story-step]')];

function scrollToStoryStep(index, behavior = 'instant') {
  const top = navigation?.offsetHeight || 0;
  const rect = story.getBoundingClientRect();
  const travel = rect.height - (innerHeight - top);
  window.scrollTo({top: window.scrollY + rect.top - top + travel * (index + .5) / storyCards.length, behavior});
  scheduleMotion();
}

function updateStoryMotion(top) {
  if (!story || !storyPin) return;
  let pinned = !reducedMotion.matches && innerWidth >= 900 && innerHeight - top >= 600;
  story.dataset.pinned = String(pinned);
  // Text zoom or taller translated copy must never be clipped into a pinned stage.
  if (pinned && storyPin.scrollHeight > innerHeight - top + 1) {
    pinned = false;
    story.dataset.pinned = 'false';
  }
  const rect = story.getBoundingClientRect();
  const travel = rect.height - (innerHeight - top);
  const progress = pinned && travel > 0 ? Math.max(0, Math.min(1, (top - rect.top) / travel)) : 0;
  let active = Math.min(storyCards.length - 1, Math.floor(progress * storyCards.length));
  // Keep a focused chapter link available until focus leaves it.
  const focused = storyCards.findIndex(card => card.contains(document.activeElement));
  if (focused !== -1) active = focused;
  const phase = focused !== -1 ? focused : Math.max(0, Math.min(storyCards.length - 1, progress * storyCards.length - .5));
  story.style.setProperty('--story-progress', progress.toFixed(4));
  storyCards.forEach((card, index) => {
    // Hold each chapter for reading; scrub a smooth crossfade between holds.
    const blend = Math.max(0, Math.min(1, (Math.abs(index - phase) - .2) / .6));
    const opacity = pinned ? 1 - blend * blend * (3 - 2 * blend) : 1;
    card.style.setProperty('--chapter-opacity', opacity.toFixed(4));
    const copyBlend = Math.max(0, opacity * 2 - 1);
    card.style.setProperty('--chapter-copy-opacity', (copyBlend * copyBlend * (3 - 2 * copyBlend)).toFixed(4));
    card.style.setProperty('--chapter-y', `${(Math.sign(index - phase) * (1 - opacity) * 40).toFixed(2)}px`);
    card.style.setProperty('--chapter-scale', (1 - (1 - opacity) * .04).toFixed(4));
    card.dataset.visible = String(opacity > 0);
    card.dataset.active = String(index === active);
    card.inert = pinned && index !== active;
    if (card.inert) card.setAttribute('aria-hidden', 'true');
    else card.removeAttribute('aria-hidden');
  });
  storySteps.forEach((button, index) => button.setAttribute('aria-pressed', String(index === active)));
}

let framePending = false;
function updateMotion() {
  framePending = false;
  /* RETIRED THEME: City of Swift dock animation.
  if (document.body.dataset.design === 'aurora') {
    const top = document.querySelector('.comparison').offsetHeight;
    const rect = cityHero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (top - rect.top) / rect.height));
    cityHero.style.setProperty('--city-progress', reducedMotion.matches ? '0' : progress.toFixed(4));
    const showDock = rect.bottom <= top + 160;
    cityDock.hidden = !showDock;
    cityDock.inert = !showDock;
    let current = -1;
    citySections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= top + 160) current = index;
    });
    cityDockLinks.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  } else {
    cityDock.hidden = true;
    cityDock.inert = true;
  }
  */
  const top = navigation?.offsetHeight || 0;
  document.documentElement.style.setProperty('--nav-height', `${top}px`);
  updateStoryMotion(top);
  if (cityScene) {
    const rect = cityScene.getBoundingClientRect();
    const drift = reducedMotion.matches ? 0 : Math.max(-12, Math.min(12, (innerHeight / 2 - rect.top - rect.height / 2) / (innerHeight + rect.height) * 24));
    cityScene.style.setProperty('--city-drift', `${drift.toFixed(2)}px`);
  }

}
function scheduleMotion() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateMotion);
  }
}
/* RETIRED THEME: City of Swift reveal observer and comparison bindings.
function observeCityReveals() {
  cityRevealObserver?.disconnect();
  if (reducedMotion.matches || typeof IntersectionObserver === 'undefined') return;
  cityRevealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      cityRevealObserver.unobserve(entry.target);
      if (entry.target.dataset.citySeen) return;
      entry.target.dataset.citySeen = 'true';
      if (reducedMotion.matches || entry.boundingClientRect.bottom <= 0) return;
      const siblings = [...entry.target.parentElement.children];
      const stagger = entry.target.matches('.community-member, .community-program') ? siblings.indexOf(entry.target) % 4 * 65 : 0;
      entry.target.animate([{opacity: .45, transform: 'translateY(22px)'}, {opacity: 1, transform: 'none'}], {
        duration: 700, delay: stagger, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'
      });
    });
  }, {threshold: .08, rootMargin: '0px 0px -24px 0px'});
  cityWorld.querySelectorAll('.city-welcome, .lounge-intro>div, .community-heading, .event-entry, .community-program, .community-member, .lounge-room-heading, .lounge-explorer, .app-overview, .lounge-ethos>div, .community-year-stats, .lounge-closing').forEach(target => {
    if (!target.dataset.citySeen) cityRevealObserver.observe(target);
  });
}
choices.forEach(button => button.addEventListener('click', () => selectDesign(button.dataset.choice, true)));
*/
window.addEventListener('scroll', scheduleMotion, {passive: true});
window.addEventListener('resize', scheduleMotion);
if (typeof ResizeObserver !== 'undefined' && navigation) new ResizeObserver(scheduleMotion).observe(navigation);
reducedMotion.addEventListener('change', () => {
  // RETIRED: cityWorld.getAnimations({subtree: true}).forEach(animation => animation.cancel());
  // RETIRED: observeCityReveals();
  scheduleMotion();
});
// RETIRED: selectDesign(new URLSearchParams(location.search).get('design'));
window.addEventListener('hashchange', () => { syncLiquidLocation(); scrollToCurrentAnchor(); });
window.addEventListener('popstate', () => { syncLiquidLocation(); scrollToCurrentAnchor(); });
syncLiquidLocation();
scheduleMotion();

/* RETIRED THEME: City of Swift room tabs.
const roomTabs = [...document.querySelectorAll('[data-room]')];
function selectRoom(name) {
  if (!roomTabs.some(tab => tab.dataset.room === name)) return;
  roomTabs.forEach(tab => {
    const selected = tab.dataset.room === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(`room-${tab.dataset.room}`).hidden = !selected;
  });
}
roomTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectRoom(tab.dataset.room));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % roomTabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + roomTabs.length) % roomTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = roomTabs.length - 1;
    else return;
    event.preventDefault();
    selectRoom(roomTabs[next].dataset.room);
    roomTabs[next].focus();
  });
});

*/
// Liquid Night reads the same files as the existing community site.
// Text is escaped and links are restricted before JSON enters the page.
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
}
function safeURL(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Missing content URL');
  const url = new URL(value, location.href);
  if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) throw new Error('Unsupported content URL');
  return url.href;
}
function contentLink(url, body, className = '') {
  const href = safeURL(url);
  return `<a class="${escapeHTML(className)}" href="${escapeHTML(href)}"${href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener noreferrer"'}>${body}</a>`;
}
function contentHTML(type, data, theme) {
  const text = escapeHTML;
  if (type === 'events') return `<div class="event-list">${data.events.map((event, index) => contentLink(event.url, `
    <div class="event-art">${event.image ? `<img src="${text(safeURL(event.image))}" alt="${text(event.title)} event poster" loading="lazy" width="800" height="800">` : `<span class="event-date-art">${text(event.period)}<svg aria-hidden="true"><use href="#bird"/></svg></span>`}</div>
    <div class="event-copy"><div class="event-meta"><span>${text(event.period)}</span><span>${text(event.status)}</span></div><h3>${text(event.title)}</h3><p>${text(event.description)}</p><div class="event-place">${text(event.venue)}</div><span class="event-action">View event details <b aria-hidden="true">↗</b></span></div>`, 'event-entry')).join('')}</div><p class="content-footnote">${text(data.subtitle)}</p>`;
  if (type === 'programs') {
    return `<div class="program-list">${data.programs.map((program, index) => contentLink(program.url, `<span class="program-index">0${index + 1} <span aria-hidden="true">${text(program.emoji)}</span></span><h3>${text(program.name)}</h3><p>${text(program.description)}</p><div><span>${text(program.stat)}</span><b aria-hidden="true">↗</b></div>`, 'community-program')).join('')}</div>`;
  }
  if (type === 'team' || type === 'speakers') {
    const members = type === 'speakers' ? data.speakers : data.members;
    const label = type === 'speakers' ? 'speakers' : 'team members';
    const memberHTML = member => {
      if (member.image && !/^assets\/speakers\/[\w.-]+\.(?:jpe?g|png)$/.test(member.image)) throw new Error('Unsupported profile image');
      return contentLink(member.linkedIn, `<span class="member-initials" aria-hidden="true">${text(member.name.split(/\s+/).map(word => word[0]).filter(Boolean).slice(0, 2).join(''))}${member.image ? `<img class="profile-photo" src="${text(member.image)}" alt="" width="80" height="80" loading="lazy" decoding="async">` : ''}</span><div><h3>${text(member.name)}</h3><p>${text(member.about)}</p><span>Connect on LinkedIn ↗</span></div>`, 'community-member');
    };
    return `<div class="member-grid">${members.slice(0, 4).map(memberHTML).join('')}</div><details class="team-directory"><summary>Meet all ${members.length} ${label} <span aria-hidden="true">+</span></summary><div class="member-grid">${members.slice(4).map(memberHTML).join('')}</div></details>`;
  }
  if (type === 'sponsors') return `<p class="sponsor-intro">${text(data.subtitle)}</p><div class="host-list">${data.sponsors.map(sponsor => contentLink(sponsor.url, `<strong>${text(sponsor.name)}</strong><span aria-hidden="true">↗</span>`, 'community-host')).join('')}</div>`;
  if (type === 'links') return `<div class="community-links">${data.links.map(link => contentLink(link.url, `<span class="connect-symbol" aria-hidden="true">${text({whatsapp:'W', luma:'↗', linkedin:'in', github:'⌘', instagram:'◎', twitter:'𝕏', discord:'D', aratt:'A', maps:'⌖'}[link.id] || '↗')}</span><div><h3>${text(link.name)}</h3><p>${text(link.description || 'Find us in Ahmedabad')}</p></div><b aria-hidden="true">↗</b>`, 'community-connect-link')).join('')}</div>`;
  if (type === 'contact') return `<div class="contact-list">${data.items.map(item => contentLink(item.email ? `mailto:${item.email}${item.id === 'sponsor' ? '?subject=Sponsorship%20offer%20for%20Swift%20Ahmedabad' : ''}` : item.url, `<h3>${text(item.title)}</h3><p>${text(item.description)}</p><span>${item.email ? text(item.email) : 'Submit your talk proposal'} <b aria-hidden="true">↗</b></span>`, `community-contact${item.id === 'sponsor' ? ' sponsor-mail-link' : ''}`)).join('')}</div>`;
  if (type === 'app') return `<div class="app-overview"><div class="app-description"><p class="community-eyebrow">YOUR COMMUNITY, IN YOUR POCKET</p><div class="app-product-name"><img src="${text(safeURL(data.app.icon))}" width="64" height="64" alt="${text(data.app.name)} app icon" loading="lazy"><h2>${text(data.app.name)}</h2></div><h3>${text(data.app.tagline)}</h3><p>${text(data.app.description)}</p><div class="app-downloads">${contentLink(data.app.appStoreUrl, 'Download on the App Store ↗', 'app-store-link')}${contentLink(data.app.testFlightUrl, 'Try the TestFlight beta ↗', 'app-beta-link')}<a href="privacy-policy.html">Privacy policy</a></div></div><div class="app-feature-intro"><svg aria-hidden="true"><use href="#bird"/></svg><p>Discover a talk.<br>Prepare your own.<br><span>Keep learning.</span></p><span>${data.features.length} ways to explore the Swift ecosystem.</span></div></div><div class="feature-gallery-heading"><p>Inside the app</p><div><button type="button" data-gallery-step="-1" aria-label="Previous app features" aria-controls="${theme}-features">←</button><button type="button" data-gallery-step="1" aria-label="Next app features" aria-controls="${theme}-features">→</button></div></div><div class="feature-gallery" id="${theme}-features" tabindex="0" role="region" aria-label="${text(data.app.name)} app feature gallery">${data.features.map(feature => `<article class="app-feature"><div class="feature-phone"><img src="${text(safeURL(feature.image))}" alt="${text(feature.title)} in the Talks app" loading="lazy" width="390" height="844"></div><h3>${text(feature.title)}</h3><p>${text(feature.description)}</p></article>`).join('')}</div>`;
  return '';
}

async function loadCommunityContent() {
  const status = document.querySelector('.content-status');
  const retry = document.getElementById('retry-content');
  status.hidden = false;
  status.querySelector('span').textContent = 'Loading community content…';
  retry.hidden = true;
  let sponsorshipEmail;
  const files = ['links', 'programs', 'team', 'speakers', 'sponsors', 'app', 'contact', 'events', 'sponsorship-email'];
  const results = await Promise.allSettled(files.map(async type => {
    const response = await fetch(`${type}.json`);
    if (!response.ok) throw new Error(`Could not load ${type}`);
    const data = await response.json();
    if (type === 'sponsorship-email') sponsorshipEmail = data;
    if (type === 'links') {
      data.links.forEach(link => { links[link.id] = safeURL(link.url); });
      links.email = safeURL(`mailto:${data.community.email}`);
      document.querySelectorAll('[data-community-description]').forEach(node => { node.textContent = data.community.description; });
    }
    if (type === 'contact') {
      links.speak = safeURL(data.items.find(item => item.id === 'speakers').url);
    }
    document.querySelectorAll(`[data-content="${type === 'links' ? 'connect' : type}"]`).forEach(container => {
      const theme = container.closest('.world').id.replace('world-', '');
      container.innerHTML = contentHTML(type, data, theme);
    });
  }));
  document.querySelectorAll('[data-link]').forEach(anchor => {
    const href = links[anchor.dataset.link];
    if (href) anchor.href = href;
  });
  if (sponsorshipEmail && links.email) {
    document.querySelectorAll('.sponsor-mail-link').forEach(anchor => {
      anchor.href = `${links.email}?subject=${encodeURIComponent(sponsorshipEmail.subject)}&body=${encodeURIComponent(sponsorshipEmail.body)}`;
    });
  }
  const failures = results.filter(result => result.status === 'rejected');
  document.documentElement.dataset.contentReady = failures.length ? 'partial' : 'ready';
  if (failures.length) {
    status.querySelector('span').textContent = 'Some community content could not load. Please try again.';
    retry.hidden = false;
  } else status.hidden = true;
  // A direct team/app/event link can arrive before those sections finish loading.
  scrollToCurrentAnchor();
  // RETIRED: observeCityReveals();
  scheduleMotion();
}
document.getElementById('retry-content').addEventListener('click', loadCommunityContent);
document.addEventListener('error', event => { if (event.target?.matches?.('.profile-photo')) event.target.remove(); }, true);
document.addEventListener('click', event => {
  const step = event.target.closest('[data-story-step]');
  if (step && story?.dataset.pinned === 'true') {
    step.focus({preventScroll: true});
    scrollToStoryStep(Number(step.dataset.storyStep), 'smooth');
  }
  const menuLink = event.target.closest('.section-menu a');
  if (sectionMenu?.open && (menuLink || !sectionMenu.contains(event.target))) sectionMenu.open = false;
  const button = event.target.closest('[data-gallery-step]');
  if (!button) return;
  const gallery = document.getElementById(button.getAttribute('aria-controls'));
  gallery.scrollBy({left: Number(button.dataset.galleryStep) * gallery.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !sectionMenu?.open) return;
  sectionMenu.open = false;
  sectionMenu.querySelector('summary').focus();
});
document.addEventListener('focusin', scheduleMotion);
if (typeof ResizeObserver !== 'undefined' && storyPin) {
  const storyResize = new ResizeObserver(scheduleMotion);
  [storyPin, ...storyCards].forEach(node => storyResize.observe(node));
}
if (document.fonts) document.fonts.ready.then(scheduleMotion);
loadCommunityContent();
