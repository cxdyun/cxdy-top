const menu = document.querySelector('.nav-menu');
const summary = menu.querySelector('summary');
const panel = menu.querySelector('.nav-panel');
const desktopPointer = matchMedia('(min-width: 768px) and (hover: hover)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let hoverTimer;
let closeTimer;
let menuAnimation;

function openMenu() {
  clearTimeout(hoverTimer);
  clearTimeout(closeTimer);
  const wasOpen = menu.open && !menu.classList.contains('is-closing');
  menuAnimation?.cancel();
  menuAnimation = null;
  menu.classList.remove('is-closing');
  panel.inert = false;
  menu.open = true;
  if (!wasOpen && !reducedMotion.matches) {
    menuAnimation = panel.animate([
      { opacity: 0, transform: 'translateY(-12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 320, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  }
}

function closeMenu(immediate = false) {
  clearTimeout(hoverTimer);
  clearTimeout(closeTimer);
  if (!menu.open) return;
  menuAnimation?.cancel();
  menuAnimation = null;
  if (immediate || reducedMotion.matches) {
    menu.open = false;
    panel.inert = false;
    menu.classList.remove('is-closing');
    return;
  }
  menu.classList.add('is-closing');
  panel.inert = true;
  const animation = panel.animate([
    { opacity: 1, transform: 'translateY(0)' },
    { opacity: 0, transform: 'translateY(-8px)' }
  ], { duration: 180, easing: 'ease-out', fill: 'forwards' });
  menuAnimation = animation;
  animation.finished.then(() => {
    menu.open = false;
    panel.inert = false;
    menu.classList.remove('is-closing');
    animation.cancel();
    menuAnimation = null;
  }, () => {}); // 快速移回菜单时取消收起，保留新一轮展开状态。
}

summary.addEventListener('pointerenter', () => {
  if (desktopPointer.matches) hoverTimer = setTimeout(openMenu, 110);
});
summary.addEventListener('click', event => {
  event.preventDefault();
  if (menu.open && !menu.classList.contains('is-closing')) closeMenu();
  else openMenu();
});
menu.addEventListener('pointerenter', () => {
  clearTimeout(closeTimer);
  if (menu.classList.contains('is-closing')) openMenu();
});
menu.addEventListener('pointerleave', () => {
  clearTimeout(hoverTimer);
  if (desktopPointer.matches && !menu.contains(document.activeElement)) {
    closeTimer = setTimeout(closeMenu, 220);
  }
});
menu.addEventListener('focusout', event => {
  if (event.relatedTarget && !menu.contains(event.relatedTarget)) closeMenu(true);
});
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => closeMenu(true));
});
document.addEventListener('pointerdown', event => {
  if (!menu.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    closeMenu(true);
    summary.focus();
  }
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches && menu.classList.contains('is-closing')) closeMenu(true);
  else if (reducedMotion.matches) menuAnimation?.cancel();
});

document.querySelectorAll('[data-gallery]').forEach(gallery => {
  const track = gallery.querySelector('.gallery-track');
  const controls = gallery.querySelector('.gallery-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const status = gallery.querySelector('.gallery-status');
  let current = 0;
  let scrollTimer;

  function setCurrent(index) {
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    const button = buttons[index];
    if (button.offsetLeft < controls.scrollLeft || button.offsetLeft + button.offsetWidth > controls.scrollLeft + controls.clientWidth) {
      controls.scrollTo({ left: button.offsetLeft - (controls.clientWidth - button.offsetWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    if (index !== current) status.textContent = `${buttons[index].textContent.trim()}，第 ${index + 1} 张，共 ${buttons.length} 张`;
    current = index;
  }

  function update() {
    setCurrent(Math.max(0, Math.min(buttons.length - 1, Math.round(track.scrollLeft / track.clientWidth))));
  }

  function select(index) {
    setCurrent(index);
    track.scrollTo({ left: index * track.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(update, 100);
  }, { passive: true });
  gallery.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let index = current;
    if (event.key === 'ArrowLeft') index = Math.max(0, current - 1);
    if (event.key === 'ArrowRight') index = Math.min(buttons.length - 1, current + 1);
    if (event.key === 'Home') index = 0;
    if (event.key === 'End') index = buttons.length - 1;
    select(index);
    if (controls.contains(document.activeElement)) buttons[index].focus({ preventScroll: true });
  });
  new ResizeObserver(update).observe(track);
  controls.hidden = false;
});

if (typeof HTMLDialogElement !== 'undefined') {
  const preview = document.createElement('dialog');
  preview.className = 'screenshot-preview';
  preview.setAttribute('aria-label', '截图预览');
  preview.innerHTML = '<div class="preview-toolbar"><button type="button" aria-pressed="false">放大</button><a target="_blank" rel="noopener">打开原图<span class="sr-only">（在新标签页打开）</span></a><form method="dialog"><button autofocus>关闭</button></form></div><div class="preview-image"><img alt=""><p role="status" hidden>图片加载失败，请打开原图重试</p></div>';
  document.body.append(preview);
  const image = preview.querySelector('img');
  const zoom = preview.querySelector('button');
  const original = preview.querySelector('a');
  const error = preview.querySelector('[role="status"]');
  let trigger;
  document.querySelectorAll('.gallery-slide > a[href*=images], .product-shot > a[href*=images]').forEach(link => {
    link.setAttribute('aria-label', (link.getAttribute('aria-label') || link.querySelector('img').alt).replace('原尺寸截图（在新标签页打开）', '截图预览'));
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      error.hidden = true;
      image.hidden = false;
      image.alt = link.querySelector('img').alt;
      image.src = original.href = link.href;
      preview.showModal();
    });
  });
  zoom.addEventListener('click', () => {
    const enlarged = preview.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(enlarged));
    zoom.textContent = enlarged ? '适应窗口' : '放大';
  });
  image.addEventListener('error', () => { image.hidden = true; error.hidden = false; });
  preview.addEventListener('close', () => {
    preview.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = '放大';
    trigger.focus({ preventScroll: true });
  });
}

// 只为尚未进入视口的内容增强动效，首屏、锚点直达和无脚本浏览始终可读。
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll('.product-heading > *, .gallery, .about > *, .tool-copy > *, .release-download, .hero-shot > *, .feature-heading, .feature-grid > div, .gallery-heading, .screen-pair > figure, .start-guide > div');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -32px 0px', threshold: 0 });
  targets.forEach(target => {
    if (target.getBoundingClientRect().top < innerHeight - 32) return;
    const order = [...target.parentElement.children].indexOf(target);
    target.style.setProperty('--reveal-delay', `${Math.min(order, 3) * 55}ms`);
    target.classList.add('reveal-pending');
    observer.observe(target);
  });
  document.addEventListener('focusin', event => {
    const target = event.target.closest('.reveal-pending');
    if (target) {
      target.classList.add('is-revealed');
      observer.unobserve(target);
    }
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    targets.forEach(target => target.classList.add('is-revealed'));
    observer.disconnect();
  });
}
