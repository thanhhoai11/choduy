document.addEventListener("DOMContentLoaded", function () {
  // === TẠO LOADER + TIẾN ĐỘ ===
  const loader = document.createElement("div");
  loader.id = "page-loader";
  loader.innerHTML = `
    <div style="
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    ">
      <img src="assets/logo/logo.png" alt="Loading..." style="width: 100px; animation: pulse 1.5s infinite; margin-bottom: 30px;">
      <div id="progress-bar-container" style="
        width: 200px;
        height: 10px;
        background-color: #ddd;
        border-radius: 5px;
        overflow: hidden;
      ">
        <div id="progress-bar" style="
          width: 0%;
          height: 100%;
          background-color: #3b82f6;
          transition: width 0.2s ease;
        "></div>
      </div>
    </div>
  `;
  document.body.appendChild(loader);

  // Tiến độ giả lập
  let progress = 0;
  const bar = () => document.getElementById("progress-bar");
  const interval = setInterval(() => {
    if (progress < 100) {
      progress += Math.random() * 8;
      bar().style.width = Math.min(progress, 100) + "%";
    }
  }, 30);

  // Khi trang load xong
  window.addEventListener("load", () => {
    setTimeout(() => {
      clearInterval(interval);
      bar().style.width = "100%";
      setTimeout(() => {
        const el = document.getElementById("page-loader");
        if (el) el.remove();
      }, 500);
    }, 500);
  });

  // === CSS TOÀN CỤC ===
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    * {
      cursor: url("assets/icons/cursor1.png"), auto !important;
    }

    a, button, input[type='submit'], input[type='button'], label, [role="button"] {
      cursor: url("assets/icons/hamster.png"), pointer !important;
    }

    .firework-particle {
      position: fixed;
      width: 8px;
      height: 8px;
      background: #fff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      animation: firework-move 0.6s ease-out forwards;
    }

    @keyframes firework-move {
      0% {
        transform: translate(-50%, -50%) translate(0, 0);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) translate(var(--x), var(--y));
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // === HIỆU ỨNG CLICK PHÁO BÔNG ===
  document.addEventListener("click", function (e) {
    const particles = 12;
    const colors = ["#ffcc00", "#ff2d55", "#3b82f6", "#22c55e", "#9333ea"];

    for (let i = 0; i < particles; i++) {
      const particle = document.createElement("div");
      particle.className = "firework-particle";
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = e.clientX + "px";
      particle.style.top = e.clientY + "px";

      const angle = (Math.PI * 2 * i) / particles;
      const distance = 60 + Math.random() * 30;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.style.setProperty("--x", `${x}px`);
      particle.style.setProperty("--y", `${y}px`);
      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 600);
    }
  });
});
