/* ============================================================
   CXDY.top — 交互脚本
   粒子网络 · 自定义光标 · 打字机 · 终端 · 滚动动效
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------------- 工具 ---------------- */
  function $ (sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$ (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ============================================================
     1. 神经元粒子网络背景
     ============================================================ */
  var canvas = $("#particles");
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var W, H, DPR, particles = [];
    var mouse = { x: -9999, y: -9999 };
    var PALETTE = [
      [110, 231, 255], // cyan
      [167, 139, 250], // violet
      [244, 114, 182]  // pink
    ];

    function resize () {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth || window.innerWidth;
      H = canvas.clientHeight || window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      init();
    }

    function randColor () {
      return PALETTE[(Math.random() * PALETTE.length) | 0];
    }

    function init () {
      var count = Math.min(110, Math.max(40, Math.floor((W * H) / 16000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        var c = randColor();
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          r: Math.random() * 1.8 + 0.8,
          c: c
        });
      }
    }

    function step () {
      ctx.clearRect(0, 0, W, H);
      var linkDist = 130;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // 鼠标轻微排斥，制造“可交互”的感觉
        var dxm = p.x - mouse.x, dym = p.y - mouse.y;
        var dm = Math.hypot(dxm, dym);
        if (dm < 130 && dm > 0.01) {
          var force = (130 - dm) / 130 * 0.6;
          p.vx += (dxm / dm) * force * 0.12;
          p.vy += (dym / dm) * force * 0.12;
        }

        p.x += p.vx;
        p.y += p.vy;

        // 摩擦，避免越跑越快
        p.vx *= 0.985;
        p.vy *= 0.985;

        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        if (p.x < 0) p.x = 0; if (p.x > W) p.x = W;
        if (p.y < 0) p.y = 0; if (p.y > H) p.y = H;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.c[0] + "," + p.c[1] + "," + p.c[2] + ",0.75)";
        ctx.fill();
      }

      // 连接线
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var pa = particles[a], pb = particles[b];
          var dx = pa.x - pb.x, dy = pa.y - pb.y;
          var dist = dx * dx + dy * dy;
          if (dist < linkDist * linkDist) {
            var alpha = (1 - Math.sqrt(dist) / linkDist) * 0.28;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = "rgba(140,160,220," + alpha + ")";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        // 连接到鼠标
        var pm = particles[a];
        var dxm = pm.x - mouse.x, dym = pm.y - mouse.y;
        var dm = dxm * dxm + dym * dym;
        if (dm < 200 * 200) {
          var ma = (1 - Math.sqrt(dm) / 200) * 0.4;
          ctx.beginPath();
          ctx.moveTo(pm.x, pm.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = "rgba(167,139,250," + ma + ")";
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      requestAnimationFrame(step);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("mouseout", function () {
      mouse.x = -9999; mouse.y = -9999;
    });
    resize();
    step();
  }

  /* ============================================================
     2. 自定义光标
     ============================================================ */
  if (!isCoarse && !reduceMotion) {
    var dot = $(".cursor-dot"), ring = $(".cursor-ring");
    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });
    (function loop () {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    })();
    // 悬停可交互元素时放大
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button, .project-card, .skill-card")) {
        ring.classList.add("is-hover");
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button, .project-card, .skill-card")) {
        ring.classList.remove("is-hover");
      }
    });
  }

  /* ============================================================
     3. 打字机效果
     ============================================================ */
  var typedEl = $("#typed");
  if (typedEl && !reduceMotion) {
    var phrases = [
      "AI 应用开发者",
      "机器学习实践者",
      "大模型 / LLM 探索者",
      "全栈工程师",
      "创意编程爱好者"
    ];
    var pi = 0, ci = 0, deleting = false;

    function type () {
      var word = phrases[pi];
      typedEl.textContent = word.slice(0, ci);

      if (!deleting) {
        ci++;
        if (ci > word.length) { deleting = true; return setTimeout(type, 1800); }
        return setTimeout(type, 85);
      } else {
        ci--;
        if (ci < 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          ci = 0;
          return setTimeout(type, 400);
        }
        return setTimeout(type, 38);
      }
    }
    type();
  } else if (typedEl) {
    typedEl.textContent = "AI 应用开发者";
  }

  /* ============================================================
     4. 滚动进度条 + 导航状态
     ============================================================ */
  var progress = $(".scroll-progress");
  var nav = $("#nav");

  function onScroll () {
    var doc = document.documentElement;
    var scrolled = window.scrollY || doc.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    if (progress) {
      progress.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + "%";
    }
    if (nav) {
      nav.classList.toggle("scrolled", scrolled > 30);
    }
    highlightNav();
  }

  var sections = $$("main section[id]");
  var navAnchors = $$(".nav-links a");
  function highlightNav () {
    var current = "";
    var offset = window.innerHeight * 0.35;
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - offset) current = s.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     5. 滚动入场 + 计数动画 + 技能条
     ============================================================ */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        // 计数动画
        $$(".count", entry.target).forEach(function (c) {
          if (c.dataset.done) return;
          c.dataset.done = "1";
          animateCount(c);
        });

        // 技能条
        $$(".skill-bar span", entry.target).forEach(function (bar) {
          bar.style.width = bar.dataset.width || "0%";
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  $$(".reveal").forEach(function (el) { observer.observe(el); });

  function animateCount (el) {
    var target = parseInt(el.dataset.target, 10) || 0;
    var start = null;
    var duration = 1600;
    function tick (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
    requestAnimationFrame(tick);
  }

  /* ============================================================
     6. 项目卡片 3D 倾斜
     ============================================================ */
  if (!isCoarse && !reduceMotion) {
    $$("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + (px * 7) + "deg) rotateX(" + (-py * 7) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ============================================================
     7. 技能卡片鼠标光晕跟随
     ============================================================ */
  if (!isCoarse) {
    $$(".skill-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
      });
    });
  }

  /* ============================================================
     8. 移动端菜单
     ============================================================ */
  var burger = $("#burger");
  var navLinks = $("#nav-links");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", navLinks).forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ============================================================
     9. 交互式终端
     ============================================================ */
  var term = $("#terminal");
  if (term) {
    var lines = [
      { t: "cmd",  path: "~", text: " whoami" },
      { t: "out",  text: "cxdyun — AI / 全栈开发者" },
      { t: "cmd",  path: "~", text: " cat mission.txt" },
      { t: "out",  text: "用代码与模型，构建有温度的智能体验。" },
      { t: "cmd",  path: "~", text: " ./train --model future" },
      { t: "ok",   text: "training ██████████ 100%  ·  loss 0.0001  ·  已就绪 ✓" }
    ];

    function esc (s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    var lineIdx = 0, charIdx = 0, started = false;

    function renderLine (line) {
      var div = document.createElement("div");
      if (line.t === "cmd") {
        div.innerHTML = '<span class="t-cmd"><span class="t-path">' + esc(line.path || "~") + '</span>' + esc(line.text) + '</span>';
      } else {
        div.className = line.t === "ok" ? "t-ok" : "t-out";
        div.textContent = line.text;
      }
      term.appendChild(div);
      return div;
    }

    function typeLine () {
      if (lineIdx >= lines.length) {
        var caret = document.createElement("span");
        caret.className = "t-caret";
        term.appendChild(caret);
        return;
      }
      var line = lines[lineIdx];
      var div = renderLine(line);
      if (line.t === "cmd" || line.t === "out" || line.t === "ok") {
        var full = line.text;
        var isCmd = line.t === "cmd";
        var i = 0;
        (function typeChar () {
          i++;
          if (isCmd) {
            div.innerHTML = '<span class="t-cmd"><span class="t-path">' + esc(line.path || "~") + '</span>' + esc(full.slice(0, i)) + '</span>';
          } else {
            div.textContent = full.slice(0, i);
          }
          if (i < full.length) {
            setTimeout(typeChar, reduceMotion ? 0 : 18);
          } else {
            lineIdx++;
            setTimeout(typeLine, reduceMotion ? 0 : 360);
          }
        })();
      }
    }

    if (reduceMotion) {
      lines.forEach(function (line) {
        var d = document.createElement("div");
        if (line.t === "cmd") {
          d.innerHTML = '<span class="t-cmd"><span class="t-path">~</span>' + esc(line.text) + '</span>';
        } else {
          d.className = line.t === "ok" ? "t-ok" : "t-out";
          d.textContent = line.text;
        }
        term.appendChild(d);
      });
    } else {
      var termObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            typeLine();
            termObserver.disconnect();
          }
        });
      }, { threshold: 0.4 });
      termObserver.observe(term);
    }
  }
})();
