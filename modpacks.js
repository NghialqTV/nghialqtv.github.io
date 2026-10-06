const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
}[c]));

const platform = (label, icon, url, cls) => `
  <a class="modpack-btn ${cls}" href="${esc(url || '#')}" target="_blank" rel="noopener">
    <span class="platform-icon">${icon}</span>${label}
  </a>`;

function renderPacks(packs){
  const box = document.querySelector('#packs');
  if(!box) return;

  box.innerHTML = packs.map((p, i) => {
    const download = p.link || p.android || p.ios || '#';
    const isHot = p.hot || i === 0;
    return `
      <article class="modpack-card ${isHot ? 'is-hot' : ''}">
        <div class="modpack-thumb-wrap">
          <img class="modpack-thumb" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"
               onerror="this.closest('.modpack-thumb-wrap').classList.add('image-error')">
          <div class="thumb-fallback">MOD PACK<br><b>${esc(p.skins || '')}</b></div>
        </div>

        <div class="modpack-info">
          <h2 class="modpack-name">
            ${esc(p.name)} ${isHot ? '<span class="hot-fire" aria-label="Hot">🔥</span>' : ''}
          </h2>
          <p class="modpack-desc">${esc(p.features || 'Full Nút Bấm • Không Trùng')}</p>
          <p class="modpack-version">${esc(p.update || 'S4 - 2026')}</p>

          <div class="modpack-actions">
            ${platform('Android','🤖', p.android || download, 'android')}
            ${platform('iOS','', p.ios || download, 'ios')}
            <a class="modpack-btn download" href="${esc(download)}" target="_blank" rel="noopener">
              <span class="download-icon">⇩</span>Tải Ngay
            </a>
          </div>
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
    document.querySelector('#packs').innerHTML = '<p class="pack-error">Không thể tải danh sách Mod Pack.</p>';
  });
