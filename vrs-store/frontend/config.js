/* ================================================================
   VRS STORE — CONFIG.JS
   ================================================================
   هذا الملف هو المكان الوحيد اللي تعدل فيه كل شيء.
   عدّل هنا وكل الموقع يتحدث أوتوماتيك.

   SECTIONS:
   - store       → اسم المتجر والوصف
   - social      → روابط التواصل الاجتماعي
   - contact     → معلومات التواصل والدعم
   - payment     → إعدادات الدفع
   - stats       → أرقام الإحصائيات
   - categories  → فئات المنتجات
   - products    → قائمة المنتجات
   - deals       → العروض الخاصة
   - features    → مزايا المتجر (قسم "لماذا نحن")
   ================================================================ */

const VRS_CONFIG = {

  /* ──────────────────────────────────────
     معلومات المتجر الأساسية
  ────────────────────────────────────── */
  store: {
    name:     'VRS',
    nameSpan: 'STORE',
    tagline:  'متجر رقمي عراقي — كل ما تحتاجه في مكان واحد',
    heroSub:  'FiveM · أدوات سيبرانية · AI · حسابات ألعاب · اشتراكات · وأكثر',
    badge:    'متجر عراقي موثوق 100%',
    year:     new Date().getFullYear().toString(),
  },

  /* ──────────────────────────────────────
     روابط التواصل الاجتماعي
     ⚠️ غيّر لروابطك الحقيقية
  ────────────────────────────────────── */
  social: {
    discord:   'https://discord.gg/XNVFmg54Vq',
    telegram:  'https://t.me/VrsStoree',
    instagram: '',
    tiktok:    '',
  },

  /* ──────────────────────────────────────
     معلومات التواصل (للدعم والدفع)
  ────────────────────────────────────── */
  contact: {
    discordServer: 'https://discord.gg/XNVFmg54Vq',
    telegram:      'https://t.me/VrsStoree',
    email:         'supportvrsstore@gmail.com',
    whatsapp:      '', /* مثال: 9647801234567 (بدون + أو 00) */
  },

  /* ──────────────────────────────────────
     إعدادات نظام الدفع
     ⚠️ ضع بيانات محافظك وروابطك الحقيقية
  ────────────────────────────────────── */
  payment: {
    /* Discord webhook لإشعارات الطلبات الجديدة
       أنشئ webhook من: Server Settings → Integrations → Webhooks */
    discordWebhook: '',

    /* Bitcoin */
    crypto: {
      enabled: false,                              /* true لتفعيل */
      address: 'BC1QXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      label:   'Bitcoin (BTC)',
    },

    /* USDT TRC20 */
    usdt: {
      enabled: false,
      address: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      network: 'TRC20',
      label:   'USDT (TRC20)',
    },

    /* PayPal */
    paypal: {
      enabled: false,
      email:   'supportvrsstore@gmail.com',
      link:    '', /* رابط PayPal.me مثال: https://paypal.me/VRSStore */
    },

    /* ZainCash (العراق) */
    zaincash: {
      enabled: false,
      number:  '',   /* رقم ZainCash */
      name:    '',   /* الاسم المسجل */
    },

    /* AsiaHawala */
    asiahawala: {
      enabled: false,
      account: '',
      name:    '',
    },
  },

  /* ──────────────────────────────────────
     إحصائيات المتجر (stats bar)
  ────────────────────────────────────── */
  stats: [
    { number: '1500+', label: 'منتج رقمي' },
    { number: '5K+',   label: 'عميل سعيد' },
    { number: '24/7',  label: 'دعم فني'    },
    { number: '100%',  label: 'تسليم فوري' },
  ],

  /* ──────────────────────────────────────
     فئات المنتجات (تظهر في "نظرة سريعة")
     Updated for Deep Expansion 2026
  ────────────────────────────────────── */
  categories: [
    { id: 'steam_vault',    icon: '💎', name: 'Steam Vault',      count: '+55 منتج رقمي' },
    { id: 'elite_gaming',   icon: '🎯', name: 'Elite Gaming',     count: '+30 حساب مميز' },
    { id: 'premium_subs',   icon: '�', name: 'Premium Subs',     count: '+25 اشتراك' },
    { id: 'ai_dev',         icon: '🤖', name: 'AI & Dev Tools',   count: '+15 أداة احترافية' },
    { id: 'cyber_hub',      icon: '🔐', name: 'Cyber Hub',        count: '+20 أداة أمنية' },
    { id: 'private_accounts',icon: '👤', name: 'Private Accounts', count: '+10 نادر' },
    { id: 'fivem_scripts',  icon: '🎮', name: 'FiveM Scripts',    count: '+50 سكريبت' },
    { id: 'game_mods',      icon: '🧩', name: 'Game Mods',        count: '+40 تعديل' },
  ],

  /* ──────────────────────────────────────
     المنتجات
     badge: "hot" | "new" | "sale" | ""
     cat: نفس id الفئة من فوق
  ────────────────────────────────────── */
  products: [
    {
      id: 1,
      cat: 'fivem',
      icon: '🎮',
      badge: 'hot',
      badgeText: '🔥 الأكثر مبيعاً',
      name: 'حزمة ESX كاملة',
      desc: 'سكريبتات ESX متكاملة — وظائف، اقتصاد، شرطة، مستشفى وأكثر',
      price: '$24.99',
      buyLink: '#',
    },
    {
      id: 2,
      cat: 'fivem',
      icon: '🗺️',
      badge: 'new',
      badgeText: '✨ جديد',
      name: 'ماب مدينة عراقية',
      desc: 'ماب يحاكي شوارع عراقية بتفاصيل واقعية لسيرفرك',
      price: '$29.99',
      buyLink: '#',
    },
    {
      id: 3,
      cat: 'fivem',
      icon: '🎮',
      badge: '',
      badgeText: '',
      name: 'حزمة QBCore كاملة',
      desc: 'سكريبتات QBCore احترافية مع نظام وظائف متكامل',
      price: '$19.99',
      buyLink: '#',
    },
    {
      id: 4,
      cat: 'cyber',
      icon: '🔐',
      badge: 'hot',
      badgeText: '🔥 مطلوب',
      name: 'حزمة أدوات اختراق',
      desc: 'مجموعة أدوات اختراق — Recon, Scanning, Exploitation',
      price: '$24.99',
      buyLink: '#',
    },
    {
      id: 5,
      cat: 'cyber',
      icon: '🛡️',
      badge: 'new',
      badgeText: '✨ جديد',
      name: 'أدوات OSINT متكاملة',
      desc: 'مجموعة أدوات جمع معلومات مفتوحة المصدر احترافية',
      price: '$34.99',
      buyLink: '#',
    },
    {
      id: 6,
      cat: 'ai',
      icon: '🤖',
      badge: 'new',
      badgeText: '✨ جديد',
      name: 'عميل AI مخصص',
      desc: 'بوت ذكاء اصطناعي مبرمج حسب طلبك ',
      price: '$49.99',
      buyLink: '#',
    },
    {
      id: 7,
      cat: 'ai',
      icon: '🤖',
      badge: '',
      badgeText: '',
      name: 'يوزرات مميزة',
      desc: 'يوزرات مميزة لمنصات التواصل الاجتماعي -انستكرام تيك توك دسكورد وغيرها',
      price: '$19.99',
      buyLink: '#',
    },
    {
      id: 8,
      cat: 'accounts',
      icon: '🎮',
      badge: 'hot',
      badgeText: '🔥 مطلوب',
      name: 'حساب Valorant Diamond+',
      desc: 'حسابات Valorant برانك Diamond وفوق مع ضمان',
      price: '$19.99',
      buyLink: '#',
    },
    {
      id: 9,
      cat: 'accounts',
      icon: '🎯',
      badge: '',
      badgeText: '',
      name: 'حساب PUBG Conqueror',
      desc: 'حساب PUBG بسكينات نادرة ورانك عالي',
      price: '$14.99',
      buyLink: '#',
    },
    {
      id: 10,
      cat: 'subs',
      icon: '🎬',
      badge: 'sale',
      badgeText: '💰 عرض',
      name: 'Netflix Premium شهر',
      desc: 'اشتراك Netflix Premium لشهر كامل — 4K UHD تسليم فوري',
      price: '$4.99',
      buyLink: '#',
    },
    {
      id: 11,
      cat: 'subs',
      icon: '🎵',
      badge: '',
      badgeText: 'كمية محدودة' ,
      name: 'Spotify Premium 3 أشهر',
      desc: 'اشتراك Spotify Premium لـ 3 أشهر بدون إعلانات',
      price: '$7.99',
      buyLink: '#',
    },
    {
      id: 12,
      cat: 'web',
      icon: '🌐',
      badge: 'new',
      badgeText: '✨ حسب الطلب',
      name: 'تصميم موقع ',
      desc: 'تصميم موقع إلكتروني احترافي كامل حسب الطلب ',
      price: '$249.99',
      buyLink: '#',
    },
  ],

  /* ──────────────────────────────────────
     العروض الخاصة
  ────────────────────────────────────── */
  deals: [
    {
      icon: '🎮',
      name: 'حزمة FiveM الذهبية',
      desc: 'ESX + QBCore + 5 مابات',
      oldPrice: '$59.99',
      price: '$34.99',
      badge: 'خصم 40%',
      buyLink: '#',
    },
    {
      icon: '📦',
      name: 'حزمة الاشتراكات',
      desc: 'Netflix + Spotify + Disney+',
      oldPrice: '$19.99',
      price: '$11.99',
      badge: 'خصم 35%',
      buyLink: '#',
    },
    {
      icon: '🔐',
      name: 'حزمة الاختراق  الكاملة',
      desc: 'Pentest + OSINT + أدوات إضافية',
      oldPrice: '$69.99',
      price: '$44.99',
      badge: 'خصم 35%',
      buyLink: '#',
    },
  ],

  /* ──────────────────────────────────────
     مزايا المتجر (قسم "لماذا نحن")
  ────────────────────────────────────── */
  features: [
    { icon: '⚡', title: 'تسليم فوري',    desc: 'كل المنتجات تسليم أوتوماتيكي فور الدفع — بدون انتظار' },
    { icon: '🔒', title: 'دفع آمن 100%',  desc: 'طرق دفع متعددة وآمنة — Crypto, mastercard , USDT وأكثر'   },
    { icon: '🛡️', title: 'ضمان استرجاع', desc: 'ضمان استرجاع كامل خلال 24 ساعة إذا ما اشتغل المنتج'    },
    { icon: '💬', title: 'دعم 24/7',      desc: 'فريق دعم نشط طول اليوم — Discord أو Telegram'          },
    { icon: '⭐', title: 'جودة مضمونة',   desc: 'كل منتج يمر بفحص واختبار للجودة قبل البيع'                      },
    { icon: '🔄', title: 'تحديث مستمر',  desc: 'منتجاتنا تتحدث باستمرار — دائما أحدث إصدار'           },
  ],

};
