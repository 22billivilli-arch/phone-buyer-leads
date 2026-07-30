const fs = require('fs');
const path = require('path');
const dir = __dirname;
let leads = JSON.parse(fs.readFileSync(path.join(dir, 'leads.json'), 'utf8'));

const TARGET = ['United Arab Emirates','Saudi Arabia','Qatar','Bahrain','Kuwait','Oman','Jordan','Nigeria','Ghana','Kenya','Egypt','Tanzania','India','Bangladesh','Pakistan','Sri Lanka','Hong Kong','Vietnam','Philippines','Iraq'];
leads.forEach(l => {
  const nums = (String(l.qty || '').match(/[0-9][0-9,]*/g) || []).map(n => +n.replace(/,/g, ''));
  l.qtyNum = nums.length ? Math.max.apply(null, nums) : 0;
  l.target = TARGET.indexOf(l.country) !== -1;
  l.dateSort = new Date(l.date).getTime() || 0;
});
const byC = {};
leads.forEach(l => { if (l.country) byC[l.country] = (byC[l.country] || 0) + 1; });
const countries = Object.keys(byC).map(c => [c, byC[c]]).sort((a, b) => b[1] - a[1]);

const DATA = JSON.stringify(leads);
const CHIPS = JSON.stringify(countries);

const CSS = `<style>
:root{
  --ink:#10233a; --ink2:#33475f; --muted:#6b7c90; --accent:#0a84c2; --accent-d:#0866a0;
  --ground:#f5f8fb; --surface:#ffffff; --border:#dde5ee; --border2:#eaf0f6;
  --target:#c67815; --target-bg:#fdf3e3; --chip:#eef4fa; --shadow:0 1px 2px rgba(16,35,58,.05),0 4px 16px rgba(16,35,58,.06);
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);
  font-family:'Pretendard','Pretendard Variable',-apple-system,BlinkMacSystemFont,'Segoe UI','Malgun Gothic',system-ui,sans-serif;
  line-height:1.5;-webkit-font-smoothing:antialiased;}
.wrap{max-width:1180px;margin:0 auto;padding:28px 20px 64px;}
header{margin-bottom:22px;}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:8px;}
h1{font-size:clamp(24px,3.4vw,34px);font-weight:800;letter-spacing:-.02em;margin:0 0 8px;text-wrap:balance;}
.sub{color:var(--muted);font-size:15px;max-width:70ch;}
.sub b{color:var(--ink2);}
.notice{margin-top:14px;background:#eef6fc;border:1px solid #cfe6f6;color:#0b5a86;border-radius:10px;padding:11px 14px;font-size:13.5px;display:flex;gap:9px;align-items:flex-start;}
.notice b{color:#08466a;}
.stats{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 6px;align-items:center;}
.stat{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:9px 14px;font-size:13px;color:var(--muted);}
.stat b{color:var(--ink);font-size:19px;font-weight:800;font-variant-numeric:tabular-nums;margin-right:5px;}
.section-label{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:22px 0 10px;}
.chips{display:flex;flex-wrap:wrap;gap:7px;}
.chip{border:1px solid var(--border);background:var(--surface);color:var(--ink2);border-radius:999px;padding:6px 13px;font-size:13px;cursor:pointer;transition:.14s;font-weight:600;display:inline-flex;gap:6px;align-items:center;}
.chip:hover{border-color:var(--accent);color:var(--accent);}
.chip .n{color:var(--muted);font-variant-numeric:tabular-nums;font-weight:700;}
.chip.on{background:var(--accent);border-color:var(--accent);color:#fff;}
.chip.on .n{color:#cfe9f7;}
.chip.tgt{border-color:#eed6b0;}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:20px 0 8px;position:sticky;top:0;background:var(--ground);padding:10px 0;z-index:5;border-bottom:1px solid var(--border2);}
.search{flex:1;min-width:220px;position:relative;}
.search input{width:100%;border:1px solid var(--border);border-radius:10px;padding:11px 14px 11px 38px;font-size:14px;background:var(--surface);color:var(--ink);font-family:inherit;outline:none;}
.search input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(10,132,194,.12);}
.search svg{position:absolute;left:12px;top:12px;width:16px;height:16px;color:var(--muted);}
select{border:1px solid var(--border);border-radius:10px;padding:11px 12px;font-size:14px;background:var(--surface);color:var(--ink);font-family:inherit;cursor:pointer;outline:none;}
.count{color:var(--muted);font-size:13.5px;margin:2px 0 14px;font-variant-numeric:tabular-nums;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px 16px 14px;display:flex;flex-direction:column;gap:10px;box-shadow:var(--shadow);transition:.15s;}
.card:hover{border-color:#c3d4e6;transform:translateY(-1px);}
.card-top{display:flex;justify-content:space-between;align-items:center;gap:8px;}
.cty{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;color:var(--accent-d);background:var(--chip);border-radius:999px;padding:4px 10px;}
.cty.tgt{color:var(--target);background:var(--target-bg);}
.date{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums;letter-spacing:.01em;}
.pname{font-size:16.5px;font-weight:800;letter-spacing:-.01em;line-height:1.3;color:var(--ink);}
.qty{display:flex;align-items:baseline;gap:6px;}
.qty b{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums;color:var(--ink);letter-spacing:-.01em;}
.meta{display:flex;flex-wrap:wrap;gap:6px;}
.tag{font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:6px;background:var(--border2);color:var(--ink2);}
.tag.g{background:#e7f5ec;color:#1c7a44;}
.tag.hs{background:#eef1f6;color:#4a5a70;font-variant-numeric:tabular-nums;}
.specs{font-size:12.5px;color:var(--muted);line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.btn{margin-top:auto;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--accent);color:#fff;border-radius:10px;padding:11px;font-size:14px;font-weight:700;text-decoration:none;transition:.14s;}
.btn:hover{background:var(--accent-d);}
.btn:focus-visible{outline:3px solid rgba(10,132,194,.35);outline-offset:2px;}
.empty{grid-column:1/-1;text-align:center;color:var(--muted);padding:60px 20px;font-size:15px;}
.foot{margin-top:34px;color:var(--muted);font-size:12.5px;border-top:1px solid var(--border);padding-top:16px;line-height:1.7;}
@media (max-width:560px){.wrap{padding:20px 14px 48px;}.grid{grid-template-columns:1fr;}}
</style>`;

const BODY = `
<div class="wrap">
<header>
  <div class="eyebrow">go4world &middot; Used Mobile Phones</div>
  <h1>글로벌 중고폰 바이어 리드</h1>
  <div class="sub">전 세계 바이어들이 올린 중고폰&middot;아이폰&middot;파손폰 구매 요청입니다. 관심 리드의 <b>지금 문의하세요</b>를 누르면 해당 바이어에게 바로 견적 문의를 보낼 수 있습니다.</div>
  <div class="notice"><span>🔒</span><div><b>연락처는 go4world 로그인 후 열립니다.</b> 로그인 상태에서 <b>지금 문의하세요</b>를 누르면 해당 바이어의 문의 폼으로 이동합니다. (새 탭에서 열림)</div></div>
</header>
<div class="stats">
  <div class="stat"><b id="s-total">0</b>건 리드</div>
  <div class="stat"><b id="s-cty">0</b>개국</div>
  <div class="stat"><b id="s-tgt">0</b>건 🎯 타겟국</div>
  <div class="stat">수집: go4world 1~6페이지</div>
</div>
<div class="section-label">국가로 필터</div>
<div class="chips" id="chips"></div>
<div class="toolbar">
  <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
    <input id="q" placeholder="제품·스펙·국가 검색 (예: iPhone, Grade A, Dubai)"></label>
  <select id="sort">
    <option value="date">최신순</option>
    <option value="qty">수량 많은순</option>
    <option value="tgt">타겟국 먼저</option>
  </select>
</div>
<div class="count" id="count"></div>
<div class="grid" id="grid"></div>
<div class="foot">🎯 타겟국 = HK 수출 우선지역(중동·아프리카·남아시아·홍콩 등). &middot; 데이터는 go4world 공개 리드에서 수집(연락처 제외). &middot; 더 많은 페이지·다른 품목(파손폰/부품 등)도 추가 가능합니다.</div>
</div>`;

const SCRIPT_BODY = [
"var $=function(id){return document.getElementById(id);};",
"$('s-total').textContent=LEADS.length;",
"$('s-cty').textContent=COUNTRIES.length;",
"$('s-tgt').textContent=LEADS.filter(function(l){return l.target;}).length;",
"var TARGET={};LEADS.forEach(function(l){if(l.target)TARGET[l.country]=1;});",
"var curCty='',curSort='date',curQ='';",
"function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');}",
"var ch='<button class=\"chip on\" data-c=\"\">전체 <span class=\"n\">'+LEADS.length+'</span></button>';",
"COUNTRIES.forEach(function(x){ch+='<button class=\"chip'+(TARGET[x[0]]?' tgt':'')+'\" data-c=\"'+esc(x[0])+'\">'+(TARGET[x[0]]?'🎯 ':'')+esc(x[0])+' <span class=\"n\">'+x[1]+'</span></button>';});",
"$('chips').innerHTML=ch;",
"$('chips').addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;curCty=b.getAttribute('data-c');var kids=$('chips').children;for(var i=0;i<kids.length;i++)kids[i].classList.toggle('on',kids[i]===b);render();});",
"$('q').addEventListener('input',function(e){curQ=e.target.value.toLowerCase().trim();render();});",
"$('sort').addEventListener('change',function(e){curSort=e.target.value;render();});",
"function render(){",
"  var f=LEADS.filter(function(l){",
"    if(curCty&&l.country!==curCty)return false;",
"    if(curQ){var hay=((l.product||'')+' '+(l.country||'')+' '+(l.specs||'')+' '+(l.grade||'')).toLowerCase();if(hay.indexOf(curQ)<0)return false;}",
"    return true;});",
"  if(curSort==='date')f.sort(function(a,b){return b.dateSort-a.dateSort;});",
"  else if(curSort==='qty')f.sort(function(a,b){return b.qtyNum-a.qtyNum;});",
"  else f.sort(function(a,b){return (b.target-a.target)||(b.dateSort-a.dateSort);});",
"  $('count').textContent=f.length+'건 표시'+(curCty?' · '+curCty:'');",
"  if(!f.length){$('grid').innerHTML='<div class=\"empty\">조건에 맞는 리드가 없어요.</div>';return;}",
"  $('grid').innerHTML=f.map(function(l){",
"    var meta=[l.grade?'<span class=\"tag g\">Grade '+esc(l.grade)+'</span>':'',l.pay?'<span class=\"tag\">'+esc(l.pay)+'</span>':'',l.hs?'<span class=\"tag hs\">HS '+esc(l.hs)+'</span>':''].join('');",
"    return '<div class=\"card\">'+",
"      '<div class=\"card-top\"><span class=\"cty'+(l.target?' tgt':'')+'\">'+(l.target?'🎯 ':'📍 ')+esc(l.country||'-')+'</span><span class=\"date\">'+esc(l.date||'')+'</span></div>'+",
"      '<div class=\"pname\">'+esc(l.product||'Used Mobile Phone')+'</div>'+",
"      (l.qty?'<div class=\"qty\"><b>'+esc(l.qty)+'</b></div>':'')+",
"      (meta?'<div class=\"meta\">'+meta+'</div>':'')+",
"      (l.specs?'<div class=\"specs\">'+esc(l.specs)+'</div>':'')+",
"      '<a class=\"btn\" href=\"'+esc(l.url)+'\" target=\"_blank\" rel=\"noopener\">지금 문의하세요 →</a>'+",
"    '</div>';",
"  }).join('');",
"}",
"render();"
].join("\n");

const SCRIPT = '<script>\nvar LEADS=' + DATA + ';\nvar COUNTRIES=' + CHIPS + ';\n' + SCRIPT_BODY + '\n<\/script>';

const html = CSS + BODY + SCRIPT;
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('생성 완료: index.html (' + html.length + ' bytes, ' + leads.length + ' leads, ' + countries.length + ' countries)');
