"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = exports.DEFAULT_FLAGS = void 0;
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.getUserById = getUserById;
exports.seedFeatureFlags = seedFeatureFlags;
exports.getFeatureFlags = getFeatureFlags;
exports.getFlag = getFlag;
exports.checkFeatureAccess = checkFeatureAccess;
exports.seedSiteConfig = seedSiteConfig;
exports.getSiteConfig = getSiteConfig;
exports.setSiteConfig = setSiteConfig;
var db_1 = require("@/lib/db");
var auth_1 = require("@/lib/auth");
// ─── Auth (Prisma-backed) ─────────────────────────────────────────────────────
function createUser(input) {
    return __awaiter(this, void 0, void 0, function () {
        var existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.default.user.findUnique({ where: { email: input.email.toLowerCase() } })];
                case 1:
                    existing = _a.sent();
                    if (existing)
                        throw new Error("البريد الإلكتروني مسجّل مسبقاً");
                    return [2 /*return*/, db_1.default.user.create({
                            data: {
                                name: input.name,
                                email: input.email.toLowerCase(),
                                passwordHash: (0, auth_1.hashPassword)(input.password),
                                role: "USER",
                                plan: "FREE",
                            },
                            select: {
                                id: true, name: true, email: true, role: true, plan: true,
                                isActive: true, isEmailVerified: true, createdAt: true, lastLoginAt: true,
                            },
                        })];
            }
        });
    });
}
function loginUser(email, password, ip) {
    return __awaiter(this, void 0, void 0, function () {
        var user, token, passwordHash, pub;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.default.user.findUnique({ where: { email: email.toLowerCase() } })];
                case 1:
                    user = _a.sent();
                    if (!user)
                        throw new Error("البريد أو كلمة المرور غير صحيحة");
                    if (!(0, auth_1.verifyPassword)(password, user.passwordHash))
                        throw new Error("البريد أو كلمة المرور غير صحيحة");
                    if (!user.isActive)
                        throw new Error("حسابك موقوف. تواصل مع الدعم.");
                    return [4 /*yield*/, db_1.default.user.update({
                            where: { id: user.id },
                            data: {
                                lastLoginAt: new Date(),
                                lastLoginIp: ip,
                                loginCount: { increment: 1 },
                            },
                        })];
                case 2:
                    _a.sent();
                    token = (0, auth_1.createToken)({ sub: user.id, email: user.email, role: user.role });
                    passwordHash = user.passwordHash, pub = __rest(user, ["passwordHash"]);
                    return [2 /*return*/, { user: pub, token: token }];
            }
        });
    });
}
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.default.user.findUnique({
                    where: { id: id },
                    select: {
                        id: true, name: true, email: true, role: true, plan: true,
                        isActive: true, isEmailVerified: true, avatar: true, company: true,
                        website: true, createdAt: true, lastLoginAt: true, loginCount: true,
                    },
                })];
        });
    });
}
// ─── Feature Flags ────────────────────────────────────────────────────────────
exports.DEFAULT_FLAGS = [
    { key: "qr_generator", name: "مولد رمز QR", requiresAuth: true, isEnabled: true, minPlan: null },
    { key: "barcode_generator", name: "مولد الباركود", requiresAuth: true, isEnabled: true, minPlan: null },
    { key: "qr_scanner", name: "قارئ QR والباركود", requiresAuth: false, isEnabled: true, minPlan: null },
    { key: "bulk_generator", name: "الإنشاء بالجملة", requiresAuth: true, isEnabled: true, minPlan: "PRO" },
    { key: "dynamic_qr", name: "QR الديناميكي", requiresAuth: true, isEnabled: true, minPlan: null },
    { key: "analytics", name: "التحليلات", requiresAuth: true, isEnabled: true, minPlan: null },
    { key: "pdf_export", name: "تصدير PDF", requiresAuth: true, isEnabled: true, minPlan: "PRO" },
    { key: "custom_logo", name: "شعار مخصص على QR", requiresAuth: true, isEnabled: true, minPlan: "PRO" },
    { key: "blog", name: "المدونة", requiresAuth: false, isEnabled: true, minPlan: null },
    { key: "pricing", name: "صفحة الأسعار", requiresAuth: false, isEnabled: true, minPlan: null },
    { key: "registration", name: "التسجيل الجديد", requiresAuth: false, isEnabled: true, minPlan: null },
    { key: "adsense", name: "إعلانات AdSense", requiresAuth: false, isEnabled: false, minPlan: null },
];
function seedFeatureFlags() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, DEFAULT_FLAGS_1, flag;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, DEFAULT_FLAGS_1 = exports.DEFAULT_FLAGS;
                    _a.label = 1;
                case 1:
                    if (!(_i < DEFAULT_FLAGS_1.length)) return [3 /*break*/, 4];
                    flag = DEFAULT_FLAGS_1[_i];
                    return [4 /*yield*/, db_1.default.featureFlag.upsert({
                            where: { key: flag.key },
                            update: {},
                            create: {
                                key: flag.key,
                                name: flag.name,
                                isEnabled: flag.isEnabled,
                                requiresAuth: flag.requiresAuth,
                                minPlan: flag.minPlan,
                            },
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getFeatureFlags() {
    return __awaiter(this, void 0, void 0, function () {
        var flags;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.default.featureFlag.findMany({ orderBy: { key: "asc" } })];
                case 1:
                    flags = _a.sent();
                    if (!(flags.length === 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, seedFeatureFlags()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, db_1.default.featureFlag.findMany({ orderBy: { key: "asc" } })];
                case 3: return [2 /*return*/, flags];
            }
        });
    });
}
function getFlag(key) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.default.featureFlag.findUnique({ where: { key: key } })];
        });
    });
}
function checkFeatureAccess(key, user) {
    return __awaiter(this, void 0, void 0, function () {
        var flag, ORDER, userLevel, minLevel;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getFlag(key)];
                case 1:
                    flag = _c.sent();
                    if (!flag)
                        return [2 /*return*/, { allowed: true }];
                    if (!flag.isEnabled)
                        return [2 /*return*/, { allowed: false, reason: "feature_disabled" }];
                    if (flag.requiresAuth && !user)
                        return [2 /*return*/, { allowed: false, reason: "auth_required" }];
                    if (flag.minPlan && user) {
                        ORDER = { FREE: 0, PRO: 1, BUSINESS: 2 };
                        userLevel = (_a = ORDER[user.plan]) !== null && _a !== void 0 ? _a : 0;
                        minLevel = (_b = ORDER[flag.minPlan]) !== null && _b !== void 0 ? _b : 0;
                        if (userLevel < minLevel)
                            return [2 /*return*/, { allowed: false, reason: "upgrade_required", }];
                    }
                    return [2 /*return*/, { allowed: true }];
            }
        });
    });
}
// ─── Site Config ─────────────────────────────────────────────────────────────
exports.DEFAULT_CONFIG = [
    { key: "site_name", value: "باركودي", type: "string", group: "general", label: "اسم الموقع" },
    { key: "site_description", value: "مولد وقارئ باركود ورموز QR", type: "string", group: "general", label: "وصف الموقع" },
    { key: "adsense_id", value: "", type: "string", group: "ads", label: "معرّف AdSense" },
    { key: "adsense_slot_top", value: "", type: "string", group: "ads", label: "كود وحدة الإعلان العلوي" },
    { key: "maintenance_mode", value: "false", type: "boolean", group: "general", label: "وضع الصيانة" },
    { key: "max_free_qr", value: "10", type: "number", group: "limits", label: "حد الرموز المجانية" },
    { key: "max_pro_qr", value: "100", type: "number", group: "limits", label: "حد الرموز Pro" },
    { key: "analytics_enabled", value: "true", type: "boolean", group: "general", label: "تتبع الزوار" },
    { key: "free_plan_name", value: "مجاني", type: "string", group: "pricing", label: "اسم الخطة المجانية" },
    { key: "free_plan_desc", value: "مثالي للاستخدام الشخصي والتجربة", type: "string", group: "pricing", label: "وصف الخطة المجانية" },
    { key: "free_plan_price", value: "0", type: "number", group: "pricing", label: "سعر المجانية ($)" },
    { key: "free_plan_features", value: "10 رموز QR يومياً\n8 أنواع باركود\nقارئ QR والباركود\nتصدير PNG فقط\nإنشاء بالجملة (10 رموز)", type: "text", group: "pricing", label: "ميزات المجانية (كل ميزة في سطر)" },
    { key: "pro_plan_name", value: "احترافي", type: "string", group: "pricing", label: "اسم خطة Pro" },
    { key: "pro_plan_desc", value: "للمحترفين وأصحاب الأعمال", type: "string", group: "pricing", label: "وصف خطة Pro" },
    { key: "pro_plan_price", value: "29", type: "number", group: "pricing", label: "سعر Pro ($)" },
    { key: "pro_plan_features", value: "100 رمز QR\nجميع أنواع الباركود (20+)\nقارئ متقدم بالكاميرا\nتصدير PNG + SVG + PDF\nإنشاء بالجملة (1000 رمز)\nشعار مخصص\nروابط مختصرة\nتاريخ الرموز (90 يوم)", type: "text", group: "pricing", label: "ميزات Pro (كل ميزة في سطر)" },
    { key: "biz_plan_name", value: "أعمال", type: "string", group: "pricing", label: "اسم خطة أعمال" },
    { key: "biz_plan_desc", value: "للشركات والفرق الكبيرة", type: "string", group: "pricing", label: "وصف خطة أعمال" },
    { key: "biz_plan_price", value: "99", type: "number", group: "pricing", label: "سعر أعمال ($)" },
    { key: "biz_plan_features", value: "كل ميزات الاحترافي\nإنشاء بالجملة (غير محدود)\nAPI Access كامل\nلوحة تحكم للفريق\nتحليلات متقدمة\nدعم مخصص 24/7\nتخصيص العلامة التجارية\nتاريخ الرموز (غير محدود)", type: "text", group: "pricing", label: "ميزات أعمال (كل ميزة في سطر)" },
];
function seedSiteConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, DEFAULT_CONFIG_1, cfg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, DEFAULT_CONFIG_1 = exports.DEFAULT_CONFIG;
                    _a.label = 1;
                case 1:
                    if (!(_i < DEFAULT_CONFIG_1.length)) return [3 /*break*/, 4];
                    cfg = DEFAULT_CONFIG_1[_i];
                    return [4 /*yield*/, db_1.default.siteConfig.upsert({
                            where: { key: cfg.key },
                            update: { label: cfg.label, group: cfg.group, type: cfg.type },
                            create: cfg,
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getSiteConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var configs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.default.siteConfig.findMany()];
                case 1:
                    configs = _a.sent();
                    if (!(configs.length === 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, seedSiteConfig()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getSiteConfig()];
                case 3: return [2 /*return*/, Object.fromEntries(configs.map(function (c) { return [c.key, c.value]; }))];
            }
        });
    });
}
function setSiteConfig(key, value, adminId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.default.siteConfig.upsert({
                    where: { key: key },
                    update: { value: value },
                    create: { key: key, value: value },
                })];
        });
    });
}
