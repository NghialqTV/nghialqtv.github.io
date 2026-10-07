const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
}[c]));

function platformBadge(label, icon, cls){
  return `<span class="pack-platform ${cls}">
    <img src="${icon}" alt="${label}">
    <span>${label}</span>
  </span>`;
}

function formatDownloads(n){
  return Number(n || 0).toLocaleString('vi-VN');
}

/* Stable key: reordering Mod Packs will not reset their local click count. */
function modpackStorageKey(pack){
  const raw = String(pack?.link || pack?.name || "");
  let hash = 0;
  for(let i = 0; i < raw.length; i++){
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return `modpack_clicks_${Math.abs(hash)}`;
}

function getLocalClicks(pack, index){
  try {
    const stableKey = modpackStorageKey(pack);
    const stable = Number(localStorage.getItem(stableKey) || 0);
    if(Number.isFinite(stable) && stable > 0) return stable;

    /* Keep old counts from the previous version when possible. */
    const legacy = Number(localStorage.getItem(`modpack_clicks_${index}`) || 0);
    return Number.isFinite(legacy) ? legacy : 0;
  } catch (_) {
    return 0;
  }
}

function addLocalClick(pack, index){
  const current = getLocalClicks(pack, index);
  const next = current + 1;

  try {
    localStorage.setItem(modpackStorageKey(pack), String(next));
    /* Also keep the legacy key in sync for compatibility. */
    localStorage.setItem(`modpack_clicks_${index}`, String(next));
  } catch (_) {}

  const el = document.querySelector(`[data-download-count="${index}"]`);
  if(el){
    const base = Number(el.dataset.baseCount || 0);
    el.textContent = `↓ ${formatDownloads(base + next)} lượt tải`;
    el.classList.remove('count-bump');
    void el.offsetWidth;
    el.classList.add('count-bump');
  }
}

/*
 * The TikTok gate catches the CLICK event in the capture phase and stops it.
 * Therefore a normal click handler on the button would never run.
 * Count the user action on pointerdown / keyboard BEFORE the gate's click handler.
 */
function bindDownloadCounters(packs){
  document.querySelectorAll('.modpack-download').forEach(button => {
    const index = Number(button.dataset.packIndex);
    const pack = packs[index];
    let counted = false;

    const countOnce = () => {
      if(counted) return;
      counted = true;
      addLocalClick(pack, index);
      setTimeout(() => { counted = false; }, 700);
    };

    button.addEventListener('pointerdown', countOnce, {passive:true});

    button.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        countOnce();
      }
    });
  });
}

function renderPacks(packs){
  const box = document.querySelector('#packs');
  if(!box) return;

  box.innerHTML = packs.map((p, i) => {
    const download = p.link || '#';
    const baseCount = Number(p.downloads || 0);
    const localClicks = getLocalClicks(i);

    return `
      <article class="modpack-card">

        <div class="modpack-thumb-wrap">
          <img
            class="modpack-thumb"
            src="${esc(p.image)}"
            alt="${esc(p.name)}"
            loading="lazy"
            onerror="this.closest('.modpack-thumb-wrap').classList.add('image-error')"
          >
          <div class="thumb-fallback">
            MOD PACK<br><b>${esc(p.skins || '')}</b>
          </div>
        </div>

        <div class="modpack-info">

          <div class="modpack-content">
            <h2 class="modpack-name">${esc(p.name)}</h2>

            <p class="modpack-desc">
              ${esc(p.desc || '')}
            </p>

            <div class="modpack-meta">
              <span
                class="modpack-download-count"
                data-download-count="${i}"
                data-base-count="${baseCount}"
              >
                ↓ ${formatDownloads(baseCount + localClicks)} lượt tải
              </span>
            </div>

            <div class="modpack-platforms">
              ${platformBadge('Android','assets/icons/android.svg','android')}
              ${platformBadge('iOS','assets/icons/ios.svg','ios')}
            </div>
          </div>

          <a
            class="modpack-download"
            href="${esc(download)}"
            target="_blank"
            rel="noopener"
            data-tiktok-gate
            data-pack-index="${i}"
            aria-label="Tải ${esc(p.name)}"
          >
            <span class="modpack-download-icon">⇩</span>
            <span>Tải Ngay</span>
          </a>

        </div>
      </article>
    `;
  }).join('');

  bindDownloadCounters(packs);
}

fetch('data/modpacks.json?v=' + Date.now(), {cache:'no-store'})
  .then(r => {
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(data => {
    if(!Array.isArray(data)) throw new Error('modpacks.json không hợp lệ');
    renderPacks(data);
  })
  .catch(err => {
    console.error(err);
    const box = document.querySelector('#packs');
    if(box) box.innerHTML =
      '<p class="pack-error">Không thể tải danh sách Mod Pack.</p>';
  });
