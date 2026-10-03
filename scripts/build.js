import fs from 'fs';
import path from 'path';

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function safeCopyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
}

const root = process.cwd();
const distDir = path.join(root, 'dist');
const distAssets = path.join(distDir, 'assets');
const distHtml = path.join(distDir, 'index.html');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(path.join(root, 'public'))) {
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
}

// Ensure dist/index.html exists (fallback to root index.html)
if (!fs.existsSync(distHtml) && fs.existsSync(path.join(root, 'index.html'))) {
  safeCopyFile(path.join(root, 'index.html'), distHtml);
}

// Sync assets across dist, public and root
if (fs.existsSync(distAssets)) {
  copyDir(distAssets, path.join(root, 'public', 'assets'));
  copyDir(distAssets, path.join(root, 'assets'));
} else if (fs.existsSync(path.join(root, 'public', 'assets'))) {
  copyDir(path.join(root, 'public', 'assets'), distAssets);
} else if (fs.existsSync(path.join(root, 'assets'))) {
  copyDir(path.join(root, 'assets'), distAssets);
}

// Sync manifest and icon
for (const file of ['manifest.json', 'icon.svg']) {
  const distF = path.join(distDir, file);
  const pubF = path.join(root, 'public', file);
  const rootF = path.join(root, file);

  if (fs.existsSync(distF)) {
    safeCopyFile(distF, pubF);
    safeCopyFile(distF, rootF);
  } else if (fs.existsSync(pubF)) {
    safeCopyFile(pubF, distF);
    safeCopyFile(pubF, rootF);
  } else if (fs.existsSync(rootF)) {
    safeCopyFile(rootF, distF);
    safeCopyFile(rootF, pubF);
  }
}

if (!fs.existsSync(distHtml)) {
  console.error('Build Error: dist/index.html is missing.');
  process.exit(1);
}

console.log('Production build and static assets verified and synchronized successfully.');
