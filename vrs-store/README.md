# VRS STORE — متجر رقمي عراقي

متجر رقمي احترافي بالكامل — FiveM · سيبرانية · AI · حسابات · اشتراكات

---

## 📁 هيكل المشروع

```
vrs-store/
├── frontend/                 # الواجهة الأمامية (Static HTML/CSS/JS)
│   ├── index.html            # صفحة رئيسية وحيدة (SPA)
│   ├── config.js             # ⚡ الملف الوحيد اللي تعدله
│   ├── css/
│   │   ├── theme.css         # متغيرات الألوان والثيم
│   │   └── style.css         # كل الـ styles
│   └── js/
│       ├── app.js            # نقطة الدخول الرئيسية
│       ├── store/            # إدارة الحالة (State Management)
│       │   ├── state.js      # AppState — reactive state
│       │   ├── auth.js       # Store.auth — token & session
│       │   └── cart.js       # Store.cart — persistent cart
│       ├── api/              # طبقة التواصل مع API
│       │   ├── client.js     # fetch wrapper مع auto token-refresh
│       │   └── endpoints.js  # كل نداءات API في مكان واحد
│       └── components/       # مكونات واجهة المستخدم
│           ├── Toast.js      # الإشعارات + Loader + Animations + Pagination
│           ├── Navbar.js     # شريط التنقل + قائمة المستخدم
│           ├── ProductCard.js# بطاقة المنتج + ProductList
│           ├── Filters.js    # فلاتر الفئات + الترتيب
│           ├── Search.js     # البحث المباشر
│           ├── Cart.js       # سلة المشتريات (sidebar)
│           ├── Auth.js       # modal تسجيل الدخول/الإنشاء
│           ├── UserPanel.js  # لوحة المستخدم (ملف، طلبات، مفضلة)
│           ├── AdminPanel.js # لوحة الإدارة (منتجات، طلبات، مستخدمين)
│           └── Payment.js    # نظام الدفع (site, Discord, Telegram, WhatsApp)
└── backend/                  # الخادم (Node.js + Express + MongoDB)
    ├── server.js             # نقطة الدخول
    ├── package.json
    ├── .env.example          # نسخه إلى .env
    ├── controllers/          # منطق الأعمال
    ├── models/               # نماذج قاعدة البيانات (Mongoose)
    ├── routes/               # تعريف المسارات
    ├── middleware/           # المصادقة، التحقق، الأخطاء
    └── utils/                # أدوات مساعدة
```

---

## 🚀 البدء السريع

### الموقع بدون Backend (وضع Demo)

```bash
# افتح مباشرة في المتصفح
open frontend/index.html

# أو استخدم server بسيط
npx serve frontend
```

الموقع يشتغل بالكامل بدون backend — يستخدم البيانات من `config.js`.

---

### تشغيل Backend كامل

```bash
cd backend
npm install
cp .env.example .env
# عدّل .env وضع MongoDB URI + JWT secrets

npm start         # للإنتاج
npm run dev       # للتطوير (nodemon)
```

ثم في `frontend/config.js` أو `js/api/client.js` غيّر:
```js
const API_BASE = 'http://localhost:5000/api';
```

---

## ⚙️ التخصيص

### كل شيء في ملف واحد

افتح `frontend/config.js` وعدّل:

| القسم | الوصف |
|-------|-------|
| `store` | اسم المتجر والـ tagline |
| `social` | روابط Discord, Telegram, Instagram |
| `contact` | بريد الدعم، رقم WhatsApp |
| `payment` | محافظ Crypto, USDT, PayPal, ZainCash |
| `categories` | الفئات وأيقوناتها |
| `products` | قائمة المنتجات وأسعارها |
| `deals` | العروض الخاصة |
| `features` | مزايا المتجر (قسم "لماذا نحن") |

### تغيير الألوان

افتح `frontend/css/theme.css`:

```css
:root {
  --accent:       #185FA5;    /* اللون الرئيسي */
  --accent-light: #378ADD;    /* اللون الفاتح */
  --accent-2:     #d88a30;    /* لون ثانوي */
  --bg:           #020510;    /* خلفية الصفحة */
  /* ... */
}
```

---

## 💳 نظام الدفع

الموقع يدعم 4 طرق للدفع:

| الطريقة | الوصف |
|--------|-------|
| **دفع بالموقع** | يُنشئ طلب في النظام مباشرة |
| **Discord Ticket** | ينسخ تفاصيل الطلب ويفتح السيرفر |
| **Telegram** | يفتح محادثة مع رسالة جاهزة |
| **WhatsApp** | يفتح واتساب مع تفاصيل الطلب |

لإضافة ZainCash / AsiaHawala:
```js
// في config.js
payment: {
  zaincash: {
    enabled: true,
    number: '07XXXXXXXXX',
    name:   'اسمك',
  },
}
```

ثم في `Payment.js` أضف الـ method المطابق.

---

## 🔧 المشاكل الشائعة

| المشكلة | الحل |
|--------|------|
| Loader لا يختفي | محلول — يختفي بعد 3 ثواني تلقائياً |
| المنتجات ما تظهر | تشغل من `config.js` بدون backend |
| خطأ في API | تحقق من `MONGODB_URI` في `.env` |
| CSS ما ينحمل | تحقق من مسارات الملفات في HTML |

---

## 🛡️ الأمان

- JWT tokens مع auto-refresh
- Input validation على backend و frontend
- Rate limiting على كل الـ endpoints
- CORS محدد للـ frontend فقط
- Password hashing بـ bcrypt
- XSS protection عبر helmet.js

---

## 📝 الترخيص

© 2024 VRS STORE — جميع الحقوق محفوظة
