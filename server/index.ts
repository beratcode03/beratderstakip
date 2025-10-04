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
      let logLine = `${req.method} ${pathReq} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
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
  const host = process.env.NODE_ENV === "production" ? "127.0.0.1" : "localhost";

  server.listen(port, host, () => {
    log(`Dersime dönebilirim !!! Site Link : http://${host}:${port}`);
  });

  // Otomatik arşivleme zamanlayıcısı - Her gece 00:00'da çalışır
  function scheduleAutoArchive() {
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );
    const msUntilMidnight = night.getTime() - now.getTime();

    setTimeout(() => {
      log("🕛 Gece yarısı - Otomatik arşivleme başlatılıyor...");
      storage.autoArchiveOldData()
        .then(() => {
          log("✅ Otomatik arşivleme tamamlandı");
        })
        .catch((error) => {
          console.error("❌ Otomatik arşivleme hatası:", error);
        });
      
      // Bir sonraki gün için tekrar zamanla
      setInterval(() => {
        log("🕛 Gece yarısı - Otomatik arşivleme başlatılıyor...");
        storage.autoArchiveOldData()
          .then(() => {
            log("✅ Otomatik arşivleme tamamlandı");
          })
          .catch((error) => {
            console.error("❌ Otomatik arşivleme hatası:", error);
          });
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    log(`⏰ Otomatik arşivleme zamanlayıcısı ayarlandı - ${Math.round(msUntilMidnight / 1000 / 60)} dakika sonra çalışacak`);
  }

  scheduleAutoArchive();
})();
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

