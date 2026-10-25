// Chạy tự động trên Cloudflare (Build command: node build-manifest.js)
// Quét thư mục img của từng trang và tạo manifest.json để trang tìm ảnh không phân biệt chữ hoa/thường.
const fs = require('fs'), path = require('path');
const PAGES = ['skin', 'weapon'];            // thêm tên thư mục trang mới vào đây nếu trang đó có thư mục img

function walk(dir, base, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out);
    else {
      const rel = path.relative(base, p).split(path.sep);
      out[rel.join('/').toLowerCase()] = rel.map(encodeURIComponent).join('/');
    }
  }
}

for (const pg of PAGES) {
  const base = path.join(__dirname, pg);
  if (!fs.existsSync(base)) continue;
  const imgDir = fs.readdirSync(base, { withFileTypes: true })
    .find(e => e.isDirectory() && e.name.toLowerCase() === 'img');
  const out = {};
  if (imgDir) walk(path.join(base, imgDir.name), base, out);
  fs.writeFileSync(path.join(base, 'manifest.json'), JSON.stringify(out));
  console.log(pg + ': ' + Object.keys(out).length + ' file');
}
