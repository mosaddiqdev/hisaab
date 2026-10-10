// English strings — source of truth for all i18n keys.
// Every key here must exist in hi.js and as.js with identical placeholder names.

export const en = {
  // ── App identity ──────────────────────────────────────────────────────────
  appName: 'Hisaab',

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabHome: 'Home',
  tabCalendar: 'Calendar',
  tabSettings: 'Settings',

  // ── Shared actions / labels ───────────────────────────────────────────────
  save: 'Save',
  cancel: 'Cancel',
  next: 'Next',
  back: 'Back',
  skip: 'Skip',
  gotIt: 'Got it',
  start: 'Start',
  today: 'Today',
  noMilk: 'No milk',
  normal: 'Normal',
  special: 'Special',
  backToNormal: 'Back to normal',
  setPrice: 'Set price',
  savePrice: 'Save price',
  edit: 'Edit',
  undo: 'Undo',
  dismiss: 'Dismiss',

  // ── Home screen ───────────────────────────────────────────────────────────
  spentInMonth: 'Spent in {month}',
  estimatedByMonthEnd: 'about {amount} expected by month end',
  specialDays_one: '{n} special price day',
  specialDays_other: '{n} special price days',
  missedDays_one: '{n} missed day',
  missedDays_other: '{n} missed days',
  thisWeek: 'This week',
  monthLink: 'Month ›',
  milkCame: 'Milk came',
  didNotCome: 'Did not come',
  differentPriceToday: 'Different price today',
  changePrice: 'Change price',
  todayLabel: 'Today',

  // ── Home — price setup (first run / new month) ────────────────────────────
  setupKeepPrice: 'Keep {amount} a day for {month}?',
  setupWhatDoYouPay: 'What do you pay for milk each day?',
  setupSameAsLast: 'Same as last month. Change it if the price went up.',
  setupSetDifferent: 'You can set a different price for any month.',

  // ── Home — aria-labels ────────────────────────────────────────────────────
  milkPricePerDay: 'Milk price per day',
  todaysMilk: "Today's milk",

  // ── Calendar screen ───────────────────────────────────────────────────────
  calLabelPlanned: 'planned',
  calLabelSoFar: 'so far',
  calLabelTotal: 'total',
  calTodayPill: 'Today',
  calSelectDays: 'Select days',
  calShareBill: 'Share bill',
  calSelectedDays_one: '{n} day selected',
  calSelectedDays_other: '{n} days selected',
  calTapTheDays: 'Tap the days you want',
  calBillCopied: 'Bill copied',
  calCouldNotShare: 'Could not share the bill',
  calSetPriceBtn: 'Set price ›',
  calEditPriceBtn: 'Edit · {amount}/day',

  // ── Calendar — aria-labels ────────────────────────────────────────────────
  ariaCalTotal: '{amount} {label}',
  ariaDayNote: '{day} {month}',
  ariaDayNoMilk: '{day} {month}, no milk',
  ariaDaySpecial: '{day} {month}, special price {amount} rupees',
  ariaPrevMonth: 'Previous month',
  ariaNextMonth: 'Next month',

  // ── Calendar — legend ─────────────────────────────────────────────────────
  legendSpecial: 'Special',
  legendNoMilk: 'No milk',

  // ── Bill text (shared via share / clipboard) ──────────────────────────────
  billTitle: '{appName} · {month} {year}',
  billTitleSoFar: '{appName} · {month} {year} (so far)',
  billMilkman: 'Milkman: {name}',
  billPrice: 'Price: {amount} per day',
  billDelivered: 'Delivered: {days} days',
  billNoMilk_one: 'No milk: {n} day ({dates} {mon})',
  billNoMilk_other: 'No milk: {n} days ({dates} {mon})',
  billSpecial: 'Special price: {items}',
  billTotal: 'Total: {amount}',

  // ── Sheet (day / bulk edit) ───────────────────────────────────────────────
  sheetOnePriceForAll: 'One price for all of them',
  sheetPlannedNoMilk: "Planned · milk won't come",
  sheetPlannedSpecial: 'Planned · special price {amount}',
  sheetUpcomingNormal: 'Upcoming · normal price {amount}',
  sheetNoMilk: 'No milk',
  sheetSpecialPrice: 'Special price · {amount}',
  sheetNormalPrice: 'Normal price · {amount}',
  sheetMilkWontCome: "Milk won't come",
  sheetPriceForEachDay: 'Price for each day',
  sheetPriceForThisDay: 'Price for this day only',
  sheetDaysSelected_one: '{n} day selected',
  sheetDaysSelected_other: '{n} days selected',

  // ── Sheet — toast messages ─────────────────────────────────────────────────
  toastMarkedNoMilk_one: '{n} day marked no milk',
  toastMarkedNoMilk_other: '{n} days marked no milk',
  toastSetToPrice_one: '{n} day set to {amount}',
  toastSetToPrice_other: '{n} days set to {amount}',
  toastBackToNormal_one: '{n} day back to normal',
  toastBackToNormal_other: '{n} days back to normal',

  // ── Sheet — aria-labels ───────────────────────────────────────────────────
  ariaEditDays_one: 'Edit {n} day',
  ariaEditDays_other: 'Edit {n} days',
  ariaEditDay: 'Edit {day}',

  // ── Confirm dialog ────────────────────────────────────────────────────────
  confirmCancel: 'Cancel',

  // ── Settings ──────────────────────────────────────────────────────────────
  settingsBillLanguage: 'Bill language',
  settingsBillLangApp: 'Same as app language',

  settingsTitle: 'Settings',
  settingsMilkman: 'Milkman',
  settingsPrice: 'Price per day',
  settingsTracking: 'Tracking',
  settingsYourData: 'Your data',
  settingsHelp: 'Help',
  settingsNameLabel: 'Name',
  settingsNamePlaceholder: 'Optional',
  settingsNameHint: 'Used in the bill you share.',
  settingsPriceAriaLabel: 'Price per day for {month}',
  settingsPriceUsedFor: 'Used for every day of {month}.',
  settingsPriceNotSet: 'Not set for {month}, so it uses {amount} from an earlier month.',
  settingsPriceNone: 'Not set yet.',
  settingsTrackMissedLabel: 'Track days milk did not come',
  settingsTrackMissedHint: 'Adds a "did not come" option',
  settingsWeekStartLabel: 'Calendar week starts on',
  settingsWeekSunday: 'Sunday',
  settingsWeekMonday: 'Monday',
  settingsBackupDownload: 'Download a backup',
  settingsBackupRestore: 'Restore from a backup',
  settingsBackupHint: 'Everything is saved only on this phone. Download a backup now and then.',
  settingsShowGuide: 'Show the guide again',
  settingsEraseData: 'Erase all data',
  settingsFooter: '{appName} · works offline',

  // ── Settings — toasts ─────────────────────────────────────────────────────
  toastBackupDownloaded: 'Backup downloaded',
  toastAllDataErased: 'All data erased',
  toastBackupRestored: 'Backup restored',
  toastNotABackup: 'That is not a {appName} backup',

  // ── Settings — confirm dialogs ────────────────────────────────────────────
  confirmEraseTitle: 'Erase all data?',
  confirmEraseBody: 'This deletes every price and every day you edited from this phone. It cannot be undone, so download a backup first if you are not sure.',
  confirmEraseOk: 'Erase everything',
  confirmRestoreTitle: 'Restore this backup?',
  confirmRestoreBody: 'It has {prices} and {days}. This replaces what is on this phone now.',
  confirmRestoreOk: 'Restore',
  confirmRestorePrices_one: '{n} monthly price',
  confirmRestorePrices_other: '{n} monthly prices',
  confirmRestoreDays_one: '{n} edited day',
  confirmRestoreDays_other: '{n} edited days',

  // ── Guide ─────────────────────────────────────────────────────────────────
  guideAriaLabel: 'Welcome to {appName}',
  guideStep: 'Step {n} of {total}',
  guideExampleCaption: 'Example: 7 days at ₹40',
  guideTapCaption: 'Example: tap a day to change it',
  guideLangPickerTitle: 'Choose your language',
  guideLangPickerBody: 'You can change this later in Settings.',

  guideTitle1: 'Keep track of your milk bill',
  guideBody1: 'Every day is counted at your price. On normal days there is nothing to do.',
  guideTitle2: 'Something different?',
  guideBody2: 'Tap a day to mark that the milk did not come, or to give that day another price.',
  guideTitle3set: 'You are all set',
  guideBody3set: 'Change the price any time in Settings. Tap a day in Calendar to change just that day.',
  guideTitle3ask: 'What do you pay each day?',
  guideBody3ask: 'For one day of milk. You can change it for any month later.',

  // ── Guide — aria-labels ───────────────────────────────────────────────────
  ariaBack: 'Back',
  ariaSkip: 'Skip',

  // ── Date — month names (long) ─────────────────────────────────────────────
  monthsLong: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],

  // ── Date — month names (short, 3-letter) ──────────────────────────────────
  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],

  // ── Date — day of week (long, Sunday first) ───────────────────────────────
  dowLong: [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ],

  // ── Date — day of week (short, 3-letter, Sunday first) ───────────────────
  dowShort: [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ],

  // ── Saved flash confirmation ───────────────────────────────────────────────
  flashSaved: 'Saved',
};
