import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// nf3 v0.3.18 does `import { nodeFileTrace } from "@vercel/nft"` as an ESM named import.
// @vercel/nft is a CJS module — Node.js cannot always detect named exports from CJS.
// This patch rewrites the import to use a default import + destructure, which always works.

const filePath = 'node_modules/nf3/dist/_chunks/trace.mjs';

if (!existsSync(filePath)) {
  console.log('ℹ️  nf3 not found, skipping patch');
  process.exit(0);
}

let content = readFileSync(filePath, 'utf8');
const target = 'import { nodeFileTrace } from "@vercel/nft";';
const replacement = 'import _nft from "@vercel/nft"; const { nodeFileTrace } = _nft;';

if (!content.includes(target)) {
  console.log('ℹ️  nf3 already patched or import pattern changed — skipping');
  process.exit(0);
}

writeFileSync(filePath, content.replace(target, replacement));
console.log('✅ Patched nf3: rewrote @vercel/nft ESM named import to default import + destructure');
