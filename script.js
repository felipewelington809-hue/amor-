(() => {
  "use strict";

  const scene = document.getElementById("scene");
  const letter = document.getElementById("letter");
  const envelope = document.getElementById("envelope");
  const openBtn = document.getElementById("openBtn");
  const replayBtn = document.getElementById("replayBtn");
  const photo = document.getElementById("herPhoto");
  const photoFrame = document.getElementById("photoFrame");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HEART_COLORS = ["#c9707f", "#d98a96", "#7a2e43", "#e8b4bb", "#c9a36b"];
  const HEART_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-heart"/></svg>';

  let isOpening = false;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  /* ---------- Corações flutuantes ---------- */
  function floatHeart(x, y, spread = 70, rise = 150) {
    if (prefersReducedMotion) return;
    const heart = document.createElement("span");
    const size = 10 + Math.random() * 14;
    heart.className = "fly-heart";
    heart.innerHTML = HEART_SVG;
    heart.style.left = x + "px";
    heart.style.top = y + "px";
    heart.style.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    heart.style.setProperty("--s", size + "px");
    heart.style.setProperty("--dx", (Math.random() - 0.5) * spread * 2 + "px");
    heart.style.setProperty("--dy", -rise * (0.6 + Math.random() * 0.8) + "px");
    heart.style.setProperty("--r", (Math.random() - 0.5) * 60 + "deg");
    heart.addEventListener("animationend", () => heart.remove());
    document.body.appendChild(heart);
  }

  function burstAt(x, y, count = 6) {
    for (let i = 0; i < count; i++) floatHeart(x, y, 50, 110);
  }

  /* ---------- Abrir a carta ---------- */
  function openLetter() {
    if (isOpening) return;
    isOpening = true;
    openBtn.disabled = true;
    envelope.classList.add("open");

    const box = envelope.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height * 0.3;
    for (let i = 0; i < 9; i++) later(() => floatHeart(cx, cy, 90, 190), 450 + i * 130);

    later(() => {
      scene.classList.add("leave");
      letter.inert = false;
      letter.classList.add("show");
      window.scrollTo(0, 0);
    }, prefersReducedMotion ? 100 : 2100);
  }

  /* ---------- Ler de novo ---------- */
  function replay() {
    timers.splice(0).forEach(clearTimeout);
    letter.classList.remove("show");
    letter.inert = true;
    scene.classList.remove("leave");
    envelope.classList.remove("open");
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    later(() => {
      openBtn.disabled = false;
      isOpening = false;
    }, 900);
  }

  /* ---------- Foto: fallback se a imagem não carregar ---------- */
  function showPhotoFallback() { photoFrame.classList.add("no-photo"); }
  photo.addEventListener("error", showPhotoFallback);
  if (photo.complete && photo.naturalWidth === 0) showPhotoFallback();

  /* ---------- Decorações: clique e aproximação do mouse ---------- */
  const decorations = Array.from(document.querySelectorAll(".decor"));

  decorations.forEach((item) => {
    item.addEventListener("click", () => {
      const box = item.getBoundingClientRect();
      burstAt(box.left + box.width / 2, box.top + box.height / 2, 5);
      item.classList.remove("wiggle");
      void item.offsetWidth; // reinicia a animação
      item.classList.add("wiggle");
    });
  });

  // Só em dispositivos com mouse; no celular a interação fica mais simples
  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hasMouse && !prefersReducedMotion) {
    let ticking = false;
    document.addEventListener("pointermove", (event) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        decorations.forEach((item) => {
          const box = item.getBoundingClientRect();
          const dx = event.clientX - (box.left + box.width / 2);
          const dy = event.clientY - (box.top + box.height / 2);
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < 110) {
            const push = ((110 - distance) / 110) * 20;
            item.style.translate = `${(-dx / distance) * push}px ${(-dy / distance) * push}px`;
          } else {
            item.style.translate = "";
          }
        });
        ticking = false;
      });
    });
  }

  openBtn.addEventListener("click", openLetter);
  replayBtn.addEventListener("click", replay);
})();