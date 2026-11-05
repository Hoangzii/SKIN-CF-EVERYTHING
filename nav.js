/* nav.js - Nút "Main Page" + dropdown dùng chung cho toàn bộ hoangzii.pages.dev
   Đặt file này ở thư mục gốc website: https://hoangzii.pages.dev/nav.js
   Mỗi trang chỉ cần thêm:  <script src="/nav.js"></script>  trước </body>
   Danh sách trang = DEFAULT bên dưới + các mục thêm trong /nav.json (không trùng đường dẫn).
   => Weapon, Skin, Weapon Sets LUÔN có trong dropdown, dù nav.json cũ hay thiếu.
   Thêm trang mới: thêm vào DEFAULT hoặc /nav.json, KHÔNG cần sửa các trang cũ.
   - Bấm chữ "Main Page" -> về trang chủ "/"
   - Rê chuột vào nút (hoặc bấm mũi tên) -> xổ danh sách các trang còn lại, từ trên xuống */
   (function () {
    if (window.__navLoaded) return; window.__navLoaded = true;
  
    var HOME = { name: "Main Page", path: "/" };
    var DEFAULT = [
      { name: "Weapon",       path: "/weapon/" },
      { name: "Skin",         path: "/skin/" },
      { name: "Weapon Sets",  path: "/sets/" }
    ];
  
    var css = '\
  #hzNav{position:fixed;top:10px;left:16px;z-index:80;font-family:"Lexend",system-ui,sans-serif;font-size:14px}\
  #hzNav .hzBtn{display:flex;align-items:stretch;height:40px;border-radius:8px;background:#1677ff;color:#fff;box-shadow:0 2px 8px rgba(22,119,255,.45);overflow:hidden}\
  #hzNav .hzMain{display:flex;align-items:center;gap:8px;padding:0 12px 0 12px;color:#fff;text-decoration:none;font:600 14px/1 "Lexend",system-ui,sans-serif}\
  #hzNav .hzArrow{display:flex;align-items:center;padding:0 10px;border:0;border-left:1px solid rgba(255,255,255,.35);background:transparent;color:#fff;cursor:pointer}\
  #hzNav .hzMain:hover,#hzNav .hzArrow:hover{background:#0f63d9}\
  #hzNav svg{width:18px;height:18px;flex:none}\
  #hzNav .hzCh{width:16px;height:16px;transition:transform .2s}\
  #hzNav.open .hzCh{transform:rotate(180deg)}\
  #hzNav .hzList{display:none;position:absolute;top:44px;left:0;min-width:100%;background:var(--card,#fff);color:var(--tx,#111);border:2px solid #1677ff;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.25);overflow:hidden}\
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
  
      // Bỏ "Main Page" khỏi danh sách (vì đã là nút chính)
      items = items.filter(function (i) { return norm(i.path) !== "/"; });
  
      // Tự nhận diện: trang hiện tại chưa có trong danh sách -> tự thêm vào
      if (!items.some(function (i) { return isCur(i.path, here); })) {
        var seg = here.split("/")[1];
        items = items.concat([{ name: document.title || seg, path: "/" + seg + "/" }]);
      }
  
      var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  
      var box = document.createElement("div"); box.id = "hzNav";
      box.innerHTML =
        '<div class="hzBtn">' +
          '<a class="hzMain" href="' + HOME.path + '">' + ICON + '<span>' + HOME.name + '</span></a>' +
          '<button type="button" class="hzArrow" aria-haspopup="true" aria-expanded="false" aria-label="Mở danh mục">' + CHEV + '</button>' +
        '</div><div class="hzList"></div>';
      var list = box.querySelector(".hzList");
  
      items.forEach(function (it) {
        var a = document.createElement("a");
        a.href = it.path; a.textContent = it.name;
        if (isCur(it.path, here)) a.className = "cur";
        list.appendChild(a);
      });
  
      var arrow = box.querySelector(".hzArrow");
      var canHover = window.matchMedia && matchMedia("(hover:hover)").matches;
      function setOpen(o) {
        box.classList.toggle("open", o); arrow.setAttribute("aria-expanded", o);
      }
      try { sessionStorage.removeItem("hzNavOpen"); } catch (e) {}   // xóa trạng thái cũ còn sót từ phiên bản trước
  
      if (canHover) {   // máy tính: rê chuột vào là mở, rời chuột ra vẫn giữ mở
        box.addEventListener("mouseenter", function () { setOpen(true); });
      }
      arrow.addEventListener("click", function (e) {   // bấm mũi tên để mở/đóng (dùng cho cảm ứng)
        e.stopPropagation();
        setOpen(!box.classList.contains("open"));
      });
      // Đóng khi bấm ra ngoài, nhấn Esc, hoặc bấm vào một mục trong danh sách
      document.addEventListener("click", function (e) { if (!box.contains(e.target)) setOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
      list.addEventListener("click", function () { setOpen(false); });
      // Quay lại bằng nút Back/Forward: trình duyệt có thể khôi phục trang cũ đang mở menu -> đóng lại
      window.addEventListener("pageshow", function () { setOpen(false); });
  
      document.body.appendChild(box);   // trang mới luôn bắt đầu ở trạng thái đóng
    }
  
    function start() {
      if (norm(location.pathname) === "/") return;   // Trang chủ: không hiện nút, chỉ áp dụng cho các trang con (weapon, skin, sets, ...)
      fetch("/nav.json", { cache: "no-cache" })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) { return Array.isArray(j) ? merge(DEFAULT, j) : DEFAULT; })
        .catch(function () { return DEFAULT; })
        .then(build);
    }
  
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  })();