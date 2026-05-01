/**
 * MINIGAMES LAUNCHER — visible sidebar panel + modal system
 */
(function () {
  "use strict";

  /* ─────────────────────────────────────────
     STYLES
  ───────────────────────────────────────── */
  const style = document.createElement("style");
  style.textContent = `
    /* ── SIDEBAR PANEL ── */
    #mg-panel {
      position: fixed;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 800;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .mg-panel-label {
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--muted, rgba(240,237,232,0.4));
      padding: 0 2px;
      margin-bottom: 4px;
    }

    .mg-panel-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 44px;
      overflow: hidden;
      padding: 10px 12px;
      background: var(--surface, #111);
      border: 1px solid var(--border2, rgba(255,255,255,0.12));
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
      white-space: nowrap;
      user-select: none;
      text-decoration: none;
    }
    .mg-panel-btn:hover {
      width: 148px;
      border-color: var(--accent-border, rgba(200,169,110,0.35));
      background: var(--surface2, #181818);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .mg-panel-icon {
      font-size: 16px;
      line-height: 1;
      flex-shrink: 0;
    }

    .mg-panel-name {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent, #c8a96e);
      opacity: 0;
      transition: opacity 0.15s ease;
      pointer-events: none;
    }
    .mg-panel-btn:hover .mg-panel-name {
      opacity: 1;
      transition-delay: 0.08s;
    }

    /* ── OVERLAY ── */
    #mg-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9000;
      background: rgba(5,5,5,0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      align-items: center;
      justify-content: center;
    }
    #mg-overlay.open {
      display: flex;
      animation: mgFadeIn 0.2s ease;
    }
    @keyframes mgFadeIn { from{opacity:0} to{opacity:1} }

    /* ── MODAL ── */
    #mg-modal {
      position: relative;
      width: min(94vw, 920px);
      height: min(90vh, 740px);
      background: var(--surface, #111);
      border: 1px solid var(--accent-border, rgba(200,169,110,0.25));
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow:
        0 40px 100px rgba(0,0,0,0.7),
        0 0 0 1px rgba(200,169,110,0.06),
        inset 0 1px 0 rgba(255,255,255,0.04);
      animation: mgSlideUp 0.3s cubic-bezier(0.22,1,0.36,1);
    }
    @keyframes mgSlideUp {
      from { opacity:0; transform: translateY(20px) scale(0.97); }
      to   { opacity:1; transform: translateY(0) scale(1); }
    }
    #mg-modal.fullscreen {
      width: 100vw;
      height: 100vh;
      border-radius: 0;
      border: none;
    }

    /* ── TOP BAR ── */
    #mg-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      border-bottom: 1px solid var(--border, rgba(255,255,255,0.07));
      background: var(--surface2, #181818);
      flex-shrink: 0;
      gap: 12px;
    }
    #mg-game-label {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent, #c8a96e);
    }
    #mg-topbar-btns {
      display: flex;
      gap: 8px;
    }
    .mg-tb-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 7px;
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      border: 1px solid var(--border2, rgba(255,255,255,0.14));
      background: transparent;
      color: var(--muted, rgba(240,237,232,0.5));
      transition: all 0.18s ease;
    }
    .mg-tb-btn:hover {
      color: var(--text, #f0ede8);
      border-color: var(--accent-border, rgba(200,169,110,0.3));
    }
    .mg-tb-btn.close-btn:hover {
      color: #e06060;
      border-color: rgba(224,96,96,0.4);
    }

    /* ── IFRAME ── */
    #mg-frame-wrap {
      flex: 1;
      position: relative;
      overflow: auto;
      min-height: 0;
    }
    #mg-frame {
      width: 100%;
      height: 100%;
      min-height: 600px;
      border: none;
      display: block;
      background: var(--bg, #0a0a0a);
    }

    /* ── TOAST ── */
    #mg-toast {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--surface, #111);
      border: 1px solid var(--accent-border, rgba(200,169,110,0.3));
      border-radius: 100px;
      padding: 9px 20px;
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.14em;
      color: var(--accent, #c8a96e);
      white-space: nowrap;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    #mg-toast.show { opacity: 1; }

    /* ── RESPONSIVE: hide panel on small screens ── */
    @media (max-width: 860px) {
      #mg-panel { display: none; }
    }

    /* ── SCROLLBAR (modal frame wrapper) ── */
    #mg-frame-wrap::-webkit-scrollbar { width: 6px; height: 6px; }
    #mg-frame-wrap::-webkit-scrollbar-track { background: var(--bg, #0a0a0a); }
    #mg-frame-wrap::-webkit-scrollbar-thumb {
      background: var(--border2, rgba(255,255,255,0.15));
      border-radius: 100px;
    }
    #mg-frame-wrap::-webkit-scrollbar-thumb:hover {
      background: var(--accent-border, rgba(200,169,110,0.3));
    }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────
     SIDEBAR PANEL HTML
  ───────────────────────────────────────── */
  const panel = document.createElement("div");
  panel.id = "mg-panel";
  panel.innerHTML = `
    <div class="mg-panel-label">Games</div>
    <button class="mg-panel-btn" onclick="window.mgOpen('snake')" title="Snake">
      <span class="mg-panel-icon">🐍</span>
      <span class="mg-panel-name">Snake</span>
    </button>
    <button class="mg-panel-btn" onclick="window.mgOpen('2048')" title="2048">
      <span class="mg-panel-icon">🔢</span>
      <span class="mg-panel-name">2048</span>
    </button>
    <button class="mg-panel-btn" onclick="window.mgOpen('sudoku')" title="Sudoku">
      <span class="mg-panel-icon">🔷</span>
      <span class="mg-panel-name">Sudoku</span>
    </button>
    <button class="mg-panel-btn" onclick="window.mgOpen('chess')" title="Chess">
      <span class="mg-panel-icon">♟</span>
      <span class="mg-panel-name">Chess</span>
    </button>
  `;
  document.body.appendChild(panel);

  /* ─────────────────────────────────────────
     MODAL HTML
  ───────────────────────────────────────── */
  const overlay = document.createElement("div");
  overlay.id = "mg-overlay";
  overlay.innerHTML = `
    <div id="mg-modal">
      <div id="mg-topbar">
        <span id="mg-game-label">🎮 Game</span>
        <div id="mg-topbar-btns">
          <button class="mg-tb-btn" id="mg-full-btn" onclick="window.mgToggleFull()">⛶ Fullscreen</button>
          <button class="mg-tb-btn close-btn" onclick="window.mgClose()">✕ Close</button>
        </div>
      </div>
      <div id="mg-frame-wrap">
        <iframe id="mg-frame" src="about:blank"></iframe>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ─────────────────────────────────────────
     TOAST
  ───────────────────────────────────────── */
  const toast = document.createElement("div");
  toast.id = "mg-toast";
  document.body.appendChild(toast);

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ─────────────────────────────────────────
     MODAL API
  ───────────────────────────────────────── */
  const modal = document.getElementById("mg-modal");
  const frame = document.getElementById("mg-frame");
  const label = document.getElementById("mg-game-label");
  let isFullscreen = false;

  const GAMES = {
    snake: { icon: "🐍", name: "Snake", file: "snake.html" },
    2048: { icon: "🔢", name: "2048", file: "2048.html" },
    sudoku: { icon: "🔷", name: "Sudoku", file: "sudoku.html" },
    chess: { icon: "♟", name: "Chess", file: "chess.html" },
  };

  window.mgOpen = function (game) {
    const g = GAMES[game];
    if (!g) return;
    label.textContent = g.icon + " " + g.name;
    frame.src = g.file;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    showToast(g.icon + " " + g.name + " — Press Esc to close");
  };

  window.mgClose = function () {
    overlay.classList.remove("open");
    setTimeout(() => {
      frame.src = "about:blank";
    }, 250);
    document.body.style.overflow = "";
    if (isFullscreen) {
      modal.classList.remove("fullscreen");
      isFullscreen = false;
      document.getElementById("mg-full-btn").textContent = "⛶ Fullscreen";
    }
  };

  window.mgToggleFull = function () {
    isFullscreen = !isFullscreen;
    modal.classList.toggle("fullscreen", isFullscreen);
    document.getElementById("mg-full-btn").textContent = isFullscreen
      ? "⛶ Exit Full"
      : "⛶ Fullscreen";
  };

  /* ── ESC to close ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open"))
      window.mgClose();
  });

  /* ── click backdrop to close ── */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) window.mgClose();
  });
})();
