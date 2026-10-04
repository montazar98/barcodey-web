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
  nav: {
    brand: "Barcodey",
    dynamic_qr: "Dynamic QR",
    app_links: "App Links",
    my_codes: "My Codes",
    free: "Free",
    pro: "Pro",
    business: "Business"
  },
  subscribe: {
    login_first: "Please login first",
    redirecting: "Redirecting to payment...",
    error: "Error starting payment",
    telegram_bot_error: "Please setup Telegram bot username from dashboard first",
    payment_server_error: "Failed to connect to payment server",
    generic_error: "Sorry, something went wrong"
  },
  ads: {
    title: "Advertisement",
    remove: "Remove Ads",
    label: "Advertisement"
  },
  auth: {
    welcome_back: "Welcome back!",
    login_desc: "Log in to access all features",
    barcode_only_members: "Barcode generator is exclusive to registered members",
    dynamic_qr_login: "Creating and managing dynamic QR codes requires login",
    bulk_login: "Bulk generation requires login",
    default_login: "Please login to access this page",
    hello: "Hello",
    create_free_account: "Create free account",
    create_account_desc: "Register now for full access to barcodes and dynamic QR codes",
    full_name: "Full Name",
    name_placeholder: "John Doe",
    password_strength_too_weak: "Password is too weak",
    agree_terms: "I agree to the",
    terms_of_use: "and terms of use",
    free_plan_perks_title: "✨ Your free account perks immediately",
    free_plan_perk_1: "Generate all types of barcodes",
    free_plan_perk_2: "Smart dynamic QR codes",
    free_plan_perk_3: "Tracking and analytics",
    free_plan_perk_4: "High resolution export",
    must_agree_terms: "You must agree to the terms",
    account_created: "Account created successfully! 🎉"
  },
  activate: {
    no_code: "No activation code provided",
    login_first: "You must login first to activate your account!",
    failed: "Activation failed",
    success_msg: "Your subscription has been activated successfully!",
    server_error: "Error connecting to server",
    loading: "Activating your subscription...",
    congrats: "Congratulations! 🎉",
    pro_activated: "Your pro subscription has been activated successfully. You can now enjoy all features.",
    go_dashboard: "Go to Dashboard",
    activation_failed: "Sorry, activation failed",
    enter_code_manually: "Enter code manually",
    activate_btn: "Activate",
    back_to_pricing: "Back to Pricing page"
  }
});

updateLocale('./src/i18n/locales/ar.json', {
  nav: {
    brand: "باركودي",
    dynamic_qr: "QR ديناميكي",
    app_links: "روابط التطبيقات",
    my_codes: "رموزي",
    free: "مجاني",
    pro: "احترافي",
    business: "أعمال"
  },
  subscribe: {
    login_first: "يرجى تسجيل الدخول أولاً",
    redirecting: "جاري التحويل للدفع...",
    error: "حدث خطأ أثناء بدء الدفع",
    telegram_bot_error: "يرجى إعداد يوزر بوت تليغرام من لوحة التحكم أولاً",
    payment_server_error: "فشل الاتصال بخادم الدفع",
    generic_error: "عذراً، حدث خطأ ما"
  },
  ads: {
    title: "إعلان",
    remove: "إزالة الإعلانات",
    label: "إعلان"
  },
  auth: {
    welcome_back: "أهلاً بعودتك!",
    login_desc: "سجّل دخولك للوصول إلى كافة الميزات",
    barcode_only_members: "مولد الباركود متاح حصرياً للأعضاء المسجلين",
    dynamic_qr_login: "إنشاء وإدارة رموز QR الديناميكية تتطلب تسجيل الدخول",
    bulk_login: "الإنشاء بالجملة يتطلب تسجيل الدخول",
    default_login: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة",
    hello: "مرحباً",
    create_free_account: "إنشاء حساب مجاني",
    create_account_desc: "سجّل الآن للوصول الكامل إلى الباركود ورموز QR الديناميكية",
    full_name: "الاسم الكامل",
    name_placeholder: "محمد أحمد",
    password_strength_too_weak: "كلمة المرور ضعيفة جداً",
    agree_terms: "أوافق على",
    terms_of_use: "وشروط الاستخدام",
    free_plan_perks_title: "✨ ميزات حسابك المجاني فوراً",
    free_plan_perk_1: "إنشاء الباركود بجميع أنواعه",
    free_plan_perk_2: "رموز QR ديناميكية ذكية",
    free_plan_perk_3: "تتبع وتحليلات الزيارات",
    free_plan_perk_4: "تصدير عالي الدقة",
    must_agree_terms: "يجب الموافقة على الشروط",
    account_created: "تم إنشاء حسابك بنجاح! 🎉"
  },
  activate: {
    no_code: "لم يتم تقديم كود تفعيل",
    login_first: "يجب تسجيل الدخول أولاً لتفعيل حسابك!",
    failed: "فشل التفعيل",
    success_msg: "تم تفعيل اشتراكك بنجاح!",
    server_error: "حدث خطأ في الاتصال بالخادم",
    loading: "جاري تفعيل اشتراكك...",
    congrats: "تهانينا! 🎉",
    pro_activated: "تم تفعيل اشتراكك الاحترافي بنجاح. يمكنك الآن الاستمتاع بجميع الميزات.",
    go_dashboard: "الذهاب للوحة التحكم",
    activation_failed: "عذراً، فشل التفعيل",
    enter_code_manually: "أدخل الكود يدوياً",
    activate_btn: "تفعيل",
    back_to_pricing: "العودة لصفحة الأسعار"
  }
});

updateLocale('./src/i18n/locales/ru.json', {
  nav: {
    brand: "Barcodey",
    dynamic_qr: "Динамический QR",
    app_links: "Ссылки на приложения",
    my_codes: "Мои коды",
    free: "Бесплатно",
    pro: "Pro",
    business: "Бизнес"
  },
  subscribe: {
    login_first: "Пожалуйста, войдите сначала",
    redirecting: "Перенаправление на оплату...",
    error: "Ошибка при начале оплаты",
    telegram_bot_error: "Пожалуйста, настройте имя бота Telegram в панели управления",
    payment_server_error: "Не удалось подключиться к серверу оплаты",
    generic_error: "Извините, что-то пошло не так"
  },
  ads: {
    title: "Реклама",
    remove: "Убрать рекламу",
    label: "Реклама"
  },
  auth: {
    welcome_back: "С возвращением!",
    login_desc: "Войдите, чтобы получить доступ ко всем функциям",
    barcode_only_members: "Генератор штрихкодов доступен только зарегистрированным пользователям",
    dynamic_qr_login: "Создание и управление динамическими QR-кодами требует входа",
    bulk_login: "Массовое создание требует входа в систему",
    default_login: "Пожалуйста, войдите для доступа к этой странице",
    hello: "Привет",
    create_free_account: "Создать бесплатный аккаунт",
    create_account_desc: "Зарегистрируйтесь для полного доступа к штрихкодам и динамическим QR-кодам",
    full_name: "Полное имя",
    name_placeholder: "Иван Иванов",
    password_strength_too_weak: "Пароль слишком слабый",
    agree_terms: "Я согласен с",
    terms_of_use: "и условиями использования",
    free_plan_perks_title: "✨ Преимущества вашего бесплатного аккаунта",
    free_plan_perk_1: "Создание всех типов штрихкодов",
    free_plan_perk_2: "Умные динамические QR-коды",
    free_plan_perk_3: "Отслеживание и аналитика",
    free_plan_perk_4: "Экспорт в высоком разрешении",
    must_agree_terms: "Вы должны согласиться с условиями",
    account_created: "Аккаунт успешно создан! 🎉"
  },
  activate: {
    no_code: "Код активации не предоставлен",
    login_first: "Сначала войдите, чтобы активировать аккаунт!",
    failed: "Активация не удалась",
    success_msg: "Ваша подписка успешно активирована!",
    server_error: "Ошибка подключения к серверу",
    loading: "Активация вашей подписки...",
    congrats: "Поздравляем! 🎉",
    pro_activated: "Ваша PRO подписка успешно активирована. Теперь вы можете использовать все функции.",
    go_dashboard: "Перейти в панель управления",
    activation_failed: "Извините, активация не удалась",
    enter_code_manually: "Введите код вручную",
    activate_btn: "Активировать",
    back_to_pricing: "Вернуться на страницу цен"
  }
});

