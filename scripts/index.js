// -----------------------------
// Project copy (unchanged)
// -----------------------------
const PROJECT_COPY = {
    "old-castillo":
        "A stately identity for a historic bed and breakfast. The logo draws from the inn’s surrounding oak branches, anchoring the mark in its natural environment while the circular frame suggests tradition and continuity. The typography conveys heritage and refinement. Together, the imagery and letterforms create a brand that feels both welcoming and dignified—an emblem of comfort, history, and timeless hospitality.",

    "arc":
        "An industrial brand system for a rail logistics company. The identity emphasizes reliability and scale—bold lettering, engineered spacing, and utility-first layouts that read clearly on rolling stock, signage, and safety gear. The palette and typography balance authority with approachability, creating a consistent look across equipment, facilities, and print.",

    "pinpoint":
        "A precise, calm visual language for PinPoint—coaching and systems design. The mark blends a location pin and a compass to signal clarity and direction. Clean grids, measured spacing, and neutral tones keep attention on outcomes and frameworks, while subtle accents guide focus and momentum.",

    "critical":
        "An administrative, member-first identity for a union of package carriers. The system favors legibility, trust, and policy clarity—structured typography, accessible colors, and forms that scale from flyers to portals. Iconography and layout choices reinforce advocacy, safety, and procedural transparency.",

    "freshwater":
        "A light, refreshing brand inspired by Wisconsin’s lakes. The symbol references a Native American lake glyph, simplified for modern use. Cool aquatic hues, gentle gradients, and open spacing evoke clarity and renewal, while sturdy type grounds the system for packaging, signage, and digital touchpoints."
};

// -----------------------------
// Config
// -----------------------------
const IMAGE_TILES = [1, 2, 3, 4, 5, 7];               // 6 = text tile
const DEFAULT_PROJECT = "old-castillo";

// Discover available projects from the buttons (avoids typos/drift)
function getProjectsFromDOM() {
    return [...document.querySelectorAll('.switch-btn[data-project]')]
        .map(b => b.dataset.project)
        .filter(Boolean);
}

// -----------------------------
// Image cache + preloading
// -----------------------------
const IMG_CACHE = Object.create(null); // { "slug/idx": HTMLImageElement }

function preloadOne(project, i) {
    return new Promise((resolve) => {
        const key = `${project}/${i}`;
        if (IMG_CACHE[key]) return resolve(IMG_CACHE[key]);

        const img = new Image();
        img.decoding = "async";
        img.loading = "eager"; // we *do* want it now
        img.onload = () => { IMG_CACHE[key] = img; resolve(img); };
        img.onerror = () => resolve(null); // fail soft
        img.src = `/assets/${project}/${i}.png`;
    });
}

async function preloadAll(projects) {
    const jobs = [];
    for (const p of projects) {
        for (const i of IMAGE_TILES) jobs.push(preloadOne(p, i));
    }
    await Promise.all(jobs);
    // console.log("Preloaded", jobs.length, "images");
}

// Helper: set a tile’s <img> from cache (falls back to URL if not cached yet)
function setTileFromCache(project, i) {
    const tile = document.querySelector(`.tile-${i}`);
    if (!tile) return;

    let img = tile.querySelector('img');
    if (!img) {
        img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        tile.appendChild(img);
    }

    const key = `${project}/${i}`;
    const cached = IMG_CACHE[key];
    img.src = cached?.src || `/assets/${project}/${i}.png`;
    img.alt = `${project} tile ${i}`;
}

// -----------------------------
// UI helpers
// -----------------------------
function toggleButton(project) {
    document.querySelectorAll('.switch-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });
    const target = document.querySelector(`.switch-btn[data-project="${project}"]`);
    if (target) {
        target.classList.add('active');
    }
}

function populateText(project) {
    const tile = document.querySelector(".tile-6");
    if (!tile) return;

    let p = tile.querySelector("p");
    if (!p) {
        p = document.createElement("p");
        tile.appendChild(p);
    }
    p.textContent = PROJECT_COPY[project] || "";
}

// -----------------------------
// Load a project into the bento
// -----------------------------
function loadImages(project) {
    IMAGE_TILES.forEach(i => setTileFromCache(project, i));
}

function loadProject(project) {
    toggleButton(project);
    loadImages(project);
    populateText(project);
}

// -----------------------------
// Wire up & kick off
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Wire switches
    document.querySelectorAll('.switch-btn[data-project]').forEach((btn) => {
        btn.addEventListener('click', () => loadProject(btn.dataset.project));
    });

    // Initial state
    loadProject(DEFAULT_PROJECT);

    // Preload after first paint (don’t block)
    const projects = getProjectsFromDOM();
    const startPreload = () => preloadAll(projects);
    (window.requestIdleCallback
        ? requestIdleCallback(startPreload, { timeout: 400 })
        : setTimeout(startPreload, 200));
});
(function () {
    const form = document.getElementById('contactForm');
    const notice = document.getElementById('formNotice');

    function showNotice(msg, ok = true) {
        notice.style.display = 'block';
        notice.textContent = msg;
        notice.style.color = ok ? 'var(--text)' : '#b00020';
        notice.style.background = ok ? 'color-mix(in srgb, var(--surface) 92%, #fff 8%)' : 'color-mix(in srgb, #ffebee 85%, #fff 15%)';
        notice.style.padding = '12px 16px';
        notice.style.borderRadius = '12px';
        notice.style.boxShadow = ok ? 'var(--elev-1)' : 'var(--elev-1)';
        notice.style.marginTop = 'var(--sm-space)';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const endpoint = form.getAttribute('action');
        const data = new FormData(form);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: data
            });

            if (res.ok) {
                form.reset();
                showNotice('Thanks! Your brief was sent. I’ll get back to you shortly.', true);
            } else {
                const payload = await res.json().catch(() => ({}));
                const msg = payload && payload.errors && payload.errors[0]?.message
                    ? payload.errors[0].message
                    : 'Something went wrong sending the form.';
                showNotice(msg, false);
            }
        } catch (err) {
            showNotice('Network error. Please try again in a moment.', false);
        }
    });
})();