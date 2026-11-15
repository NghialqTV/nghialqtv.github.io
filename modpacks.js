/* Mod Pack data remains in data/modpacks.json; original URLs and counts preserved. */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
}[c]));

function packImageUrl(raw) {
  const value = String(raw || '').trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(?:\.\/)?assets\/[\w\-./% ]+$/i.test(value) && !value.includes('..')) return value;
  return '';
}
function platformBadge(label, icon, cls){
  return `<span class="pack-platform ${cls}"><img src="${icon}" alt=""><span>${label}</span></span>`;
}
function formatDownloads(n){ return Number(n || 0).toLocaleString('vi-VN'); }
function getLocalClicks(index){
  try { const n=Number(localStorage.getItem(`modpack_clicks_${index}`)||0);return Number.isFinite(n)?n:0; }
  catch(_){return 0;}
}
function addLocalClick(index){
  // Giữ logic đếm hiển thị hiện hữu của trang gốc (không sửa dữ liệu JSON).
  const next=getLocalClicks(index)+10;
  try{localStorage.setItem(`modpack_clicks_${index}`,String(next));}catch(_){}
  const el=document.querySelector(`[data-download-count="${index}"]`);
  if(el){const base=Number(el.dataset.baseCount||0);el.textContent=`↓ ${formatDownloads(base+next)} lượt tải`;}
}
let sourcePacks=[];
function renderPacks(packs){
  const box=document.querySelector('#packs'); if(!box)return;
  const results=document.querySelector('#pack-results');
  if(results)results.textContent=`${packs.length} / ${sourcePacks.length} packs`;
  if(!packs.length){box.innerHTML='<div class="pack-empty">Không tìm thấy Mod Pack phù hợp. Hãy thử từ khóa khác.</div>';return;}
  box.innerHTML=packs.map((p,i)=>{
    const sourceIndex=p.__sourceIndex; // preserve existing local counter even after sorting
    const download=p.link||'#';
    const baseCount=Number(p.downloads||0);
    const localClicks=getLocalClicks(sourceIndex);
    const number=String(sourceIndex+1).padStart(2,'0');
    return `
      <article class="modpack-card">
        <div class="modpack-thumb-wrap">
          <img class="modpack-thumb" src="${esc(packImageUrl(p.image))}" alt="${esc(p.name)}" loading="lazy"
             onerror="this.closest('.modpack-thumb-wrap').classList.add('image-error')">
          <div class="thumb-fallback">MOD PACK<br><b>${esc(p.skins||'')}</b></div>
          <span class="pack-index">${number}</span>
          <span class="pack-image-tag">MOD PACK</span>
        </div>
        <div class="modpack-info">
          <div class="modpack-content">
            <h2 class="modpack-name">${esc(p.name)}</h2>
            <p class="modpack-desc">${esc(p.desc||'')}</p>
            <div class="modpack-meta">
              <span class="modpack-download-count" data-download-count="${sourceIndex}" data-base-count="${baseCount}">
                ↓ ${formatDownloads(baseCount+localClicks)} lượt tải
              </span>
            </div>
          </div>
          <div class="pack-card-footer">
            <div class="modpack-platforms">
              ${platformBadge('Android','assets/icons/android.svg','android')}
              ${platformBadge('iOS','assets/icons/ios.svg','ios')}
            </div>
            <a class="modpack-download" href="${esc(download)}" target="_blank" rel="noopener"
               data-tiktok-gate data-pack-index="${sourceIndex}" aria-label="Tải ${esc(p.name)}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"/></svg><span>Tải ngay</span>
            </a>
          </div>
        </div>
      </article>`;
  }).join('');
  box.querySelectorAll('.modpack-download').forEach(button=>{
    button.addEventListener('click',()=>addLocalClick(Number(button.dataset.packIndex)));
  });
}
function updateView(){
  const search=document.querySelector('#pack-search');
  const sort=document.querySelector('#pack-sort');
  const q=(search?.value||'').trim().toLocaleLowerCase('vi-VN');
  let data=sourcePacks.filter(p=>`${p.name||''} ${p.desc||''} ${p.tag||''}`.toLocaleLowerCase('vi-VN').includes(q));
  if(sort?.value==='downloads')data=[...data].sort((a,b)=>(Number(b.downloads)||0)-(Number(a.downloads)||0));
  if(sort?.value==='name')data=[...data].sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'vi'));
  renderPacks(data);
}
document.querySelector('#pack-search')?.addEventListener('input',updateView);
document.querySelector('#pack-sort')?.addEventListener('change',updateView);
fetch('data/modpacks.json?v='+Date.now(),{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
  .then(data=>{
    if(!Array.isArray(data))throw new Error('modpacks.json không hợp lệ');
    sourcePacks=data.map((p,index)=>({...p,__sourceIndex:index}));
    updateView();
  }).catch(err=>{
    console.error(err);
    const box=document.querySelector('#packs');
    if(box)box.innerHTML='<p class="pack-error">Không thể tải danh sách Mod Pack.</p>';
    const results=document.querySelector('#pack-results');if(results)results.textContent='Không tải được';
  });
