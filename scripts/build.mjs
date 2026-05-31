import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { transform } from 'esbuild';

const entryFile = 'energy-flow-card.js';
const outFile = 'dist/energy-flow-card.js';
const imageFiles = {
  day_no_ev: 'images/energy-house-day-no-ev.png',
  day_with_ev: 'images/energy-house-day-with-ev.png',
  night_no_ev: 'images/energy-house-night-no-ev.png',
  night_with_ev: 'images/energy-house-night-with-ev.png',
};

const source = await readFile(entryFile, 'utf8');
const imageEntries = await Promise.all(
  Object.entries(imageFiles).map(async ([key, imageFile]) => {
    const image = await readFile(imageFile);
    return `  ${key}: 'data:image/png;base64,${image.toString('base64')}',`;
  })
);

const inlineImages = [
  '// __BUILD_INLINE_BACKGROUNDS_START__',
  'const BUNDLED_BG_IMAGES = {',
  ...imageEntries,
  '};',
  '// __BUILD_INLINE_BACKGROUNDS_END__',
].join('\n');

const preparedSource = source.replace(
  /\/\/ __BUILD_INLINE_BACKGROUNDS_START__[\s\S]*?\/\/ __BUILD_INLINE_BACKGROUNDS_END__/,
  inlineImages
);

if (preparedSource === source) {
  throw new Error('Could not find background image build markers in energy-flow-card.js');
}

const result = await transform(preparedSource, {
  loader: 'js',
  minify: true,
  target: 'es2020',
  legalComments: 'none',
});

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, `${result.code.trimEnd()}\n`);

const sourceSize = (await stat(entryFile)).size;
const distSize = (await stat(outFile)).size;
console.log(`Built ${outFile}`);
console.log(`source: ${formatBytes(sourceSize)} -> dist: ${formatBytes(distSize)}`);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}
