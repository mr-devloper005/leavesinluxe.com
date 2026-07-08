#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run') || args.has('--check');
const nearLossless = args.has('--near-lossless');
const failOnLarge = args.has('--fail-on-large');
const maxImageKb = Number(process.env.MAX_PUBLIC_IMAGE_KB || 750);
const iconImageKb = Number(process.env.MAX_PUBLIC_ICON_KB || 1000);

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Missing dependency: sharp. Run `pnpm add -D sharp` first.');
  process.exit(1);
}

const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const stats = {
  scanned: 0,
  optimized: 0,
  skipped: 0,
  savedBytes: 0,
  large: [],
};

function relativePublicPath(file) {
  return path.relative(publicDir, file).replaceAll(path.sep, '/');
}

function isIconAsset(file) {
  const relative = relativePublicPath(file);
  return [
    'favicon.png',
    'favicon.ico',
    'apple-icon.png',
  ].includes(relative);
}

async function walk(dir) {
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (imageExts.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function format(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  const before = (await fs.stat(file)).size;
  stats.scanned += 1;
  const limitKb = isIconAsset(file) ? iconImageKb : maxImageKb;

  if (before / 1024 > limitKb) {
    stats.large.push({ file, size: before, limitKb });
  }

  // Strict default: no resize, no JPEG recompression. JPEG recompression is not truly lossless in sharp.
  if ((ext === '.jpg' || ext === '.jpeg') && !nearLossless) {
    console.log(`SKIP jpeg-lossless ${path.relative(root, file)} (${format(before)})`);
    stats.skipped += 1;
    return;
  }

  let pipeline = sharp(file, { animated: true, failOn: 'none' }).rotate();
  if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, palette: false });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ lossless: true, effort: 6 });
  } else if (ext === '.avif') {
    pipeline = pipeline.avif({ lossless: true, effort: 9 });
  } else if (nearLossless) {
    pipeline = pipeline.jpeg({ quality: 95, mozjpeg: true, progressive: true });
  }

  const output = await pipeline.toBuffer();
  if (output.length >= before) {
    console.log(`KEEP ${path.relative(root, file)} (${format(before)}, optimized not smaller)`);
    stats.skipped += 1;
    return;
  }

  const saved = before - output.length;
  console.log(`${dryRun ? 'WOULD ' : ''}OPTIMIZE ${path.relative(root, file)} ${format(before)} -> ${format(output.length)} saved ${format(saved)}`);
  stats.optimized += 1;
  stats.savedBytes += saved;
  if (!dryRun) await fs.writeFile(file, output);
}

const files = await walk(publicDir);
for (const file of files) await optimize(file);

console.log('\nImage optimization summary');
console.log(`Scanned: ${stats.scanned}`);
console.log(`Optimized: ${stats.optimized}`);
console.log(`Skipped/kept: ${stats.skipped}`);
console.log(`Saved: ${format(stats.savedBytes)}`);

if (stats.large.length) {
  console.log('\nLarge public images over budget:');
  for (const item of stats.large) {
    console.log(`- ${path.relative(root, item.file)} ${format(item.size)} (limit ${item.limitKb}KB)`);
  }
}

if (failOnLarge && stats.large.length) {
  console.error(`\nImage budget failed: ${stats.large.length} images are over ${maxImageKb}KB.`);
  process.exit(1);
}
