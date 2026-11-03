/* NGHIALQ TV Gaming V7 - automatic voice attempt with user-gesture fallback */
(() => {
  if (!/(?:\/|\/index\.html)$/i.test(location.pathname)) return;
  const KEY = 'nghialq_started_v7';
  try { if (sessionStorage.getItem(KEY)) return; } catch (_) {}
  const root = document.createElement('div');
  root.id = 'gaming-load';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Khởi động NGHĨALQ TV');
  root.innerHTML = '<div class="gaming-load-core"><div class="gaming-load-mark"><img src="assets/icons/logo.png" alt="Logo chính thức NGHĨALQ TV"></div><div class="gaming-load-title">NGHĨALQ TV</div><div class="gaming-load-caption" id="gaming-load-caption">Đang khởi động...</div><div class="gaming-load-track"><span></span></div><button type="button" class="gaming-start-btn" id="gaming-start-btn" hidden>▶ CHẠM ĐỂ KHỞI ĐỘNG</button><button type="button" class="gaming-skip-btn" id="gaming-skip-btn">Bỏ qua lời chào</button></div>';
  document.body.prepend(root);
  const caption = root.querySelector('#gaming-load-caption');
  const start = root.querySelector('#gaming-start-btn');
  const skip = root.querySelector('#gaming-skip-btn');
  const synth = window.speechSynthesis;
  const audio = new Audio('assets/audio/nhac-nen.mp3');
  const adamAudio = new Audio('assets/audio/adam-loi-chao.mp3');
  adamAudio.preload = 'auto';
  audio.volume = .65;
  audio.preload = 'none';
  let done = false, attempt = 0, speechTimer = null, utterance = null;
  function close() {
    if (done) return;
    done = true;
    clearTimeout(speechTimer);
    try { adamAudio.pause(); } catch (_) {}
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
    const current = ++attempt;
    start.hidden = true;
    caption.textContent = 'Đang phát lời chào Adam...';
    adamAudio.onended = () => { if (current === attempt) finishGreeting(); };
    adamAudio.onerror = () => {
      if (current !== attempt) return;
      start.hidden = false;
      start.disabled = true;
      start.textContent = 'THIẾU FILE GIỌNG ADAM';
      caption.textContent = 'Không tìm thấy assets/audio/adam-loi-chao.mp3. Hãy tải file MP3 lên GitHub.';
    };
    adamAudio.play().catch((err) => {
      if (current !== attempt) return;
      // A browser autoplay restriction is NOT a reason to switch to Google TTS.
      if (err && err.name === 'NotAllowedError') {
        start.hidden = false;
        start.disabled = false;
        start.textContent = '▶ CHẠM ĐỂ PHÁT GIỌNG ADAM';
        caption.textContent = 'Chạm để bật âm thanh';
      } else {
        start.hidden = false;
        start.disabled = true;
        start.textContent = 'KHÔNG PHÁT ĐƯỢC MP3';
        caption.textContent = 'Kiểm tra file assets/audio/adam-loi-chao.mp3';
      }
    });
  }
  start.addEventListener('click', () => speak(true));
  skip.addEventListener('click', () => { ++attempt; try { synth?.cancel(); adamAudio.pause(); } catch (_) {} close(); });
  // Let the startup animation render before attempting speech.
  setTimeout(() => speak(false), 650);
})();
