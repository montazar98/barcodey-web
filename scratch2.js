const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

const replacements = {
  '"QR ديناميكي"': 'dict.nav?.dynamic_qr || "QR ديناميكي"',
  '"روابط التطبيقات"': 'dict.nav?.app_links || "روابط التطبيقات"',
  '"مجاني"': 'dict.nav?.free || "مجاني"',
  '"احترافي"': 'dict.nav?.pro || "احترافي"',
  '"أعمال"': 'dict.nav?.business || "أعمال"',
  'لوحة التحكم': '{dict.nav?.dashboard || "لوحة التحكم"}',
  'رموزي': '{dict.nav?.my_codes || "رموزي"}',
  'تسجيل الخروج': '{dict.nav?.logout || "تسجيل الخروج"}',
  'تسجيل الدخول': '{dict.nav?.login || "تسجيل الدخول"}',
  'دخول': '{dict.nav?.login || "دخول"}',
  'ابدأ مجاناً': '{dict.nav?.start_free || "ابدأ مجاناً"}',
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.replace(key, value);
}

fs.writeFileSync('src/components/layout/Navbar.tsx', content);
