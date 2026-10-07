const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#039;'
}[c]));

function platformBadge(label, icon, cls) {
  return `<span class="pack-platform ${cls}">
    <img src="${icon}" alt="${label}">
    <span>${label}</span>
  </span>`;
}

function formatDownloads(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function getDownloadCount(pack, index) {
  const key = `modpack_downloads_${pack.name || index}`;

  try {
    const saved = localStorage.getItem(key);
    if (saved !== null && Number.isFinite(Number(saved))) {
      return Number(saved);
    }
  } catch (_) {}

  return Number(pack.downloads || 0);
}

function addDownload(pack, index) {
  const key = `modpack_downloads_${pack.name || index}`;
  const current = getDownloadCount(pack, index);
  const next = current + 1;

  try {
    localStorage.setItem(key, String(next));
  } catch (_) {}

  const counter = document.querySelector(`[data-download-count="${index}"]`);
  if (counter) {
    counter.textContent = `↓ ${formatDownloads(next)} lượt tải`;
  }

  return next;
}

function renderPacks(packs) {
  const box = document.querySelector('#packs');
  if (!box) return;

  box.innerHTML = packs.map((p, i) => {
    const download = p.link || '#';
    const count = getDownloadCount(p, i);

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
            MOD PACK<br>
            <b>${esc(p.skins || '')}</b>
          </div>
        </div>

        <div class="modpack-info">

          <div class="modpack-content">

            <h2 class="modpack-name">
              ${esc(p.name)}
            </h2>

            <p class="modpack-desc">
              ${esc(p.desc || '')}
            </p>

            <div class="modpack-meta">
              <span class="modpack-download-count" data-download-count="${i}">
                ↓ ${formatDownloads(count)} lượt tải
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

  box.querySelectorAll('.modpack-download').forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.packIndex);
      const pack = packs[index];
      if (pack) addDownload(pack, index);
    });
  });
}

fetch('data/modpacks.json?v=' + Date.now(), {
  cache: 'no-store'
})
  .then(response => {
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) {
      throw new Error('modpacks.json không phải dạng danh sách');
    }
    renderPacks(data);
  })
  .catch(error => {
    console.error('Mod Pack Error:', error);

    const box = document.querySelector('#packs');
    if (box) {
      box.innerHTML = `
        <p class="pack-error">
          Không thể tải danh sách Mod Pack.
        </p>
      `;
    }
  });
