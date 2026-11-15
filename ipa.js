/* IPA MOD — dữ liệu tải từ data/ipa.json, giống cách Mod Pack hoạt động. */
(() => {
  'use strict';
  const list = document.getElementById('ipaList');
  const count = document.getElementById('itemCount');
  const modal = document.getElementById('previewModal');
  const modalTitle = document.getElementById('previewTitle');
  const modalImages = document.getElementById('previewImages');
  const DOWNLOAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v11m-4-4 4 4 4-4M5 17v3h14v-3"/></svg>';
  const IMAGE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m3 17 6-5 4 3 3-3 5 5"/></svg>';
  const CALENDAR_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Chấp nhận link https/http hoặc ảnh nội bộ trong assets/...; bỏ qua đường dẫn lạ.
  function safeImage(value){
    const url = String(value || '').trim();
    if (/^https?:\/\/[^\s]+$/i.test(url)) return url;
    if (/^assets\/[\w\-./% ]+$/i.test(url) && !url.includes('..')) return url;
    return '';
  }
  // Link đi đến nơi khác chỉ chấp nhận HTTPS/HTTP hoặc đường dẫn tương đối.
  function safeLink(value){
    const url = String(value || '').trim();
    if (/^https?:\/\/[^\s]+$/i.test(url)) return url;
    if (/^(?:\.\/)?[\w\-./%]+(?:\?[\w\-=&%]+)?$/i.test(url) && !url.includes('..')) return url;
    return '';
  }
  const itemIcon = item => safeImage(item.icon) || 'assets/icons/ipalq.png';

  function action(href,label,cls,icon){
    if (!href) return '';
    return `<a href="${esc(href)}" class="btn ${cls}" data-tiktok-gate rel="noopener" aria-label="${esc(label)}">${icon}<span>${esc(label)}</span></a>`;
  }

  function card(item,index){
    const name = esc(item.name || 'IPA Mod');
    const image = safeImage(item.image);
    const icon = itemIcon(item);
    const link = safeLink(item.link);
    const key = safeLink(item.getKeyLink);
    const previews = (Array.isArray(item.preview) ? item.preview : []).map(safeImage).filter(Boolean);
    const canPreview = !!image || previews.length > 0;
    const badge = esc(item.tag || (key ? 'GET KEY' : 'iOS'));
    return `<article class="ipa-card">
      <div class="visual ${image ? '' : 'image-fallback'}">
        ${image ? `<img class="banner" src="${esc(image)}" loading="lazy" alt="Ảnh giới thiệu ${name}" onerror="this.parentNode.classList.add('image-fallback')">` : ''}
        <div class="visual-watermark"><img src="${esc(icon)}" alt="" loading="lazy"></div>
        <span class="visual-label"><i></i> ${esc(item.platform || 'iOS')} DOWNLOAD</span>
      </div>
      <div class="card-body">
        <div class="card-topline"><span class="item-number">IPA / ${String(index+1).padStart(2,'0')}</span><span class="tag ${key?'has-key':'no-key'}">✦ ${badge}</span></div>
        <div class="item-header"><img class="item-icon" src="${esc(icon)}" alt="" loading="lazy"><h3>${name}</h3></div>
        <p class="item-desc">${esc(item.desc || 'Chọn liên kết bên dưới để mở bản tải phù hợp.')}</p>
        <div class="item-meta">${item.version ? `<span>${CALENDAR_ICON} Cập nhật ${esc(item.version)}</span>` : ''}<span>◈ ${esc(item.platform || 'iOS')}</span></div>
        <div class="card-actions">
          ${action(link,item.downloadLabel || 'Tải xuống','btn-download',DOWNLOAD_ICON)}
          ${action(key,item.keyLabel || 'Get Key','btn-key','<img src="assets/icons/key-premium.svg" alt="" aria-hidden="true">')}
          ${canPreview ? `<button type="button" class="btn btn-preview" data-preview-index="${index}" aria-label="Xem ảnh ${name}">${IMAGE_ICON}<span>Xem ảnh</span></button>` : ''}
        </div>
      </div>
    </article>`;
  }

  let currentItems = [];
  function openPreview(index){
    const item = currentItems[index]; if(!item) return;
    const images = [safeImage(item.image),...(Array.isArray(item.preview) ? item.preview.map(safeImage) : [])].filter(Boolean);
    const unique = [...new Set(images)]; if(!unique.length) return;
    modalTitle.textContent = item.name || 'Xem ảnh';
    modalImages.replaceChildren();
    unique.forEach((src,i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Hình ${i+1} - ${item.name || 'IPA'}`;
      img.loading = i ? 'lazy' : 'eager';
      modalImages.appendChild(img);
    });
    modal.hidden = false;
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    modal.querySelector('.preview-close').focus();
  }
  function closePreview(){
    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }
  list.addEventListener('click',e=>{
    const btn = e.target.closest('[data-preview-index]');
    if (btn) openPreview(Number(btn.dataset.previewIndex));
  });
  modal.addEventListener('click',e=>{if(e.target.closest('[data-close-preview]')) closePreview();});
  document.addEventListener('keydown',e=>{if(e.key === 'Escape' && !modal.hidden) closePreview();});

  fetch('data/ipa.json?v='+Date.now(),{cache:'no-store'})
    .then(response=>{if(!response.ok) throw new Error(`HTTP ${response.status}`);return response.json();})
    .then(data=>{
      if(!Array.isArray(data)) throw new Error('data/ipa.json phải là mảng JSON');
      currentItems = data.filter(i=>i && typeof i === 'object');
      count.textContent = String(currentItems.length).padStart(2,'0');
      list.innerHTML = currentItems.length ? currentItems.map(card).join('') : '<div class="error-state">Chưa có mục IPA nào trong data/ipa.json.</div>';
    })
    .catch(error=>{
      console.error('IPA data:',error);
      list.innerHTML = '<div class="error-state">Không tải được danh sách IPA.<br>Hãy kiểm tra file <strong>data/ipa.json</strong> và chạy website bằng HTTP/HTTPS.</div>';
      count.textContent = '0';
    });
})();
