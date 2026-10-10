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
  back: 'वापस',
  skip: 'छोड़ें',
  gotIt: 'ठीक है',
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
  specialDays_one: '{n} दिन अलग दाम पर',
  specialDays_other: '{n} दिन अलग दाम पर',
  missedDays_one: '{n} दिन दूध नहीं आया',
  missedDays_other: '{n} दिन दूध नहीं आया',
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
  milkPricePerDay: 'दूध का रोज़ का दाम',
  todaysMilk: 'आज का दूध',

  // ── Calendar screen ───────────────────────────────────────────────────────
  calLabelPlanned: 'अनुमानित',
  calLabelSoFar: 'अब तक',
  calLabelTotal: 'कुल',
  calTodayPill: 'आज',
  calSelectDays: 'दिन चुनें',
  calShareBill: 'बिल शेयर करें',
  calSelectedDays_one: '{n} दिन चयनित',
  calSelectedDays_other: '{n} दिन चयनित',
  calTapTheDays: 'जो दिन चाहें उन पर टैप करें',
  calBillCopied: 'बिल कॉपी हो गया',
  calCouldNotShare: 'बिल शेयर नहीं हो सका',
  calSetPriceBtn: 'दाम सेट करें ›',
  calEditPriceBtn: 'दाम बदलें · {amount}/दिन',

  // ── Calendar — aria-labels ────────────────────────────────────────────────
  ariaCalTotal: '{amount} {label}',
  ariaDayNote: '{day} {month}',
  ariaDayNoMilk: '{day} {month}, दूध नहीं आया',
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
  billDelivered: 'दूध आने के दिन: {days}',
  billNoMilk_one: 'दूध नहीं आया: {n} दिन ({dates} {mon})',
  billNoMilk_other: 'दूध नहीं आया: {n} दिन ({dates} {mon})',
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
  sheetDaysSelected_one: '{n} दिन चयनित',
  sheetDaysSelected_other: '{n} दिन चयनित',

  // ── Sheet — toast messages ─────────────────────────────────────────────────
  toastMarkedNoMilk_one: '{n} दिन के लिए "दूध नहीं आया" दर्ज किया गया',
  toastMarkedNoMilk_other: '{n} दिन के लिए "दूध नहीं आया" दर्ज किया गया',
  toastSetToPrice_one: '{n} दिन के लिए दाम {amount} तय किया गया',
  toastSetToPrice_other: '{n} दिन के लिए दाम {amount} तय किया गया',
  toastBackToNormal_one: '{n} दिन का दाम फिर से सामान्य कर दिया गया',
  toastBackToNormal_other: '{n} दिन का दाम फिर से सामान्य कर दिया गया',

  // ── Sheet — aria-labels ───────────────────────────────────────────────────
  ariaEditDays_one: '{n} दिन बदलें',
  ariaEditDays_other: '{n} दिन बदलें',
  ariaEditDay: '{day} बदलें',

  // ── Confirm dialog ────────────────────────────────────────────────────────
  confirmCancel: 'रद्द करें',

  // ── Settings ──────────────────────────────────────────────────────────────
  settingsBillLanguage: 'बिल की भाषा',
  settingsBillLangApp: 'ऐप की भाषा जैसी',

  settingsTitle: 'सेटिंग्स',
  settingsMilkman: 'दूधवाला',
  settingsPrice: 'रोज़ का दाम',
  settingsTracking: 'ट्रैकिंग',
  settingsYourData: 'आपका डेटा',
  settingsHelp: 'मदद',
  settingsNameLabel: 'नाम',
  settingsNamePlaceholder: 'वैकल्पिक',
  settingsNameHint: 'यह नाम आपके शेयर किए गए बिल में दिखेगा।',
  settingsPriceAriaLabel: '{month} के लिए प्रतिदिन दाम',
  settingsPriceUsedFor: '{month} के हर दिन के लिए यही दाम लगेगा।',
  settingsPriceNotSet: '{month} के लिए दाम नहीं है, इसलिए पहले के महीने का {amount} लग रहा है।',
  settingsPriceNone: 'अभी तक तय नहीं किया गया है।',
  settingsTrackMissedLabel: 'दूध न आने वाले दिन ट्रैक करें',
  settingsTrackMissedHint: '"नहीं आया" का विकल्प जुड़ जाएगा',
  settingsWeekStartLabel: 'कैलेंडर सप्ताह की शुरुआत',
  settingsWeekSunday: 'रविवार',
  settingsWeekMonday: 'सोमवार',
  settingsBackupDownload: 'बैकअप डाउनलोड करें',
  settingsBackupRestore: 'बैकअप से रिस्टोर करें',
  settingsBackupHint: 'सारा डेटा सिर्फ़ इसी फ़ोन में सेव होता है। समय-समय पर बैकअप डाउनलोड करते रहें।',
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
  confirmEraseBody: 'इससे इस फ़ोन में सेव किए गए सभी दाम और आपके बदले हुए सभी दिन मिट जाएंगे। यह कार्रवाई वापस नहीं की जा सकती, इसलिए पहले बैकअप डाउनलोड कर लें।',
  confirmEraseOk: 'सब मिटाएं',
  confirmRestoreTitle: 'यह बैकअप रिस्टोर करें?',
  confirmRestoreBody: 'इस बैकअप में {prices} और {days} शामिल हैं। इससे इस फ़ोन पर मौजूद डेटा बदल जाएगा।',
  confirmRestoreOk: 'रिस्टोर करें',
  confirmRestorePrices_one: '{n} मासिक दाम',
  confirmRestorePrices_other: '{n} मासिक दाम',
  confirmRestoreDays_one: '{n} दिन के बदलाव',
  confirmRestoreDays_other: '{n} दिन के बदलाव',

  // ── Guide ─────────────────────────────────────────────────────────────────
  guideAriaLabel: '{appName} में आपका स्वागत है',
  guideStep: 'चरण {n} / {total}',
  guideExampleCaption: 'उदाहरण: ₹40 प्रतिदिन, 7 दिन',
  guideTapCaption: 'उदाहरण: बदलने के लिए दिन पर टैप करें',
  guideLangPickerTitle: 'अपनी भाषा चुनें',
  guideLangPickerBody: 'इसे बाद में सेटिंग्स में बदला जा सकता है।',

  guideTitle1: 'दूध का हिसाब आसानी से रखें',
  guideBody1: 'हर दिन का हिसाब आपके तय किए गए दाम से होता है। सामान्य दिनों में आपको कुछ करने की ज़रूरत नहीं है।',
  guideTitle2: 'कुछ अलग हुआ?',
  guideBody2: 'किसी दिन टैप करें और बताएं कि दूध नहीं आया, या उस दिन का दाम अलग था।',
  guideTitle3set: 'आप तैयार हैं',
  guideBody3set: 'सेटिंग्स में कभी भी दाम बदलें। कैलेंडर में किसी दिन पर टैप करके सिर्फ उस दिन बदलें।',
  guideTitle3ask: 'आप रोज़ दूध के लिए कितना देते हैं?',
  guideBody3ask: 'यह एक दिन के दूध का दाम है। बाद में आप किसी भी महीने का दाम बदल सकते हैं।',

  // ── Guide — aria-labels ───────────────────────────────────────────────────
  ariaBack: 'वापस',
  ariaSkip: 'छोड़ें',

  // ── Date — month names (long, Devanagari) ─────────────────────────────────
  monthsLong: [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ],

  // ── Date — month names (short, Devanagari) ────────────────────────────────
  monthsShort: [
    'जन', 'फर', 'मार', 'अप्र', 'मई', 'जून',
    'जुल', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'
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
