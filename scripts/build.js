import fs from 'fs';
import path from 'path';

const distHtml = path.join(process.cwd(), 'dist', 'index.html');
if (!fs.existsSync(distHtml)) {
  console.error('Error: dist/index.html does not exist.');
  process.exit(1);
}

console.log('Production build verified successfully.');
