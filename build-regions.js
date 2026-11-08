// Tạo weapon/regions.json từ các file trong thư mục "ITEMCFT WORLD" (ItemCN.csv, ItemVN.csv, ItemBR.csv, ItemWE.csv, ItemPH.csv ...).
// Chạy tự động trên Cloudflare cùng build-manifest.js. Muốn cập nhật: chỉ cần chép đè file CSV mới vào "ITEMCFT WORLD" rồi đẩy lên GitHub.
// Chạy thử trên máy (nếu có Node): node build-regions.js
const fs = require('fs'), path = require('path');

const SRC_DIR = path.join(__dirname, 'ITEMCFT WORLD');
const OUT = path.join(__dirname, 'weapon', 'regions.json');
// Hậu tố tên file -> tên cột khu vực trong Google Sheet. Thêm file mới (vd ItemRU.csv) chỉ cần thêm 1 dòng ở đây.
const REGION_OF = {
  CN: 'China', VN: 'Vietnam', BR: 'Brazil', WE: 'West', PH: 'Philippines',
  RU: 'Russia', ID: 'Indonesia', KR: 'South Korea', ES: 'Español', EU: 'Europe',
  SEA: 'SEA', JP: 'Japan', TW: 'Taiwan'
};

// Đọc CSV (có ngoặc kép, xuống dòng trong ô)
function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = []; let row = [], f = '', q = false, i = 0; const n = text.length;
  while (i < n) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i += 2; continue } q = false; i++; continue }
      f += c; i++; continue;
    }
    if (c === '"') { q = true; i++; continue }
    if (c === ',') { row.push(f); f = ''; i++; continue }
    if (c === '\r') { i++; continue }
    if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; i++; continue }
    f += c; i++;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row) }
  return rows;
}

const clean = s => String(s || '').replace(/^\s*\[[^\]]*\]\s*/, '').replace(/\s+/g, ' ').trim();

function buildRegion(file) {
  const rows = parseCSV(fs.readFileSync(file, 'utf8'));
  const h = rows[0].map(x => x.trim()), I = {};
  h.forEach((k, i) => I[k] = i);
  const need = ['_ITEM_TYPE', '_SHORT_NAME', '_NAME', '_ItemIndexInBute', '_ItemButeType', '_ITEM_ID'];
  for (const k of need) if (!(k in I)) throw new Error(path.basename(file) + ': thiếu cột ' + k);
  const byKey = new Map();   // key -> Map(name -> {n, id})
  for (let r = 1; r < rows.length; r++) {
    const v = rows[r];
    if (!v || (v[I._ITEM_TYPE] || '').trim() !== 'W') continue;
    if ((v[I._ItemButeType] || '').trim() === '0') continue;
    const key = (v[I._ItemIndexInBute] || '').trim();
    if (!/^\d+$/.test(key) || key === '0') continue;
    let name = clean(v[I._SHORT_NAME]);
    if (!name || name === '-') name = clean(v[I._NAME]).replace(/\s+\d+\s*(days?|ngày)$/i, '');
    if (!name || name === '-') continue;
    if (!byKey.has(key)) byKey.set(key, { m: new Map(), a: new Set() });
    const K = byKey.get(key), m = K.m, id = +v[I._ITEM_ID] || 0;
    const e = m.get(name) || { n: 0, id };
    e.n++; e.id = Math.min(e.id, id); m.set(name, e);
    // tên nội bộ (_NAME, thường là tiếng Anh, kể cả file CN) dùng làm tên phụ để nhận diện, không hiển thị
    const alt = clean(v[I._NAME]).replace(/\s*\d+\s*(days?|ngày|dias?)$/i, '').trim();
    if (alt && alt !== '-' && alt !== name) K.a.add(alt);
  }
  // mỗi key: danh sách tên, tên dùng nhiều nhất đứng đầu (hoà thì lấy món ra mắt sớm nhất)
  const out = {}, alias = {};
  for (const [k, K] of byKey) {
    out[k] = [...K.m.entries()].sort((a, b) => b[1].n - a[1].n || a[1].id - b[1].id).map(x => x[0]);
    const a = [...K.a].filter(x => !K.m.has(x));
    if (a.length) alias[k] = a;
  }
  return { names: out, alias };
}

const res = { built: new Date().toISOString(), regions: {}, alias: {} };
if (fs.existsSync(SRC_DIR)) {
  for (const f of fs.readdirSync(SRC_DIR)) {
    const m = f.match(/^Item([A-Za-z]+)\.csv$/i);
    if (!m) continue;
    const code = m[1].toUpperCase(), region = REGION_OF[code];
    if (!region) { console.log('Bỏ qua ' + f + ' (chưa khai báo hậu tố ' + code + ' trong REGION_OF)'); continue }
    try {
      const b = buildRegion(path.join(SRC_DIR, f));
      res.regions[region] = b.names; res.alias[region] = b.alias;
      console.log(f + ' -> ' + region + ': ' + Object.keys(res.regions[region]).length + ' vũ khí');
    } catch (e) { console.log('Lỗi ' + f + ': ' + e.message) }
  }
} else console.log('Không thấy thư mục ITEMCFT WORLD');
if (fs.existsSync(path.dirname(OUT))) fs.writeFileSync(OUT, JSON.stringify(res));
