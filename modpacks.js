const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
async function loadPacks(){
 const box=document.querySelector('#packs'); if(!box)return;
 try{
  const r=await fetch('data/modpacks.json?v='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw Error(r.status);
  const packs=await r.json();
  box.innerHTML=packs.map((p,i)=>{
   const download=p.link||'#';
   const hot=p.hot||i===0;
   return `<article class="modpack-card ${hot?'is-hot':''}">
    <div class="modpack-thumb-wrap">
      <img class="modpack-thumb" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
      <div class="thumb-fallback">MOD PACK<br><b>${esc(p.skins||'')}</b></div>
    </div>
    <div class="modpack-info">
      <h2 class="modpack-name">${esc(p.name)} ${hot?'<span class="hot-fire">🔥</span>':''}</h2>
      <p class="modpack-desc">${esc(p.features||'Full Nút Bấm • Không Trùng')}</p>
      <p class="modpack-version">${esc(p.update||'S4 - 2026')}</p>
      <div class="modpack-actions">
        <a class="modpack-btn download" href="${esc(download)}" target="_blank" rel="noopener">⇩ Tải Ngay</a>
      </div>
    </div>
   </article>`;
  }).join('');
 }catch(e){
  console.error(e);
  box.innerHTML='<p class="pack-error">Không thể tải danh sách Mod Pack.</p>';
 }
}
loadPacks();
