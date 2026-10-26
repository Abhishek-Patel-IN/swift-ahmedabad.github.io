// Refraction changes the browser's native text paint; no duplicate text texture.
export function lensMap(width, height, diameter) {
  const mapWidth = Math.ceil(width * 2.4), mapHeight = Math.ceil(height * 2.4);
  const pixels = new Uint8ClampedArray(mapWidth * mapHeight * 4);
  for (let i = 0; i < pixels.length; i += 4) { pixels[i] = pixels[i + 1] = pixels[i + 2] = 128; pixels[i + 3] = 255; }
  const radius = diameter / 2, minimum = Math.min(width, height);
  for (let y = Math.floor(mapHeight / 2 - radius); y < mapHeight / 2 + radius; y++) {
    for (let x = Math.floor(mapWidth / 2 - radius); x < mapWidth / 2 + radius; x++) {
      const nx = (x + .5 - mapWidth / 2) / radius, ny = (y + .5 - mapHeight / 2) / radius;
      const square = nx * nx + ny * ny;
      if (square >= 1) continue;
      const strength = 1.8 * (1 - square) ** 2, i = (y * mapWidth + x) * 4;
      pixels[i] = 128 + nx * strength * 127 * minimum / width;
      pixels[i + 1] = 128 + ny * strength * 127 * minimum / height;
    }
  }
  return {width: mapWidth, height: mapHeight, pixels};
}
export function lensPoint(x, y, width, height, diameter) {
  const edge = diameter / 2 + 2;
  return {x: Math.max(edge, Math.min(width - edge, x)), y: Math.max(edge, Math.min(height - edge, y))};
}
const instances = new WeakMap();
export function initHeadlineGlass(stage) {
  if (instances.has(stage)) return instances.get(stage);
  const heading = stage.querySelector('h2');
  if (!heading || typeof ResizeObserver === 'undefined' || typeof IntersectionObserver === 'undefined') return () => {};
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('headline-optics');
  svg.setAttribute('aria-hidden', 'true');
  // Safari's CSS filter path needs object bounds and a complete image map.
  // Compositing a small map over feFlood made SourceGraphic disappear in Safari 27.
  svg.innerHTML = '<filter id="headline-refraction" primitiveUnits="objectBoundingBox" x="-5%" y="-8%" width="110%" height="116%" color-interpolation-filters="sRGB"><feImage result="map"/><feComponentTransfer in="map" result="neutral-map"><feFuncR type="linear" slope="1" intercept="-.00196078431372549"/><feFuncG type="linear" slope="1" intercept="-.00196078431372549"/></feComponentTransfer><feDisplacementMap in="SourceGraphic" in2="neutral-map" xChannelSelector="R" yChannelSelector="G"/></filter>';
  const image = svg.querySelector('feImage'), displacement = svg.querySelector('feDisplacementMap');
  const lens = document.createElement('div');
  lens.className = 'headline-lens';
  lens.setAttribute('aria-hidden', 'true');
  lens.hidden = true;
  stage.append(svg, lens);
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const plain = ['(forced-colors:active)', '(prefers-contrast:more)', '(prefers-reduced-transparency:reduce)'].map(query => matchMedia(query));
  let frame = null, disposed = false, suspended = false, visible = false, ready = false, dirty = true, failed = false;
  let width = 0, height = 0, diameter = 0, point, target, last = 0, deadline = 0, ticket = 0, down = false, printing = false;
  const listeners = [];
  function listen(node, type, callback, options) { node.addEventListener(type, callback, options); listeners.push(() => node.removeEventListener(type, callback, options)); }
  function selected() { const selection = document.getSelection(); return down || Boolean(selection && !selection.isCollapsed && selection.containsNode(heading, true)); }
  function allowed() { return !disposed && !suspended && !failed && visible && !document.hidden && !printing && !plain.some(query => query.matches) && !selected(); }
  function stop() { if (frame !== null) cancelAnimationFrame(frame); frame = null; last = 0; }
  function hide() { stop(); heading.style.removeProperty('filter'); lens.hidden = true; }
  function wake() { if (frame === null && ready && allowed()) frame = requestAnimationFrame(draw); }
  function build() {
    dirty = false;
    const rect = heading.getBoundingClientRect();
    width = rect.width; height = rect.height;
    diameter = Math.floor(Math.min(fine.matches && !reduced.matches ? 192 : 128, width * .45, height * .85));
    if (diameter < 64 || !width || !height) { ready = false; hide(); return; }
    const canvas = document.createElement('canvas'), context = canvas.getContext('2d');
    if (!context) throw new Error('Displacement map unavailable');
    const map = lensMap(width, height, diameter);
    canvas.width = map.width; canvas.height = map.height;
    const pixels = context.createImageData(map.width, map.height);
    pixels.data.set(map.pixels); context.putImageData(pixels, 0, 0);
    const url = canvas.toDataURL();
    const preload = new Image(), generation = ++ticket;
    ready = false;
    preload.onload = () => {
      if (disposed || generation !== ticket) return;
      image.setAttribute('href', url);
      image.setAttribute('width', map.width / width); image.setAttribute('height', map.height / height);
      displacement.setAttribute('scale', parseFloat(getComputedStyle(heading).fontSize) * .1 / Math.min(width, height));
      lens.style.width = lens.style.height = `${diameter}px`;
      point = target = lensPoint(width * .65, height * .55, width, height, diameter);
      ready = true; sync();
    };
    preload.onerror = () => { if (generation === ticket) { failed = true; hide(); stage.dataset.glassState = 'fallback'; } };
    preload.src = url;
  }
  function draw(time) {
    frame = null;
    if (!allowed() || !ready) { hide(); return; }
    const moving = fine.matches && !reduced.matches && time < deadline;
    const alpha = moving ? 1 - Math.exp(-Math.min(50, last ? time - last : 16.67) / 85) : 1;
    point.x += (target.x - point.x) * alpha; point.y += (target.y - point.y) * alpha;
    const unsettled = moving && Math.hypot(target.x - point.x, target.y - point.y) > .15;
    if (!unsettled) point = {...target};
    image.setAttribute('x', (point.x - Math.ceil(width * 2.4) / 2) / width);
    image.setAttribute('y', (point.y - Math.ceil(height * 2.4) / 2) / height);
    lens.style.left = `${point.x - diameter / 2}px`; lens.style.top = `${point.y - diameter / 2}px`;
    heading.style.filter = 'url(#headline-refraction)'; lens.hidden = false;
    stage.dataset.glassState = fine.matches && !reduced.matches ? 'ready' : 'static';
    last = unsettled ? time : 0;
    if (unsettled) wake();
  }
  function sync() {
    if (!allowed()) { hide(); return; }
    try { if (dirty) build(); wake(); }
    catch { failed = true; hide(); stage.dataset.glassState = 'fallback'; }
  }
  function invalidate() { if (disposed) return; ticket++; dirty = true; ready = false; hide(); sync(); }
  listen(stage, 'pointermove', event => {
    if (event.pointerType !== 'mouse' || !fine.matches || reduced.matches || !ready || !allowed()) return;
    const rect = heading.getBoundingClientRect();
    target = lensPoint(event.clientX - rect.left, event.clientY - rect.top, width, height, diameter);
    deadline = performance.now() + 1200; wake();
  }, {passive: true});
  listen(stage, 'pointerleave', () => { if (ready && fine.matches && !reduced.matches) { target = lensPoint(width * .65, height * .55, width, height, diameter); deadline = performance.now() + 1200; wake(); } });
  listen(stage, 'pointerdown', () => { down = true; sync(); }, {passive: true});
  listen(window, 'pointerup', () => { down = false; sync(); }, {passive: true});
  listen(window, 'pointercancel', () => { down = false; sync(); }, {passive: true});
  listen(document, 'selectionchange', sync);
  listen(document, 'visibilitychange', sync);
  listen(window, 'blur', () => { down = false; hide(); });
  listen(window, 'focus', sync);
  listen(window, 'beforeprint', () => { printing = true; sync(); });
  listen(window, 'afterprint', () => { printing = false; sync(); });
  listen(window, 'pagehide', event => { suspended = true; if (event.persisted) hide(); else dispose(); });
  listen(window, 'pageshow', () => { suspended = false; sync(); });
  [fine, reduced, ...plain].forEach(query => listen(query, 'change', invalidate));
  if (document.fonts) { listen(document.fonts, 'loadingdone', invalidate); document.fonts.ready.then(() => { if (!disposed) invalidate(); }); }
  const resize = new ResizeObserver(invalidate); resize.observe(heading);
  const intersection = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); });
  intersection.observe(stage);
  function dispose() {
    if (disposed) return;
    disposed = true; ticket++; hide(); resize.disconnect(); intersection.disconnect(); listeners.forEach(remove => remove());
    svg.remove(); lens.remove(); instances.delete(stage);
  }
  instances.set(stage, dispose);
  return dispose;
}
if (typeof document !== 'undefined') document.querySelectorAll('[data-headline-glass]').forEach(initHeadlineGlass);
