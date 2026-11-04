// Ảnh có thể là URL https:// trực tiếp hoặc đường dẫn nội bộ assets/... .
// Dán link ảnh trực tiếp trong data/resources.json (trường image).
function resourceImageUrl(raw) {
  const value = String(raw || '').trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(?:\.\/)?assets\/[\w\-./% ]+$/i.test(value) && !value.includes('..')) return value;
  return '';
}

function renderResources(items) {
  const box = document.getElementById('resources');
  box.replaceChildren();
  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card resource-neon-card';

    const image = document.createElement('img');
    image.className = 'icon';
    image.loading = 'lazy';
    image.alt = 'Ảnh ' + String(item.name || 'tài nguyên');
    const primary = resourceImageUrl(item.image);
    const fallback = resourceImageUrl(item.icon) || 'assets/icons/resources.png';
    image.src = primary || fallback;
    image.addEventListener('error', () => {
      if (image.getAttribute('src') !== fallback) image.src = fallback;
      else image.style.visibility = 'hidden';
    });
    card.appendChild(image);

    const info = document.createElement('div');
    info.className = 'info';
    const title = document.createElement('b');
    title.textContent = item.name || 'Tài nguyên';
    const version = document.createElement('div');
    version.textContent = item.version || '';
    info.append(title, version);
    card.appendChild(info);

    const link = document.createElement('a');
    link.className = 'resource-download';
    const downloadUrl = String(item.link || '').trim();
    if (/^https?:\/\//i.test(downloadUrl) || /^(?:\.\/)?[\w/-]+\.html$/i.test(downloadUrl)) {
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('data-tiktok-gate', '');
    } else {
      link.href = '#';
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', e => { e.preventDefault(); alert('Chưa có link tải!'); });
    }
    link.setAttribute('aria-label', 'Tải ' + (item.name || 'tài nguyên'));
    link.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v3h16v-3"/></svg>';
    card.appendChild(link);
    box.appendChild(card);
  });
}

fetch('data/resources.json?v=' + Date.now(), { cache: 'no-store' })
  .then(response => { if (!response.ok) throw Error('Không thể tải dữ liệu'); return response.json(); })
  .then(items => {
    if (!Array.isArray(items)) throw Error('Dữ liệu không hợp lệ');
    renderResources(items);
  })
  .catch(() => { document.getElementById('resources').textContent = 'Không tải được danh sách. Vui lòng thử lại.'; });
