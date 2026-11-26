(() => {
const $ = s => document.querySelector(s);
const KEY = 'orderbook.v1';
let O = JSON.parse(localStorage.getItem(KEY) || '[]');
let filter = 'all';
const save = () => localStorage.setItem(KEY, JSON.stringify(O));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = n => Number(n).toLocaleString('ar-EG');
const toEn = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const STATUS = {new:'جديد', shipped:'اتشحن', delivered:'اتسلم', returned:'مرتجع'};

// Pull the fields out of a pasted chat message. Egyptian mobiles: 01[0125]xxxxxxxx.
function parseMessage(raw){
  const text = toEn(raw);
  const phoneM = text.match(/(?:\+?20|0)?(1[0125]\d{8})/);
  const phone = phoneM ? '0' + phoneM[1] : '';
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  let total = '';
  const priceM = toEn(raw).match(/(?:السعر|الاجمالي|الإجمالي|اجمالي|total|المطلوب|بـ?)\s*[:\-]?\s*(\d{2,6})\s*(?:جنيه|ج|egp)?/i) || toEn(raw).match(/(\d{2,6})\s*(?:جنيه|ج\b|egp)/i);
  if (priceM) total = priceM[1];
  const isPhoneLine = l => /1[0125]\d{8}/.test(toEn(l).replace(/\D/g,''));
  const isPrice = l => /(السعر|الاجمالي|الإجمالي|اجمالي|total|جنيه|egp)/i.test(l);
  const isAddr = l => /(شارع|ش\.|عمارة|مدينة|القاهرة|الجيزة|اسكندرية|الإسكندرية|محافظة|حي|ميدان|برج|دور|شقة|-|،)/.test(l) && !isPhoneLine(l);
  let name = '', addr = '', items = [];
  lines.forEach((l, i) => {
    if (isPhoneLine(l) && !/\D/.test(l.replace(/[\s+\-()٠-٩0-9]/g,''))) return;
    if (!name && i === 0 && !isPhone(l) && !isPrice(l) && l.split(' ').length <= 4) { name = l.replace(/^(انا|أنا|اسمي|الاسم)\s*[:\-]?\s*/,''); return; }
    if (!addr && isAddr(l) && !/عايز|اريد|أريد|طلب/.test(l)) { addr = l; return; }
    if (isPrice(l)) { const rest = toEn(l).replace(/(السعر|الاجمالي|الإجمالي|اجمالي|total)?\s*[:\-]?\s*\d{2,6}\s*(جنيه|ج|egp)?/ig,'').trim(); if (rest.length > 2) items.push(rest); return; }
    items.push(l);
  });
  function isPhone(l){ return isPhoneLine(l); }
  return {name, phone, addr, items: items.join(' / ').replace(/^(عايز|عاوز|محتاج|اريد|أريد)\s*/,''), total};
}
function render(){
  const f = filter === 'all' ? O : O.filter(o => o.status === filter);
  const owed = O.filter(o => o.pay==='cod' && o.status==='shipped').reduce((s,o)=>s+o.total,0);
  const paidIn = O.filter(o => o.status==='delivered' || o.pay==='paid' && o.status!=='returned').reduce((s,o)=>s+o.total,0);
  const returns = O.filter(o => o.status==='returned').length;
  $('#stats').innerHTML = `<div><b>${num(O.length)}</b>كل الطلبات</div><div><b>${num(owed)} ج</b>كاش مع شركة الشحن</div><div><b>${num(paidIn)} ج</b>مبيعات اتأكدت</div><div><b>${num(returns)}</b>مرتجع</div>`;
  $('#filters').innerHTML = [['all','الكل'],...Object.entries(STATUS)].map(([k,v]) => `<button data-f="${k}" class="${filter===k?'on':''}">${v}</button>`).join('');
  $('#list').innerHTML = f.length ? f.slice().reverse().map(o => `<div class="ord">
    <b>${esc(o.name)}</b> · ${esc(o.phone)}<br><small>${esc(o.addr||'بدون عنوان')}</small><br>${esc(o.items)}<br>
    <b>${num(o.total)} ج</b> · ${o.pay==='paid'?'مدفوع':'كاش عند الاستلام'} ·
    <select data-s="${o.id}">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${o.status===k?'selected':''}>${v}</option>`).join('')}</select>
    <a class="wa" target="_blank" rel="noopener" href="https://wa.me/2${o.phone}?text=${encodeURIComponent('أهلا ' + o.name + '، طلبك (' + o.items + ') بإجمالي ' + o.total + ' جنيه: ' + STATUS[o.status])}">رسالة</a>
    <button data-d="${o.id}">حذف</button></div>`).join('') : '<p>مفيش طلبات.</p>';
}
$('#parse').onclick = () => {
  const r = parseMessage($('#raw').value); if(!$('#raw').value.trim()) return;
  $('#f').hidden = false; $('#name').value = r.name; $('#phone').value = r.phone; $('#addr').value = r.addr; $('#items').value = r.items; $('#total').value = r.total;
};
$('#f').addEventListener('submit', e => {
  e.preventDefault();
  O.push({id:Date.now(), name:$('#name').value.trim(), phone:toEn($('#phone').value).replace(/\D/g,''), addr:$('#addr').value.trim(), items:$('#items').value.trim(), total:+$('#total').value, pay:$('#pay').value, status:'new'});
  save(); e.target.reset(); e.target.hidden = true; $('#raw').value=''; render();
});
$('#list').addEventListener('change', e => { const id = e.target.dataset.s; if(!id) return; O.find(o=>o.id==id).status = e.target.value; save(); render(); });
$('#list').addEventListener('click', e => { const id = e.target.dataset.d; if(!id) return; O = O.filter(o=>o.id!=id); save(); render(); });
$('#filters').addEventListener('click', e => { if(e.target.dataset.f){ filter = e.target.dataset.f; render(); } });
$('#clear').onclick = () => { if(confirm('تمسح كل الطلبات؟')){ O=[]; save(); render(); } };
window.__parse = parseMessage;
render();
})();
