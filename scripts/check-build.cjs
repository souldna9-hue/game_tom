const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
require('./build.cjs');
const output=path.resolve(__dirname,'../public');
const html=fs.readFileSync(path.join(output,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(match[1]==='.'||/^(https?:|#)/.test(match[1]))continue;
  assert(fs.existsSync(path.join(output,match[1])),`Missing HTML dependency: ${match[1]}`);
}
const gameFile=fs.readdirSync(output).find(name=>/^game\.[a-f0-9]+\.js$/.test(name));
const game=fs.readFileSync(path.join(output,gameFile),'utf8');
new vm.Script(game);
const map=JSON.parse(game.match(/^const ASSET_URLS=(.*);/)[1]);
for(const [from,to] of Object.entries(map))assert(fs.existsSync(path.join(output,to)),`Missing mapped asset: ${from}`);
for(const name of ['sword','laurel','archer']){
  assert(map[`assets/${name}-run.png`]);
  assert(map[`assets/${name}-manifest.json`]);
  const manifest=JSON.parse(fs.readFileSync(path.join(output,map[`assets/${name}-manifest.json`])));
  assert.equal(manifest.frame_layout.rows.run.length,8);
}
assert(map['assets/background-03.webp']);assert(map['assets/portal.png']);
const config=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../vercel.json')));
assert.equal(config.outputDirectory,'public');
console.log('PASS: generated HTML dependencies, fingerprint map, character manifests and Vercel output.');
