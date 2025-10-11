//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { registerRoutes } from "./rotalar";
import { log, serveStatic } from "./static";
import { validateEnvironmentVariables } from "./env-validation";
import { storage } from "./depolama";

validateEnvironmentVariables();

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("env", "production");
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const pathReq = req.path;
  let capturedJsonResponse: any;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathReq.startsWith("/api")) {
      const externalIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const localIp = req.socket.localAddress || 'unknown';
      const host = req.headers['host'] || 'unknown';
      
      let logLine = `${req.method} ${pathReq} ${res.statusCode} in ${duration}ms [External IP: ${externalIp}, Local IP: ${localIp}, Host: ${host}]`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Server error:", err);
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0"; 

  server.listen(port, host, () => {
    log(`Dersime dönebilirim !!! Site Link : http://${host}:${port}`);
  });

  // Otomatik arşivleme zamanlayıcısı - Her Pazar 23:59'da çalışır (Türkiye saati GMT+3)
  function scheduleAutoArchive() {
    // Türkiye saati için tarih hesaplama
    const now = new Date();
    const turkeyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    
    // Bir sonraki Pazar 23:59'u bul
    const nextSunday = new Date(turkeyTime);
    const currentDay = nextSunday.getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
    
    // Bugün Pazar ise ve saat 23:59'u geçmemişse, bugün arşivle
    // Bugün Pazar ise ve saat 23:59'u geçtiyse, gelecek Pazar arşivle
    // Diğer günlerdeyse, bu haftanın veya gelecek haftanın Pazarına göre hesapla
    let daysUntilSunday: number;
    if (currentDay === 0) {
      // Pazar günü
      const targetTime = new Date(turkeyTime);
      targetTime.setHours(23, 59, 0, 0);
      daysUntilSunday = turkeyTime < targetTime ? 0 : 7;
    } else {
      // Pazar değil
      daysUntilSunday = 7 - currentDay;
    }
    
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
    nextSunday.setHours(23, 59, 0, 0);
    
    const msUntilSunday = nextSunday.getTime() - turkeyTime.getTime();

    setTimeout(() => {
      log("📅 Pazar 23:59 - Haftalık otomatik arşivleme başlatılıyor...");
      storage.autoArchiveOldData()
        .then(() => {
          log("✅ Haftalık otomatik arşivleme tamamlandı");
        })
        .catch((error) => {
          console.error("❌ Haftalık otomatik arşivleme hatası:", error);
        });
      
      // Bir sonraki hafta için tekrar zamanla (7 gün = 604800000 ms)
      setInterval(() => {
        log("📅 Pazar 23:59 - Haftalık otomatik arşivleme başlatılıyor...");
        storage.autoArchiveOldData()
          .then(() => {
            log("✅ Haftalık otomatik arşivleme tamamlandı");
          })
          .catch((error) => {
            console.error("❌ Haftalık otomatik arşivleme hatası:", error);
          });
      }, 7 * 24 * 60 * 60 * 1000); // 7 gün
    }, msUntilSunday);

    const hoursUntil = Math.round(msUntilSunday / 1000 / 60 / 60);
    const daysUntil = Math.floor(hoursUntil / 24);
    log(`⏰ Haftalık otomatik arşivleme zamanlayıcısı ayarlandı - ${daysUntil} gün ${hoursUntil % 24} saat sonra çalışacak (Pazar 23:59)`);
  }

  scheduleAutoArchive();
})();
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

