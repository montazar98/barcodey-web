# 🚀 دليل نشر قاعدة البيانات (Database Deployment Guide)

تم بناء مشروع **باركودي** باستخدام **Prisma ORM** مع دعم كامل لقواعد البيانات العالية الأداء.

---

## 1. الوضع الحالي (التطوير المحلي - Local)
- **قاعدة البيانات:** SQLite (`prisma/dev.db`)
- **الملف:** موجود داخل مجلد `prisma/dev.db`
- **المميزات:** يعمل محلياً فوراً بدون الحاجة لتثبيت أي خادم خارجي.

---

## 2. الرفع إلى الاستضافة (Vercel + Supabase أو Neon.tech)

عندما تقرر نشر الموقع على Vercel أو أي استضافة سحابية، تحتاج فقط لربطه بقاعدة بيانات PostgreSQL مجانية (مثل [Neon.tech](https://neon.tech) أو [Supabase](https://supabase.com)):

### الخطوة 1: احصل على رابط قاعدة بيانات PostgreSQL مجاناً
1. افتح [Neon.tech](https://neon.tech) أو [Supabase.com](https://supabase.com) وأنشئ حساباً مجانياً (يعطيك 0.5GB إلى 1GB مجاناً مدى الحياة).
2. انسخ رابط الاتصال (Connection String) المشابه لـ:
   ```env
   DATABASE_URL="postgresql://user:password@ep-cool-sample.us-east-2.aws.neon.tech/barcodey?sslmode=require"
   ```

### الخطوة 2: تغيير سطر واحد فقط في المخطط
في ملف `prisma/schema.prisma`، غيّر فقط السطر:
```prisma
datasource db {
  provider = "postgresql" // كان "sqlite"
  url      = env("DATABASE_URL")
}
```

### الخطوة 3: تحديث متغيرات البيئة في الاستضافة
في لوحة تحكم الاستضافة (Vercel / Render / Railway):
أضف المتغيرات التالية:
- `DATABASE_URL`: رابط الـ PostgreSQL الخاص بك
- `AUTH_SECRET`: نص أمان عشوائي لتشفير التوكن
- `ADMIN_EMAIL`: بريد الإدارة (الافتراضي: `admin@barcodey.online`)
- `ADMIN_PASSWORD`: كلمة مرور الإدارة
- `NEXT_PUBLIC_SITE_URL`: رابط موقعك `https://barcodey.online`

### الخطوة 4: تشغيل أمر بناء الجداول تلقائياً
في أمر البناء (Build Command) على Vercel أو الخادم:
```bash
npx prisma generate && npx prisma db push && npm run build
```
ستقوم Prisma بإنشاء جميع الجداول، العلاقات، الفهارس، وميزات التحكم تلقائياً دون أي جهد إضافي!

---

## 3. الجداول المنشأة في قاعدة البيانات:
1. **User:** المستخدمون، خططهم (FREE, PRO, BUSINESS)، كلمات المرور المشفرة، وإحصاءات الدخول.
2. **QRCode:** رموز QR الثابتة والديناميكية، روابط التوجيه، حماية كلمة المرور، وتاريخ الانتهاء.
3. **QRScan:** تفاصيل كل عملية مسح، نوع الجهاز، البلد، المتصفح، وعنوان IP.
4. **VisitorSession:** جلسات زوار الموقع، الدولة، المدينة، المتصفح، النظام، وقت البقاء، ومصدر الزيارة (Referer / Search / Social).
5. **PageView:** مسار كل صفحة تمت زيارتها ووقت البقاء فيها.
6. **FeatureFlag:** نظام تشغيل/تعطيل الميزات من لوحة التحكم، وتحديد قيود الاشتراكات.
7. **SiteConfig:** إعدادات الموقع العامة، أكواد Google AdSense، وحدود الاستخدام.
8. **Subscription:** سجل الاشتراكات والمدفوعات.
