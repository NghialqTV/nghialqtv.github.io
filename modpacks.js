const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
}[c]));

function platformBadge(label, icon, cls){
  return `<span class="pack-platform ${cls}">
    <img src="${icon}" alt="${label}">
    <span>${label}</span>
  </span>`;
}

function renderPacks(packs){
  const box = document.querySelector('#packs');
  if(!box) return;

  box.innerHTML = packs.map((p, i) => {
    const download = p.link || '#';
    const isHot = p.hot || i === 0;

    return `
      <article class="modpack-card ${isHot ? 'is-hot' : ''}">
        <div class="modpack-thumb-wrap">
          <img class="modpack-thumb" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"
               onerror="this.closest('.modpack-thumb-wrap').classList.add('image-error')">
          <div class="thumb-fallback">MOD PACK<br><b>${esc(p.skins || '')}</b></div>
        </div>

        <div class="modpack-info">
          <div class="modpack-content">
            <h2 class="modpack-name">
              ${esc(p.name)}
              ${isHot ? '<span class="hot-fire" aria-label="Hot">🔥</span>' : ''}
            </h2>

            <p class="modpack-desc">${esc(p.features || 'Full Nút Bấm • Không Trùng')}</p>
            <p class="modpack-version">${esc(p.update || 'S4 - 2026')}</p>

            <div class="modpack-platforms">
              ${platformBadge('Android','assets/icons/android.svg','android')}
              ${platformBadge('iOS','assets/icons/ios.svg','ios')}
            </div>
          </div>

          <a class="modpack-download" href="${esc(download)}" target="_blank" rel="noopener" aria-label="Tải ${esc(p.name)}">
            <span class="modpack-download-icon">⇩</span>
            <span>Tải Ngay</span>
          </a>
        </div>
      </article>`;
  }).join('');
}

fetch('data/modpacks.json?v=' + Date.now(), {cache:'no-store'})
  .then(r => {
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(renderPacks)
  .catch(err => {
    console.error(err);
    const box = document.querySelector('#packs');
    if(box) box.innerHTML = '<p class="pack-error">Không thể tải danh sách Mod Pack.</p>';
  });
