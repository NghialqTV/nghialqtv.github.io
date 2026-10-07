const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
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

/*
 * Public virtual counter
 * ----------------------
 * GitHub Pages is static, so a truly shared counter cannot be stored
 * without a server/database. This implementation displays the configured
 * public virtual number for everyone and adds a small local +1 only on
 * the current browser after a click.
 */
function getDownloadCount(pack) {
  return Number(pack.downloads || 0);
}

function addLocalClick(pack, index) {
  const key = `modpack_local_click_${index}`;
  let clicks = 0;

  try {
    clicks = Number(localStorage.getItem(key) || 0);
    clicks = Number.isFinite(clicks) ? clicks + 1 : 1;
    localStorage.setItem(key, String(clicks));
  } catch (_) {
    clicks = 1;
  }

  const counter = document.querySelector(`[data-download-count="${index}"]`);
  if (counter) {
    counter.textContent =
      `↓ ${formatDownloads(getDownloadCount(pack) + clicks)} lượt tải`;
  }
}

function renderPacks(packs) {
  const box = document.querySelector('#packs');
  if (!box) return;

  box.innerHTML = packs.map((p, i) => {
    const download = p.link || '#';
    const baseCount = getDownloadCount(p);

    let localClicks = 0;
    try {
      localClicks = Number(localStorage.getItem(`modpack_local_click_${i}`) || 0);
      if (!Number.isFinite(localClicks)) localClicks = 0;
    } catch (_) {}

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

            <p class="modpack-desc">${esc(p.desc || '')}</p>

            <div class="modpack-meta">
              <span class="modpack-download-count" data-download-count="${i}">
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
      if (pack) addLocalClick(pack, index);
    });
  });
}

fetch('data/modpacks.json?v=' + Date.now(), { cache: 'no-store' })
  .then(response => {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error('modpacks.json không phải dạng danh sách');
    renderPacks(data);
  })
  .catch(error => {
    console.error('Mod Pack Error:', error);
    const box = document.querySelector('#packs');
    if (box) {
      box.innerHTML = '<p class="pack-error">Không thể tải danh sách Mod Pack.</p>';
    }
  });
