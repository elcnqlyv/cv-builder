#!/usr/bin/env node
// Render a CV from JSON into an ATS-friendly, single-column .docx
// Usage: node build_cv.js <cv.json> <out.docx>
// Schema: see ../references/cv-schema.md

const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Tab, TabStopType,
  AlignmentType, BorderStyle, LevelFormat, HeadingLevel,
} = require('docx');

const [, , inputPath, outPath] = process.argv;
if (!inputPath || !outPath) {
  console.error('Usage: node build_cv.js <cv.json> <out.docx>');
  process.exit(1);
}

const cv = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (!cv.name) { console.error('cv.json needs a "name"'); process.exit(1); }
if (!Array.isArray(cv.sections)) { console.error('cv.json needs a "sections" array'); process.exit(1); }

const meta = Object.assign(
  { page: 'A4', font: 'Calibri', fontSize: 10.5, margin: 0.75, accent: '000000', headerAlign: 'center' },
  cv.meta || {}
);

const PAGES = { A4: { width: 11906, height: 16838 }, Letter: { width: 12240, height: 15840 } };
const page = PAGES[meta.page] || PAGES.A4;
const marginDxa = Math.round(meta.margin * 1440);
const contentWidth = page.width - 2 * marginDxa;
const body = Math.round(meta.fontSize * 2);       // half-points
const align = meta.headerAlign === 'left' ? AlignmentType.LEFT : AlignmentType.CENTER;

// Inline **bold** support, so key tools/results can be emphasised sparingly.
function runs(text, opts = {}) {
  return String(text).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) => {
    const isBold = part.startsWith('**') && part.endsWith('**');
    return new TextRun({ text: isBold ? part.slice(2, -2) : part, ...opts, bold: isBold || opts.bold });
  });
}

function sectionHeading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
    children: [new TextRun({ text })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'cv-bullets', level: 0 },
    spacing: { after: 30 },
    children: runs(text),
  });
}

function entry(item) {
  const out = [];
  const hasBullets = Array.isArray(item.bullets) && item.bullets.length > 0;
  out.push(new Paragraph({
    keepNext: true,
    spacing: { before: 100, after: 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: contentWidth }],
    children: [
      ...runs(item.title || '', { bold: true }),
      ...(item.dates ? [new TextRun({ children: [new Tab(), item.dates] })] : []),
    ],
  }));
  const sub = [item.org, item.location].filter(Boolean).join(', ');
  if (sub) {
    out.push(new Paragraph({
      keepNext: hasBullets || !!item.note,
      spacing: { after: 30 },
      children: [new TextRun({ text: sub, italics: true })],
    }));
  }
  if (item.note) {
    out.push(new Paragraph({ spacing: { after: 30 }, keepNext: hasBullets, children: runs(item.note) }));
  }
  if (hasBullets) item.bullets.forEach((b) => out.push(bullet(b)));
  return out;
}

function renderSection(sec) {
  const out = [sectionHeading(sec.heading)];
  const items = sec.items || [];
  switch (sec.type) {
    case 'text':
      out.push(new Paragraph({ spacing: { after: 40 }, children: runs(sec.text || '') }));
      break;
    case 'entries':
      items.forEach((it) => out.push(...entry(it)));
      break;
    case 'skills':
      items.forEach((it) => {
        const children = typeof it === 'string'
          ? runs(it)
          : [new TextRun({ text: `${it.label}: `, bold: true }), ...runs(it.value)];
        out.push(new Paragraph({ spacing: { after: 40 }, children }));
      });
      break;
    case 'list':
      items.forEach((it) => out.push(bullet(it)));
      break;
    case 'lines':
      items.forEach((it) => out.push(new Paragraph({ spacing: { after: 30 }, children: runs(it) })));
      break;
    default:
      console.error(`Unknown section type "${sec.type}" in "${sec.heading}"`);
      process.exit(1);
  }
  return out;
}

const children = [];
children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1,
  alignment: align,
  children: [new TextRun({ text: cv.name })],
}));
if (cv.title) {
  children.push(new Paragraph({
    alignment: align,
    spacing: { after: 40 },
    children: [new TextRun({ text: cv.title, bold: true })],
  }));
}
if (Array.isArray(cv.contact) && cv.contact.length) {
  children.push(new Paragraph({
    alignment: align,
    spacing: { after: 60 },
    children: [new TextRun({ text: cv.contact.join('  |  ') })],
  }));
}
cv.sections.forEach((s) => children.push(...renderSection(s)));

const doc = new Document({
  creator: cv.name,
  title: `${cv.name} - CV`,
  styles: {
    default: { document: { run: { font: meta.font, size: body } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: meta.font, size: 34, bold: true, color: meta.accent },
        paragraph: { spacing: { before: 0, after: 40 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: meta.font, size: body + 2, bold: true, allCaps: true, color: meta.accent },
        paragraph: {
          spacing: { before: 200, after: 80 }, outlineLevel: 1,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: meta.accent, space: 1 } },
        },
      },
    ],
  },
  numbering: {
    config: [{
      reference: 'cv-bullets',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: page.width, height: page.height },
        margin: { top: marginDxa, bottom: marginDxa, left: marginDxa, right: marginDxa },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log(`Wrote ${outPath}`);
});
