/* NGHIALQ TV Gaming V7 - automatic voice attempt with user-gesture fallback */
(() => {
  if (!/(?:\/|\/index\.html)$/i.test(location.pathname)) return;
  const KEY = 'nghialq_started_v7';
  try { if (sessionStorage.getItem(KEY)) return; } catch (_) {}
  const root = document.createElement('div');
  root.id = 'gaming-load';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Khởi động NGHĨALQ TV');
  root.innerHTML = '<div class="gaming-load-core"><div class="gaming-load-mark"><span>NLQ</span></div><div class="gaming-load-title">NGHĨALQ TV</div><div class="gaming-load-caption" id="gaming-load-caption">Đang khởi động...</div><div class="gaming-load-track"><span></span></div><button type="button" class="gaming-start-btn" id="gaming-start-btn" hidden>▶ CHẠM ĐỂ KHỞI ĐỘNG</button><button type="button" class="gaming-skip-btn" id="gaming-skip-btn">Bỏ qua lời chào</button></div>';
  document.body.prepend(root);
  const caption = root.querySelector('#gaming-load-caption');
  const start = root.querySelector('#gaming-start-btn');
  const skip = root.querySelector('#gaming-skip-btn');
  const synth = window.speechSynthesis;
  const audio = new Audio('assets/audio/nhac-nen.mp3');
  audio.volume = .65;
  audio.preload = 'none';
  let done = false, attempt = 0, speechTimer = null, utterance = null;
  function close() {
    if (done) return;
    done = true;
    clearTimeout(speechTimer);
    try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
    root.classList.add('done');
    setTimeout(() => root.remove(), 450);
  }
  function fallback() {
    if (done) return;
    clearTimeout(speechTimer);
    start.hidden = false;
    start.disabled = false;
    caption.textContent = 'Chạm để bật lời chào';
  }
  function finishGreeting() {
    if (done) return;
    clearTimeout(speechTimer);
    caption.textContent = 'Lên nhạc!';
    // Browsers may block playback without a user gesture; missing MP3 is tolerated.
    audio.play().catch(() => {});
    close();
  }
  function speak(fromGesture = false) {
    if (done) return;
    const id = ++attempt;
    clearTimeout(speechTimer);
    start.hidden = true;
    caption.textContent = 'Đang phát lời chào...';
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      if (fromGesture) finishGreeting(); else fallback();
      return;
    }
    try {
      synth.cancel();
      utterance = new SpeechSynthesisUtterance('Anh em cần gì thì liên hệ qua mục Mua Key nhé. Chúc anh em ngày mới vui vẻ. Lên nhạc!');
      utterance.lang = 'vi-VN';
      utterance.rate = .96;
      utterance.pitch = 1.1;
      const voices = synth.getVoices();
      utterance.voice = voices.find(v => /^vi[-_]/i.test(v.lang) && /female|woman|nữ|google/i.test(v.name)) || voices.find(v => /^vi(?:[-_]|$)/i.test(v.lang)) || null;
      utterance.onend = () => { if (id === attempt) finishGreeting(); };
      utterance.onerror = () => { if (id === attempt) fallback(); };
      synth.speak(utterance);
      // Speech engines may silently block automatic synthesis; allow manual recovery.
      speechTimer = setTimeout(() => { if (id === attempt) fallback(); }, fromGesture ? 15000 : 4500);
    } catch (_) { fallback(); }
  }
  start.addEventListener('click', () => speak(true));
  skip.addEventListener('click', () => { ++attempt; try { synth?.cancel(); } catch (_) {} close(); });
  // Let the startup animation render before attempting speech.
  setTimeout(() => speak(false), 650);
})();
