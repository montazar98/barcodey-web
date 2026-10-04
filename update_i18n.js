const fs = require('fs');

const ar = JSON.parse(fs.readFileSync('src/i18n/locales/ar.json'));
const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json'));
const ru = JSON.parse(fs.readFileSync('src/i18n/locales/ru.json'));

// Nav extensions
const navKeys = {
  login: { ar: "تسجيل الدخول", en: "Login", ru: "Войти" },
  logout: { ar: "تسجيل الخروج", en: "Logout", ru: "Выйти" },
  profile: { ar: "حسابي", en: "My Account", ru: "Мой аккаунт" },
  plan: { ar: "الخطة:", en: "Plan:", ru: "План:" },
  admin: { ar: "الإدارة", en: "Admin", ru: "Админ" }
};

for (const [key, trans] of Object.entries(navKeys)) {
  ar.nav[key] = trans.ar;
  en.nav[key] = trans.en;
  ru.nav[key] = trans.ru;
}

// SubscribeButton
const subKeys = {
  subscribe: {
    login_first: { ar: "يرجى تسجيل الدخول أولاً", en: "Please login first", ru: "Пожалуйста, войдите сначала" },
    redirecting: { ar: "جاري التوجيه للدفع...", en: "Redirecting to payment...", ru: "Перенаправление на оплату..." },
    error: { ar: "حدث خطأ أثناء بدء الدفع", en: "Error starting payment", ru: "Ошибка при начале оплаты" }
  }
};
ar.subscribe = subKeys.subscribe.ar; // Wait, object assignment
ar.subscribe = { login_first: "يرجى تسجيل الدخول أولاً", redirecting: "جاري التوجيه للدفع...", error: "حدث خطأ أثناء بدء الدفع" };
en.subscribe = { login_first: "Please login first", redirecting: "Redirecting to payment...", error: "Error starting payment" };
ru.subscribe = { login_first: "Пожалуйста, войдите сначала", redirecting: "Перенаправление на оплату...", error: "Ошибка при начале оплаты" };

// AdBanner
ar.ads = { title: "إعلان", remove: "إزالة الإعلانات" };
en.ads = { title: "Advertisement", remove: "Remove Ads" };
ru.ads = { title: "Реклама", remove: "Убрать рекламу" };

// Not Found
ar.not_found = { title: "الصفحة غير موجودة", desc: "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", back: "العودة للرئيسية" };
en.not_found = { title: "Page Not Found", desc: "Sorry, the page you are looking for does not exist or has been moved.", back: "Back to Home" };
ru.not_found = { title: "Страница не найдена", desc: "Извините, запрашиваемая страница не существует или была перемещена.", back: "На главную" };

// Auth - Login
ar.auth = {
  login_title: "تسجيل الدخول",
  login_subtitle: "سجّل دخولك للوصول إلى كافة الميزات",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  login_btn: "تسجيل الدخول",
  logging_in: "جاري الدخول...",
  no_account: "ليس لديك حساب؟",
  register_now: "سجل الآن",
  error_invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  register_title: "إنشاء حساب جديد",
  register_subtitle: "انضم إلينا للوصول إلى كافة الميزات الاحترافية",
  name: "الاسم",
  register_btn: "إنشاء الحساب",
  registering: "جاري التسجيل...",
  has_account: "لديك حساب بالفعل؟",
  login_now: "سجل دخولك",
  activate_title: "تفعيل الحساب",
  activate_subtitle: "يرجى تفعيل حسابك للوصول إلى كافة الميزات",
  activate_btn: "تفعيل الحساب",
  activating: "جاري التفعيل...",
  code: "رمز التفعيل",
  req_login_dynamic: "إنشاء وإدارة رموز QR الديناميكية تتطلب تسجيل الدخول",
  req_login_bulk: "الإنشاء بالجملة يتطلب تسجيل الدخول",
  req_login_default: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة"
};

en.auth = {
  login_title: "Login",
  login_subtitle: "Log in to access all features",
  email: "Email Address",
  password: "Password",
  login_btn: "Login",
  logging_in: "Logging in...",
  no_account: "Don't have an account?",
  register_now: "Register Now",
  error_invalid: "Invalid email or password",
  register_title: "Create New Account",
  register_subtitle: "Join us to access all pro features",
  name: "Name",
  register_btn: "Create Account",
  registering: "Registering...",
  has_account: "Already have an account?",
  login_now: "Login now",
  activate_title: "Activate Account",
  activate_subtitle: "Please activate your account to access all features",
  activate_btn: "Activate Account",
  activating: "Activating...",
  code: "Activation Code",
  req_login_dynamic: "Creating and managing dynamic QR codes requires login",
  req_login_bulk: "Bulk generation requires login",
  req_login_default: "Please login to access this page"
};

ru.auth = {
  login_title: "Войти",
  login_subtitle: "Войдите, чтобы получить доступ ко всем функциям",
  email: "Электронная почта",
  password: "Пароль",
  login_btn: "Войти",
  logging_in: "Вход...",
  no_account: "Нет аккаунта?",
  register_now: "Зарегистрироваться",
  error_invalid: "Неверный адрес электронной почты или пароль",
  register_title: "Создать новый аккаунт",
  register_subtitle: "Присоединяйтесь для доступа к PRO-функциям",
  name: "Имя",
  register_btn: "Создать аккаунт",
  registering: "Регистрация...",
  has_account: "Уже есть аккаунт?",
  login_now: "Войти сейчас",
  activate_title: "Активация аккаунта",
  activate_subtitle: "Пожалуйста, активируйте свой аккаунт",
  activate_btn: "Активировать аккаунт",
  activating: "Активация...",
  code: "Код активации",
  req_login_dynamic: "Создание и управление динамическими QR-кодами требует входа",
  req_login_bulk: "Массовое создание требует входа в систему",
  req_login_default: "Пожалуйста, войдите для доступа к этой странице"
};

fs.writeFileSync('src/i18n/locales/ar.json', JSON.stringify(ar, null, 2));
fs.writeFileSync('src/i18n/locales/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/locales/ru.json', JSON.stringify(ru, null, 2));
console.log('Dictionaries updated!');
