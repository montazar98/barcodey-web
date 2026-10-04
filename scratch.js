const fs = require('fs');
let content = fs.readFileSync('src/components/qr/QRGenerator.tsx', 'utf8');

const replacements = {
  '"تم نسخ الرمز إلى الحافظة"': 'dict.qr?.success_copy || "تم نسخ الرمز إلى الحافظة"',
  '"تعذّر النسخ، جرّب التنزيل"': 'dict.qr?.error_copy || "تعذّر النسخ، جرّب التنزيل"',
  '>نوع المحتوى<': '>{dict.qr?.content || "نوع المحتوى"}<',
  '>المحتوى<': '>{dict.qr?.content || "المحتوى"}<',
  '>الرابط<': '>{dict.qr?.url || "الرابط"}<',
  '>النص<': '>{dict.qr?.text || "النص"}<',
  'placeholder="أكتب النص هنا..."': 'placeholder={dict.qr?.text || "أكتب النص هنا..."}',
  '>اسم الشبكة (SSID)<': '>{dict.qr?.ssid || "اسم الشبكة (SSID)"}<',
  '>كلمة المرور<': '>{dict.qr?.password || "كلمة المرور"}<',
  '>التشفير<': '>{dict.qr?.encryption || "التشفير"}<',
  '>بدون كلمة مرور<': '>{dict.qr?.no_password || "بدون كلمة مرور"}<',
  '>رقم الهاتف<': '>{dict.qr?.phone || "رقم الهاتف"}<',
  '>البريد الإلكتروني<': '>{dict.qr?.email || "البريد الإلكتروني"}<',
  '>الموضوع<': '>{dict.qr?.subject || "الموضوع"}<',
  'placeholder="موضوع الرسالة"': 'placeholder={dict.qr?.subject || "موضوع الرسالة"}',
  '>خط العرض (Latitude)<': '>{dict.qr?.lat || "خط العرض (Latitude)"}<',
  '>خط الطول (Longitude)<': '>{dict.qr?.lng || "خط الطول (Longitude)"}<',
  '>التخصيص<': '>{dict.qr?.customization || "التخصيص"}<',
  '>لون الرمز<': '>{dict.qr?.fg_color || "لون الرمز"}<',
  '>لون الخلفية<': '>{dict.qr?.bg_color || "لون الخلفية"}<',
  '>الحجم: {size}px<': '>{dict.qr?.size || "الحجم:"} {size}px<',
  '>مستوى تصحيح الأخطاء<': '>{dict.qr?.error_level || "مستوى تصحيح الأخطاء"}<',
  '>معاينة الرمز<': '>{dict.qr?.preview || "معاينة الرمز"}<',
  'أدخل المحتوى لرؤية الرمز': '{dict.qr?.empty_preview || "أدخل المحتوى لرؤية الرمز"}',
  '>نسخ<': '>{dict.qr?.copy || "نسخ"}<',
  '>بيانات الرمز<': '>{dict.qr?.qr_data || "بيانات الرمز"}<',
  '"تم تنزيل الرمز كـ PNG"': 'dict.qr?.success_png || "تم تنزيل الرمز كـ PNG"',
  '"تم تنزيل الرمز كـ SVG"': 'dict.qr?.success_svg || "تم تنزيل الرمز كـ SVG"',
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.replace(key, value);
}

fs.writeFileSync('src/components/qr/QRGenerator.tsx', content);
