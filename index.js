const axios = require("axios");
const express = require("express"); // إضافة اكسبريس

const app = express();
const API_URL = "https://crm.alboraq-syr.com/api/public/reservations/catalog";
const BASE_URL = "https://crm.alboraq-syr.com";

const BOT_TOKEN = "8558475369:AAGoxbNPOsNV8elHerb1P82LGCvZ_F_XDSQ";
const CHAT_ID = "-5158382083";

// قائمة الـ IDs المستهدفة لتسهيل قراءة الكود وصيانته
const TARGET_IDS = [
  "c2b6cfdf-314f-41da-93a3-45c1a961ceca",
  "cd117f4e-0fd6-4649-923e-ad47ad573aa2",
  "dd9caedf-0e3a-42c2-9d31-46564ee72e46",
  "1c723523-c9c0-41de-abcb-f500747c0f0e"
  // "1c723523-c9c0-41de-abcb-f500747c0f0e",
  // "dd9caedf-0e3a-42c2-9d31-46564ee72e46",
];

async function sendTelegramMessage(product) {
  const imageUrl = product.images?.length ? BASE_URL + product.images[0] : null;

  const message = `
🔥 منتج متوفر الآن!

📦 الاسم: ${product.name}
💰 السعر: ${product.price} ${product.currency}
📦 الكمية المتاحة: ${product.available}

📝 الوصف:
${product.description || "لا يوجد وصف"}
`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      photo: imageUrl,
      caption: message.substring(0, 1024),
    });
    console.log(`✅ sended: ${product.name}`);
  } catch (error) {
    console.error(
      `❌ error sending product ${product.name}:`,
      error.response?.data || error.message,
    );
  }
}

async function checkProducts() {
  console.log("🔍 checking products...");
  try {
    const { data } = await axios.get(API_URL);

    for (const product of data) {
      if (product.available > 0 && TARGET_IDS.includes(product.id)) {
        await sendTelegramMessage(product);
      }
    }
    console.log("✅ end to check products.");
  } catch (error) {
    console.error("❌ error:", error.message);
  }
}

// ----------------------------------------------------
// إعدادات السيرفر لمنع Render من إظهار خطأ Port Binding
// ----------------------------------------------------

// مسار وهمي لفحص الحالة والتشغيل اليدوي إذا أردت
app.get("/", async (req, res) => {
  res.send("المنظومة تعمل بنجاح في الخلفية 🚀");
});

app.get("/force-check", async (req, res) => {
  await checkProducts();
  res.send("تم تشغيل الفحص يدوياً بنجاح!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);

  // تشغيل الفحص فوراً عند إقلاع السيرفر
  checkProducts();

  // تشغيل الفحص التلقائي كل دقيقتين
  setInterval(checkProducts, 2 * 60 * 1000);
});
