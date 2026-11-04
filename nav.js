/* nav.js - Nút "Danh mục" dùng chung cho toàn bộ hoangzii.pages.dev
   Đặt file này ở thư mục gốc website: https://hoangzii.pages.dev/nav.js
   Mỗi trang chỉ cần thêm:  <script src="/nav.js"></script>  trước </body>
   Muốn thêm trang mới: sửa file /nav.json (hoặc DEFAULT bên dưới), KHÔNG cần sửa các trang cũ. */
(function () {
  if (window.__navLoaded) return; window.__navLoaded = true;

  var DEFAULT = [
    { name: "Main Page", path: "/" },
    { name: "Weapon",    path: "/weapon/" },
    { name: "Skin",      path: "/skin/" }
  ];

  var css = '\
#hzNav{position:fixed;top:10px;left:16px;z-index:80;font-family:"Lexend",system-ui,sans-serif;font-size:14px}\
#hzNav .hzBtn{display:flex;align-items:center;gap:8px;height:40px;padding:0 14px 0 12px;border:0;border-radius:8px;background:#1677ff;color:#fff;font:600 14px/1 "Lexend",system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(22,119,255,.45);transition:background .15s}\
#hzNav .hzBtn:hover{background:#0f63d9}\
#hzNav .hzBtn svg{width:18px;height:18px;flex:none}\
#hzNav .hzBtn .hzCh{width:16px;height:16px;transition:transform .2s}\
#hzNav.open .hzCh{transform:rotate(180deg)}\
#hzNav .hzList{display:none;position:absolute;top:44px;left:0;min-width:190px;background:var(--card,#fff);color:var(--tx,#111);border:2px solid #1677ff;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.25);overflow:hidden}\
#hzNav.open .hzList{display:block}\
#hzNav.open::after{content:"";position:absolute;left:0;right:0;top:38px;height:10px}\
#hzNav .hzList a{display:block;padding:11px 16px;color:inherit;text-decoration:none;white-space:nowrap;border-bottom:1px solid var(--line,#e6e6e6)}\
#hzNav .hzList a:last-child{border-bottom:0}\
#hzNav .hzList a:hover{background:rgba(22,119,255,.12)}\
#hzNav .hzList a.cur{background:#1677ff;color:#fff;font-weight:600;pointer-events:none}\
@media(max-width:600px){body{padding-top:64px!important}}';

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>';
  var CHEV = '<svg class="hzCh" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

  function norm(p) {
    p = p.replace(/index\.html$/i, "");
    if (p.charAt(p.length - 1) !== "/") p += "/";
    return p;
  }

  function isCur(itemPath, here) {
    itemPath = norm(itemPath);
    return itemPath === "/" ? here === "/" : here.indexOf(itemPath) === 0;
  }

  function build(items) {
    var here = norm(location.pathname);

    // Tự nhận diện: trang hiện tại chưa có trong danh sách -> tự thêm vào
    if (here !== "/" && !items.some(function (i) { return isCur(i.path, here); })) {
      var seg = here.split("/")[1];
      items = items.concat([{ name: document.title || seg, path: "/" + seg + "/" }]);
    }

    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

    var box = document.createElement("div"); box.id = "hzNav";
    box.innerHTML = '<button type="button" class="hzBtn" aria-haspopup="true" aria-expanded="false">' + ICON + '<span>Category</span>' + CHEV + '</button><div class="hzList"></div>';
    var list = box.querySelector(".hzList");

    items.forEach(function (it) {
      var a = document.createElement("a");
      a.href = it.path; a.textContent = it.name;
      if (isCur(it.path, here)) a.className = "cur";
      list.appendChild(a);
    });

    var btn = box.querySelector(".hzBtn");
    var canHover = window.matchMedia && matchMedia("(hover:hover)").matches;
    function setOpen(o) { box.classList.toggle("open", o); btn.setAttribute("aria-expanded", o); }

    if (canHover) {                       // máy tính: rê chuột là xổ xuống, chỉ đóng khi bấm ra ngoài hoặc nhấn Esc
      box.addEventListener("mouseenter", function () { setOpen(true); });   // rê chuột vào -> mở, rời chuột ra vẫn giữ mở
    }
    btn.addEventListener("click", function (e) {   // điện thoại/cảm ứng: bấm để mở/đóng
      e.stopPropagation();
      if (!canHover) setOpen(!box.classList.contains("open"));
    });
    document.addEventListener("click", function (e) { if (!box.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

    document.body.appendChild(box);
  }

  function start() {
    fetch("/nav.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { return Array.isArray(j) && j.length ? j : DEFAULT; })
      .catch(function () { return DEFAULT; })
      .then(build);
  }

  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
