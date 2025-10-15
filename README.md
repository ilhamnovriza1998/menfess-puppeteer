# Menfess Puppeteer Bot

Backend bot Puppeteer yang berjalan di Railway untuk posting tweet (text & foto) ke akun X/Twitter.

## 📦 Instalasi & Deployment

1. Clone repo ini ke lokal atau langsung deploy ke Railway.
2. Tambahkan **SECRET ENV** di Railway:
   - `TWITTER_USERNAME` — username X kamu
   - `TWITTER_PASSWORD` — password X kamu
3. Deploy — Railway otomatis install `package.json`.
4. Gunakan endpoint `/post` (method POST) untuk trigger posting:

```bash
curl -X POST https://your-bot-url.railway.app/post \
  -F "text=Halo dari menfess!" \
  -F "photo=@/path/to/image.jpg"
