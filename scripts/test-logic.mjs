// Checks for the price timeline. Run: node scripts/test-logic.mjs
globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = undefined;
const { state } = await import('../js/store.js');
const L = await import('../js/logic.js');
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) { console.log('FAIL', m, a, b); process.exitCode = 1 } else console.log('ok  ', m) };
state.monthPrice = { '2026-10': 20 }; state.priceChanges = {};
eq(L.priceOn('2026-10-20'), 20, 'plain month price');
eq(L.priceOn('2026-11-05'), 20, 'next month inherits');
state.priceChanges = { '2026-10-15': 25 };
eq([L.priceOn('2026-10-14'), L.priceOn('2026-10-15'), L.priceOn('2026-10-31')], [20, 25, 25], 'change applies from its day');
eq(L.priceOn('2026-11-01'), 25, 'next month inherits the changed price');
state.monthPrice['2026-11'] = 30;
eq([L.priceOn('2026-11-01'), L.priceOn('2026-11-20')], [30, 30], 'own month price overrides carry-over');
eq(L.monthChanges('2026-10'), [['2026-10-15', 25]], 'monthChanges lists this month only');
state.days = { '2026-10-16': { price: 99 }, '2026-10-17': { missed: true } };
const s = L.monthSummary(2026, 9, new Date(2026, 9, 18));
// 14 days at 20 (1-14) + day15 25 + day16 special 99 + day17 missed 0 + day18 25 = 280+25+99+0+25 = 429
eq(s.total, 429, 'month total mixes change, special and missed');
eq(L.priceOn('2026-09-10'), 0, 'before any price is 0');

// ── Bill message ──────────────────────────────────────────────────────────────
const { billText } = await import('../js/bill.js');
state.billLang = 'en'; state.trackMissed = true; state.milkman = '';
state.monthPrice = { '2026-10': 20 }; state.priceChanges = { '2026-10-15': 25 };
state.days = { '2026-10-03': { missed: true }, '2026-10-07': { missed: true }, '2026-10-20': { price: 60 } };
const full = new Date(2026, 10, 5); // viewing October from November: the month is final
eq(billText(2026, 9, { now: full }).split('\n'), [
  'Milk bill', 'October 2026 (1–31 Oct)', '──────────',
  '12 days × ₹20 = ₹240', '16 days × ₹25 = ₹400 (from 15 Oct)',
  'Special price: 20 Oct ₹60', 'No milk: 2 days (3, 7 Oct)', '──────────', 'Total: ₹700'], 'bill: full month, every line adds up');
// the lines must add up to the same total the app shows
const sumLines = txt => txt.split('\n').reduce((a, l) => { const m = l.match(/= ₹([\d,]+)/); return m ? a + +m[1].replace(/,/g, '') : a; }, 0) + 60;
eq(sumLines(billText(2026, 9, { now: full })), L.monthSummary(2026, 9, new Date(2026, 9, 31)).total, 'bill: itemised lines equal the total');
const mid = billText(2026, 9, { now: new Date(2026, 9, 12), bold: true, link: 'https://x.app/' }).split('\n');
eq([mid[0], mid[1], mid[3], mid.at(-1)], ['*Milk bill*', 'October 2026 (1–12 Oct)', '10 days × ₹20 = ₹200', 'https://x.app/'], 'bill: current month stops today, bold + link');
eq(mid.includes('*Total: ₹200*'), true, 'bill: total bolded for WhatsApp');
state.milkman = ' Ramesh ';
eq(billText(2026, 9, { now: full }).split('\n')[1], 'Ramesh · October 2026 (1–31 Oct)', 'bill: name from Settings appears');
state.milkman = ''; state.trackMissed = false;
eq(billText(2026, 9, { now: full }).includes('No milk'), false, 'bill: no-milk line hidden when not tracking');
state.trackMissed = true; state.days = {}; state.priceChanges = {};
eq(billText(2026, 9, { now: full }).split('\n')[3], '31 days × ₹20 = ₹620', 'bill: plain month is one line');
state.days = { '2026-10-09': { missed: true } };
eq(billText(2026, 9, { now: full }).split('\n')[4], 'No milk: 1 day (9 Oct)', 'bill: singular day');
