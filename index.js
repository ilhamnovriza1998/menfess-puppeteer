import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", async (req, res) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto("https://x.com");
  res.send("Puppeteer bot is running!");
  await browser.close();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
