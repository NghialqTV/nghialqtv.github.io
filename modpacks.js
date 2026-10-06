const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
fetch('data/modpacks.json?v='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(packs=>{
 document.querySelector('#packs').innerHTML=packs.map((p,i)=>`
 <article class="pack-card">
   <div class="thumb"><img src="${esc(p.image)}" alt="${esc(p.name+' '+p.version)}" onerror="this.style.display='none'">
     <div class="thumb-fallback">MOD PACK<br><b>${esc(p.skins)}</b></div>
   </div>
   <div class="pack-info">
     <h2>${esc(p.name)} <span>${i===0?'🔥':''}</span></h2>
     <p>${esc(p.features)}</p><p>${esc(p.update)}</p>
     <div class="actions">
       <a class="platform android" href="${esc(p.android)}" target="_blank" rel="noopener">🤖 Android</a>
       <a class="platform ios" href="${esc(p.ios)}" target="_blank" rel="noopener"> iOS</a>
       <button class="download" data-index="${i}">⇩ Tải Ngay</button>
     </div>
   </div>
 </article>`).join('');
}).catch(()=>document.querySelector('#packs').innerHTML='<p>Không thể tải danh sách Mod Pack.</p>');

document.addEventListener('click',e=>{
 const b=e.target.closest('.download'); if(!b) return;
 const i=Number(b.dataset.index);
 fetch('data/modpacks.json').then(r=>r.json()).then(p=>{
   const x=p[i];
   const url=x.android || x.ios || '#';
   // Giữ cơ chế quảng cáo của website: nút tải chỉ chuyển tới link tải sau khi ad/gate của website xử lý.
   window.open(url,'_blank','noopener');
 });
});
