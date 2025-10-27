/* Central JS for Assignment 6
   - Renders packages & gallery
   - Booking price calc & validation
   - Modal using data-* attributes
   - Nav highlight & mobile menu
*/

const packagesData = [
  { id: 'p1', name: 'Himalayan Classic', destination: 'Annapurna, Nepal', durationDays: 7, basePrice: 650, season: 'spring', img: 'https://images.unsplash.com/photo-1506898660607-2b0a1b3b6d5e?auto=format&fit=crop&w=800&q=60' },
  { id: 'p2', name: 'Kathmandu Discovery', destination: 'Kathmandu Valley, Nepal', durationDays: 4, basePrice: 420, season: 'autumn', img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60' },
  { id: 'p3', name: 'Lakeside Retreat', destination: 'Pokhara, Nepal', durationDays: 3, basePrice: 300, season: 'summer', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=60' },
  { id: 'p4', name: 'Everest View Intro', destination: 'Solukhumbu, Nepal', durationDays: 5, basePrice: 550, season: 'winter', img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=60' }
];

const galleryData = [
  { id: 'g1', thumb: 'https://images.unsplash.com/photo-1505765054687-4d5b7c1e7d7b?auto=format&fit=crop&w=800&q=60', large: 'https://images.unsplash.com/photo-1505765054687-4d5b7c1e7d7b?auto=format&fit=crop&w=1600&q=80', title: 'Morning in the Himalaya', caption: 'Golden light over high ridges' },
  { id: 'g2', thumb: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60', large: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', title: 'City Temple', caption: 'A serene temple courtyard' },
  { id: 'g3', thumb: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=60', large: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80', title: 'Lakeside', caption: 'Peaceful lake and small boats' },
  { id: 'g4', thumb: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60', large: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80', title: 'Sunset Ridge', caption: 'Sunset cast over a mountain ridge' }
];

// multipliers & surcharges
const seasonMultiplier = { spring: 1.05, summer: 1.10, autumn: 1.15, winter: 1.12 };
const weekendSurcharge = 0.15; // 15% extra if includes weekend

document.addEventListener('DOMContentLoaded', () => {
  // set year
  document.querySelectorAll('[id^=year]').forEach(el => el.textContent = new Date().getFullYear());

  renderFeatured();
  renderPackagesTable();
  renderPackagesSelect();
  renderGallery();
  setupModal();
  setupNavHighlight();
  setupMobileMenu();
  setupBookingForm();
  setupContactForm();
});

/* RENDERING */
function renderFeatured() {
  const el = document.getElementById('featuredPackages');
  if (!el) return;
  el.innerHTML = '';
  packagesData.slice(0,3).forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'package-card';
    card.innerHTML = `
      <img src="${pkg.img}" alt="${escapeHtml(pkg.name)}">
      <h3>${escapeHtml(pkg.name)}</h3>
      <p class="muted">${escapeHtml(pkg.destination)} · ${pkg.durationDays} days</p>
      <p><strong>From $${pkg.basePrice.toFixed(2)}</strong></p>
      <a class="btn" href="booking.html">Book</a>
    `;
    el.appendChild(card);
  });
}

function renderPackagesTable() {
  const tbody = document.querySelector('#packagesTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  packagesData.forEach(pkg => {
    const sampleFinal = computeFinalPrice({
      basePrice: pkg.basePrice,
      season: pkg.season,
      nights: pkg.durationDays,
      guests: 1,
      promo: null,
      sampleWeekend: maybeIncludeWeekend(pkg.durationDays)
    });
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(pkg.name)}</td>
      <td>${escapeHtml(pkg.destination)}</td>
      <td>${pkg.durationDays}</td>
      <td>$${pkg.basePrice.toFixed(2)}</td>
      <td>${capitalize(pkg.season)}</td>
      <td>$${sampleFinal.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPackagesSelect() {
  const sel = document.getElementById('packageSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Choose a package --</option>';
  packagesData.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} — ${p.destination} (${p.durationDays}d) - $${p.basePrice}`;
    opt.setAttribute('data-base-price', p.basePrice);
    opt.setAttribute('data-duration', p.durationDays);
    opt.setAttribute('data-season', p.season);
    sel.appendChild(opt);
  });
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = '';
  galleryData.forEach(img => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.style.backgroundImage = `url(${img.thumb})`;
    div.setAttribute('data-large', img.large);
    div.setAttribute('data-title', img.title);
    div.setAttribute('data-caption', img.caption);
    div.innerHTML = `<div class="caption"><strong>${escapeHtml(img.title)}</strong></div>`;
    grid.appendChild(div);
  });

  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return openModalFromElement(item);
  });
}

/* MODAL */
function setupModal() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalCaption = document.getElementById('modalCaption');
  const closeBtn = document.getElementById('modalClose');

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function openModalFromElement(el) {
    const large = el.getAttribute('data-large');
    const title = el.getAttribute('data-title') || '';
    const caption = el.getAttribute('data-caption') || '';
    if (!large) return;
    modalImg.src = large;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modalCaption.textContent = caption;
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
  }

  window.openModalFromElement = openModalFromElement;
}

/* NAV */
function setupNavHighlight() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
    a.addEventListener('click', () => {
      document.querySelectorAll('.main-nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
    });
  });
}

/* MOBILE MENU */
function setupMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.style.display = expanded ? '' : 'block';
  });
}

/* BOOKING FORM & PRICE CALC */
function setupBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const checkIn = document.getElementById('checkIn');
  const checkOut = document.getElementById('checkOut');
  const guests = document.getElementById('guests');
  const packageSelect = document.getElementById('packageSelect');
  const promo = document.getElementById('promo');
  const nightsEl = document.getElementById('nights');
  const liveTotalEl = document.getElementById('liveTotal');
  const submitBtn = document.getElementById('submitBtn');
  const messages = document.getElementById('formMessages');

  ['change','input'].forEach(ev => {
    checkIn.addEventListener(ev, update);
    checkOut.addEventListener(ev, update);
    guests.addEventListener(ev, update);
    packageSelect.addEventListener(ev, update);
    promo.addEventListener(ev, update);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      messages.textContent = 'Please complete required fields correctly.';
      return;
    }
    messages.textContent = 'Booking confirmed (demo). We would now proceed to payment.';
    form.reset();
    update();
  });

  form.addEventListener('reset', () => setTimeout(update, 50));

  function update() {
    messages.textContent = '';
    const checkInVal = checkIn.value;
    const checkOutVal = checkOut.value;
    const guestsVal = Number(guests.value) || 1;
    const pkgId = packageSelect.value;
    const promoVal = promo.value && promo.value.trim();

    const nights = computeNights(checkInVal, checkOutVal);
    nightsEl.textContent = nights;

    const fieldsValid = form.checkValidity() && nights > 0 && pkgId !== '';
    submitBtn.disabled = !fieldsValid;

    const pkg = packagesData.find(p => p.id === pkgId);
    const base = pkg ? pkg.basePrice : 0;
    const season = pkg ? pkg.season : 'summer';
    const includesWeekend = nights > 0 && includesWeekendNights(checkInVal, nights);

    const total = computeFinalPrice({ basePrice: base, season, nights, guests: guestsVal, promo: promoVal, sampleWeekend: includesWeekend });
    liveTotalEl.textContent = total.toFixed(2);
  }

  update();
}

/* CONTACT FORM */
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const msg = document.getElementById('contactMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      msg.textContent = 'Please fill all required fields correctly.';
      return;
    }
    msg.textContent = 'Thank you — your message has been received (demo).';
    form.reset();
  });
}

/* HELPERS */
function computeNights(checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr) return 0;
  const inD = new Date(checkInStr);
  const outD = new Date(checkOutStr);
  const diff = outD.setHours(0,0,0,0) - inD.setHours(0,0,0,0);
  if (isNaN(diff)) return 0;
  const nights = Math.max(0, Math.round(diff / (24 * 60 * 60 * 1000)));
  return nights;
}

function includesWeekendNights(startDateStr, nights) {
  if (!startDateStr || nights <= 0) return false;
  let d = new Date(startDateStr);
  for (let i=0;i<nights;i++){
    const dow = d.getDay(); // 0 Sun, 6 Sat
    if (dow === 0 || dow === 6) return true;
    d = new Date(d.getTime() + 24*60*60*1000);
  }
  return false;
}

function computeFinalPrice({ basePrice=0, season='summer', nights=1, guests=1, promo=null, sampleWeekend=false }) {
  const nightsCount = Math.max(1, nights);
  let price = basePrice * nightsCount * guests;

  const sMult = seasonMultiplier[season] || 1.0;
  price *= sMult;

  if (sampleWeekend) price *= (1 + weekendSurcharge);

  if (guests > 2) {
    const extraMultiplier = 1 + 0.20 * (Math.ceil((guests - 2)));
    price *= extraMultiplier;
  }

  const code = (promo || '').trim().toUpperCase();
  if (code === 'EARLYBIRD') price *= 0.90;
  else if (code === 'SUMMER15') price *= 0.85;

  return Math.max(0, Math.round(price * 100) / 100);
}

function maybeIncludeWeekend(days) {
  const start = new Date();
  for (let i=0;i<days;i++){
    const d = new Date(start.getTime() + i*24*60*60*1000);
    if (d.getDay() === 0 || d.getDay() === 6) return true;
  }
  return false;
}

function capitalize(str){ return String(str).charAt(0).toUpperCase()+String(str).slice(1) }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function openModalFromElement(el) {
  if (window.openModalFromElement) window.openModalFromElement(el);
}
