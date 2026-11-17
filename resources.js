/*
 * NGHIALQ TV - Resources
 * - Hiển thị banner lớn, link tải nằm bên dưới.
 * - Ưu tiên dữ liệu JSON; có cache cục bộ và dữ liệu dự phòng để tránh trang trắng.
 * - Không tạo URL cache-busting ngẫu nhiên ở mỗi lượt truy cập.
 */
(() => {
  'use strict';

  const DATA_URL = new URL('/data/resources.json', window.location.origin).toString();
  const FALLBACK_IMAGE = new URL('/assets/icons/resources.png', window.location.origin).toString();
  const CACHE_KEY = 'nghialqtv_resources_cache_v2';
  const container = document.getElementById('resources');
  const status = document.getElementById('resources-status');

  // Bản dự phòng đồng bộ với data/resources.json hiện tại.
  // Nếu JSON gặp lỗi tạm thời, khách truy cập vẫn nhìn thấy danh sách tài nguyên.
  const FALLBACK_ITEMS = [
    { name: 'Resources Mod Skin', version: 'Cập Nhật 17/11', link: 'https://linkx.me/BN9ME', image: 'https://cdn.upanhlaylink.com/i/4A7jHxW4.png' },
    { name: 'Tài Nguyên Full', version: 'Cập Nhật 17/11', link: 'https://linkx.me/2hpr', image: 'https://cdn.upanhlaylink.com/i/JXo8a6dZ.png' },
    { name: 'Camera Xa', version: 'Cập Nhật 17/11', link: 'https://linkx.me/E485U', image: 'https://cdn.upanhlaylink.com/i/1AJfba9w.png' },
    { name: '120 FPS Cao', version: 'Cập Nhật 17/11', link: 'https://linkx.me/BhrDz', image: 'https://cdn.upanhlaylink.com/i/r3yYSyAg.png' },
    { name: 'Map VGHD', version: 'Android / IOS', link: 'https://linkx.me/bSOTW', image: 'https://cdn.upanhlaylink.com/i/ZjtidW9B.png' },
    { name: 'Map VGHD Full Quái - Trụ', version: 'Android', link: 'https://linkx.me/X1zdiH', image: 'https://cdn.upanhlaylink.com/i/0NppmrFt.png' }
  ];

  if (!container) return;

  function safeImageUrl(raw) {
    const value = String(raw || '').trim();
    if (!value) return '';
    try {
      const url = new URL(value, window.location.origin);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
      if (url.origin !== window.location.origin && !/^https?:$/.test(url.protocol)) return '';
      return url.href;
    } catch (_) {
      return '';
    }
  }

  function safeDownloadUrl(raw) {
    const value = String(raw || '').trim();
    if (!value) return '';
    try {
      const url = new URL(value, window.location.origin);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
      return url.href;
    } catch (_) {
      return '';
    }
  }

  function readCache() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function writeCache(items) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(items)); } catch (_) {
      // Không chặn giao diện nếu trình duyệt tắt hoặc giới hạn localStorage.
    }
  }

  function setStatus(message) {
    if (status) status.textContent = message || '';
  }

  function makeDownloadIcon() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const path1 = document.createElementNS(ns, 'path');
    path1.setAttribute('d', 'M12 3v12m-5-5 5 5 5-5');
    const path2 = document.createElementNS(ns, 'path');
    path2.setAttribute('d', 'M4 17v3h16v-3');
    svg.append(path1, path2);
    return svg;
  }

  function renderResources(items) {
    const validItems = Array.isArray(items) ? items.filter(item => item && typeof item === 'object') : [];
    if (!validItems.length) {
      container.innerHTML = '<p class="resource-empty">Hiện chưa có tài nguyên nào.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    validItems.forEach((item, index) => {
      const nameText = String(item.name || 'Tài nguyên');
      const card = document.createElement('article');
      card.className = 'card resource-neon-card';

      const imageWrap = document.createElement('div');
      imageWrap.className = 'resource-image-wrap';

      const image = document.createElement('img');
      image.className = 'resource-image';
      image.alt = nameText;
      image.loading = index < 2 ? 'eager' : 'lazy';
      image.decoding = 'async';
      if (index === 0) image.fetchPriority = 'high';
      image.src = safeImageUrl(item.image) || safeImageUrl(item.icon) || FALLBACK_IMAGE;

      image.addEventListener('error', () => {
        if (image.dataset.fallbackTried === '1') {
          imageWrap.classList.add('image-unavailable');
          image.remove();
          return;
        }
        image.dataset.fallbackTried = '1';
        image.src = FALLBACK_IMAGE;
      }, { once: false });

      const number = document.createElement('span');
      number.className = 'resource-image-number';
      number.textContent = String(index + 1).padStart(2, '0');
      imageWrap.append(image, number);

      const info = document.createElement('div');
      info.className = 'resource-info';

      const title = document.createElement('h2');
      title.className = 'resource-title';
      title.textContent = nameText;

      const version = document.createElement('p');
      version.className = 'resource-version';
      version.textContent = String(item.version || item.desc || 'Tài nguyên NghĩaLQ TV');
      info.append(title, version);

      const download = document.createElement('a');
      download.className = 'resource-download';
      const destination = safeDownloadUrl(item.link);
      if (destination) {
        download.href = destination;
        download.target = '_blank';
        download.rel = 'noopener noreferrer';
        download.setAttribute('data-tiktok-gate', '');
      } else {
        download.href = '#';
        download.setAttribute('aria-disabled', 'true');
        download.addEventListener('click', event => {
          event.preventDefault();
          window.alert('Tài nguyên này chưa có link tải.');
        });
      }
      download.setAttribute('aria-label', 'Tải xuống ' + nameText);
      download.append(makeDownloadIcon(), document.createTextNode(destination ? 'TẢI XUỐNG' : 'CHƯA CÓ LINK'));

      card.append(imageWrap, info, download);
      fragment.appendChild(card);
    });

    container.replaceChildren(fragment);
  }

  async function fetchLatest() {
    let lastError;
    // Thử lại khi mạng/CDN có lỗi tạm thời.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(DATA_URL, {
          method: 'GET',
          mode: 'same-origin',
          credentials: 'same-origin',
          cache: 'default',
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const items = await response.json();
        if (!Array.isArray(items) || !items.length) throw new Error('Dữ liệu tài nguyên không hợp lệ');
        writeCache(items);
        renderResources(items);
        setStatus('');
        return true;
      } catch (error) {
        lastError = error;
        if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }

    console.warn('[Resources] Không tải được JSON mới nhất:', lastError);
    setStatus('Đang hiển thị dữ liệu dự phòng. Vui lòng kiểm tra kết nối nếu nội dung chưa mới nhất.');
    return false;
  }

  // Hiển thị ngay cache/dữ liệu dự phòng, không đợi mạng nên tránh trang trắng.
  const cachedItems = readCache();
  renderResources(cachedItems || FALLBACK_ITEMS);
  if (!cachedItems) setStatus('');

  fetchLatest();

  // Nếu khách mở trang lúc mất mạng, tự tải lại khi kết nối trở lại.
  window.addEventListener('online', fetchLatest);
})();
