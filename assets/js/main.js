/* ============================================================
   יום הולדת 40 לאמא — לוגיקה ואינטראקציות
   ============================================================ */
(function () {
  "use strict";

  /* ---------- הזרקת שם אמא ---------- */
  document.querySelectorAll("[data-name]").forEach((el) => (el.textContent = CONFIG.momName));
  document.title = `💛 יום הולדת 40 ל${CONFIG.momName} 💛`;

  /* ---------- ניווט ---------- */
  const navbar = document.getElementById("navbar");
  const burger = document.getElementById("nav-burger");
  const navLinks = document.getElementById("nav-links");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  });
  burger.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );

  /* ---------- איפוס — חוזרים לנקודת ההתחלה ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("לאפס את המסע ולחזור לנקודת ההתחלה?")) {
        buildJourney();
        const start = document.getElementById("journey");
        if (start) start.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  /* ---------- המסע ההפוך: מתחילים היום (40) וחוזרים אחורה עד הלידה ---------- */
  const introEl = document.getElementById("journey-intro");
  introEl.innerHTML = `
    <div class="intro-card">
      <span class="intro-kicker">${JOURNEY_INTRO.kicker}</span>
      <div class="intro-emoji">🕰️</div>
      <h3 class="intro-title">${JOURNEY_INTRO.title}</h3>
      <div class="intro-prop">${JOURNEY_INTRO.prop}</div>
      <p class="intro-text">${JOURNEY_INTRO.text}</p>
    </div>`;

  const norm = (s) =>
    (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[.,!?׳״"'`\-]/g, "")
      .replace(/\s+/g, " ");

  const tl = document.getElementById("timeline");
  const order = [...TIMELINE].reverse(); // 40 (היום) ראשון ... לידה אחרון
  const stopEls = [];
  const gateEls = [];
  const bannerEls = [];
  let giftEl = null; // קטע המתנה — נחשף רק בסוף המסע
  let unlocked = 0; // אינדקס התחנה האחרונה שנחשפה (0 = הראשונה גלויה)

  const buildMilestone = (item, i) => {
    const div = document.createElement("div");
    if (item.noMilestone) {
      div.className = "tl-skip";
      return div;
    }
    div.className =
      "tl-item " + (i % 2 === 0 ? "tl-a" : "tl-b") + (item.n === 1 || item.n === 21 ? " finale" : "");
    const isPdf = /\.pdf$/i.test(item.img);
    const media = item.noPhoto
      ? ""
      : isPdf
      ? `<a class="tl-photo tl-pdf" href="${item.img}" target="_blank" rel="noopener"
             data-emoji="${item.emoji}"><span>📄 לצפייה במסמך</span></a>`
      : `<div class="tl-photo" data-emoji="${item.emoji}">
          <img src="${item.img}" alt="${item.title}" loading="lazy"${item.rot ? ` style="transform:rotate(${item.rot}deg)"` : ""}
               onerror="this.parentElement.style.display='none'">
        </div>`;
    const videoHtml = item.video
      ? `<div class="tl-video">
          <video controls preload="metadata" playsinline>
            <source src="${encodeURI(item.video)}" type="video/mp4" />
          </video>
          ${item.videoCaption ? `<div class="tl-video-cap">${item.videoCaption}</div>` : ""}
        </div>`
      : "";
    div.innerHTML = `
      <div class="tl-dot">${item.emoji}</div>
      <div class="tl-card">
        ${media}
        <div class="tl-body">
          <div class="tl-year">${item.year}</div>
          <div class="tl-hdate">${item.hdate}</div>
          <div class="tl-title">${item.title}</div>
          <div class="tl-text">${item.text}</div>
          ${videoHtml}
        </div>
      </div>`;
    return div;
  };

  const buildGate = (gate, onSolve, onReveal) => {
    const wrap = document.createElement("div");
    wrap.className = "journey-gate locked";
    wrap.style.setProperty("--kc", gate.color || "#e8b64c");

    const finish = () => {
      if (wrap.classList.contains("solved")) return;
      wrap.classList.add("solved");
      onSolve();
    };

    if (gate.type === "activity") {
      const psalmHtml = gate.psalm ? `<div class="gate-psalm">${gate.psalm}</div>` : "";
      if (gate.cake) {
        const total = gate.candles || 40;
        const photoStepHtml = gate.photo ? `
            <div class="gate-photo-step">
              <div class="gate-lock">📸</div>
              <span class="gate-kicker">${gate.photo.kicker || gate.kicker || "תחנה"}</span>
              <img class="gate-photo-reveal" src="${gate.photo.img}" alt="${gate.photo.title || ""}" />
              <h3 class="gate-title">${gate.photo.title || ""}</h3>
              <p class="gate-intro">${gate.photo.text || ""}</p>
              <button class="gate-submit gate-photo-btn" type="button">${gate.photo.button || "ממשיכים"}</button>
            </div>` : "";
        wrap.innerHTML = `
          <div class="gate-card">
            ${photoStepHtml}
            <div class="gate-cake-main"${gate.photo ? " hidden" : ""}>
              <div class="gate-lock">🎂</div>
              <span class="gate-kicker">${gate.kicker || "תחנה"}</span>
              <div class="gate-emoji">${gate.emoji || "🎂"}</div>
              <h3 class="gate-title">${gate.title || ""}</h3>
              <p class="gate-intro">${gate.text || ""}</p>
              <div class="gate-cake-host"></div>
              <p class="gate-cake-status">🔥 נותרו ${total} נרות לכבות... (לחצו / העבירו אצבע על הנרות)</p>
              <button class="gate-submit gate-station" type="button" disabled>${gate.button || "ממשיכים"}</button>
            </div>
          </div>`;
        const host = wrap.querySelector(".gate-cake-host");
        const status = wrap.querySelector(".gate-cake-status");
        const btn = wrap.querySelector(".gate-station");
        let litLeft = total;
        host.appendChild(
          buildCakeWidget(total, () => {
            litLeft--;
            if (litLeft > 0) {
              status.textContent = `🔥 נותרו ${litLeft} נרות לכבות...`;
            } else {
              status.textContent = "🎉 כל 40 הנרות כבו — משאלה שנשלחה! אפשר להמשיך";
              btn.disabled = false;
              burstConfetti(220, wrap);
            }
          })
        );
        btn.addEventListener("click", finish);
        if (gate.photo) {
          wrap.querySelector(".gate-photo-btn").addEventListener("click", () => {
            wrap.querySelector(".gate-photo-step").hidden = true;
            wrap.querySelector(".gate-cake-main").hidden = false;
            burstConfetti(100, wrap);
          });
        }
      } else if (gate.pre) {
        wrap.innerHTML = `
          <div class="gate-card">
            <div class="gate-pre">
              <div class="gate-lock">🌅</div>
              <span class="gate-kicker">בוקר טוב</span>
              <div class="gate-emoji">☀️</div>
              <h3 class="gate-title">${gate.pre.question}</h3>
              <button class="gate-submit gate-pre-btn" type="button">${gate.pre.button}</button>
            </div>
            ${gate.photo ? `
            <div class="gate-photo-step" hidden>
              <div class="gate-lock">📸</div>
              <span class="gate-kicker">${gate.photo.kicker || gate.kicker || "תחנה"}</span>
              <img class="gate-photo-reveal" src="${gate.photo.img}" alt="${gate.photo.title || ""}" />
              <h3 class="gate-title">${gate.photo.title || ""}</h3>
              <p class="gate-intro">${gate.photo.text || ""}</p>
              <button class="gate-submit gate-photo-btn" type="button">${gate.photo.button || "ממשיכים"}</button>
            </div>` : ""}
            ${gate.mid ? `
            <div class="gate-mid" hidden>
              <div class="gate-lock">🎯</div>
              <span class="gate-kicker">${gate.mid.kicker || gate.kicker || "תחנה"}</span>
              <div class="gate-emoji">${gate.mid.emoji || gate.emoji || "🎉"}</div>
              <h3 class="gate-title">${gate.mid.title || ""}</h3>
              <p class="gate-intro">${gate.mid.text || ""}</p>
              <button class="gate-submit gate-mid-btn" type="button">${gate.mid.button || "ממשיכים"}</button>
            </div>` : ""}
            <div class="gate-main" hidden>
              <div class="gate-lock">🎯</div>
              <span class="gate-kicker">${gate.kicker || "תחנה"}</span>
              <div class="gate-emoji">${gate.emoji || "🎉"}</div>
              <h3 class="gate-title">${gate.title || ""}</h3>
              <p class="gate-intro">${gate.text || ""}</p>
              ${psalmHtml}
              <button class="gate-submit gate-station" type="button">${gate.button || "בוצע ✓ ממשיכים"}</button>
            </div>
          </div>`;
        const photoEl = wrap.querySelector(".gate-photo-step");
        const midEl = wrap.querySelector(".gate-mid");
        const mainEl = wrap.querySelector(".gate-main");
        const chain = [photoEl, midEl, mainEl].filter(Boolean);
        wrap.querySelector(".gate-pre-btn").addEventListener("click", () => {
          wrap.querySelector(".gate-pre").hidden = true;
          if (gate.revealPhoto) burstConfetti(120, wrap);
          chain[0].hidden = false;
        });
        if (photoEl) {
          wrap.querySelector(".gate-photo-btn").addEventListener("click", () => {
            photoEl.hidden = true;
            (midEl || mainEl).hidden = false;
          });
        }
        if (midEl) {
          wrap.querySelector(".gate-mid-btn").addEventListener("click", () => {
            midEl.hidden = true;
            mainEl.hidden = false;
          });
        }
        wrap.querySelector(".gate-station").addEventListener("click", finish);
      } else {
        wrap.innerHTML = `
          <div class="gate-card">
            <div class="gate-lock">🎯</div>
            <span class="gate-kicker">${gate.kicker || "תחנה"}</span>
            <div class="gate-emoji">${gate.emoji || "🎉"}</div>
            <h3 class="gate-title">${gate.title || ""}</h3>
            <p class="gate-intro">${gate.text || ""}</p>
            ${psalmHtml}
            <button class="gate-submit gate-station" type="button">${gate.button || "בוצע ✓ ממשיכים"}</button>
          </div>`;
        wrap.querySelector(".gate-submit").addEventListener("click", finish);
      }
    } else {
      wrap.innerHTML = `
        <div class="gate-card">
          <div class="gate-lock">🔒</div>
          <span class="gate-kicker">חידה — ענו כדי לגלות את התמונה</span>
          <div class="gate-emoji">🗝️</div>
          <h3 class="gate-title">מה מחכה בתחנה הבאה?</h3>
          <p class="gate-question">${gate.question}</p>
          <div class="gate-form">
            <input type="text" class="gate-input" placeholder="התשובה שלכם..." aria-label="תשובה" />
            <button class="gate-submit" type="button">גלו את התמונה 🔓</button>
          </div>
          <button class="gate-hint-btn" type="button">רמז 💡</button>
          <p class="gate-hint" hidden>${gate.hint || ""}</p>
          <p class="gate-error" hidden>אופס, לא מדויק. נסו שוב 🙃</p>
        </div>`;
      const input = wrap.querySelector(".gate-input");
      const err = wrap.querySelector(".gate-error");
      const hint = wrap.querySelector(".gate-hint");
      const answers = [gate.answer, ...(gate.aliases || [])].map(norm);
      const attempt = () => {
        if (answers.includes(norm(input.value))) {
          err.hidden = true;
          finish();
        } else {
          err.hidden = false;
          input.classList.add("shake");
          setTimeout(() => input.classList.remove("shake"), 500);
        }
      };
      wrap.querySelector(".gate-submit").addEventListener("click", attempt);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") attempt();
      });
      wrap.querySelector(".gate-hint-btn").addEventListener("click", () => (hint.hidden = !hint.hidden));
    }
    return wrap;
  };

  const apply = () => {
    stopEls.forEach((el, i) => el.classList.toggle("hidden-locked", i > unlocked));
    gateEls.forEach((g, i) => {
      if (g) g.classList.toggle("hidden-locked", i !== unlocked + 1);
    });
    bannerEls.forEach((b, i) => {
      if (b) b.classList.toggle("hidden-locked", i > unlocked + 1);
    });
    if (giftEl) giftEl.classList.toggle("hidden-locked", unlocked < order.length - 1);
  };

  function buildJourney() {
    tl.innerHTML = "";
    stopEls.length = 0;
    gateEls.length = 0;
    bannerEls.length = 0;
    unlocked = 0;
    order.forEach((item, i) => {
    // באנר מעבר לילה→בוקר מוצג לפני שער הבוקר
    const bannerBeforeGate = item.n === 9;
    const addBanner = () => {
      if (BANNERS[item.n]) {
        const b = document.createElement("div");
        b.className = "tl-banner";
        b.innerHTML = `<span>${BANNERS[item.n]}</span>`;
        bannerEls[i] = b;
        tl.appendChild(b);
      }
    };
    if (bannerBeforeGate) addBanner();
    // שער נחשף לפני התחנה (חוץ מהתחנה הראשונה — היום)
    if (i > 0 && GATES[item.n]) {
      const g = buildGate(GATES[item.n], () => {
        unlocked = Math.max(unlocked, i);
        apply();
        burstConfetti(item.n === 1 ? 220 : 130, stopEls[i]);
        const isLast = i === order.length - 1;
        // תחנות ללא כרטיס קבוע (עדי/סוסים): מתקדמים קדימה לשלב הבא במקום לקפוץ אחורה
        const target = isLast && giftEl
          ? giftEl
          : item.noMilestone
          ? bannerEls[i + 1] || gateEls[i + 1] || stopEls[i]
          : stopEls[i];
        setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), isLast ? 700 : 260);
      });
      gateEls[i] = g;
      tl.appendChild(g);
    }
    if (!bannerBeforeGate) addBanner();
    const el = buildMilestone(item, i);
    stopEls[i] = el;
    tl.appendChild(el);

    // אחרי התחנה האחרונה (הלידה 1986) — קטע המתנה, נחשף רק בסוף המסע
    if (i === order.length - 1) {
      const gift = document.createElement("div");
      gift.className = "tl-gift hidden-locked";
      gift.innerHTML = `
        <div class="gift-card">
          <div class="gift-emoji">🎁</div>
          <span class="section-kicker">ועכשיו — למתנה</span>
          <h2 class="section-title">הגיע הזמן לפנק אותך</h2>
          <p class="section-lead">מוזמנת לבחור לעצמך משהו שמסמל את המסע המטורף שעברנו היום 💛</p>
          <a href="https://nogajewelry.com/collections/breast-milk-rings" class="btn-primary" target="_blank" rel="noopener">💍 לבחירת המתנה</a>
        </div>`;
      tl.appendChild(gift);
      giftEl = gift;
    }

    // התחנה הראשונה (היום/40): פעילות הפתיחה (הצגה) — גלויה, מתחילה את המסע
    if (i === 0 && GATES[item.n]) {
      const opener = buildGate(GATES[item.n], () => {
        burstConfetti(160, opener);
        const first = gateEls[1] || stopEls[1];
        if (first) setTimeout(() => first.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
      });
      opener.classList.remove("locked");
      tl.appendChild(opener);
    }
    });
    apply();
  }
  buildJourney();

  /* ---------- 40 סיבות ---------- */
  const reasonsGrid = document.getElementById("reasons-grid");
  REASONS.forEach((reason, i) => {
    const card = document.createElement("div");
    card.className = "reason-card reveal";
    card.innerHTML = `
      <div class="reason-inner">
        <div class="reason-face reason-front"><span class="num">${i + 1}</span></div>
        <div class="reason-face reason-back">${reason}</div>
      </div>`;
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      if (card.classList.contains("flipped")) burstConfetti(14, card);
    });
    reasonsGrid.appendChild(card);
  });

  /* ---------- קהוט ---------- */
  document.getElementById("kahoot-link").href = CONFIG.kahootUrl;

  /* ---------- עוגת נרות (נבנית בתוך תחנת עדי) ---------- */
  function buildCakeWidget(total, onBlow) {
    const cake = document.createElement("div");
    cake.className = "cake cake-mini";
    const candles = document.createElement("div");
    candles.className = "candles";
    for (let i = 0; i < total; i++) {
      const c = document.createElement("div");
      c.className = "candle";
      c.innerHTML = '<div class="flame"></div>';
      const blow = () => {
        if (c.classList.contains("out")) return;
        c.classList.add("out");
        onBlow();
      };
      c.addEventListener("click", blow);
      c.addEventListener("pointerenter", blow);
      candles.appendChild(c);
    }
    cake.appendChild(candles);
    cake.insertAdjacentHTML(
      "beforeend",
      '<div class="cake-top"></div>' +
        '<div class="cake-layer cake-cream"></div>' +
        '<div class="cake-layer cake-mid"></div>' +
        '<div class="cake-layer cake-base"></div>' +
        '<div class="cake-plate"></div>'
    );
    return cake;
  }

  /* ---------- פלייליסט ---------- */
  const list = document.getElementById("playlist-list");
  PLAYLIST.forEach((track) => {
    const a = document.createElement("a");
    a.className = "track reveal";
    a.href = track.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = `
      <div class="track-play">▶</div>
      <div class="track-emoji">${track.emoji}</div>
      <div class="track-info">
        <div class="track-title">${track.title}</div>
        <div class="track-artist">${track.artist}</div>
      </div>`;
    list.appendChild(a);
  });
  const cta = document.createElement("div");
  cta.className = "playlist-cta reveal";
  cta.innerHTML = `<a href="${CONFIG.playlistUrl}" target="_blank" rel="noopener" class="btn-primary">לפלייליסט המלא 🎧</a>`;
  list.appendChild(cta);

  /* ---------- אנימציית חשיפה בגלילה ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- בלונים ב-HERO ---------- */
  const balloons = document.querySelector(".hero-balloons");
  const bColors = ["#e8b64c", "#e8617d", "#7b6cf6", "#f5d78e", "#50c9a5"];
  for (let i = 0; i < 12; i++) {
    const b = document.createElement("span");
    const size = 30 + Math.random() * 34;
    b.style.cssText = `position:absolute;bottom:-120px;left:${Math.random() * 100}%;
      width:${size}px;height:${size * 1.2}px;border-radius:50%;
      background:${bColors[i % bColors.length]};opacity:.55;
      filter:blur(.3px);animation:balloonRise ${10 + Math.random() * 10}s linear ${Math.random() * 8}s infinite;`;
    balloons.appendChild(b);
  }
  const style = document.createElement("style");
  style.textContent =
    "@keyframes balloonRise{to{transform:translateY(-120vh) translateX(30px) rotate(8deg);opacity:0;}}";
  document.head.appendChild(style);

  /* ---------- קונפטי (canvas) ---------- */
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  const cColors = ["#e8b64c", "#f5d78e", "#e8617d", "#7b6cf6", "#50c9a5", "#ffffff"];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function burstConfetti(count, originEl) {
    let ox = canvas.width / 2,
      oy = canvas.height / 3;
    if (originEl) {
      const r = originEl.getBoundingClientRect();
      ox = r.left + r.width / 2;
      oy = r.top + r.height / 2;
    }
    for (let i = 0; i < count; i++) {
      particles.push({
        x: ox,
        y: oy,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -12 - 4,
        size: 4 + Math.random() * 6,
        color: cColors[(Math.random() * cColors.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 120 + Math.random() * 60,
      });
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter((p) => p.life > 0 && p.y < canvas.height + 40);
    particles.forEach((p) => {
      p.vy += 0.22;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 60));
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    requestAnimationFrame(loop);
  }
  loop();

  // התפרצות פתיחה
  setTimeout(() => burstConfetti(120), 600);

  /* ---------- מוזיקת רקע ---------- */
  const musicBtn = document.getElementById("music-toggle");
  let audioCtx,
    playing = false,
    noteTimer;
  // מחרוזת מנגינות יום הולדת (~2:20 דק׳) שנוצרת ב-Web Audio — בלי קבצים חיצוניים.
  // כל שורה = ביטוי מוזיקלי; [0, dur] = הפסקה קצרה. הפרקים חוזרים בסדר משתנה כדי לגוון.
  const HB_A = [[392,.4],[392,.2],[440,.6],[392,.6],[523,.6],[494,1.0]];              // "יום הולדת שמח"
  const HB_B = [[392,.4],[392,.2],[440,.6],[392,.6],[587,.6],[523,1.0]];
  const W_A  = [[523,.3],[659,.3],[784,.3],[659,.45],[587,.15],[523,.6]];             // ואלס חגיגי
  const W_B  = [[587,.3],[698,.3],[880,.3],[698,.45],[659,.15],[587,.6]];
  const W_C  = [[523,.3],[659,.3],[784,.3],[1046.5,.6],[880,.3],[784,.3],[659,.3],[523,.9]];
  const F_A  = [[392,.2],[523,.2],[659,.25],[784,.5],[659,.2],[784,.6]];              // פאנפרה
  const F_B  = [[523,.2],[659,.2],[784,.25],[1046.5,.75],[880,.3],[784,.3],[659,.3],[523,.6]];
  const M_A  = [[392,.3],[392,.3],[494,.3],[587,.3],[494,.3],[392,.6]];               // מארש שמח
  const M_B  = [[440,.3],[440,.3],[523,.3],[659,.3],[587,.3],[494,.6]];
  const M_C  = [[659,.3],[587,.3],[494,.3],[440,.3],[392,.9]];
  const G_A  = [[349,.4],[440,.4],[523,.4],[440,.4],[466,.4],[349,.8]];               // לחן חם ורך
  const G_B  = [[523,.4],[587,.4],[659,.4],[587,.4],[523,.4],[466,.8]];
  const PK_A = [[523,.25],[523,.25],[587,.25],[659,.25],[523,.25],[659,.5]];          // פולקה קופצנית
  const PK_B = [[698,.25],[659,.25],[587,.25],[523,.25],[494,.25],[523,.5]];
  const R    = [[0,.35]];
  const MEDLEY = [
    ...HB_A,...HB_B,...R, ...W_A,...W_B,...W_C,...R, ...F_A,...F_B,...R, ...M_A,...M_B,...M_C,...R, ...G_A,...G_B,...R, ...PK_A,...PK_B,...R,
    ...F_A,...F_B,...R, ...PK_A,...PK_B,...R, ...M_A,...M_B,...M_C,...R, ...W_A,...W_B,...W_C,...R, ...G_A,...G_B,...R, ...HB_A,...HB_B,...R,
    ...W_C,...W_A,...W_B,...R, ...HB_A,...HB_B,...R, ...PK_A,...PK_B,...R, ...G_A,...G_B,...R, ...F_A,...F_B,...R, ...M_A,...M_B,...M_C,...R,
    ...HB_A,...HB_B,...R, ...M_A,...M_B,...M_C,...R, ...W_A,...W_B,...W_C,...R, ...F_A,...F_B,...R, ...PK_A,...PK_B,...R, ...G_A,...G_B,...R,
  ];
  function playTune() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let t = audioCtx.currentTime + 0.1;
    MEDLEY.forEach(([freq, dur]) => {
      if (freq > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + dur);
      }
      t += dur;
    });
    const total = MEDLEY.reduce((a, [, d]) => a + d, 0.6) * 1000;
    noteTimer = setTimeout(playTune, total); // מנגן שוב בלולאה בסיום המחרוזת
  }
  musicBtn.addEventListener("click", async () => {
    playing = !playing;
    musicBtn.classList.toggle("playing", playing);
    if (playing) {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      try { await audioCtx.resume(); } catch (e) { /* חלק מהדפדפנים מחזירים דחייה שקטה */ }
      playTune();
      burstConfetti(60);
    } else {
      clearTimeout(noteTimer);
      if (audioCtx) audioCtx.suspend();
    }
  });
  // חימום מנוע השמע כבר במגע הראשון בדף — עוקף חסימות autoplay בחלק מהדפדפנים
  document.addEventListener("pointerdown", function warmAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    document.removeEventListener("pointerdown", warmAudio);
  }, { once: true });
})();
