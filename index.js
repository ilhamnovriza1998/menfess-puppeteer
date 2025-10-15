import express from "express";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json({ limit: "10mb" }));

const username = process.env.X_USERNAME;
const password = process.env.X_PASSWORD;

// 🧠 Fungsi utama untuk posting ke X
async function postToTwitter(text) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  console.log("🔹 Membuka Twitter...");
  await page.goto("https://x.com/login", { waitUntil: "networkidle2" });

  await page.waitForSelector('input[autocomplete="username"]', { visible: true });
  await page.type('input[autocomplete="username"]', username);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);

  await page.waitForSelector('input[name="password"]', { visible: true });
  await page.type('input[name="password"]', password);
  await page.keyboard.press("Enter");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log("✅ Login berhasil, menulis tweet...");

  await page.waitForSelector('div[aria-label="Post text"]', { visible: true });
  await page.click('div[aria-label="Post text"]');
  await page.keyboard.type(text);

  await page.waitForSelector('div[data-testid="tweetButtonInline"]', { visible: true });
  await page.click('div[data-testid="tweetButtonInline"]');

  console.log("🎉 Tweet terkirim:", text);
  await browser.close();
}

// 🛰️ Endpoint untuk menerima kiriman dari web kamu
app.post("/post", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Teks tidak boleh kosong" });

    await postToTwitter(text);
    res.json({ success: true, message: "Tweet berhasil diposting!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Port server Replit
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server aktif di port ${PORT}`));
