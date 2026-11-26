/* nav.js - Menu dùng chung cho toàn bộ hoangzii.pages.dev
   Đặt file này ở thư mục gốc website: https://hoangzii.pages.dev/nav.js
   Mỗi trang chỉ cần thêm:  <script src="/nav.js"></script>  trước </body>
   Danh sách trang = DEFAULT bên dưới + các mục thêm trong /nav.json (không trùng đường dẫn).
   => Weapon, Skin, Weapon Sets LUÔN có trong menu, dù nav.json cũ hay thiếu.
   Thêm trang mới: thêm vào DEFAULT hoặc /nav.json, KHÔNG cần sửa các trang cũ.
   Giao diện: nút nhỏ dính sát mép trái màn hình; bấm vào => khung menu trượt từ trái sang phải
   (Main Page ở trên cùng, bên dưới là các trang). Đóng: bấm ra ngoài, bấm nút ×, nhấn Esc hoặc chọn 1 trang. */
(function () {
  if (window.__navLoaded) return; window.__navLoaded = true;

  var HOME = { name: "Main Page", path: "/" };
  var DEFAULT = [
    { name: "Weapon",       path: "/weapon/" },
    { name: "Skin",         path: "/skin/" },
    { name: "Weapon Sets",  path: "/sets/" }
  ];
  var W = 260;   // độ rộng khung menu (px)

  var css = '\
#hzNav{font-family:"Lexend",system-ui,sans-serif;font-size:14px}\
#hzNav .hzTab{position:fixed;top:12px;left:0;z-index:81;display:flex;align-items:center;gap:6px;height:44px;padding:0 12px 0 12px;border:0;border-radius:0 10px 10px 0;background:#1677ff;color:#fff;cursor:pointer;box-shadow:2px 2px 10px rgba(22,119,255,.45);font:600 14px/1 "Lexend",system-ui,sans-serif;transition:padding .15s,background .15s}\
#hzNav .hzTab:hover{background:#0f63d9;padding-left:16px}\
#hzNav .hzTab .hzCh{width:14px;height:14px}\
#hzNav svg{width:20px;height:20px;flex:none}\
#hzNav .hzDim{position:fixed;inset:0;z-index:82;background:rgba(0,0,0,.35);opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}\
#hzNav .hzPanel{position:fixed;top:0;left:0;bottom:0;z-index:83;width:' + W + 'px;max-width:85vw;background:var(--card,#fff);color:var(--tx,#111);box-shadow:4px 0 24px rgba(0,0,0,.3);transform:translateX(-105%);transition:transform .28s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow-y:auto}\
#hzNav.open .hzDim{opacity:1;visibility:visible}\
#hzNav.open .hzPanel{transform:translateX(0)}\
#hzNav.open .hzTab{visibility:hidden}\
#hzNav .hzHead{display:flex;align-items:stretch;background:#1677ff;color:#fff}\
#hzNav .hzMain{flex:1;display:flex;align-items:center;gap:10px;padding:16px 18px;color:#fff;text-decoration:none;font:600 15px/1 "Lexend",system-ui,sans-serif}\
#hzNav .hzMain:hover,#hzNav .hzX:hover{background:#0f63d9}\
#hzNav .hzX{border:0;background:transparent;color:#fff;font:400 26px/1 "Lexend",system-ui,sans-serif;padding:0 16px;cursor:pointer}\
#hzNav .hzList a{display:block;padding:14px 20px;color:inherit;text-decoration:none;white-space:nowrap;border-bottom:1px solid var(--line,#e6e6e6);font-weight:500}\
#hzNav .hzList a:hover{background:rgba(22,119,255,.12)}\
#hzNav .hzList a.cur{background:rgba(22,119,255,.14);color:#1677ff;font-weight:700;box-shadow:inset 4px 0 0 #1677ff;pointer-events:none}\
@media(prefers-reduced-motion:reduce){#hzNav .hzPanel,#hzNav .hzDim{transition:none}}\
@media(max-width:600px){body{padding-top:64px!important}}';

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>';
  var CHEV = '<svg class="hzCh" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';

  function norm(p) {
    p = p.replace(/index\.html$/i, "");
    if (p.charAt(p.length - 1) !== "/") p += "/";
    return p;
  }
  function isCur(itemPath, here) {
    itemPath = norm(itemPath);
    return itemPath === "/" ? here === "/" : here.indexOf(itemPath) === 0;
  }
  // Gộp DEFAULT + nav.json, bỏ trùng đường dẫn (DEFAULT được ưu tiên -> 3 trang chính luôn có mặt)
  function merge(base, extra) {
    var out = base.slice();
    extra.forEach(function (x) {
      if (!x || !x.path || !x.name) return;
      var xp = norm(x.path);
      if (!out.some(function (y) { return norm(y.path) === xp; })) out.push(x);
    });
    return out;
  }

  function build(items) {
    var here = norm(location.pathname);
    if (here === "/") return;   // Trang chủ đã có menu riêng -> không hiện nút này
    items = items.filter(function (i) { return norm(i.path) !== "/"; });
    // Trang hiện tại chưa có trong danh sách -> tự thêm vào
    if (!items.some(function (i) { return isCur(i.path, here); })) {
      var seg = here.split("/")[1];
      items = items.concat([{ name: document.title || seg, path: "/" + seg + "/" }]);
    }

    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement("div"); box.id = "hzNav";
    box.innerHTML =
      '<button type="button" class="hzTab" aria-expanded="false" aria-controls="hzPanel" aria-label="Mở menu">' + ICON + CHEV + '</button>' +
      '<div class="hzDim"></div>' +
      '<nav class="hzPanel" id="hzPanel" aria-label="Menu">' +
        '<div class="hzHead"><a class="hzMain" href="' + HOME.path + '">' + ICON + '<span>' + HOME.name + '</span></a>' +
        '<button type="button" class="hzX" aria-label="Đóng menu">&times;</button></div>' +
        '<div class="hzList"></div>' +
      '</nav>';
    var list = box.querySelector(".hzList"), tab = box.querySelector(".hzTab");
    items.forEach(function (it) {
      var a = document.createElement("a");
      a.href = it.path; a.textContent = it.name;
      if (isCur(it.path, here)) { a.className = "cur"; a.setAttribute("aria-current", "page"); }
      list.appendChild(a);
    });

    function setOpen(o) {
      box.classList.toggle("open", o); tab.setAttribute("aria-expanded", o);
      if (o) { var f = box.querySelector(".hzMain"); if (f) f.focus({ preventScroll: true }); }
    }
    try { sessionStorage.removeItem("hzNavOpen"); } catch (e) {}
    tab.addEventListener("click", function (e) { e.stopPropagation(); setOpen(true); });
    box.querySelector(".hzX").addEventListener("click", function () { setOpen(false); tab.focus(); });
    box.querySelector(".hzDim").addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("open")) { setOpen(false); tab.focus(); } });
    list.addEventListener("click", function () { setOpen(false); });
    window.addEventListener("pageshow", function () { setOpen(false); });   // Back/Forward: luôn đóng

    document.body.appendChild(box);
  }

  function start() {
    if (norm(location.pathname) === "/") return;   // Trang chủ: không hiện menu này
    fetch("/nav.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { return Array.isArray(j) ? merge(DEFAULT, j) : DEFAULT; })
      .catch(function () { return DEFAULT; })
      .then(build);
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
