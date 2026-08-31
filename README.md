# رحلة الثانوية 🎓

تطبيق تحفيزي لطلاب الثانوية العامة: مذاكرة، نقاط، اختبارات، شارات وتقدم.

## تم تجهيز المشروع
- Expo / React Native
- Supabase Authentication + Database
- حفظ جلسات المذاكرة والمدة
- اختبارات ونتائج
- نقاط وStreak وشارات
- إعداد EAS لإخراج APK

## قاعدة البيانات
افتح `supabase_schema.sql` في Supabase SQL Editor ونفذه كاملًا.

## إعداد التطبيق
أنشئ ملف `.env` اعتمادًا على `.env.example` وضع Project URL وAnon/Publishable Key فقط.
لا تضع Service Role Key داخل التطبيق.

## بناء APK
بعد إعداد Expo/EAS:
`npm install`
`npx eas login`
`npx eas build --platform android --profile preview`

ملاحظة: بناء APK النهائي يحتاج حساب EAS، كما أن ربط قاعدة البيانات يحتاج بيانات مشروع Supabase الخاص بك.
