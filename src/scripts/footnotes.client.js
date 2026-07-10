// Shared footnote popover. Uses fixed positioning + a backdrop so the card always
// sits cleanly above content (no bleed-through) and behaves on mobile. Dismiss via
// ×, backdrop tap, outside click, Escape, or scroll.
// Kinds: gif/meme (local media), quote (text), link (YouTube embeds in place; other
// links become an "open ↗" that leaves in a new tab).
const KICKERS = { gif: 'Reaction gif', meme: 'Meme', quote: 'Movie quote', link: 'Link' };

function ytId(url) {
  const m = (url || '').match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/
  );
  return m ? m[1] : null;
}

function init() {
  const pop = document.getElementById('fn-pop');
  const backdrop = document.getElementById('fn-backdrop');
  if (!pop || !backdrop) return;
  const mediaEl = document.getElementById('fn-pop-media');
  const kickerEl = document.getElementById('fn-pop-kicker');
  const textEl = document.getElementById('fn-pop-text');
  let active = null;

  function hide() {
    pop.hidden = true;
    backdrop.hidden = true;
    mediaEl.replaceChildren();  // tear down any iframe so audio/video stops
    if (active) { active.classList.remove('is-active'); active = null; }
  }

  function place(el) {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const left = Math.min(Math.max(12, r.left), vw - w - 12);
    let top = r.bottom + 8;
    if (top + h > vh - 12) {
      const above = r.top - h - 8;
      top = above >= 12 ? above : Math.max(12, (vh - h) / 2);
    }
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  function show(el) {
    const kind = el.dataset.kind;
    kickerEl.textContent = KICKERS[kind] ?? '';
    if (kind === 'quote') {
      mediaEl.replaceChildren();
      textEl.className = 'fn-pop-text quote';
      textEl.innerHTML =
        `“${el.dataset.quote}”` +
        (el.dataset.source ? `<span class="src">— ${el.dataset.source}</span>` : '');
    } else if (kind === 'link') {
      const id = ytId(el.dataset.href);
      if (id) {
        const t = (el.dataset.href.match(/[?&]t=(\d+)/) || [])[1];
        const frame = document.createElement('iframe');
        frame.src = `https://www.youtube.com/embed/${id}${t ? `?start=${t}` : ''}`;
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.allowFullscreen = true;
        mediaEl.replaceChildren(frame);
        kickerEl.textContent = 'Video';
      } else {
        mediaEl.replaceChildren();
      }
      textEl.className = 'fn-pop-text';
      const a = document.createElement('a');
      a.href = el.dataset.href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'fn-link';
      a.textContent = id ? 'Watch on YouTube ↗' : 'Open link ↗';
      textEl.replaceChildren(document.createTextNode(`${el.textContent}  `), a);
    } else {
      const img = document.createElement('img');
      img.src = el.dataset.media;
      img.alt = el.textContent;
      mediaEl.replaceChildren(img);
      textEl.className = 'fn-pop-text';
      textEl.textContent = el.textContent;
    }
    backdrop.hidden = false;
    pop.hidden = false;      // unhide so we can measure, then position
    place(el);
    active = el;
    el.classList.add('is-active');
  }

  document.querySelectorAll('.footnote').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      active === el ? hide() : show(el);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        active === el ? hide() : show(el);
      }
    });
  });

  backdrop.addEventListener('click', hide);
  pop.addEventListener('click', (e) => e.stopPropagation());
  pop.querySelector('[data-fn-close]')?.addEventListener('click', (e) => { e.stopPropagation(); hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', () => { if (!pop.hidden) hide(); }, { passive: true });
}

document.addEventListener('DOMContentLoaded', init);
