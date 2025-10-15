const express = require("express");
const puppeteer = require("puppeteer");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// setup multer untuk file upload
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("Menfess bot alive 🚀");
});

app.post("/post", upload.single("photo"), async (req, res) => {
  try {
    const text = req.body.text;
    const photo = req.file;  // mungkin undefined kalau tidak ada foto

    console.log("📩 Received post request:", { text, hasPhoto: !!photo });

    // open browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // login ke X
    await page.goto("https://twitter.com/login", { waitUntil: "networkidle2" });
    // nanti kamu masukkan logika login (username, password) di sini
    // contohnya:
    // await page.type('input[name="session[username_or_email]"]', process.env.TWITTER_USERNAME);
    // await page.type('input[name="session[password]"]', process.env.TWITTER_PASSWORD);
    // await page.keyboard.press('Enter');
    // await page.waitForNavigation({ waitUntil: "networkidle2" });

    // buka form tweet
    await page.goto("https://twitter.com/compose/tweet", { waitUntil: "networkidle2" });
    await page.type('div[aria-label="Tweet text"]', text);

    if (photo) {
      // upload foto
      const photoPath = photo.path;
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('div[aria-label="Add photos or video"]')
      ]);
      await fileChooser.accept([photoPath]);
      console.log("📸 Photo uploaded via Puppeteer");
      // tunggu thumbnail muncul atau delay sedikit
      await page.waitForTimeout(2000);
    }

    // klik tombol Tweet
    await page.click('div[data-testid="tweetButtonInline"]');
    await page.waitForTimeout(3000);  // tunggu posting selesai

    await browser.close();

    // hapus file temp upload
    if (photo) {
      fs.unlink(photo.path, (err) => {
        if (err) console.warn("⚠️ Failed delete temp photo:", err);
      });
    }

    return res.json({ success: true, message: "Tweet posted by bot" });
  } catch (error) {
    console.error("🔥 Error in /post:", error);
    return res.status(500).json({ success: false, error: error.toString() });
  }
});

// port Railway default — process.env.PORT atau 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot menfess listening on port ${PORT}`);
});
