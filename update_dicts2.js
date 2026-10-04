const fs = require('fs');

const updateLocale = (file, updates) => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [section, keys] of Object.entries(updates)) {
    if (!data[section]) data[section] = {};
    for (const [k, v] of Object.entries(keys)) {
      data[section][k] = v;
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

updateLocale('./src/i18n/locales/en.json', {
  auth: {
    req_length: "8 characters minimum",
    req_uppercase: "Uppercase letter",
    req_number: "Number"
  }
});

updateLocale('./src/i18n/locales/ar.json', {
  auth: {
    req_length: "8 أحرف على الأقل",
    req_uppercase: "حرف كبير",
    req_number: "رقم"
  }
});

updateLocale('./src/i18n/locales/ru.json', {
  auth: {
    req_length: "Минимум 8 символов",
    req_uppercase: "Заглавная буква",
    req_number: "Цифра"
  }
});
