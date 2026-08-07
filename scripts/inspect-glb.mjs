import fs from 'fs';
const buf = fs.readFileSync('public/3d/model_a.glb');
const chunk0Len = buf.readUInt32LE(12);
const json = JSON.parse(buf.slice(20, 20+chunk0Len).toString('utf8'));
console.log('meshes:', json.meshes?.length, '| materials:', json.materials?.length);
const prim = json.meshes?.[0]?.primitives?.[0];
console.log('primitive attributes:', JSON.stringify(prim?.attributes));
console.log('has NORMAL:', 'NORMAL' in (prim?.attributes||{}));
console.log('has POSITION:', 'POSITION' in (prim?.attributes||{}));
// Check all 3 models
for(const f of ['public/3d/model_a.glb','public/3d/model_b.glb','public/3d/model_c.glb']) {
  const b = fs.readFileSync(f);
  const clen = b.readUInt32LE(12);
  const j = JSON.parse(b.slice(20,20+clen).toString('utf8'));
  const p = j.meshes?.[0]?.primitives?.[0];
  console.log(f, '| attrs:', Object.keys(p?.attributes||{}));
}
