// DRAFT — needs native Hindi speaker review. See glossary in .agents/tasks/i18n/glossary.md
// Hindi (Devanagari script). Latin digits only — no Devanagari numerals (०-९).
// Plural: Intl.PluralRules('hi') — both 0 and 1 use category 'one'; 2+ use 'other'.

export const hi = {
  // ── App identity ──────────────────────────────────────────────────────────
  appName: 'हिसाब',

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabHome: 'होम',
  tabCalendar: 'कैलेंडर',
  tabSettings: 'सेटिंग्स',

  // ── Shared actions / labels ───────────────────────────────────────────────
  save: 'सेव करें',
  cancel: 'रद्द करें',
  next: 'आगे',
  back: 'पीछे',
  skip: 'छोड़ें',
  gotIt: 'समझ गया',
  start: 'शुरू करें',
  today: 'आज',
  noMilk: 'दूध नहीं',
  normal: 'सामान्य',
  special: 'विशेष',
  backToNormal: 'सामान्य पर वापस',
  setPrice: 'दाम सेट करें',
  savePrice: 'दाम सेव करें',
  edit: 'बदलें',
  undo: 'पूर्ववत करें',
  dismiss: 'हटाएं',

  // ── Home screen ───────────────────────────────────────────────────────────
  spentInMonth: '{month} में खर्च',
  estimatedByMonthEnd: 'महीने के अंत तक लगभग {amount} खर्च होगा',
  specialDays_one: '{n} विशेष दाम दिन',   // REVIEW: same as _other — confirm if singular needs a different form, e.g. '{n} विशेष दाम का दिन'
  specialDays_other: '{n} विशेष दाम दिन',
  missedDays_one: '{n} छूटा दिन',
  missedDays_other: '{n} छूटे दिन',
  thisWeek: 'इस हफ्ते',
  monthLink: 'महीना ›',
  milkCame: 'दूध आया',
  didNotCome: 'नहीं आया',
  differentPriceToday: 'आज अलग दाम',
  changePrice: 'दाम बदलें',
  todayLabel: 'आज',

  // ── Home — price setup (first run / new month) ────────────────────────────
  setupKeepPrice: '{month} के लिए {amount} प्रतिदिन रखें?',
  setupWhatDoYouPay: 'आप हर दिन दूध के लिए कितना देते हैं?',
  setupSameAsLast: 'पिछले महीने जैसा। अगर दाम बढ़ा हो तो बदलें।',
  setupSetDifferent: 'आप हर महीने अलग दाम सेट कर सकते हैं।',

  // ── Home — aria-labels ────────────────────────────────────────────────────
  milkPricePerDay: 'दूध का प्रतिदिन दाम',
  todaysMilk: 'आज का दूध',

  // ── Calendar screen ───────────────────────────────────────────────────────
  calLabelPlanned: 'अनुमानित',
  calLabelSoFar: 'अब तक',
  calLabelTotal: 'कुल',
  calTodayPill: 'आज',
  calSelectDays: 'दिन चुनें',
  calShareBill: 'बिल शेयर करें',
  calSelectedDays_one: '{n} दिन चुना गया',
  calSelectedDays_other: '{n} दिन चुने गए',
  calTapTheDays: 'जो दिन चाहें उन पर टैप करें',
  calBillCopied: 'बिल कॉपी हो गया',
  calCouldNotShare: 'बिल शेयर नहीं हो सका',
  calSetPriceBtn: 'दाम सेट करें ›',
  calEditPriceBtn: '{amount}/दिन बदलें',

  // ── Calendar — aria-labels ────────────────────────────────────────────────
  ariaCalTotal: '{amount} {label}',
  ariaDayNote: '{day} {month}',
  ariaDayNoMilk: '{day} {month}, दूध नहीं',
  ariaDaySpecial: '{day} {month}, विशेष दाम {amount} रुपये',
  ariaPrevMonth: 'पिछला महीना',
  ariaNextMonth: 'अगला महीना',

  // ── Calendar — legend ─────────────────────────────────────────────────────
  legendSpecial: 'विशेष',
  legendNoMilk: 'दूध नहीं',

  // ── Bill text (shared via share / clipboard) ──────────────────────────────
  billTitle: '{appName} · {month} {year}',
  billTitleSoFar: '{appName} · {month} {year} (अब तक)',
  billMilkman: 'दूधवाला: {name}',
  billPrice: 'दाम: {amount} प्रतिदिन',
  billDelivered: 'डिलीवरी: {days} दिन',
  billNoMilk_one: 'दूध नहीं: {n} दिन ({dates} {mon})',
  billNoMilk_other: 'दूध नहीं: {n} दिन ({dates} {mon})',
  billSpecial: 'विशेष दाम: {items}',
  billTotal: 'कुल: {amount}',

  // ── Sheet (day / bulk edit) ───────────────────────────────────────────────
  sheetOnePriceForAll: 'सभी के लिए एक दाम',
  sheetPlannedNoMilk: 'योजना · दूध नहीं आएगा',
  sheetPlannedSpecial: 'योजना · विशेष दाम {amount}',
  sheetUpcomingNormal: 'आने वाला · सामान्य दाम {amount}',
  sheetNoMilk: 'दूध नहीं',
  sheetSpecialPrice: 'विशेष दाम · {amount}',
  sheetNormalPrice: 'सामान्य दाम · {amount}',
  sheetMilkWontCome: 'दूध नहीं आएगा',
  sheetPriceForEachDay: 'हर दिन का दाम',
  sheetPriceForThisDay: 'सिर्फ इस दिन का दाम',
  sheetDaysSelected_one: '{n} दिन चुना गया',
  sheetDaysSelected_other: '{n} दिन चुने गए',

  // ── Sheet — toast messages ─────────────────────────────────────────────────
  toastMarkedNoMilk_one: '{n} दिन दूध नहीं पर मार्क हुआ',
  toastMarkedNoMilk_other: '{n} दिन दूध नहीं पर मार्क हुए',
  toastSetToPrice_one: '{n} दिन का दाम {amount} हुआ',
  toastSetToPrice_other: '{n} दिनों का दाम {amount} हुआ',
  toastBackToNormal_one: '{n} दिन सामान्य पर वापस',
  toastBackToNormal_other: '{n} दिन सामान्य पर वापस',

  // ── Sheet — aria-labels ───────────────────────────────────────────────────
  ariaEditDays_one: '{n} दिन बदलें',
  ariaEditDays_other: '{n} दिन बदलें',
  ariaEditDay: '{day} बदलें',

  // ── Confirm dialog ────────────────────────────────────────────────────────
  confirmCancel: 'रद्द करें',

  // ── Settings ──────────────────────────────────────────────────────────────
  settingsTitle: 'सेटिंग्स',
  settingsMilkman: 'दूधवाला',
  settingsPrice: 'प्रतिदिन दाम',
  settingsTracking: 'ट्रैकिंग',
  settingsYourData: 'आपका डेटा',
  settingsHelp: 'मदद',
  settingsNameLabel: 'नाम',
  settingsNamePlaceholder: 'वैकल्पिक',
  settingsNameHint: 'जो बिल आप शेयर करते हैं उसमें दिखेगा।',
  settingsPriceAriaLabel: '{month} के लिए प्रतिदिन दाम',
  settingsPriceUsedFor: '{month} के हर दिन के लिए यही दाम लगेगा।',
  settingsPriceNotSet: '{month} के लिए दाम नहीं है, इसलिए पहले के महीने का {amount} लग रहा है।',
  settingsPriceNone: 'अभी तक सेट नहीं किया।',
  settingsTrackMissedLabel: 'दूध न आने वाले दिन ट्रैक करें',
  settingsTrackMissedHint: '"नहीं आया" का विकल्प जुड़ जाएगा',
  settingsWeekStartLabel: 'कैलेंडर हफ्ते की शुरुआत',
  settingsWeekSunday: 'रविवार',
  settingsWeekMonday: 'सोमवार',
  settingsBackupDownload: 'बैकअप डाउनलोड करें',
  settingsBackupRestore: 'बैकअप से रिस्टोर करें',
  settingsBackupHint: 'सब कुछ केवल इस फोन पर सेव है। समय-समय पर बैकअप डाउनलोड करते रहें।',
  settingsShowGuide: 'गाइड फिर से देखें',
  settingsEraseData: 'सारा डेटा मिटाएं',
  settingsFooter: '{appName} · ऑफलाइन काम करता है',

  // ── Settings — toasts ─────────────────────────────────────────────────────
  toastBackupDownloaded: 'बैकअप डाउनलोड हो गया',
  toastAllDataErased: 'सारा डेटा मिट गया',
  toastBackupRestored: 'बैकअप रिस्टोर हो गया',
  toastNotABackup: 'यह {appName} का बैकअप नहीं है',

  // ── Settings — confirm dialogs ────────────────────────────────────────────
  confirmEraseTitle: 'सारा डेटा मिटाएं?',
  confirmEraseBody: 'इससे आपके इस फोन से हर दाम और हर बदला हुआ दिन मिट जाएगा। यह वापस नहीं होगा, इसलिए पहले बैकअप डाउनलोड कर लें।',
  confirmEraseOk: 'सब मिटाएं',
  confirmRestoreTitle: 'यह बैकअप रिस्टोर करें?',
  confirmRestoreBody: 'इसमें {prices} और {days} हैं। यह इस फोन पर मौजूद डेटा की जगह ले लेगा।',
  confirmRestoreOk: 'रिस्टोर करें',
  confirmRestorePrices_one: '{n} मासिक दाम',
  confirmRestorePrices_other: '{n} मासिक दाम',
  confirmRestoreDays_one: '{n} बदला हुआ दिन',
  confirmRestoreDays_other: '{n} बदले हुए दिन',

  // ── Guide ─────────────────────────────────────────────────────────────────
  guideAriaLabel: '{appName} में आपका स्वागत है',
  guideStep: 'चरण {n} / {total}',
  guideExampleCaption: 'उदाहरण: 7 दिन ₹40 पर',
  guideTapCaption: 'उदाहरण: बदलने के लिए दिन पर टैप करें',
  guideLangPickerTitle: 'अपनी भाषा चुनें',
  guideLangPickerBody: 'इसे बाद में सेटिंग्स में बदला जा सकता है।',

  guideTitle1: 'आपका दूध का हिसाब, आपके लिए',
  guideBody1: 'हर दिन आपके दाम पर गिना जाता है। सामान्य दिनों में कुछ करने की जरूरत नहीं।',
  guideTitle2: 'कुछ अलग?',
  guideBody2: 'किसी दिन टैप करें और बताएं कि दूध नहीं आया, या उस दिन का दाम अलग था।',
  guideTitle3set: 'आप तैयार हैं',
  guideBody3set: 'सेटिंग्स में कभी भी दाम बदलें। कैलेंडर में किसी दिन पर टैप करके सिर्फ उस दिन बदलें।',
  guideTitle3ask: 'आप हर दिन कितना देते हैं?',
  guideBody3ask: 'एक दिन के दूध के लिए। बाद में किसी भी महीने के लिए बदल सकते हैं।',

  // ── Guide — aria-labels ───────────────────────────────────────────────────
  ariaBack: 'पीछे',
  ariaSkip: 'छोड़ें',

  // ── Date — month names (long, Devanagari) ─────────────────────────────────
  monthsLong: [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्तूबर', 'नवंबर', 'दिसंबर'
  ],

  // ── Date — month names (short, Devanagari) ────────────────────────────────
  monthsShort: [
    'जन', 'फर', 'मार', 'अप्र', 'मई', 'जून',
    'जुल', 'अग', 'सित', 'अक्त', 'नव', 'दिस'
  ],

  // ── Date — day of week (long, Sunday first, Devanagari) ───────────────────
  dowLong: [
    'रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
  ],

  // ── Date — day of week (short, Sunday first, Devanagari) ─────────────────
  dowShort: [
    'रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'
  ],

  // ── Saved flash confirmation ───────────────────────────────────────────────
  flashSaved: 'सेव हो गया',
};
