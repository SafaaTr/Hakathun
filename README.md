# 🐾 منصة رفيق لإدارة ورعاية الحيوانات الأليفة  
### **Rafeeq Pet Care Platform — Unified Web & Core Backend**

![Version](https://img.shields.io/badge/version-1.2--Nov2026-brightgreen?style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 📖 نظرة عامة على المشروع (Executive Overview)

**منصة رفيق (Rafeeq)** هي منظومة رقمية متكاملة تجمع في بيئة واحدة كافة أطراف قطاع رعاية الحيوانات الأليفة في سوريا:
1. **أصحاب الحيوانات الأليفة (Pet Owners):** إدارة ملفات الحيوانات الصحية، حجز مواعيد الأطباء البيطريين، طلب رعاية استضافة منزلية مؤقتة أثناء السفر، والتسوق من متاجر مستلزمات الحيوانات.
2. **الأطباء البيطريون (Veterinarians):** إدارة العيادات، تحديد المواعيد الأسبوعية، استقبال وتأكيد/رفض طلبات الكشف الطبي، ومتابعة سجلات التطعيم.
3. **المربون المستضيفون (Host Caregivers):** تقديم خدمات الاستضافة المنزلية أو الريفية (Home / Barn) للحيوانات الأليفة خلال غياب أصحابها، واستعراض طلبات الرعاية وتأكيدها وتقييم أصحاب الحيوانات.
4. **أصحاب المتاجر (Store Owners):** إدارة المتاجر المعتمدة، عرض وتحديث المنتجات والمستلزمات، ومتابعة طلبات الشراء الدفع عند الاستلام (COD).
5. **مديرو النظام (Super Admins):** إشراف رقابي وإداري كامل على إنشاء وتفعيل وتعطيل حسابات الأطباء، المربين، والمتاجر، مع لوحة إحصائيات حية (KPIs).

> **الالتزام الكامل بالمواصفات الفنية:** تم بناء وهندسة المشروع بالكامل وفق **وثيقة التحليل الفني والمواصفات الشاملة (الإصدار 1.2 — تشرين الثاني 2026)**، مع الالتزام الصارم بالقاعدة الذهبية لتوحيد التسميات (Golden Rule).

---

## 🏛 المعمارية البرمجية (System Architecture)

يعتمد المشروع معمارية حديثة وموزعة بنظام Monorepo منظم يحتوي على طبقتين أساسيتين:

```
Hakathun/
├── backend/                  # خادم الباك إيند المركزي (NestJS Core API)
│   ├── src/
│   │   ├── modules/          # وحدات الأعمال (Admin, Auth, Pets, Host, Vet, Store, Reviews)
│   │   ├── database/         # مخططات MongoDB Mongoose Schemas الـ 12
│   │   └── common/           # الفلاتر، حراس الصلاحيات (Guards)، والمشغلات (Interceptors)
│   └── package.json
│
├── front-web/                # لوحة التحكم وتطبيق الويب (Next.js 16 Web Dashboard)
│   ├── src/
│   │   ├── app/              # مسارات App Router وصفحات الإدارة والمتجر
│   │   ├── components/       # مكونات واجهة المستخدم (Modals, Forms, Sidebar, Tables)
│   │   ├── context/          # إدارة الحالة وتوثيق الجلسات (AuthContext)
│   │   └── services/         # طبقة التواصل مع واجهات الـ API (Axios Service Layer)
│   └── package.json
│
└── README.md                 # دليل التوثيق والتشغيل
```

---

## ✨ أبرز مميزات ووظائف المنصة (Key Features)

### 1. الإشراف الرقابي والإداري (Super Admin Console)
- **إدارة المتاجر (Stores Management):** إنشاء حسابات المتاجر، ربط المالك تلقائياً، وتفعيل أو إغلاق المتجر (`active` / `closed`).
- **إدارة المربيين المستضيفين (Host Caregivers):** تسجيل المربيين مع نوع المكان (منزل / حظيرة)، نوع التسعير (مجاني / مدفوع)، السعر اليومي، والتحكم بحالة التوفر (`available` / `unavailable`).
- **إدارة الأطباء البيطريين (Veterinarians):** اعتماد وتفعيل الأطباء وعياداتهم مع تشفير فوري لكلمات المرور.
- **مؤشرات الأداء الحية (KPIs Stats):** إحصائيات متزامنة لعدد المستخدمين، الحيوانات المسجلة، المتاجر النشطة، والطلبات والحجوزات.

### 2. السجلات الطبية والملف الصحي (Pet Profile)
- توليد كود مرجعي فريد لكل حيوان أليف بصيغة: `PET-XXXXXX`.
- تسجيل نوع الحيوان، العمر، صورة الحيوان، تاريخ آخر زيارة بيطرية، وسجل التطعيمات بصيغة `PDF`.

### 3. العيادات وحجوزات المواعيد البيطرية (Vet Care & Appointments)
- جدول زمني أسبوعي للمواعيد مخصص لكل طبيب (`vet_slots`).
- نظام حجز موعد بيطري برقم مرجعي `VET-XXXXXX`، مع إمكانية قبول أو رفض الطلب من الطبيب وتحديث حالة الحجز فوراً.

### 4. الاستضافة والرعاية المؤقتة (Host Boarding)
- حجز رعاية مؤقتة للمربين برقم مرجعي `HST-XXXXXX` مع تحديد تواريخ البداية والنهاية وملاحظات تغذية الحيوان.
- تصفية المربيين حسب الموقع ونوع الحيوان المقبول ومتوسط التقييمات.

### 5. المتجر الإلكتروني والدفع عند الاستلام (E-Commerce & Orders)
- إضافة المنتجات للسلة وحساب المجموع تلقائياً.
- إتمام الشراء بخيار الدفع عند الاستلام (Cash On Delivery) وتوليد رقم طلب `ORD-XXXXXX`.

### 6. نظام التقييمات التبادلية (Reviews & Ratings)
- تقييم بالنجوم (1 إلى 5 نجوم) مع تعليق نصي يولد كود `REV-XXXXXX`.
- احتساب تقييمات الأطباء والمربيين ديناميكياً عبر MongoDB Aggregation Pipelines دون تخزين مكرر.

---

## 🔒 الأمان وحماية البيانات (Security & Best Practices)

- **مصفوفة الأدوار وحيدة القيمة (Single Role per User):** يمتلك كل مستخدم دوراً واحداً فقط داخل مصفوفة `roles` لمنع تضارب الصلاحيات (`pet_owner` | `veterinarian` | `host_caregiver` | `store_owner` | `admin`).
- **التحقق من الهاتف السوري:** حظر تسجيل أي رقم لا يطابق النمط السوري المعتمد (`09XXXXXXXX` - 10 أرقام بالضبط).
- **حماية الصلاحيات (RBAC Guards):** حظر أي محاولات وصول غير مصرح بها بكود `403 Forbidden`.
- **هيكلية الاستجابة الموحدة (Standard API Envelope):** 100% من استجابات النظام مطابقة للصيغة:
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": { ... }
  }
  ```

---

## 🚀 دليل التشغيل والتثبيت المحلي (Quick Start Guide)

### المتطلبات الأساسية:
- **Node.js** (إصدار 18 فما فوق)
- **MongoDB** محلي أو عبر سحابة (يعمل افتراضياً على المنفذ `27017`)

---

### 1. تشغيل خادم الباك إيند (Backend API)
```bash
# الانتقال لمجلد الباك إيند
cd backend

# تثبيت الحزم
npm install

# بناء المشروع وتوليد ملفات الإنتاج
npm run build

# تشغيل الخادم (يعمل على المنفذ 3001)
node dist/main.js
# أو عبر بيئة التطوير:
npm run start:dev
```
> الخادم سيعمل مباشرة على: `http://localhost:3001/api/v1`

---

### 2. تشغيل واجهة الويب (Frontend Web)
```bash
# الانتقال لمجلد واجهة الويب
cd front-web

# تثبيت الحزم
npm install

# تشغيل خادم التطوير (يعمل على المنفذ 3000)
npm run dev
```
> افتح المتصفح على: `http://localhost:3000`

---

## 🔑 الحسابات التجريبية الجاهزة (Demo Credentials)

| الدور (Role) | اسم المستخدم / البريد | كلمة المرور (Password) | المنصة / الواجهة |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@rafeeq.sy` | `Admin@2026` | Web Dashboard (`/dashboard/admin/*`) |
| **Store Owner** | `maya@happypaws.sy` | `StoreOwner@2026` | Web Dashboard (`/dashboard/products`) |
| **Veterinarian** | `Dr. Zaid Khouri` | `VetPass123` | Mobile / Internal API |
| **Host Caregiver** | `Nasser Al-Homsi` | `HostPass123` | Mobile / Internal API |
| **Pet Owner** | `Sarah Pet Owner` | `Password123` | Mobile / Client API |

---

## 🧪 نتائج الاختبارات البرمجية والتحقق (Test Results)

- **اختبارات التكامل End-to-End (E2E Integration):** اجتياز **27 من أصل 27 اختباراً بنسبة 100%**.
- **اختبارات الأمان واختراق JWT و RBAC:** اجتياز **13 من أصل 13 فحصاً أمنياً بنسبة 100%**.
- **أداء وتحمل الخادم (Throughput & Concurrency):** معدل معالجة يتجاوز **260 - 330 طلب في الثانية (req/sec)** مع زمن استجابة P50 يبلغ **21ms**.

---

<div align="center">
  <b>تم التطوير والربط لصالح مسابقة هاكاثون رفيق لرعاية الحيوانات الأليفة 2026 🐾</b>
</div>
