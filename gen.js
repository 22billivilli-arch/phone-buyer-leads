const fs = require('fs');
const path = require('path');
const dir = __dirname;
let leads = JSON.parse(fs.readFileSync(path.join(dir, 'leads.json'), 'utf8'));

// ── 한국어 사전 ──────────────────────────────────────────────
const COUNTRY_KO = {
  'Canada':'캐나다','Hong Kong':'홍콩','Qatar':'카타르','United Arab Emirates':'아랍에미리트(UAE)',
  'United Kingdom':'영국','India':'인도','Japan':'일본','Saudi Arabia':'사우디아라비아','United States':'미국',
  'Hungary':'헝가리','Italy':'이탈리아','Australia':'호주','Brooklyn':'미국(브루클린)','Oman':'오만',
  'Manchester':'영국(맨체스터)','Kenya':'케냐','Switzerland':'스위스','Bangkok':'태국(방콕)','Singapore':'싱가포르',
  'Sharjah':'UAE(샤르자)','Mansoura':'이집트(만수라)','Bangladesh':'방글라데시','Brunei Darussalam':'브루나이',
  'Georgia':'조지아','Dubai':'UAE(두바이)','Netherlands':'네덜란드','Uzbekistan':'우즈베키스탄','Germany':'독일',
  'Afghanistan':'아프가니스탄','Van Nuys':'미국(밴나이스)','Poland':'폴란드','Trinidad and Tobago':'트리니다드토바고',
  'Bahrain':'바레인','Sri Lanka':'스리랑카','Kuwait':'쿠웨이트','Quetta':'파키스탄(퀘타)'
};
const PRODUCT_KO = {
  'Used Mobile Phone':'중고 휴대폰','Used Mobile':'중고폰','Mobile Phone And Used Phones':'휴대폰·중고폰',
  'Broken And Damaged Iphones':'파손·손상 아이폰','Used Mobile Phones':'중고 휴대폰','New Phones And Used Phones':'신품·중고폰',
  'Used Iphone':'중고 아이폰','Used Phones':'중고폰','Mobile Phone':'휴대폰',
  'Used Mobile Phones Like Used Iphone':'중고 휴대폰(중고 아이폰 등)','New And Refurbished Iphones':'신품·리퍼 아이폰',
  'Used Iphones':'중고 아이폰','Mobile Phones And Accessories Like Used Mobile Pho':'휴대폰·액세서리',
  'Vintage Mobile':'빈티지 휴대폰','Old Phone With Battery':'배터리 포함 구형폰','Used Cell Phone And Tablets':'중고 휴대폰·태블릿',
  'Refurbished Iphone Mobiles':'리퍼 아이폰','Used Phone Like Used Iphone':'중고폰(중고 아이폰 등)',
  'Used Ipads And Laptops':'중고 아이패드·노트북','Refurbished Mobile Phones':'리퍼 휴대폰','Used And Brand New Phone':'중고·신품폰',
  'Second Hand Mobile Phones':'중고 휴대폰','Used Iphone Mobile, Used Ipad':'중고 아이폰·아이패드','New And Used Mobile Phone':'신품·중고 휴대폰',
  'Used Smartphones':'중고 스마트폰','Used Phone':'중고폰','Refurbished Iphones':'리퍼 아이폰',
  'Mobile Phones And Accessories':'휴대폰·액세서리','Second Hand Iphones':'중고 아이폰','Used Phone Like Iphone':'중고폰(아이폰 등)',
  'Used Electronics Like Laptop, Phones And Computer':'중고 전자제품(노트북·폰·컴퓨터)',
  'Used And New Mobile Phones Like Redmi A4 Mobile':'중고·신품 휴대폰(레드미 A4 등)','Used And New Mobile Phones':'중고·신품 휴대폰',
  'Electronic Products Like Laptops, Headphones, Mobi':'전자제품(노트북·헤드폰 등)','Used Mobile Phones Like S25 Ultra':'중고 휴대폰(S25 울트라 등)',
  'Used A+ Condition Mobile Phone':'A+급 중고 휴대폰','Second Hand Mobile Phone':'중고 휴대폰','Used I Pads':'중고 아이패드',
  'Used Mobiles':'중고폰','Used Iphone Kits':'중고 아이폰 키트'
};
function payKo(p){
  const t=(p||'').trim().toLowerCase();
  if(t==='bank transfer'||t==='wire transfer') return {ko:'계좌이체',g:'계좌이체'};
  if(t==='t/t'||t==='tt') return {ko:'T/T(전신환)',g:'T/T'};
  if(t==='l/c'||t==='lc') return {ko:'L/C(신용장)',g:'L/C'};
  if(t==='l/c or t/t'||t==='t/t or l/c') return {ko:'L/C 또는 T/T',g:'L/C·T/T'};
  return {ko:p||'',g:p||'기타'};
}
function qtyKo(q){
  return (q||'').replace(/Unit\/Units|Units|Unit/gi,'개').replace(/Pieces|Piece|Pcs/gi,'피스')
    .replace(/Sets|Set/gi,'세트').replace(/Containers?/gi,'컨테이너').replace(/\bFCL\b/gi,'FCL').trim();
}
// 스펙: 용어 치환(모델명·브랜드는 원문 유지)
const SPEC_RULES = [
  [/Second\s*Hand|Secondhand/gi,'중고'],[/Cracked Screen/gi,'액정파손'],[/Broken Body/gi,'본체파손'],
  [/Faulty Battery/gi,'배터리불량'],[/Water Damaged?/gi,'침수'],[/Battery Health/gi,'배터리성능'],
  [/Certified Pre-?Owned/gi,'인증중고(CPO)'],[/Pre-?owned/gi,'중고'],[/Factory Unlocked/gi,'공장언락'],[/Unlocked/gi,'언락'],
  [/Refurbished/gi,'리퍼'],[/Warr[ae]nty/gi,'보증'],[/In Reusable Condition/gi,'재사용가능'],[/Working Condition/gi,'작동상태'],
  [/Wholesale price/gi,'도매가'],[/Stock availability/gi,'재고여부'],[/Company Details/gi,'회사정보'],
  [/Pictures? Required/gi,'사진필요'],[/Photos?\/videos?/gi,'사진/영상'],[/In Bulk/gi,'대량'],
  [/European Standard/gi,'유럽규격'],[/CE Marking/gi,'CE인증'],[/No Advance Payment/gi,'선금없음'],
  [/Packaging Terms?/gi,'포장조건'],[/Packaging/gi,'포장'],
  [/Smartphones?/gi,'스마트폰'],[/\bTablets?\b/gi,'태블릿'],[/\bLaptops?\b/gi,'노트북'],[/\bAbove\b/gi,'이상'],
  [/\bStorage\b/gi,'용량'],[/\bCarrier\b/gi,'통신사'],[/\bMobile Phones?\b/gi,'휴대폰'],[/\bCell Phones?\b/gi,'휴대폰'],
  [/\bPhones\b/gi,'폰'],[/\bMobiles?\b/gi,'휴대폰'],
  [/\bTypes?\b/gi,'종류'],[/\bBr[ae]nds?\b/gi,'브랜드'],
  [/\bModels?\b/gi,'모델'],[/\bGrade\b/gi,'등급'],[/\bCondition\b/gi,'상태'],[/\bQuantity\b|\bQty\b/gi,'수량'],
  [/\bOrigin\b/gi,'원산지'],[/\bMaterial\b/gi,'재질'],[/\bUses\b/gi,'용도'],[/\bStyle\b/gi,'스타일'],
  [/\bLatest\b/gi,'최신'],[/\bWeekly\b/gi,'주간'],[/\bMonthly\b/gi,'월간'],[/\bEach\b/gi,'각'],
  [/\bLater\b/gi,'추후'],[/\bInitially\b/gi,'초기'],[/\bAll Models\b/gi,'전 모델'],[/\bAssorted\b/gi,'혼합'],
  [/\bUsed\b/gi,'중고'],[/\bNew\b/gi,'신품'],[/\bOnly\b/gi,'만'],[/\bBoth Welcome\b/gi,'둘 다 가능'],
  [/\bWelcomed?\b/gi,'환영'],[/\bLike\b/gi,'예:'],[/\bEtc\b\.?/gi,'등'],[/\bDiff(erent)?\b/gi,'여러'],
  [/\bmin(imum)?\b/gi,'최소'],[/\bWarranty\b/gi,'보증'],[/\bAnd\b/gi,','],[/\bOr\b/gi,'또는'],[/\bWith\b/gi,'/']
];
function specKo(s){
  if(!s) return '';
  let t=' '+s+' ';
  SPEC_RULES.forEach(([re,rep])=>{ t=t.replace(re,rep); });
  return t.replace(/\s*,\s*,\s*/g,', ').replace(/\s+/g,' ').replace(/\s*:\s*/g,': ').trim();
}

const TARGET = ['United Arab Emirates','Saudi Arabia','Qatar','Bahrain','Kuwait','Oman','Jordan','Nigeria','Ghana','Kenya','Egypt','Tanzania','India','Bangladesh','Pakistan','Sri Lanka','Hong Kong','Vietnam','Philippines','Iraq','Dubai','Sharjah','Mansoura','Quetta'];
leads.forEach(l => {
  const nums = (String(l.qty || '').match(/[0-9][0-9,]*/g) || []).map(n => +n.replace(/,/g, ''));
  l.qtyNum = nums.length ? Math.max.apply(null, nums) : 0;
  l.target = TARGET.indexOf(l.country) !== -1;
  l.dateSort = new Date(l.date).getTime() || 0;
  l.ctyKo = COUNTRY_KO[l.country] || l.country || '기타';
  l.prodKo = PRODUCT_KO[l.product] || l.product || '중고 휴대폰';
  const pk = payKo(l.pay); l.payKoTxt = pk.ko; l.payG = pk.g;
  l.qtyKo = qtyKo(l.qty);
  l.specKo = specKo(l.specs);
  const mm = (l.url || '').match(/buyleads\/(\d+)\/(.+)$/);
  l.origUrl = mm ? 'https://www.go4worldbusiness.com/buylead/view/' + mm[1] + '/' + mm[2] + '.html' : '';
});

const byC = {};
leads.forEach(l => { byC[l.ctyKo] = (byC[l.ctyKo] || 0) + 1; });
const countries = Object.keys(byC).map(c => [c, byC[c]]).sort((a, b) => b[1] - a[1]);
const targetKo = {}; leads.forEach(l => { if (l.target) targetKo[l.ctyKo] = 1; });

const DATA = JSON.stringify(leads);
const CHIPS = JSON.stringify(countries);
const TGT = JSON.stringify(targetKo);

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
.search{flex:1;min-width:200px;position:relative;}
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
.qty b{font-size:19px;font-weight:800;font-variant-numeric:tabular-nums;color:var(--ink);letter-spacing:-.01em;}
.qty .lbl{font-size:12px;color:var(--muted);font-weight:600;}
.meta{display:flex;flex-wrap:wrap;gap:6px;}
.tag{font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:6px;background:var(--border2);color:var(--ink2);}
.tag.g{background:#e7f5ec;color:#1c7a44;}
.tag.p{background:#eaf2fb;color:#2b6cb0;}
.tag.hs{background:#eef1f6;color:#4a5a70;font-variant-numeric:tabular-nums;}
.specs{font-size:12.5px;color:var(--muted);line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.btn{margin-top:auto;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--accent);color:#fff;border-radius:10px;padding:11px;font-size:14px;font-weight:700;text-decoration:none;transition:.14s;}
.btn:hover{background:var(--accent-d);}
.btn:focus-visible,.btn2:focus-visible{outline:3px solid rgba(10,132,194,.35);outline-offset:2px;}
.btn2{display:flex;align-items:center;justify-content:center;gap:5px;color:var(--muted);font-size:12.5px;font-weight:600;text-decoration:none;padding:7px;margin-top:-2px;border-radius:8px;transition:.14s;}
.btn2:hover{color:var(--accent);background:var(--chip);}
.empty{grid-column:1/-1;text-align:center;color:var(--muted);padding:60px 20px;font-size:15px;}
.foot{margin-top:34px;color:var(--muted);font-size:12.5px;border-top:1px solid var(--border);padding-top:16px;line-height:1.7;}
@media (max-width:560px){.wrap{padding:20px 14px 48px;}.grid{grid-template-columns:1fr;}}
</style>`;

const BODY = `
<div class="wrap">
<header>
  <div class="eyebrow">go4world &middot; 중고 휴대폰 바이어</div>
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
    <input id="q" placeholder="제품·스펙·국가 검색 (예: 아이폰, 등급 A, 두바이)"></label>
  <select id="qtyf">
    <option value="">수량 전체</option>
    <option value="0-100">~100개</option>
    <option value="100-1000">100~1,000개</option>
    <option value="1000-10000">1,000~10,000개</option>
    <option value="10000-">10,000개 이상</option>
  </select>
  <select id="payf"><option value="">결제방식 전체</option></select>
  <select id="sort">
    <option value="date">최신순</option>
    <option value="qty">수량 많은순</option>
    <option value="tgt">타겟국 먼저</option>
  </select>
</div>
<div class="count" id="count"></div>
<div class="grid" id="grid"></div>
<div class="foot">🎯 타겟국 = HK 수출 우선지역(중동·아프리카·남아시아·홍콩 등). &middot; 데이터는 go4world 공개 리드에서 수집(연락처 제외). &middot; 스펙은 자동 번역이라 모델명·브랜드는 원문으로 표시됩니다.</div>
</div>`;

const SCRIPT_BODY = [
"var $=function(id){return document.getElementById(id);};",
"$('s-total').textContent=LEADS.length;",
"$('s-cty').textContent=COUNTRIES.length;",
"$('s-tgt').textContent=LEADS.filter(function(l){return l.target;}).length;",
"var curCty='',curSort='date',curQ='',curQty='',curPay='';",
"function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');}",
"var ch='<button class=\"chip on\" data-c=\"\">전체 <span class=\"n\">'+LEADS.length+'</span></button>';",
"COUNTRIES.forEach(function(x){ch+='<button class=\"chip'+(TGT[x[0]]?' tgt':'')+'\" data-c=\"'+esc(x[0])+'\">'+(TGT[x[0]]?'🎯 ':'')+esc(x[0])+' <span class=\"n\">'+x[1]+'</span></button>';});",
"$('chips').innerHTML=ch;",
"var pays={};LEADS.forEach(function(l){if(l.payG)pays[l.payG]=(pays[l.payG]||0)+1;});",
"var po='<option value=\"\">결제방식 전체</option>';Object.keys(pays).sort(function(a,b){return pays[b]-pays[a];}).forEach(function(p){po+='<option value=\"'+esc(p)+'\">'+esc(p)+' ('+pays[p]+')</option>';});$('payf').innerHTML=po;",
"$('chips').addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;curCty=b.getAttribute('data-c');var k=$('chips').children;for(var i=0;i<k.length;i++)k[i].classList.toggle('on',k[i]===b);render();});",
"$('q').addEventListener('input',function(e){curQ=e.target.value.toLowerCase().trim();render();});",
"$('qtyf').addEventListener('change',function(e){curQty=e.target.value;render();});",
"$('payf').addEventListener('change',function(e){curPay=e.target.value;render();});",
"$('sort').addEventListener('change',function(e){curSort=e.target.value;render();});",
"function render(){",
"  var f=LEADS.filter(function(l){",
"    if(curCty&&l.ctyKo!==curCty)return false;",
"    if(curPay&&l.payG!==curPay)return false;",
"    if(curQty){var pr=curQty.split('-'),mn=+pr[0],mx=pr[1]===''?Infinity:+pr[1];if(!(l.qtyNum>=mn&&l.qtyNum<mx))return false;}",
"    if(curQ){var hay=((l.prodKo||'')+' '+(l.product||'')+' '+(l.ctyKo||'')+' '+(l.country||'')+' '+(l.specKo||'')+' '+(l.specs||'')+' '+(l.grade||'')).toLowerCase();if(hay.indexOf(curQ)<0)return false;}",
"    return true;});",
"  if(curSort==='date')f.sort(function(a,b){return b.dateSort-a.dateSort;});",
"  else if(curSort==='qty')f.sort(function(a,b){return b.qtyNum-a.qtyNum;});",
"  else f.sort(function(a,b){return (b.target-a.target)||(b.dateSort-a.dateSort);});",
"  $('count').textContent=f.length+'건 표시'+(curCty?' · '+curCty:'');",
"  if(!f.length){$('grid').innerHTML='<div class=\"empty\">조건에 맞는 리드가 없어요.</div>';return;}",
"  $('grid').innerHTML=f.map(function(l){",
"    var meta=[l.grade?'<span class=\"tag g\">등급 '+esc(l.grade)+'</span>':'',l.payKoTxt?'<span class=\"tag p\">'+esc(l.payKoTxt)+'</span>':'',l.hs?'<span class=\"tag hs\">HS '+esc(l.hs)+'</span>':''].join('');",
"    return '<div class=\"card\">'+",
"      '<div class=\"card-top\"><span class=\"cty'+(l.target?' tgt':'')+'\">'+(l.target?'🎯 ':'📍 ')+esc(l.ctyKo||'-')+'</span><span class=\"date\">'+esc(l.date||'')+'</span></div>'+",
"      '<div class=\"pname\">'+esc(l.prodKo||'중고 휴대폰')+'</div>'+",
"      (l.qtyKo?'<div class=\"qty\"><span class=\"lbl\">수량</span><b>'+esc(l.qtyKo)+'</b></div>':'')+",
"      (meta?'<div class=\"meta\">'+meta+'</div>':'')+",
"      (l.specKo?'<div class=\"specs\">'+esc(l.specKo)+'</div>':'')+",
"      '<a class=\"btn\" href=\"'+esc(l.url)+'\" target=\"_blank\" rel=\"noopener\">지금 문의하세요 →</a>'+",
"      (l.origUrl?'<a class=\"btn2\" href=\"'+esc(l.origUrl)+'\" target=\"_blank\" rel=\"noopener\">원문 링크 보러가기 ↗</a>':'')+",
"    '</div>';",
"  }).join('');",
"}",
"render();"
].join("\n");

const SCRIPT = '<script>\nvar LEADS=' + DATA + ';\nvar COUNTRIES=' + CHIPS + ';\nvar TGT=' + TGT + ';\n' + SCRIPT_BODY + '\n<\/script>';

fs.writeFileSync(path.join(dir, 'index.html'), CSS + BODY + SCRIPT);
console.log('생성 완료: ' + leads.length + '건, ' + countries.length + '개국, 결제그룹=' + [...new Set(leads.map(l=>l.payG))].join(','));
