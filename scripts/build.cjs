const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'dist');
const output = path.join(root, 'public');
// Only clear this generated directory, never source files or an arbitrary argument.
if (path.dirname(output) !== root || path.basename(output) !== 'public') throw new Error('Unsafe output path');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, 'assets'), { recursive: true });

const assetMap = {};
for (const name of fs.readdirSync(path.join(source, 'assets'))) {
  const bytes = fs.readFileSync(path.join(source, 'assets', name));
  const extension = path.extname(name);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  const target = `${path.basename(name, extension)}.${hash}${extension}`;
  assetMap[`assets/${name}`] = `assets/${target}`;
  fs.writeFileSync(path.join(output, 'assets', target), bytes);
}

let html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
for (const [from, to] of Object.entries(assetMap)) html = html.replaceAll(from, to);
for (const name of ['game.js', 'audio.js', 'style.css']) {
  let content = fs.readFileSync(path.join(source, name), 'utf8');
  if (name === 'game.js') {
    // The same loader works in source previews and in the fingerprinted deployment.
    content = `const ASSET_URLS=${JSON.stringify(assetMap)};\n${content}`;
  }
  const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
  const extension = path.extname(name);
  const target = `${path.basename(name, extension)}.${hash}${extension}`;
  fs.writeFileSync(path.join(output, target), content);
  html = html.replace(new RegExp(`${name.replace('.', '\\.')}([?][^"']*)?`, 'g'), target);
}
fs.writeFileSync(path.join(output, 'index.html'), html);
console.log(`Static build ready: public/ (${Object.keys(assetMap).length} fingerprinted assets)`);
