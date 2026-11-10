const pptxgen = require('pptxgenjs');
const React = require('react'); const ReactDOMServer = require('react-dom/server'); const sharp = require('sharp');
const { FaCamera, FaVideo, FaEuroSign, FaBullseye } = require('react-icons/fa');
const { applyTheme } = require('/root/.claude/skills/synced/2e0d7a87-487e-4e82-a26f-5793ce272b8c_30b47144-8f3b-444e-af05-c0794a9d89fe/pptx/scripts/apply_theme.js');
const QR = '/tmp/claude-0/-home-user-tutor-uil/5708f06a-ab8e-595d-8bd3-44d8601224e7/scratchpad/pijl/qr.png';
const OUT = process.argv[2] || 'doneer-een-pijl-slides.pptx';

async function icon(Comp, color) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: '#' + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

(async () => {
  const THEME = { name: 'Willem Bakker', headFontFace: 'Arial', bodyFontFace: 'Calibri',
    colors: { dk1: '0B1B3F', lt1: 'FFFFFF', dk2: '071536', lt2: 'DCE6F5', accent1: 'F15A22', accent2: '1D4FB3', accent3: 'F2C12E', accent4: 'C7421A', accent5: '6EA3E6', accent6: '22703F', hlink: 'F15A22', folHlink: 'C7421A' } };
  const pres = new pptxgen(); pres.layout = 'LAYOUT_16x9'; pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.title = 'Doneer een pijl – Willem Bakker'; pres.author = 'Stichting Willem Bakker Archer';
  const C = pres.SchemeColor;

  // Laag-out: donkerblauw, titel linksboven, lichte strepen als motief (schuine lichte parallellogrammen)
  pres.defineSlideMaster({ title: 'Donker', background: { color: THEME.colors.dk2 }, objects: [
    { rect: { x: 6.2, y: -1, w: 1.1, h: 8, fill: { color: THEME.colors.accent5, transparency: 88 }, rotate: 20 } },
    { rect: { x: 8.4, y: -1, w: 0.5, h: 8, fill: { color: THEME.colors.accent5, transparency: 90 }, rotate: 20 } },
    { rect: { x: 9.3, y: -1, w: 0.9, h: 8, fill: { color: THEME.colors.accent1, transparency: 90 }, rotate: 20 } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.75, w: 7.5, h: 0.75, fontSize: 34, bold: true, color: THEME.colors.lt1, margin: 0, valign: 'middle', align: 'left' }, text: 'Titel' } },
    { text: { text: 'Stichting Willem Bakker Archer · Doneer een pijl', options: { x: 0.5, y: 5.2, w: 6, h: 0.3, fontSize: 10, color: THEME.colors.accent5, margin: 0 } } },
  ] });
  const band = (slide, text, x, y, w) => {
    slide.addShape(pres.ShapeType.parallelogram, { x, y, w, h: 0.34, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: 'Label ' + text });
    slide.addText(text.toUpperCase(), { x, y, w, h: 0.34, fontSize: 11, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0, charSpacing: 2, isTextBox: true, objectName: 'Labeltekst' });
  };
  const chevrons = (slide, x, y) => slide.addText('»»»', { x, y, w: 0.8, h: 0.4, fontSize: 24, bold: true, color: C.accent1, margin: 0, isTextBox: true, objectName: 'Chevrons' });
  const [icCamera, icVideo, icEuro, icTarget] = await Promise.all([icon(FaCamera, 'FFFFFF'), icon(FaVideo, 'FFFFFF'), icon(FaEuroSign, 'FFFFFF'), icon(FaBullseye, 'FFFFFF')]);

  /* ---------- Slide 1: het team ---------- */
  pres.addSection({ title: 'Doneer een pijl' });
  const s1 = pres.addSlide({ masterName: 'Donker', sectionTitle: 'Doneer een pijl' });
  band(s1, 'Stichting Willem Bakker Archer', 0.5, 0.32, 3.4);
  s1.addText('Het team achter Willem', { placeholder: 'title' });
  // fotokader links
  s1.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.65, w: 4.1, h: 3.3, rectRadius: 0.15, fill: { color: THEME.colors.accent2, transparency: 75 }, line: { color: C.accent5, width: 1, dashType: 'dash' }, objectName: 'Fotokader team' });
  s1.addImage({ data: icCamera, x: 2.2, y: 2.55, w: 0.7, h: 0.7, objectName: 'Camera-icoon' });
  s1.addText('Foto van het team hier plaatsen', { x: 0.7, y: 3.35, w: 3.7, h: 0.4, fontSize: 13, color: C.accent5, align: 'center', margin: 0, isTextBox: true, objectName: 'Fototekst' });
  // zes teamleden rechts, 2 kolommen x 3 rijen
  const team = [['Herbert', 'Vader van Willem, stichting'], ['Gjalt', 'Financieel'], ['Piet', 'Sponsoring'], ['Tanja', 'Topsportbegeleiding'], ['Ruud', 'Legal en coördinatie'], ['Cornelie', 'Marketing']];
  team.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2); const x = 5.0 + col * 2.35, y = 1.65 + row * 1.1;
    s1.addShape(pres.ShapeType.ellipse, { x, y: y + 0.08, w: 0.55, h: 0.55, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: 'Initiaal ' + t[0] });
    s1.addText(t[0][0], { x, y: y + 0.08, w: 0.55, h: 0.55, fontSize: 18, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0, isTextBox: true, objectName: 'Initiaalletter ' + t[0] });
    s1.addText([{ text: t[0], options: { fontSize: 16, bold: true, color: C.background1, breakLine: true } }, { text: t[1], options: { fontSize: 11, color: C.accent5 } }], { x: x + 0.65, y, w: 1.65, h: 0.75, valign: 'middle', margin: 0, isTextBox: true, objectName: 'Teamlid ' + t[0] });
  });
  s1.addText([{ text: 'En wij zijn ook heel blij: ', options: { bold: true, color: C.accent3 } }, { text: 'met het EK-goud, met jullie vanavond en met elke pijl die erbij komt.', options: { color: C.background1 } }], { x: 5.0, y: 4.95, w: 4.55, h: 0.55, fontSize: 13, italic: true, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Wij zijn blij' });
  chevrons(s1, 8.75, 5.15);
  s1.addNotes('Stel het team kort voor: Herbert (vader, stichting), Gjalt (financieel), Piet (sponsoring), Tanja (topsportbegeleiding), Ruud (legal en coördinatie van vanavond), Cornelie (marketing). Benoem dat de stichting is opgericht door Herbert met vier ondernemers. Vervang het fotokader door een echte teamfoto (Invoegen > Afbeelding) en verwijder dan het kader.');

  /* ---------- Slide 2: doneer een pijl ---------- */
  const s2 = pres.addSlide({ masterName: 'Donker', sectionTitle: 'Doneer een pijl' });
  band(s2, 'Steun Willem op weg naar LA 2028', 0.5, 0.32, 3.6);
  s2.addText('Doneer een pijl', { placeholder: 'title' });
  const stappen = [
    [icVideo, 'Elke pijl is anders', 'Met een hogesnelheidscamera, dataregistratie en AI meet Willem hoe elke pijl vliegt. Alleen pijlen die exact hetzelfde doen, komen in zijn wedstrijdset.'],
    [icEuro, 'Wat een pijl kost', 'Eén merk ter wereld maakt pijlen op dit niveau. € 80 per pijl, een set van 6 kost € 480, een set van 12 € 900.'],
    [icTarget, 'Meer pijlen, beter schieten', 'Hoe meer pijlen er zijn om uit te selecteren, hoe strakker de set en hoe hoger de scores. Zo komt Los Angeles 2028 dichterbij.'],
  ];
  stappen.forEach((st, i) => {
    const y = 1.65 + i * 1.18;
    s2.addShape(pres.ShapeType.ellipse, { x: 0.5, y, w: 0.6, h: 0.6, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: 'Icooncirkel ' + (i + 1) });
    s2.addImage({ data: st[0], x: 0.63, y: y + 0.13, w: 0.34, h: 0.34, objectName: 'Icoon ' + st[1] });
    s2.addText(st[1], { x: 1.3, y: y - 0.05, w: 4.7, h: 0.35, fontSize: 16, bold: true, color: C.background1, margin: 0, isTextBox: true, objectName: 'Kop ' + (i + 1) });
    s2.addText(st[2], { x: 1.3, y: y + 0.3, w: 4.7, h: 0.75, fontSize: 12, color: C.background2, margin: 0, valign: 'top', isTextBox: true, objectName: 'Tekst ' + (i + 1) });
  });
  // QR-kaart rechts
  s2.addShape(pres.ShapeType.roundRect, { x: 6.5, y: 1.45, w: 3.0, h: 3.75, rectRadius: 0.12, fill: { color: C.background1 }, line: { color: C.background1 }, shadow: { type: 'outer', color: '000000', blur: 6, offset: 3, angle: 90, opacity: 0.4 }, objectName: 'QR-kaart' });
  s2.addImage({ path: QR, x: 6.8, y: 1.6, w: 2.4, h: 2.4, objectName: 'QR-code doneerpagina' });
  s2.addShape(pres.ShapeType.roundRect, { x: 7.1, y: 4.05, w: 1.8, h: 0.32, rectRadius: 0.06, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: 'Scan-band' });
  s2.addText('SCAN & DONEER', { x: 7.1, y: 4.05, w: 1.8, h: 0.32, fontSize: 11, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0, charSpacing: 2, isTextBox: true, objectName: 'Scan-tekst' });
  s2.addText([{ text: 'h-vest.nl/willembakker/doneer', options: { bold: true, color: C.text1, breakLine: true } }, { text: '1 pijl € 80 · 3 pijlen € 240 · set van 12 € 900', options: { color: C.accent4, breakLine: true } }, { text: 'Betalen met iDEAL', options: { color: C.text1 } }], { x: 6.6, y: 4.42, w: 2.8, h: 0.72, fontSize: 10, align: 'center', margin: 0, valign: 'top', isTextBox: true, objectName: 'QR-onderschrift' });
  chevrons(s2, 8.75, 5.15);
  s2.addNotes('Haak aan op Willems verhaal: hij selecteert zijn pijlen met een hogesnelheidscamera, dataregistratie en AI. Uit een partij pijlen blijven alleen de pijlen over die exact hetzelfde vliegen. Eén merk ter wereld maakt pijlen op dit niveau; € 80 per pijl (set van 6: € 480, set van 12: € 900; controleer deze bedragen). Hoe meer pijlen om uit te selecteren, hoe beter de set en hoe beter Willem schiet. Afsluiten met de QR-code: scan, kies 1 pijl, 3 pijlen of een eigen bedrag, betaal met iDEAL.');

  await pres.writeFile({ fileName: OUT }); await applyTheme(OUT, THEME); console.log('geschreven', OUT);
})().catch(e => { console.error(e); process.exit(1); });
