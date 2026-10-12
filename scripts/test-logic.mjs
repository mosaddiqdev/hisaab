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
