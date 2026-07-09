// Positions the shared popover under a clicked/tapped footnote. Dismiss via
// ×, outside-click, or Escape. Theme tokens handle all the looks.
const KICKERS = { gif: 'Reaction gif', meme: 'Meme', quote: 'Movie quote' };

function init() {
  const pop = document.getElementById('fn-pop');
  if (!pop) return;
  const mediaEl = document.getElementById('fn-pop-media');
  const kickerEl = document.getElementById('fn-pop-kicker');
  const textEl = document.getElementById('fn-pop-text');
  let active = null;

  const hide = () => {
    pop.hidden = true;
    if (active) { active.classList.remove('is-active'); active = null; }
  };

  function show(el) {
    const kind = el.dataset.kind;
    kickerEl.textContent = KICKERS[kind] ?? '';
    if (kind === 'quote') {
      mediaEl.replaceChildren();
      textEl.className = 'fn-pop-text quote';
      textEl.innerHTML =
        `“${el.dataset.quote}”` +
        (el.dataset.source ? `<span class="src">— ${el.dataset.source}</span>` : '');
    } else {
      const img = document.createElement('img');
      img.src = el.dataset.media;
      img.alt = el.textContent;
      mediaEl.replaceChildren(img);
      textEl.className = 'fn-pop-text';
      textEl.textContent = el.textContent;
    }
    const r = el.getBoundingClientRect();
    pop.hidden = false;
    const width = pop.offsetWidth;
    let left = window.scrollX + r.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    pop.style.top = `${window.scrollY + r.bottom + 8}px`;
    pop.style.left = `${Math.max(8, left)}px`;
    active = el;
    el.classList.add('is-active');
  }

  document.querySelectorAll('.footnote').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (active === el) return hide();
      show(el);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        active === el ? hide() : show(el);
      }
    });
  });
  pop.querySelector('[data-fn-close]')?.addEventListener('click', (e) => { e.stopPropagation(); hide(); });
  document.addEventListener('click', hide);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}

document.addEventListener('DOMContentLoaded', init);
