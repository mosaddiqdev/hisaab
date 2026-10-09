// DRAFT — needs native Assamese speaker review. See glossary in .agents/tasks/i18n/glossary.md
// Assamese (Bengali script). Latin digits only — no Assamese/Bengali numerals (০-৯).
// Assamese-specific characters used: ৰ (U+09F0 ra) and ৱ (U+09F1 wa).
// Plural: Intl.PluralRules('as') — both 0 and 1 use category 'one'; 2+ use 'other'.

export const assamese = {
  // ── App identity ──────────────────────────────────────────────────────────
  appName: 'হিচাব',

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabHome: 'হোম',
  tabCalendar: 'কেলেণ্ডাৰ',        // ৰ U+09F0
  tabSettings: 'ছেটিংছ',

  // ── Shared actions / labels ───────────────────────────────────────────────
  save: 'ছেভ কৰক',
  cancel: 'বাতিল কৰক',
  next: 'পিছলৈ',                   // "forward/next"
  back: 'আগলৈ',                    // "back/previous"
  skip: 'এৰক',
  gotIt: 'বুজিলোঁ',
  start: 'আৰম্ভ কৰক',
  today: 'আজি',
  noMilk: 'গাখীৰ নাই',
  normal: 'সাধাৰণ',
  special: 'বিশেষ',
  backToNormal: 'সাধাৰণলৈ ঘূৰক',
  setPrice: 'দাম ঠিক কৰক',
  savePrice: 'দাম ছেভ কৰক',
  edit: 'সলনি কৰক',
  undo: 'পূৰ্বৱৎ কৰক',             // ৱ U+09F1
  dismiss: 'আঁতৰাওক',

  // ── Home screen ───────────────────────────────────────────────────────────
  spentInMonth: '{month}ত খৰচ',
  estimatedByMonthEnd: 'মাহৰ শেষলৈ প্ৰায় {amount} খৰচ হ\'ব',
  specialDays_one: '{n} বিশেষ দাম দিন',
  specialDays_other: '{n} বিশেষ দাম দিন',
  missedDays_one: '{n} দিন গাখীৰ নাহিল',
  missedDays_other: '{n} দিন গাখীৰ নাহিল',
  thisWeek: 'এই সপ্তাহ',
  monthLink: 'মাহ ›',
  milkCame: 'গাখীৰ আহিল',
  didNotCome: 'নাহিল',
  differentPriceToday: 'আজি বেলেগ দাম',
  changePrice: 'দাম সলনি কৰক',
  todayLabel: 'আজি',

  // ── Home — price setup (first run / new month) ────────────────────────────
  setupKeepPrice: '{month}ৰ বাবে প্ৰতিদিন {amount} ৰাখিবনে?',    // ৰ U+09F0
  setupWhatDoYouPay: 'আপুনি প্ৰতিদিন গাখীৰৰ বাবে কিমান দিয়ে?',
  setupSameAsLast: 'আগৰ মাহৰ দৰে। দাম বাঢ়িলে সলনি কৰক।',
  setupSetDifferent: 'আপুনি প্ৰতিটো মাহৰ বাবে বেলেগ দাম ঠিক কৰিব পাৰে।',

  // ── Home — aria-labels ────────────────────────────────────────────────────
  milkPricePerDay: 'গাখীৰৰ প্ৰতিদিনৰ দাম',
  todaysMilk: 'আজিৰ গাখীৰ',

  // ── Calendar screen ───────────────────────────────────────────────────────
  calLabelPlanned: 'পৰিকল্পনা',
  calLabelSoFar: 'এতিয়ালৈকে',
  calLabelTotal: 'মুঠ',
  calTodayPill: 'আজি',
  calSelectDays: 'দিন বাছক',
  calShareBill: 'বিল শ্বেয়াৰ কৰক',
  calSelectedDays_one: '{n} দিন বাছনি হৈছে',
  calSelectedDays_other: '{n} দিন বাছনি হৈছে',
  calTapTheDays: 'যি দিনবোৰ বিচাৰে সিহঁতত টেপ কৰক',
  calBillCopied: 'বিল কপি হ\'ল',
  calCouldNotShare: 'বিল শ্বেয়াৰ কৰিব পৰা নগ\'ল',
  calSetPriceBtn: 'দাম ঠিক কৰক ›',
  calEditPriceBtn: '{amount}/দিন সলনি কৰক',

  // ── Calendar — aria-labels ────────────────────────────────────────────────
  ariaCalTotal: '{amount} {label}',
  ariaDayNote: '{day} {month}',
  ariaDayNoMilk: '{day} {month}, গাখীৰ নাই',
  ariaDaySpecial: '{day} {month}, বিশেষ দাম {amount} টকা',
  ariaPrevMonth: 'আগৰ মাহ',
  ariaNextMonth: 'পিছৰ মাহ',        // ৰ U+09F0

  // ── Calendar — legend ─────────────────────────────────────────────────────
  legendSpecial: 'বিশেষ',
  legendNoMilk: 'গাখীৰ নাই',

  // ── Bill text (shared via share / clipboard) ──────────────────────────────
  billTitle: '{appName} · {month} {year}',
  billTitleSoFar: '{appName} · {month} {year} (এতিয়ালৈকে)',
  billMilkman: 'গাখীৰৱালা: {name}',   // ৱ U+09F1
  billPrice: 'দাম: প্ৰতিদিন {amount}',
  billDelivered: 'ডেলিভাৰি: {days} দিন',    // ৰ U+09F0
  billNoMilk_one: 'গাখীৰ নাই: {n} দিন ({dates} {mon})',
  billNoMilk_other: 'গাখীৰ নাই: {n} দিন ({dates} {mon})',
  billSpecial: 'বিশেষ দাম: {items}',
  billTotal: 'মুঠ: {amount}',

  // ── Sheet (day / bulk edit) ───────────────────────────────────────────────
  sheetOnePriceForAll: 'সকলোৰ বাবে এটা দাম',
  sheetPlannedNoMilk: 'পৰিকল্পনা · গাখীৰ নাহিব',
  sheetPlannedSpecial: 'পৰিকল্পনা · বিশেষ দাম {amount}',
  sheetUpcomingNormal: 'আসন্ন · সাধাৰণ দাম {amount}',
  sheetNoMilk: 'গাখীৰ নাই',
  sheetSpecialPrice: 'বিশেষ দাম · {amount}',
  sheetNormalPrice: 'সাধাৰণ দাম · {amount}',
  sheetMilkWontCome: 'গাখীৰ নাহিব',
  sheetPriceForEachDay: 'প্ৰতিটো দিনৰ দাম',
  sheetPriceForThisDay: 'কেৱল এই দিনটোৰ দাম',
  sheetDaysSelected_one: '{n} দিন বাছনি হৈছে',
  sheetDaysSelected_other: '{n} দিন বাছনি হৈছে',

  // ── Sheet — toast messages ─────────────────────────────────────────────────
  toastMarkedNoMilk_one: '{n} দিন গাখীৰ নাই বুলি চিহ্নিত হ\'ল',
  toastMarkedNoMilk_other: '{n} দিন গাখীৰ নাই বুলি চিহ্নিত হ\'ল',
  toastSetToPrice_one: '{n} দিনৰ দাম {amount} হ\'ল',
  toastSetToPrice_other: '{n} দিনৰ দাম {amount} হ\'ল',
  toastBackToNormal_one: '{n} দিন সাধাৰণলৈ ঘূৰিল',
  toastBackToNormal_other: '{n} দিন সাধাৰণলৈ ঘূৰিল',

  // ── Sheet — aria-labels ───────────────────────────────────────────────────
  ariaEditDays_one: '{n} দিন সলনি কৰক',
  ariaEditDays_other: '{n} দিন সলনি কৰক',
  ariaEditDay: '{day} সলনি কৰক',

  // ── Confirm dialog ────────────────────────────────────────────────────────
  confirmCancel: 'বাতিল কৰক',

  // ── Settings ──────────────────────────────────────────────────────────────
  settingsTitle: 'ছেটিংছ',
  settingsMilkman: 'গাখীৰৱালা',      // ৱ U+09F1
  settingsPrice: 'প্ৰতিদিনৰ দাম',
  settingsTracking: 'ট্ৰেকিং',
  settingsYourData: 'আপোনাৰ ডেটা',
  settingsHelp: 'সহায়',
  settingsNameLabel: 'নাম',
  settingsNamePlaceholder: 'ঐচ্ছিক',
  settingsNameHint: 'আপুনি শ্বেয়াৰ কৰা বিলত দেখাব।',
  settingsPriceAriaLabel: '{month}ৰ বাবে প্ৰতিদিনৰ দাম',  // ৰ U+09F0
  settingsPriceUsedFor: '{month}ৰ প্ৰতিটো দিনৰ বাবে এই দাম ব্যৱহাৰ হ\'ব।',
  settingsPriceNotSet: '{month}ৰ বাবে দাম নাই, সেইবাবে আগৰ মাহৰ {amount} ব্যৱহাৰ হৈছে।',
  settingsPriceNone: 'এতিয়াও ঠিক কৰা হোৱা নাই।',
  settingsTrackMissedLabel: 'গাখীৰ নহা দিনবোৰ ট্ৰেক কৰক',
  settingsTrackMissedHint: '"নাহিল" বিকল্প যোগ হ\'ব',
  settingsWeekStartLabel: 'কেলেণ্ডাৰ সপ্তাহ আৰম্ভ হয়',   // ৰ U+09F0
  settingsWeekSunday: 'দেওবাৰ',
  settingsWeekMonday: 'সোমবাৰ',        // ৰ U+09F0
  settingsBackupDownload: 'বেকআপ ডাউনলোড কৰক',
  settingsBackupRestore: 'বেকআপৰ পৰা ৰিষ্টোৰ কৰক',   // ৰ U+09F0 twice
  settingsBackupHint: 'সকলো কেৱল এই ফোনত ছেভ আছে। সময়ে সময়ে বেকআপ ডাউনলোড কৰক।',
  settingsShowGuide: 'গাইড পুনৰায় চাওক',
  settingsEraseData: 'সকলো ডেটা মচক',
  settingsFooter: '{appName} · অফলাইনত কাম কৰে',

  // ── Settings — toasts ─────────────────────────────────────────────────────
  toastBackupDownloaded: 'বেকআপ ডাউনলোড হ\'ল',
  toastAllDataErased: 'সকলো ডেটা মচা হ\'ল',
  toastBackupRestored: 'বেকআপ ৰিষ্টোৰ হ\'ল',    // ৰ U+09F0
  toastNotABackup: 'এইটো {appName}ৰ বেকআপ নহয়',

  // ── Settings — confirm dialogs ────────────────────────────────────────────
  confirmEraseTitle: 'সকলো ডেটা মচিবনে?',
  confirmEraseBody: 'এইটোৱে আপোনাৰ ফোনৰ পৰা সকলো দাম আৰু সলনি কৰা দিন মচি পেলাব। এইটো পূৰ্বৱৎ কৰিব নোৱাৰি, সেইবাবে আগতে বেকআপ ডাউনলোড কৰক।',   // ৱ U+09F1
  confirmEraseOk: 'সকলো মচক',
  confirmRestoreTitle: 'এই বেকআপ ৰিষ্টোৰ কৰিবনে?',   // ৰ U+09F0
  confirmRestoreBody: 'ইয়াত {prices} আৰু {days} আছে। এইটোৱে এই ফোনত থকা ডেটা সলনি কৰিব।',
  confirmRestoreOk: 'ৰিষ্টোৰ কৰক',    // ৰ U+09F0
  confirmRestorePrices_one: '{n} মাহেকীয়া দাম',
  confirmRestorePrices_other: '{n} মাহেকীয়া দাম',
  confirmRestoreDays_one: '{n} সলনি কৰা দিন',
  confirmRestoreDays_other: '{n} সলনি কৰা দিন',

  // ── Guide ─────────────────────────────────────────────────────────────────
  guideAriaLabel: '{appName}লৈ আপোনাক স্বাগতম',
  guideStep: 'পদক্ষেপ {n} / {total}',
  guideExampleCaption: 'উদাহৰণ: 7 দিন ₹40 হাৰত',   // ৰ U+09F0
  guideTapCaption: 'উদাহৰণ: সলনিৰ বাবে দিনত টেপ কৰক',
  guideTitle1: 'আপোনাৰ গাখীৰৰ হিচাব, আপোনাৰ বাবে',
  guideBody1: 'প্ৰতিটো দিন আপোনাৰ দামত গণনা হয়। সাধাৰণ দিনত কৰিবলৈ একো নাই।',
  guideTitle2: 'কিবা বেলেগ?',
  guideBody2: 'কোনো দিনত টেপ কৰি জনাওক যে গাখীৰ নাহিল, বা সেই দিনৰ দাম বেলেগ আছিল।',
  guideTitle3set: 'আপুনি সাজু',
  guideBody3set: 'ছেটিংছত যিকোনো সময়ত দাম সলনি কৰক। কেলেণ্ডাৰত কোনো দিনত টেপ কৰি কেৱল সেই দিনটো সলনি কৰক।',   // ৰ U+09F0
  guideTitle3ask: 'আপুনি প্ৰতিদিন কিমান দিয়ে?',
  guideBody3ask: 'এদিনৰ গাখীৰৰ বাবে। পিছত যিকোনো মাহৰ বাবে সলনি কৰিব পাৰিব।',

  // ── Guide — aria-labels ───────────────────────────────────────────────────
  ariaBack: 'আগলৈ',
  ariaSkip: 'এৰক',

  // ── Date — month names (long, Assamese/Bengali script) ───────────────────
  monthsLong: [
    'জানুৱাৰী', 'ফেব্ৰুৱাৰী', 'মাৰ্চ', 'এপ্ৰিল', 'মে', 'জুন',    // ৰ U+09F0 in জানুৱাৰী, ফেব্ৰুৱাৰী
    'জুলাই', 'আগষ্ট', 'ছেপ্টেম্বৰ', 'অক্টোবৰ', 'নৱেম্বৰ', 'ডিচেম্বৰ'  // ৰ U+09F0 in ছেপ্টেম্বৰ, অক্টোবৰ, নৱেম্বৰ, ডিচেম্বৰ
  ],

  // ── Date — month names (short, Assamese/Bengali script) ──────────────────
  monthsShort: [
    'জান', 'ফেব', 'মাৰ্চ', 'এপ্ৰি', 'মে', 'জুন',    // ৰ U+09F0 in মাৰ্চ
    'জুলা', 'আগ', 'ছেপ', 'অক্ট', 'নৱে', 'ডিচে'
  ],

  // ── Date — day of week (long, Sunday first, Assamese) ────────────────────
  dowLong: [
    'দেওবাৰ', 'সোমবাৰ', 'মঙলবাৰ', 'বুধবাৰ', 'বৃহস্পতিবাৰ', 'শুক্ৰবাৰ', 'শনিবাৰ'   // ৰ U+09F0 in all
  ],

  // ── Date — day of week (short, Sunday first, Assamese) ───────────────────
  dowShort: [
    'দেও', 'সোম', 'মঙ্গ', 'বুধ', 'বৃহ', 'শুক্ৰ', 'শনি'   // ৰ U+09F0 in শুক্ৰ
  ],

  // ── Saved flash confirmation ───────────────────────────────────────────────
  flashSaved: 'ছেভ হ\'ল',
};
