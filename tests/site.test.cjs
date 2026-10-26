// 先启动 README 中的本地预览，再运行 NODE_PATH="$(npm root -g)" node --test tests/site.test.cjs。
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { chromium } = require('playwright');
const baseURL = 'http://127.0.0.1:4320';
let browser;

before(async () => { browser = await chromium.launch({ channel: 'chrome', headless: true }); });
after(async () => { await browser?.close(); });

for (const width of [1440, 768, 390, 320]) {
  test(`${width}px：布局不溢出，真实截图可加载`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
    await page.goto(baseURL);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    for (const gallery of await page.locator('[data-gallery]').all()) {
      for (const button of await gallery.locator('button').all()) {
        await button.click();
        const index = await button.evaluate(el => [...el.parentElement.children].indexOf(el));
        await page.waitForFunction(({ id, index }) => {
          const track = document.getElementById(id);
          return Math.abs(track.scrollLeft - index * track.clientWidth) < 2;
        }, { id: await button.getAttribute('aria-controls'), index });
        await gallery.locator('.gallery-slide img').nth(index).evaluate(img => img.decode());
        await page.waitForFunction(label => [...document.querySelectorAll('.gallery-controls button')].some(el => el.textContent.trim() === label && el.getAttribute('aria-pressed') === 'true'), (await button.textContent()).trim());
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
  });
}

test('桌面悬停菜单、Escape 关闭并恢复焦点', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseURL);
  await page.locator('summary').hover();
  await page.waitForFunction(() => document.querySelector('.nav-menu').open);
  assert.equal(await page.locator('.nav-menu').evaluate(el => el.open), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.nav-menu').evaluate(el => el.open), false);
  assert.equal(await page.locator('summary').evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Enter');
  await page.locator('.nav-panel a[href="#about"]').click();
  assert.equal(await page.locator('.nav-menu').evaluate(el => el.open), false);
  assert.equal(new URL(page.url()).hash, '#about');
  await page.close();
});

test('手机菜单点击、点击外部关闭与产品页跳转', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(baseURL);
  await page.locator('summary').tap();
  assert.equal(await page.locator('.nav-menu').evaluate(el => el.open), true);
  await page.locator('.menu-scrim').tap({ position: { x: 10, y: 700 } });
  await page.waitForFunction(() => !document.querySelector('.nav-menu').open);
  assert.equal(await page.locator('.nav-menu').evaluate(el => el.open), false);
  await page.locator('summary').tap();
  await page.locator('.nav-products a').first().tap();
  await page.waitForURL(`${baseURL}/cook-photo/`);
  assert.equal(new URL(page.url()).pathname, '/cook-photo/');
  assert.equal(await page.locator('#tool-title').innerText(), '片刻');
  await page.close();
});

test('键盘切图、滚动同步、缩放后保留选中项及减少动态效果', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(baseURL);
  const track = page.locator('#photo-gallery');
  const buttons = page.locator('.photo-product .gallery-controls button');
  const last = (await buttons.count()) - 1;
  await track.focus();
  await page.keyboard.press('End');
  await page.waitForFunction(index => document.querySelectorAll('.photo-product .gallery-controls button')[index].getAttribute('aria-pressed') === 'true', last);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(index => {
    const track = document.querySelector('#photo-gallery');
    return Math.abs(track.scrollLeft - track.clientWidth * index) < 2;
  }, last);
  await buttons.nth(last).focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(index => document.querySelectorAll('.photo-product .gallery-controls button')[index].getAttribute('aria-pressed') === 'true', last - 1);
  assert.equal(await buttons.nth(last - 1).evaluate(el => el === document.activeElement), true);
  await track.evaluate(el => el.scrollLeft = 0);
  await page.waitForFunction(() => document.querySelector('.photo-product button').getAttribute('aria-pressed') === 'true');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).animationName), 'none');
  await page.close();
});

test('下载地址与产品页一致，兼容性及截图版本说明保留', async () => {
  const page = await browser.newPage();
  await page.goto(baseURL);
  for (const [section, path] of [['.photo-product', 'cook-photo'], ['.video-product', 'video-select'], ['.atlas-product', 'assets-atlas']]) {
    const href = await page.locator(`${section} .button-outline`).getAttribute('href');
    const productHTML = readFileSync(`${path}/index.html`, 'utf8');
    assert.ok(productHTML.includes(`href="${href}"`));
    assert.match(await page.locator(`${section} .product-compatibility`).innerText(), /未公证测试版/);
  }
  assert.match(await page.locator('.photo-product .screenshot-note').innerText(), /v2.0.2.*自有/);
  assert.match(await page.locator('.footer-disclaimer').innerText(), /Intel 尚未实机验证/);
  await page.close();
});

test('禁用 JavaScript 仍可浏览截图、展开菜单与进入产品页', async () => {
  const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await page.goto(baseURL);
  assert.equal(await page.locator('.gallery-controls').first().isVisible(), false);
  assert.equal(await page.locator('#photo-gallery img').count(), 5);
  await page.locator('summary').click();
  assert.equal(await page.locator('.nav-products').isVisible(), true);
  await page.locator('.nav-products a[href="/assets-atlas/"]').click();
  assert.equal(new URL(page.url()).pathname, '/assets-atlas/');
  await page.close();
});

for (const [route, name] of [['cook-photo', '片刻'], ['video-select', '片段'], ['assets-atlas', 'Assets Atlas']]) {
  for (const width of [1440, 390, 320]) {
    test(`${name} ${width}px：详情布局、吸顶导航、安装说明和下载入口`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
      await page.goto(`${baseURL}/${route}/`);
      assert.equal(await page.locator('h1').innerText(), name);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (width < 768) assert.equal(await page.locator('.local-screens').isVisible(), false);
      assert.equal(await page.locator('.local-download').getAttribute('href'), await page.locator('.primary-link').getAttribute('href'));
      assert.match(await page.locator('.runtime-note').innerText(), /尚未完成 Apple 公证/);
      const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => !document.getElementById(href.slice(1))));
      assert.deepEqual(brokenAnchors, []);
      for (const img of await page.locator('.tool-page img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el => el.decode());
      }
      await page.locator('.local-links a[href="#guide-title"]').click();
      const target = await page.locator('#guide-title').boundingBox();
      const nav = await page.locator('.local-nav').boundingBox();
      assert.ok(target.y >= nav.y + nav.height);
      assert.equal(Math.round(nav.y), width > 767 ? 44 : 48);
      const details = page.locator('.start-guide').last().locator('details');
      await details.locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.equal(await details.evaluate(el => el.open), true);
      assert.equal(await details.locator('a[href$=".sha256"]').isVisible(), true);
      if (route === 'assets-atlas') assert.match(await details.innerText(), /Intel 尚未实机验证/);
      else assert.match(await details.innerText(), /Intel Mac 暂不支持/);
      await page.keyboard.press('Enter');
      assert.equal(await details.evaluate(el => el.open), false);
      assert.deepEqual(errors, []);
      await page.close();
    });
  }
  test(`${name}：无 JavaScript 下导航和安装说明仍可操作`, async () => {
    const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    await page.goto(`${baseURL}/${route}/`);
    await page.locator('.nav-menu summary').click();
    assert.equal(await page.locator('.nav-products').isVisible(), true);
    await page.locator('.nav-menu summary').click();
    const details = page.locator('.start-guide').last().locator('details');
    await details.locator('summary').click();
    assert.equal(await details.locator('a[href$=".sha256"]').isVisible(), true);
    await page.close();
  });
}

test('菜单悬停容错、平滑收起和快速移回不会闪闭', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseURL);
  await page.locator('.nav-menu summary').hover();
  await page.waitForFunction(() => document.querySelector('.nav-menu').open);
  await page.locator('.nav-products a').first().hover();
  assert.equal(await page.locator('.nav-menu').evaluate(el => el.open), true);
  await page.mouse.move(1300, 600);
  await page.waitForFunction(() => document.querySelector('.nav-menu').classList.contains('is-closing'));
  assert.equal(await page.locator('.nav-panel').evaluate(el => el.inert), true);
  await page.locator('.nav-menu summary').hover();
  await page.waitForFunction(() => !document.querySelector('.nav-menu').classList.contains('is-closing'));
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.nav-menu').evaluate(el => el.open), true);
  assert.equal(await page.locator('.nav-panel').evaluate(el => el.inert), false);
  await page.mouse.move(1300, 600);
  await page.waitForFunction(() => !document.querySelector('.nav-menu').open);
  await page.locator('.nav-menu summary').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.querySelector('.nav-menu').open);
  assert.equal(await page.locator('.nav-panel').evaluate(el => el.inert), false);
  await page.close();
});

for (const route of ['', 'cook-photo/', 'video-select/', 'assets-atlas/']) {
  test(`${route || '首页'}：滚动入场只播放一次，减少动态效果即时生效`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${baseURL}/${route}`);
    const selector = route ? '.feature-heading' : '.about h2';
    const target = page.locator(selector);
    assert.equal(await target.evaluate(el => el.classList.contains('reveal-pending')), true);
    assert.equal(await target.evaluate(el => getComputedStyle(el).opacity), '0');
    await target.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .65, behavior: 'instant' }));
    await page.waitForFunction(selector => document.querySelector(selector).classList.contains('is-revealed'), selector);
    await page.waitForFunction(selector => document.querySelector(selector).getAnimations().some(animation => animation.playState === 'running'), selector);
    await page.waitForFunction(selector => getComputedStyle(document.querySelector(selector)).opacity === '1', selector);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    assert.equal(await target.evaluate(el => el.classList.contains('is-revealed')), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => [...document.querySelectorAll('.reveal-pending')].every(el => getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none'));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    assert.equal(await target.evaluate(el => getComputedStyle(el).opacity), '1');
    await page.close();
  });
}


test('旧产品地址保留跳转，其他产品导航指向片刻新路径', async () => {
  const page = await browser.newPage();
  await page.goto(baseURL + '/photo-select/');
  await page.waitForURL(baseURL + '/cook-photo/');
  assert.equal(await page.locator('#tool-title').innerText(), '片刻');
  await page.goto(baseURL + '/assets-atlas/');
  assert.equal(await page.locator('.desktop-product').first().getAttribute('href'), '/cook-photo/');
  assert.equal(await page.locator('.desktop-product').first().innerText(), '片刻');
  await page.close();
});


test('图片和视频独立展示并共用同一个帧藏安装包', async () => {
  const page = await browser.newPage();
  await page.goto(baseURL);
  assert.equal(await page.locator('.product').count(), 3);
  const photo = await page.locator('.photo-product .button-outline').getAttribute('href');
  assert.equal(await page.locator('.video-product .button-outline').getAttribute('href'), photo);
  assert.match(photo, /cxdy-moment-v2\.0\.2\/cxdy-moment-2\.0\.2-arm64\.dmg$/);
  for (const route of ['cook-photo', 'video-select']) {
    await page.goto(`${baseURL}/${route}/`);
    assert.equal(await page.locator('.primary-link').getAttribute('href'), photo);
    assert.match(await page.locator('.runtime-note').innerText(), /macOS 26.2/);
  }
  await page.close();
});
