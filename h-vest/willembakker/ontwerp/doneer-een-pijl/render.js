const { chromium } = require('playwright');
const path = require('path');
const file = 'file://' + path.resolve('ontwerp.html');
const sheets = [
  { id: 'a6-voor',   w: 105, h: 148, name: 'tafelkaart-A6-voorkant' },
  { id: 'a6-achter', w: 105, h: 148, name: 'tafelkaart-A6-achterkant' },
  { id: 'vlag',      w: 200, h: 80,  name: 'tafelvlag-200x80' },
  { id: 'etiket',    w: 214, h: 74,  name: 'flesetiket-pinkcube-208x68-met-afloop' },
];
const px = mm => Math.round(mm / 25.4 * 96);
(async () => {
  const browser = await chromium.launch();
  for (const s of sheets) {
    const ctx = await browser.newContext({ viewport: { width: px(s.w), height: px(s.h) }, deviceScaleFactor: 4 });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('requestfailed', r => errs.push('failed: ' + r.url()));
    await page.goto(file + '?sheet=' + s.id); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
    await page.screenshot({ path: s.name + '.png', fullPage: false });
    await page.addStyleTag({ content: `@page{size:${s.w}mm ${s.h}mm;margin:0} html,body{background:transparent}` });
    await page.pdf({ path: s.name + '.pdf', width: s.w + 'mm', height: s.h + 'mm', printBackground: true, pageRanges: '1', preferCSSPageSize: true });
    const fonts = await page.evaluate(() => Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight + ' ' + f.style));
    console.log(s.name, 'fonts:', fonts.join(' | '), errs.length ? 'ERR ' + errs.join(' ; ') : 'ok');
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
