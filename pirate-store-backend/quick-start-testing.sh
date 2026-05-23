#!/bin/bash
# 🚀 QUICK START SCRIPT FOR REFUND TESTING
# ========================================
# استخدم هذا الملف لبدء الاختبار بسرعة

echo "🎯 Refund Service Testing - Quick Start"
echo "========================================"
echo ""

# تحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المكتبات..."
    npm install
    echo ""
fi

# اعرض الخيارات
echo "اختر طريقة الاختبار:"
echo "1. الاختبار السريع (npm run test:refund) ⚡"
echo "2. اختبارات الوحدة (npm test) 🧪"
echo "3. تشغيل الخادم (npm run dev) 🚀"
echo "4. جميع الخيارات أعلاه 🔄"
echo ""

read -p "الخيار (1-4): " choice

case $choice in
    1)
        echo ""
        echo "⚡ تشغيل الاختبار السريع..."
        npm run test:refund
        ;;
    2)
        echo ""
        echo "🧪 تشغيل اختبارات الوحدة..."
        npm test
        ;;
    3)
        echo ""
        echo "🚀 تشغيل الخادم..."
        npm run dev
        ;;
    4)
        echo ""
        echo "🔄 تشغيل جميع الاختبارات..."
        echo ""
        echo "⚡ الخطوة 1: الاختبار السريع"
        npm run test:refund
        echo ""
        echo "🧪 الخطوة 2: اختبارات الوحدة"
        npm test
        echo ""
        echo "✅ اكتمل الاختبار!"
        ;;
    *)
        echo "❌ اختيار غير صحيح"
        exit 1
        ;;
esac

echo ""
echo "✨ اكتمل!"
