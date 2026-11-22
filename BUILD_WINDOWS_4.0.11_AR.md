# بناء الحمد برنت 4.0.11

يلزم Node.js حديث يدعم node:sqlite، وnpm، وأدوات Electron Builder المحددة في package-lock.json.

```sh
npm ci
npm test
npm run dist
```

المخرج dist-v4.0.11/Alhamd-Print-Setup-4.0.11.exe. مثبت NSIS تقليدي لنسختي Windows x64 وARM64 مع اختيار مجلد التثبيت واختصارات سطح المكتب وقائمة ابدأ. لم يتغير appId أو اسم المنتج أو مسار البيانات؛ deleteAppDataOnUninstall معطل.

فحص CRC في build/check-installer.cjs يجري تلقائيًا بعد البناء. يحتاج إنتاج نفس البايتات إلى نفس نسخ أدوات البناء والتوقيت. لا يتضمن أرشيف المصدر قواعد بيانات تشغيل أو مفاتيح توقيع أو مفاتيح حماية جهاز. الدليل RELEASE_4.0.11_AR.md يشرح الوظائف وحدود التحقق. حزمة التحقق تشمل سيناريوهات Electron وواجهة المتصفح، إلى جانب الاختبارات الآلية في tests/.
