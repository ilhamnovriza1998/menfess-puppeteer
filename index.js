const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// setup multer untuk upload file foto
const upload = multer({ dest: "uploads/" });

// endpoint root
app.get("/", (req, res) => {
  res.send("🚀 Menfess Puppeteer aktif! Gunakan POST /post untuk kirim tweet otomatis.");
});

// === POST /post ===
// form-data: { text: "isi tweet", image: (file optional) }
app.post("/post", upload.single("image"), async (req, res) => {
  const { text } = req.body;
  const imagePath = req.file ? req.file.path : null;

  if (!text) {
    return res.status(400).json({ error: "Teks tidak boleh kosong" });
  }

  try {
    console.log("🔹 Membuka browser...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // ====== LOGIN KE X ======
    console.log("🔹 Login ke X...");
    await page.goto("https://x.com/login", { waitUntil: "networkidle2" });

    // Ganti ini dengan username & password akun Menfess kamu
    const USERNAME = process.env.X_USERNAME || "username_kamu";
    const PASSWORD = process.env.X_PASSWORD || "password_kamu";

    // Tunggu input user muncul
    await page.waitForSelector('input[name="text"], input[name="session[username_or_email]"]', { timeout: 20000 });

    // Isi username
    await page.type('input[name="text"], input[name="session[username_or_email]"]', USERNAME);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    // Jika muncul input password (kadang langsung kadang lewat step 2)
    try {
      await page.waitForSelector('input[name="password"]', { timeout: 5000 });
    } catch {}
    await page.type('input[name="password"]', PASSWORD);
    await page.keyboard.press("Enter");

    // Tunggu halaman utama selesai
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("✅ Login sukses");

    // ====== MULAI POSTING ======
    console.log("📝 Membuat postingan...");
    await page.goto("https://x.com/compose/tweet", { waitUntil: "networkidle2" });
    await page.waitForSelector('div[aria-label="Post text"]', { timeout: 15000 });

    await page.type('div[aria-label="Post text"]', text);

    // Jika ada gambar, upload juga
    if (imagePath) {
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('div[aria-label="Add photos or video"]'),
      ]);
      await fileChooser.accept([imagePath]);
      console.log("📸 Gambar ditambahkan");
    }

    // Klik tombol Post
    await page.waitForTimeout(2000);
    const postButton = await page.$('div[data-testid="tweetButtonInline"]');
    if (postButton) {
      await postButton.click();
      console.log("🚀 Tweet dikirim!");
    } else {
      throw new Error("Tombol Post tidak ditemukan");
    }

    await page.waitForTimeout(5000);
    await browser.close();

    // hapus file upload kalau ada
    if (imagePath) fs.unlinkSync(imagePath);

    res.json({ success: true, message: "Tweet berhasil diposting ✅" });
  } catch (err) {
    console.error("❌ Gagal posting:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server aktif di port ${PORT}`));
