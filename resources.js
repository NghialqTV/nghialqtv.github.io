fetch("data/resources.json?v=" + Date.now())
  .then(res => { if(!res.ok) throw Error("Không thể tải dữ liệu"); return res.json(); })
  .then(list => {
    document.getElementById("resources").innerHTML = list.map(i => `
      <article class="card resource-neon-card">
        <div class="info"><b>${i.name}</b><div>${i.version || ""}</div></div>
        <a class="resource-download" href="${i.link}" data-tiktok-gate target="_blank" rel="noopener noreferrer" aria-label="Tải ${i.name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v3h16v-3"/></svg></a>
      </article>
    `).join("");
  }).catch(() => { document.getElementById("resources").textContent="Không tải được danh sách. Vui lòng thử lại."; });
