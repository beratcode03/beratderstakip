// BERAT CANKIR
// BERAT BİLAL CANKIR
// CANKIR




import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./depolama";

// Activity logger helper - outputs to stdout for Electron to capture
function logActivity(action: string, description?: string) {
  const timestamp = new Date().toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const message = description 
    ? `[ACTIVITY] ${action} | ${description}`
    : `[ACTIVITY] ${action}`;
  console.log(message);
}

import {
  insertTaskSchema,
  insertMoodSchema,
  insertGoalSchema,
  insertQuestionLogSchema,
  insertExamResultSchema,
  insertFlashcardSchema,
  insertExamSubjectNetSchema,
  insertStudyHoursSchema,
  insertSetupCompletedSchema,
} from "@shared/sema";
import { z } from "zod";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
dotenv.config();

interface WeatherData {
  main: {
    temp: number;
    temp_max: number;
    temp_min: number;
    humidity: number;
    pressure: number;
    feels_like: number;
  };
  weather: Array<{ id: number; description: string; main: string }>;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  rain?: { "1h"?: number; "3h"?: number };
  snow?: { "1h"?: number; "3h"?: number };
  cod?: number | string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Görev routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      logActivity('Görev Eklendi', validatedData.title);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ 
            message: "Görev verisi geçersiz. Lütfen tüm gerekli alanları kontrol edin.", 
            errors: error.errors 
          });
      } else {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Görev oluşturulurken bir hata oluştu. Lütfen tekrar deneyin." });
      }
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  app.patch("/api/tasks/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.toggleTaskComplete(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      logActivity('Görev Durumu Değiştirildi', task.completed ? 'Tamamlandı' : 'Beklemede');
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle task completion" });
    }
  });

  app.patch("/api/tasks/:id/archive", async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.archiveTask(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      logActivity('Görev Arşivlendi');
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to archive task" });
    }
  });

  app.patch("/api/tasks/:id/unarchive", async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.updateTask(id, { archived: false });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      logActivity('Görev Geri Yüklendi', 'Arşivden çıkarıldı');
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to unarchive task" });
    }
  });

  app.get("/api/tasks/archived", async (req, res) => {
    try {
      const tasks = await storage.getArchivedTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch archived tasks" });
    }
  });

  app.get("/api/tasks/by-date-range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const tasks = await storage.getTasksByDateRange(startDate as string, endDate as string);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks by date range" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);

      if (!deleted) {
        return res.status(404).json({ message: "Görev bulunamadı. Zaten silinmiş olabilir." });
      }

      logActivity('Görev Silindi');
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Görev silinirken bir hata oluştu. Lütfen tekrar deneyin." });
    }
  });

  // Ruh hali routes
  app.get("/api/moods", async (req, res) => {
    try {
      const moods = await storage.getMoods();
      res.json(moods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch moods" });
    }
  });

  app.get("/api/moods/latest", async (req, res) => {
    try {
      const mood = await storage.getLatestMood();
      res.json(mood);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest mood" });
    }
  });

  app.post("/api/moods", async (req, res) => {
    try {
      const validatedData = insertMoodSchema.parse(req.body);
      const mood = await storage.createMood(validatedData);
      res.status(201).json(mood);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid mood data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create mood" });
      }
    }
  });

  // raporlarım ve takvim kısmı routes
  app.get("/api/summary/daily", async (req, res) => {
    try {
      const range = parseInt(req.query.range as string) || 30;
      const summary = await storage.getDailySummary(range);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily summary" });
    }
  });

  app.get("/api/calendar/:date", async (req, res) => {
    try {
      const { date } = req.params; // YYYY-AA-GG format
      
      // Görevleri getir (arşivlenmiş dahil - takvim için)
      let activeTasks = [];
      let archivedTasks = [];
      try {
        activeTasks = await storage.getTasksByDate(date) || [];
        archivedTasks = await storage.getArchivedTasks() || [];
      } catch (taskError) {
        console.error("❌ Error fetching tasks:", taskError);
        activeTasks = [];
        archivedTasks = [];
      }
      
      const archivedTasksForDate = archivedTasks.filter((t: any) => {
        if (t.dueDate) {
          const taskDate = t.dueDate.split('T')[0];
          return taskDate === date;
        }
        if (t.createdAt) {
          const createdDate = new Date(t.createdAt).toISOString().split('T')[0];
          return createdDate === date;
        }
        return false;
      });
      const tasksForDate = [...activeTasks, ...archivedTasksForDate];
      
      // Çalışma saatlerini getir (arşivlenmiş dahil - takvim için)
      let activeStudyHours = [];
      let archivedStudyHours = [];
      try {
        activeStudyHours = await storage.getStudyHours() || [];
        archivedStudyHours = await storage.getArchivedStudyHours() || [];
      } catch (studyError) {
        console.error("❌ Error fetching study hours:", studyError);
        activeStudyHours = [];
        archivedStudyHours = [];
      }
      
      const allStudyHours = [...activeStudyHours, ...archivedStudyHours];
      const studyHoursForDate = allStudyHours.filter((sh: any) => sh.study_date === date);
      
      // Soru loglarını getir (arşivlenmiş dahil - takvim için)
      let activeQuestionLogs = [];
      let archivedQuestionLogs = [];
      try {
        activeQuestionLogs = await storage.getQuestionLogs() || [];
        archivedQuestionLogs = await storage.getArchivedQuestionLogs() || [];
      } catch (questionError) {
        console.error("❌ Error fetching question logs:", questionError);
        activeQuestionLogs = [];
        archivedQuestionLogs = [];
      }
      
      const allQuestionLogs = [...activeQuestionLogs, ...archivedQuestionLogs];
      const questionsForDate = allQuestionLogs.filter((q: any) => q.study_date === date);
      
      // Sınav sonuçlarını getir (arşivlenmiş dahil - takvim için)
      let activeExamResults = [];
      let archivedExamResults = [];
      try {
        activeExamResults = await storage.getExamResults() || [];
        archivedExamResults = await storage.getArchivedExamResults() || [];
      } catch (examError) {
        console.error("❌ Error fetching exam results:", examError);
        activeExamResults = [];
        archivedExamResults = [];
      }
      
      const allExamResults = [...activeExamResults, ...archivedExamResults];
      const examsForDate = allExamResults.filter((e: any) => e.exam_date === date);

      // günlük kalan gün sayısı hesaplama - Türkiye saati ile (UTC+3)
      // Türkiye saatine göre bugünün tarihini al
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Europe/Istanbul',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
      });
      const istanbulDateStr = formatter.format(now); // YYYY-MM-DD formatında
      const [todayYear, todayMonth, todayDay] = istanbulDateStr.split('-').map(Number);
      const today = new Date(todayYear, todayMonth - 1, todayDay);
      
      // Hedef tarihi parse et
      const [year, month, day] = date.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day);

      const diffTime = targetDate.getTime() - today.getTime();
      // Math.floor kullanarak negatif değerleri doğru hesapla (dün = -1, bugün = 0, yarın = 1)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const response = {
        date,
        dayNumber: targetDate.getDate(),
        daysRemaining: diffDays,
        tasks: tasksForDate,
        tasksCount: tasksForDate.length,
        studyHours: studyHoursForDate,
        questions: questionsForDate,
        exams: examsForDate,
      };
      
      res.json(response);
    } catch (error) {
      console.error("❌ Calendar endpoint error:", error);
      console.error("❌ Error details:", {
        name: (error as Error)?.name,
        message: (error as Error)?.message,
        stack: (error as Error)?.stack
      });
      res.status(500).json({ message: "Failed to fetch calendar data", error: (error as Error)?.message });
    }
  });

  // NET HESAPLAMA
  app.post("/api/calculate-ranking", async (req, res) => {
    try {
      const { nets, year } = req.body;

      // nets objesi örneği:
      let tytNets = 0;
      let aytNets = 0;

      // TYT neti hesaplama
      if (nets?.tyt) {
        const tyt = nets.tyt;
        tytNets =
          (parseFloat(tyt.turkce) || 0) +
          (parseFloat(tyt.sosyal) || 0) +
          (parseFloat(tyt.matematik) || 0) +
          (parseFloat(tyt.fen) || 0);
      }

      // AYT neti hesaplama
      if (nets?.ayt) {
        const ayt = nets.ayt;
        aytNets =
          (parseFloat(ayt.matematik) || 0) +
          (parseFloat(ayt.fizik) || 0) +
          (parseFloat(ayt.kimya) || 0) +
          (parseFloat(ayt.biyoloji) || 0);
      }

      // 2023-2025 YKS sıralama verileri (yaklaşık değerler)
      //burası kullanılmayacak
      const rankingData: Record<string, any> = {
        "2023": {
          tytWeight: 0.4,
          aytWeight: 0.6,
          rankings: {
            350: 1000,
            320: 5000,
            300: 10000,
            280: 20000,
            260: 35000,
            240: 50000,
            220: 75000,
            200: 100000,
            180: 150000,
            160: 200000,
          },
        },
        "2024": {
          tytWeight: 0.4,
          aytWeight: 0.6,
          rankings: {
            360: 1000,
            330: 5000,
            310: 10000,
            290: 20000,
            270: 35000,
            250: 50000,
            230: 75000,
            210: 100000,
            190: 150000,
            170: 200000,
          },
        },
        "2025": {
          tytWeight: 0.4,
          aytWeight: 0.6,
          rankings: {
            355: 1000,
            325: 5000,
            305: 10000,
            285: 20000,
            265: 35000,
            245: 50000,
            225: 75000,
            205: 100000,
            185: 150000,
            165: 200000,
          },
        },
      };

      const yearData = rankingData[year] || rankingData["2024"];

      // numarasal hatalara karşı kontrol
      if (isNaN(tytNets)) tytNets = 0;
      if (isNaN(aytNets)) aytNets = 0;

      // Net'i puana çevirme (yaklaşık formül)
      const tytScore = tytNets * 4; // Her doğru ~4 puan
      const aytScore = aytNets * 4; // Her doğru ~4 puan

      // Ağırlıklı toplam puan
      const totalScore =
        tytScore * yearData.tytWeight + aytScore * yearData.aytWeight;

      // En yakın sıralamayı bul
      let estimatedRanking = 500000; // Varsayılan
      const scores = Object.keys(yearData.rankings)
        .map(Number)
        .sort((a, b) => b - a);

      for (const score of scores) {
        if (totalScore >= score) {
          estimatedRanking = yearData.rankings[score];
          break;
        }
      }

      res.json({
        tytScore: tytScore.toFixed(2),
        aytScore: aytScore.toFixed(2),
        totalScore: totalScore.toFixed(2),
        estimatedRanking,
        year,
        methodology: "2023-2025 YKS verilerine dayalı tahmin",
      });
    } catch (error) {
      console.error("Ranking calculation error:", error);
      res.status(500).json({ message: "Sıralama hesaplanamadı" });
    }
  });

  // Goal routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(id, validatedData);

      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGoal(id);

      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Sakarya,serdivan için hava durumu route
  app.get("/api/weather", async (req, res) => {
    try {
      const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

      let currentData: WeatherData;
      let forecastData: any;
      let airQualityData: any;
      let uvData: any;

      if (!OPENWEATHER_API_KEY) {
        // API anahtarı yoksa statik veri kullan
        currentData = {
          main: {
            temp: 18,
            temp_max: 20,
            temp_min: 15,
            humidity: 75,
            pressure: 1013,
            feels_like: 18,
          },
          weather: [{ id: 800, description: "açık", main: "Clear" }],
          wind: { speed: 2.5, deg: 180 },
          clouds: { all: 20 },
          visibility: 10000,
          sys: {
            sunrise: Math.floor(new Date().setHours(5, 54, 0, 0) / 1000),
            sunset: Math.floor(new Date().setHours(18, 53, 0, 0) / 1000),
          },
        };
        forecastData = { list: [] };
        airQualityData = {
          list: [
            { main: { aqi: 2 }, components: { pm2_5: 15, pm10: 25, o3: 60 } },
          ],
        };
        uvData = { value: 4 };
      } else {
        // Sakarya, Serdivan için gerçek OpenWeather API çağrıları (lat: 40.7969, lon: 30.3781)
        const lat = 40.7969;
        const lon = 30.3781;

        try {
          // hava durumu
          const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`,
          );
          currentData = await currentResponse.json();
          
          // API başarısız olursa (geçersiz anahtar vs) statik veri kullan
          if (!currentData || !currentData.main || currentData.cod === 401 || currentData.cod === '401') {
            console.log("Weather API key is invalid, using static data");
            currentData = {
              main: {
                temp: 18,
                temp_max: 20,
                temp_min: 15,
                humidity: 75,
                pressure: 1013,
                feels_like: 18,
              },
              weather: [{ id: 800, description: "açık", main: "Clear" }],
              wind: { speed: 2.5, deg: 180 },
              clouds: { all: 20 },
              visibility: 10000,
              sys: {
                sunrise: Math.floor(new Date().setHours(5, 54, 0, 0) / 1000),
                sunset: Math.floor(new Date().setHours(18, 53, 0, 0) / 1000),
              },
            };
            forecastData = { list: [] };
            airQualityData = {
              list: [
                { main: { aqi: 2 }, components: { pm2_5: 15, pm10: 25, o3: 60 } },
              ],
            };
            uvData = { value: 4 };
          } else {
            // 5 günlük tahmin
            const forecastResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`,
            );
            forecastData = await forecastResponse.json();

            // hava kalitesi
            const airQualityResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`,
            );
            airQualityData = await airQualityResponse.json();

            // uv indeksi
            const uvResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`,
            );
            uvData = await uvResponse.json();
          }
        } catch (apiError) {
          console.error(
            "OpenWeather API error, falling back to static data:",
            apiError,
          );
          // geriye statik veri döndür
          currentData = {
            main: {
              temp: 18,
              temp_max: 20,
              temp_min: 15,
              humidity: 75,
              pressure: 1013,
              feels_like: 18,
            },
            weather: [{ id: 800, description: "açık", main: "Clear" }],
            wind: { speed: 2.5, deg: 180 },
            clouds: { all: 20 },
            visibility: 10000,
            sys: {
              sunrise: Math.floor(new Date().setHours(5, 54, 0, 0) / 1000),
              sunset: Math.floor(new Date().setHours(18, 53, 0, 0) / 1000),
            },
          };
          forecastData = { list: [] };
          airQualityData = {
            list: [
              { main: { aqi: 2 }, components: { pm2_5: 15, pm10: 25, o3: 60 } },
            ],
          };
          uvData = { value: 4 };
        }
      }

      // emoji fonksiyonu
      const getWeatherEmoji = (weatherId: number, isDay: boolean = true) => {
        if (weatherId >= 200 && weatherId < 300) return "⛈️"; // gök gürültülü
        if (weatherId >= 300 && weatherId < 400) return "🌦️"; // hafif yağmur
        if (weatherId >= 500 && weatherId < 600) return "🌧️"; // yağmur
        if (weatherId >= 600 && weatherId < 700) return "❄️"; // kar
        if (weatherId >= 700 && weatherId < 800) return "🌫️"; // sis
        if (weatherId === 800) return isDay ? "☀️" : "🌙"; // açık
        if (weatherId > 800) return isDay ? "⛅" : "☁️"; // bulutlu
        return "🌤️";
      };

      // 12 saatlik tahmin işleme
      const hourlyForecast = [];
      const currentHour = new Date().getHours();

      for (let i = 0; i < 12; i++) {
        const hour = (currentHour + i) % 24;
        const isDay = hour >= 6 && hour <= 19;

        // Gün boyunca sıcaklık değişimi
        let temp = 18; // Temel sıcaklık
        if (hour >= 6 && hour <= 8)
          temp = 16; // Sabah serin
        else if (hour >= 9 && hour <= 11)
          temp = 19; // Geç sabah sıcak
        else if (hour >= 12 && hour <= 15)
          temp = 21; // Öğle en sıcak
        else if (hour >= 16 && hour <= 18)
          temp = 20; // Akşam serin
        else if (hour >= 19 && hour <= 21)
          temp = 18; // Gece serin
        else temp = 15; // Gece en serin

        // Rastgelelik ekle ama gerçekçi tut
        temp += Math.floor(Math.random() * 3) - 1; // ±1°C

        // Hava durumu koşulları - çeşitlilik için karışım
        let weatherId = 800; // Açık varsayılan
        let precipitation = 0;

        if (i === 2 || i === 3) {
          weatherId = 801; // Az bulutlu
        } else if (i === 5 || i === 6) {
          weatherId = 802; // Parçalı bulutlu
        } else if (i === 8) {
          weatherId = 500; // Hafif yağmur
          precipitation = 0.5;
        }

        hourlyForecast.push({
          time: `${hour.toString().padStart(2, "0")}:00`,
          hour: hour,
          temperature: temp,
          emoji: getWeatherEmoji(weatherId, isDay),
          humidity: 75 + Math.floor(Math.random() * 10) - 5, // 70-80% nem
          windSpeed: 8 + Math.floor(Math.random() * 6), // 8-14 km/h rüzgar
          windDirection: 180 + Math.floor(Math.random() * 60) - 30, // Değişken rüzgar yönü
          precipitation: precipitation,
          description:
            weatherId === 800
              ? "açık"
              : weatherId === 801
                ? "az bulutlu"
                : weatherId === 802
                  ? "parçalı bulutlu"
                  : "hafif yağmur",
        });
      }

      // 7 günlük tahmin işleme
      const dailyForecast: any[] = [];
      const today = new Date();

      // Özel günler için tahmin verileri
      const customForecast = [
        // Bugün - mevcut hava durumunu kullan
        {
          date: today.toISOString().split("T")[0],
          dayName: today.toLocaleDateString("tr-TR", { weekday: "short" }),
          temperature: {
            max: Math.round(
              currentData.main.temp_max || currentData.main.temp + 3,
            ),
            min: Math.round(
              currentData.main.temp_min || currentData.main.temp - 3,
            ),
          },
          description: currentData.weather[0].description,
          emoji: getWeatherEmoji(currentData.weather[0].id),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6),
        },
      ];

      // 6 günlük özel tahmin verisi
      for (let i = 1; i <= 6; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        const dayName = forecastDate.toLocaleDateString("tr-TR", {
          weekday: "short",
        });

        let weatherData;
        switch (dayName.toLowerCase()) {
          case "çar": // carsamba
            weatherData = {
              temperature: { max: 18, min: 12 },
              description: "sis",
              emoji: "🌫️",
              humidity: 85,
              windSpeed: 8,
            };
            break;
          case "per": // perşembe
            weatherData = {
              temperature: { max: 19, min: 13 },
              description: "gökgürültülü sağanak",
              emoji: "⛈️",
              humidity: 80,
              windSpeed: 15,
            };
            break;
          case "cum": // cuma
            weatherData = {
              temperature: { max: 19, min: 13 },
              description: "gökgürültülü sağanak",
              emoji: "⛈️",
              humidity: 78,
              windSpeed: 12,
            };
            break;
          case "cmt": // cumartesi
            weatherData = {
              temperature: { max: 18, min: 12 },
              description: "yağmurlu",
              emoji: "🌧️",
              humidity: 88,
              windSpeed: 10,
            };
            break;
          case "paz": // pazar
            weatherData = {
              temperature: { max: 19, min: 13 },
              description: "gökgürültülü sağanak",
              emoji: "⛈️",
              humidity: 82,
              windSpeed: 14,
            };
            break;
          default:
            // diğer günler için genel tahmin
            weatherData = {
              temperature: { max: 20, min: 14 },
              description: "parçalı bulutlu",
              emoji: "⛅",
              humidity: 65,
              windSpeed: 8,
            };
        }

        customForecast.push({
          date: forecastDate.toISOString().split("T")[0],
          dayName: dayName,
          ...weatherData,
        });
      }

      // custom forecast'u dailyForecast'a ekle
      dailyForecast.push(...customForecast);

      // hava durumu detayları
      const now = new Date();
      const sunrise = new Date(currentData.sys.sunrise * 1000);
      const sunset = new Date(currentData.sys.sunset * 1000);
      const isDay = now > sunrise && now < sunset;

      // UV indeksi hesaplama (gerçek UV API'si başarısız olursa yedek)
      const getUVIndex = () => {
        if (uvData && uvData.value !== undefined) {
          const uvValue = Math.round(uvData.value);
          let level, description;

          if (uvValue <= 2) {
            level = "Düşük";
            description = "Güvenli seviyede, koruma gereksiz";
          } else if (uvValue <= 5) {
            level = "Orta";
            description = "Orta seviye risk, güneş kremi önerilir";
          } else if (uvValue <= 7) {
            level = "Yüksek";
            description = "Koruyucu önlemler gerekli";
          } else if (uvValue <= 10) {
            level = "Çok Yüksek";
            description = "Güçlü koruma şart, gölgeyi tercih edin";
          } else {
            level = "Aşırı";
            description = "Dışarı çıkmaktan kaçının";
          }

          return { value: uvValue, level, description };
        }

        // uv API yoksa basit hesaplama
        if (!isDay)
          return {
            value: 0,
            level: "Düşük",
            description: "Gece boyunca UV endeksi düşük",
          };
        const hour = now.getHours();
        if (hour < 8 || hour > 18)
          return { value: 1, level: "Düşük", description: "Güvenli seviyede" };
        if (hour >= 10 && hour <= 16) {
          const baseUV =
            currentData.clouds.all < 30
              ? 8
              : currentData.clouds.all < 70
                ? 5
                : 3;
          return baseUV > 7
            ? {
                value: baseUV,
                level: "Yüksek",
                description: "Koruyucu önlemler gerekli",
              }
            : { value: baseUV, level: "Orta", description: "Orta seviye risk" };
        }
        return { value: 3, level: "Orta", description: "Orta seviye risk" };
      };

      // hava kalitesi hesaplama
      const airQuality = airQualityData
        ? {
            aqi: airQualityData.list[0].main.aqi,
            level:
              ["İyi", "Orta", "Hassas", "Sağlıksız", "Çok Sağlıksız"][
                airQualityData.list[0].main.aqi - 1
              ] || "Bilinmiyor",
            description:
              airQualityData.list[0].main.aqi <= 2
                ? "Temiz hava"
                : "Hava kalitesine dikkat edin",
            components: {
              pm2_5: airQualityData.list[0].components.pm2_5,
              pm10: airQualityData.list[0].components.pm10,
              o3: airQualityData.list[0].components.o3,
            },
          }
        : null;

      // Geliştirilmiş yaşam tarzı indeksleri
      const temp = currentData.main.temp;
      const windSpeed = Math.round(currentData.wind.speed * 3.6);
      const humidity = currentData.main.humidity;
      const isRaining =
        currentData.weather[0].id >= 500 && currentData.weather[0].id < 600;
      const isSnowing =
        currentData.weather[0].id >= 600 && currentData.weather[0].id < 700;
      const visibility = currentData.visibility || 10000;
      const uvValue = uvData?.value || 0;
      const airQualityIndex = airQualityData?.list[0]?.main?.aqi || 3;

      const lifeIndices = {
        exercise: {
          level: (() => {
            if (isRaining || isSnowing) return "Kötü";
            if (temp < 5 || temp > 35) return "Kötü";
            if (temp < 10 || temp > 30) return "Orta";
            if (airQualityIndex > 3) return "Orta";
            if (windSpeed > 25) return "Orta";
            return "İyi";
          })(),
          emoji: "🏃",
          description: (() => {
            if (isRaining || isSnowing) return "Hava koşulları uygun değil";
            if (temp > 35) return "Aşırı sıcak, egzersizden kaçının";
            if (temp > 30) return "Çok sıcak, sabah/akşam saatleri tercih edin";
            if (temp < 5) return "Çok soğuk, kapalı alan tercih edin";
            if (temp < 10) return "Soğuk, ısınma egzersizleri yapın";
            if (airQualityIndex > 3) return "Hava kalitesi düşük, dikkat edin";
            if (windSpeed > 25) return "Güçlü rüzgar, dikkatli olun";
            return "Dış egzersiz için mükemmel koşullar";
          })(),
        },
        clothing: {
          level: "Uygun",
          emoji: (() => {
            if (temp > 28) return "👕";
            if (temp > 20) return "👔";
            if (temp > 10) return "🧥";
            if (temp > 0) return "🧥";
            return "🧥";
          })(),
          description: (() => {
            if (isRaining) return "Yağmurluk ve şemsiye gerekli";
            if (isSnowing) return "Kalın mont ve bot gerekli";
            if (temp > 28) return "Hafif ve nefes alabilir kıyafetler";
            if (temp > 20) return "Hafif kıyafetler, ince ceket";
            if (temp > 10) return "Orta kalınlık ceket önerilir";
            if (temp > 0) return "Kalın mont ve eldiven gerekli";
            return "Çok kalın kıyafetler, bere ve eldiven şart";
          })(),
        },
        travel: {
          level: (() => {
            if (visibility < 2000) return "Kötü";
            if (isRaining && windSpeed > 20) return "Kötü";
            if (isSnowing || windSpeed > 30) return "Kötü";
            if (isRaining || windSpeed > 20) return "Orta";
            return "İyi";
          })(),
          emoji: "🚗",
          description: (() => {
            if (visibility < 2000)
              return "Görüş mesafesi çok düşük, ertelenebilirse erteleyin";
            if (isSnowing) return "Kar nedeniyle çok dikkatli sürün";
            if (isRaining && windSpeed > 20)
              return "Yağmur ve rüzgar, çok dikkatli olun";
            if (isRaining) return "Yağışlı hava, hızınızı azaltın";
            if (windSpeed > 30) return "Aşırı rüzgar, seyahati erteleyin";
            if (windSpeed > 20) return "Güçlü rüzgar, dikkatli sürün";
            return "Seyahat için uygun koşullar";
          })(),
        },
        skin: {
          level: (() => {
            if (uvValue > 7) return "Yüksek Risk";
            if (uvValue > 3) return "Orta Risk";
            if (humidity < 30 || humidity > 80) return "Dikkat";
            return "İyi";
          })(),
          emoji: "🧴",
          description: (() => {
            if (uvValue > 7)
              return "Güçlü güneş kremi ve koruyucu kıyafet şart";
            if (uvValue > 3) return "Güneş kremi ve şapka önerilir";
            if (humidity > 80)
              return "Yağlı ciltler için hafif nemlendiriciler";
            if (humidity < 30) return "Kuru hava, yoğun nemlendirici kullanın";
            return "Normal cilt bakımı yeterli";
          })(),
        },
        driving: {
          level: (() => {
            if (visibility < 1000) return "Tehlikeli";
            if (isSnowing || (isRaining && windSpeed > 25)) return "Kötü";
            if (isRaining || windSpeed > 20) return "Dikkatli";
            if (visibility < 5000) return "Dikkatli";
            return "İyi";
          })(),
          emoji: "🚙",
          description: (() => {
            if (visibility < 1000) return "Görüş sıfıra yakın, sürmeyin";
            if (isSnowing) return "Kar nedeniyle çok yavaş ve dikkatli sürün";
            if (isRaining && windSpeed > 25)
              return "Fırtına koşulları, mümkünse beklemeyin";
            if (isRaining) return "Yağmur, fren mesafesini artırın";
            if (windSpeed > 20) return "Rüzgar yan yana araçları etkileyebilir";
            if (visibility < 5000) return "Sisli hava, farları açın";
            return "Sürüş için ideal koşullar";
          })(),
        },
      };

      const responseData = {
        location: "Serdivan, Sakarya",
        current: {
          temperature: Math.round(currentData.main.temp),
          description: currentData.weather[0].description,
          emoji: getWeatherEmoji(currentData.weather[0].id, isDay),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6),
          windDirection: currentData.wind.deg,
          windDescription:
            windSpeed < 5
              ? "sakin"
              : windSpeed < 15
                ? "hafif meltem"
                : "güçlü rüzgar",
          feelsLike: Math.round(currentData.main.feels_like),
          pressure: currentData.main.pressure,
          visibility: Math.round(currentData.visibility / 1000),
          precipitation: currentData.rain
            ? currentData.rain["1h"] || 0
            : currentData.snow
              ? currentData.snow["1h"] || 0
              : 0,
        },
        hourlyForecast,
        sunData: {
          sunrise: sunrise.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sunset: sunset.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          dayLength: `${Math.round((sunset.getTime() - sunrise.getTime()) / 3600000)}s ${Math.round(((sunset.getTime() - sunrise.getTime()) % 3600000) / 60000)}dk`,
          sunProgress: isDay
            ? ((now.getTime() - sunrise.getTime()) /
                (sunset.getTime() - sunrise.getTime())) *
              100
            : 0,
        },
        forecast: dailyForecast,
        uvIndex: getUVIndex(),
        airQuality,
        lifeIndices,
      };

      res.json(responseData);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ message: "Hava durumu verileri alınamadı" });
    }
  });

  // cevap logları routes
  app.get("/api/question-logs", async (req, res) => {
    try {
      const logs = await storage.getQuestionLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question logs" });
    }
  });

  app.post("/api/question-logs", async (req, res) => {
    try {
      const validatedData = insertQuestionLogSchema.parse(req.body);
      const log = await storage.createQuestionLog(validatedData);
      const totalQuestions = parseInt(validatedData.correct_count) + parseInt(validatedData.wrong_count) + parseInt(validatedData.blank_count || '0');
      logActivity('Soru Kaydı Eklendi', `${totalQuestions} soru - ${validatedData.subject}`);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid question log data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create question log" });
      }
    }
  });

  app.get("/api/question-logs/range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ message: "Start date and end date are required" });
      }
      const logs = await storage.getQuestionLogsByDateRange(
        startDate as string,
        endDate as string,
      );
      res.json(logs);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch question logs by date range" });
    }
  });

  app.delete("/api/question-logs/all", async (req, res) => {
    try {
      await storage.deleteAllQuestionLogs();
      logActivity('❌ TÜM SORU KAYITLARI SİLİNDİ', 'Toplu silme işlemi');
      res.json({ message: "All question logs deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete all question logs" });
    }
  });

  app.delete("/api/question-logs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQuestionLog(id);
      
      logActivity('Soru Kaydı Silindi');
      if (!deleted) {
        return res.status(404).json({ message: "Question log not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete question log" });
    }
  });

  app.put("/api/question-logs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await storage.updateQuestionLog(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Question log not found" });
      }

      if (updates.archived) {
        logActivity('Soru Kaydı Arşivlendi');
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update question log" });
    }
  });

  app.get("/api/question-logs/archived", async (req, res) => {
    try {
      const logs = await storage.getArchivedQuestionLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch archived question logs" });
    }
  });

  // Konu istatistikleri routes
  app.get("/api/topics/stats", async (req, res) => {
    try {
      const stats = await storage.getTopicStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topic statistics" });
    }
  });

  app.get("/api/topics/priority", async (req, res) => {
    try {
      const priorityTopics = await storage.getPriorityTopics();
      res.json(priorityTopics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch priority topics" });
    }
  });

  app.get("/api/subjects/stats", async (req, res) => {
    try {
      const stats = await storage.getSubjectSolvedStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject statistics" });
    }
  });

  // Sınav sonuçları routes
  app.get("/api/exam-results", async (req, res) => {
    try {
      const results = await storage.getExamResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exam results" });
    }
  });

  app.post("/api/exam-results", async (req, res) => {
    try {
      const validatedData = insertExamResultSchema.parse(req.body);
      const result = await storage.createExamResult(validatedData);
      logActivity('Deneme Sınav Eklendi', validatedData.display_name || validatedData.exam_name);

      // Eğer subjects_data sağlanmışsa, sınav konu netleri oluştur
      if (validatedData.subjects_data) {
        try {
          const subjectsData = JSON.parse(validatedData.subjects_data);

          // Her konu için veri ile konu netleri oluştur
          for (const [subjectName, subjectData] of Object.entries(
            subjectsData,
          )) {
            const data = subjectData as any;
            if (data.correct || data.wrong || data.blank) {
              const correct = parseInt(data.correct) || 0;
              const wrong = parseInt(data.wrong) || 0;
              const blank = parseInt(data.blank) || 0;
              const netScore = correct - wrong * 0.25;

              // ders isimlerini Türkçe'ye çevir
              const subjectNameMap: { [key: string]: string } = {
                turkce: "Türkçe",
                matematik: "Matematik",
                sosyal: "Sosyal Bilimler",
                fen: "Fen Bilimleri",
                fizik: "Fizik",
                kimya: "Kimya",
                biyoloji: "Biyoloji",
                geometri: "Geometri",
              };

              // Branş denemesi için exam_type'ı direkt kullan
              // Tam deneme için ders bazında TYT/AYT belirle
              let examType: "TYT" | "AYT";
              if (validatedData.exam_scope === "branch") {
                // Branş denemesinde kullanıcının seçtiği exam_type'ı kullan
                // TYT branş denemesinde Fizik/Kimya/Biyoloji de TYT olarak kaydedilmeli
                examType = (validatedData.exam_type as "TYT" | "AYT") || "TYT";
              } else {
                // Tam denemede validatedData.exam_type'a göre belirle
                if (validatedData.exam_type === "TYT") {
                  // TYT denemesi - TYT dersleri (Fen Bilimleri genel bir ders olarak)
                  // Genel TYT denemesinde Fizik/Kimya/Biyoloji ayrı girilmez, sadece Fen Bilimleri vardır
                  const isTYTSubject = [
                    "turkce",
                    "matematik",
                    "sosyal",
                    "fen",
                    "geometri"
                  ].includes(subjectName);
                  examType = isTYTSubject ? "TYT" : "AYT";
                } else {
                  // AYT denemesi - yalnızca AYT dersleri
                  const isAYTSubject = [
                    "matematik",
                    "fizik",
                    "kimya",
                    "biyoloji",
                    "geometri"
                  ].includes(subjectName);
                  examType = isAYTSubject ? "AYT" : "TYT";
                }
              }
              
              const mappedSubjectName =
                subjectNameMap[subjectName] || subjectName;

              // wrong_topics'i JSON formatına çevir
              const wrongTopicsJson = data.wrong_topics && data.wrong_topics.length > 0 
                ? JSON.stringify(data.wrong_topics.map((topic: string) => ({ topic })))
                : null;

              await storage.createExamSubjectNet({
                exam_id: result.id,
                exam_type: examType,
                subject: mappedSubjectName,
                net_score: netScore.toString(),
                correct_count: correct.toString(),
                wrong_count: wrong.toString(),
                blank_count: blank.toString(),
                wrong_topics_json: wrongTopicsJson,
              });
            }
          }
        } catch (parseError) {
          console.error("Failed to parse subjects_data:", parseError);
        }
      }

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid exam result data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create exam result" });
      }
    }
  });

  app.put("/api/exam-results/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedResult = await storage.updateExamResult(id, updates);
      
      if (!updatedResult) {
        return res.status(404).json({ message: "Exam result not found" });
      }
      
      res.json(updatedResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid exam result data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update exam result" });
      }
    }
  });

  app.delete("/api/exam-results/all", async (req, res) => {
    try {
      await storage.deleteAllExamResults();
      logActivity('❌ TÜM DENEMELER SİLİNDİ', 'Toplu silme işlemi');
      res.json({ message: "All exam results deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete all exam results" });
    }
  });

  app.delete("/api/exam-results/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExamResult(id);
      
      logActivity('Deneme Sınav Silindi');
      if (!deleted) {
        return res.status(404).json({ message: "Exam result not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exam result" });
    }
  });

  app.get("/api/exam-results/archived", async (req, res) => {
    try {
      const results = await storage.getArchivedExamResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch archived exam results" });
    }
  });

  // örnek ders netleri routes
  app.get("/api/exam-subject-nets", async (req, res) => {
    try {
      const nets = await storage.getExamSubjectNets();
      res.json(nets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exam subject nets" });
    }
  });

  app.get("/api/exam-subject-nets/exam/:examId", async (req, res) => {
    try {
      const { examId } = req.params;
      const nets = await storage.getExamSubjectNetsByExamId(examId);
      res.json(nets);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch exam subject nets for exam" });
    }
  });

  app.post("/api/exam-subject-nets", async (req, res) => {
    try {
      const validatedData = insertExamSubjectNetSchema.parse(req.body);
      const net = await storage.createExamSubjectNet(validatedData);
      res.status(201).json(net);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Invalid exam subject net data",
          errors: error.errors,
        });
      } else if (
        error instanceof Error &&
        error.message.includes("does not exist")
      ) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create exam subject net" });
      }
    }
  });

  app.put("/api/exam-subject-nets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertExamSubjectNetSchema
        .partial()
        .parse(req.body);
      const net = await storage.updateExamSubjectNet(id, validatedData);

      if (!net) {
        return res.status(404).json({ message: "Exam subject net not found" });
      }

      res.json(net);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Invalid exam subject net data",
          errors: error.errors,
        });
      } else {
        res.status(500).json({ message: "Failed to update exam subject net" });
      }
    }
  });

  app.delete("/api/exam-subject-nets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExamSubjectNet(id);

      if (!deleted) {
        return res.status(404).json({ message: "Exam subject net not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exam subject net" });
    }
  });

  app.delete("/api/exam-subject-nets/exam/:examId", async (req, res) => {
    try {
      const { examId } = req.params;
      const deleted = await storage.deleteExamSubjectNetsByExamId(examId);

      if (!deleted) {
        return res
          .status(404)
          .json({ message: "No exam subject nets found for this exam" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exam subject nets" });
    }
  });
  //ARTIK KULLANMAYACAĞIMIZ ROUTESLAR
  // Flashcard routes - commented out until implementation is complete
  /*
  app.get("/api/flashcards", async (req, res) => {
    try {
      const flashcards = await storage.getFlashcards();
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  app.get("/api/flashcards/due", async (req, res) => {
    try {
      const flashcards = await storage.getFlashcardsDue();
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch due flashcards" });
    }
  });

  app.post("/api/flashcards", async (req, res) => {
    try {
      const validatedData = insertFlashcardSchema.parse(req.body);
      const flashcard = await storage.createFlashcard(validatedData);
      res.status(201).json(flashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid flashcard data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create flashcard" });
      }
    }
  });

  app.put("/api/flashcards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertFlashcardSchema.partial().parse(req.body);
      const flashcard = await storage.updateFlashcard(id, validatedData);

      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }

      res.json(flashcard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid flashcard data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update flashcard" });
      }
    }
  });

  app.post("/api/flashcards/:id/review", async (req, res) => {
    try {
      const { id } = req.params;
      const { difficulty, isCorrect, userAnswer } = req.body;

      if (!["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).json({ message: "Invalid difficulty level" });
      }

      const flashcard = await storage.reviewFlashcard(id, difficulty);

      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }

      // Eğer cevap yanlışsa hata takibine ekle
      if (!isCorrect && userAnswer && flashcard) {
        await storage.addFlashcardError({
          cardId: id,
          question: flashcard.question,
          topic: flashcard.topic || flashcard.subject,
          difficulty: flashcard.difficulty,
          userAnswer,
          correctAnswer: flashcard.answer,
          timestamp: new Date(),
        });
      }

      res.json(flashcard);
    } catch (error) {
      res.status(500).json({ message: "Failed to review flashcard" });
    }
  });

  // Hata sıklığı analizi için route
  app.get("/api/flashcards/errors", async (req, res) => {
    try {
      const errors = await storage.getFlashcardErrors();
      res.json(errors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flashcard errors" });
    }
  });

  app.get("/api/flashcards/errors/by-difficulty", async (req, res) => {
    try {
      const errorsByDifficulty = await storage.getFlashcardErrorsByDifficulty();
      res.json(errorsByDifficulty);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch flashcard errors by difficulty" });
    }
  });

  // Örnek kartları yükle
  app.post("/api/flashcards/seed", async (req, res) => {
    try {
      await storage.seedSampleFlashcards();
      res.json({ message: "Sample flashcards seeded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed sample flashcards" });
    }
  });

  app.delete("/api/flashcards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFlashcard(id);

      if (!deleted) {
        return res.status(404).json({ message: "Flashcard not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete flashcard" });
    }
  });

  // Export API routes
  app.get("/api/export/json", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      const moods = await storage.getMoods();
      const dailySummary = await storage.getDailySummary(365); // Full year

      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: {
          tasks,
          moods,
          summary: dailySummary,
        },
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="yapilacaklar-yedegi-${new Date().toISOString().split("T")[0]}.json"`,
      );
      res.json(exportData);
    } catch (error) {
      console.error("JSON export error:", error);
      res.status(500).json({ message: "Export failed" });
    }
  });

  app.get("/api/export/csv", async (req, res) => {
    try {
      const tasks = await storage.getTasks();

      // CSV Header
      let csvContent =
        "ID,Başlık,Açıklama,Öncelik,Kategori,Renk,Tamamlandı,Tamamlanma Tarihi,Bitiş Tarihi,Oluşturulma Tarihi\n";

      // CSV Data
      tasks.forEach((task) => {
        const row = [
          task.id,
          `"${(task.title || "").replace(/"/g, '""')}"`, // Escape quotes
          `"${(task.description || "").replace(/"/g, '""')}"`,
          task.priority,
          task.category,
          task.color || "",
          task.completed ? "Evet" : "Hayır",
          task.completedAt || "",
          task.dueDate || "",
          task.createdAt
            ? new Date(task.createdAt).toLocaleDateString("tr-TR")
            : "",
        ].join(",");
        csvContent += row + "\n";
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="gorevler-${new Date().toISOString().split("T")[0]}.csv"`,
      );
      res.send("\uFEFF" + csvContent); // Add BOM for proper UTF-8 encoding
    } catch (error) {
      console.error("CSV export error:", error);
      res.status(500).json({ message: "Export failed" });
    }
  });
  */

  // Çalışma saati routes
  app.get("/api/study-hours", async (req, res) => {
    try {
      const studyHours = await storage.getStudyHours();
      res.json(studyHours);
    } catch (error) {
      res.status(500).json({ message: "Çalışma saatleri getirilirken hata oluştu" });
    }
  });

  app.post("/api/study-hours", async (req, res) => {
    try {
      const validatedData = insertStudyHoursSchema.parse(req.body);
      
      // Aynı tarih için zaten kayıt var mı kontrol et
      const existingStudyHours = await storage.getStudyHours();
      const duplicate = existingStudyHours.find((sh: any) => sh.study_date === validatedData.study_date);
      
      if (duplicate) {
        return res.status(409).json({ message: "Bu tarih için zaten çalışma saati kaydı var!" });
      }
      
      const studyHours = await storage.createStudyHours(validatedData);
      logActivity('Çalışma Saati Eklendi', `${validatedData.hours} saat`);
      res.status(201).json(studyHours);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Geçersiz çalışma saati verisi", errors: error.errors });
      } else {
        res.status(500).json({ message: "Çalışma saati oluşturulurken hata oluştu" });
      }
    }
  });

  app.patch("/api/study-hours/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertStudyHoursSchema.partial().parse(req.body);
      const studyHours = await storage.updateStudyHours(id, validatedData);
      
      if (!studyHours) {
        return res.status(404).json({ message: "Çalışma saati kaydı bulunamadı" });
      }
      
      res.json(studyHours);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Geçersiz çalışma saati verisi", errors: error.errors });
      } else {
        res.status(500).json({ message: "Çalışma saati güncellenirken hata oluştu" });
      }
    }
  });

  app.delete("/api/study-hours/:id", async (req, res) => {
    try {
      const { id} = req.params;
      const deleted = await storage.deleteStudyHours(id);
      
      logActivity('Çalışma Saati Silindi');
      if (!deleted) {
        return res.status(404).json({ message: "Çalışma saati kaydı bulunamadı" });
      }
      
      res.json({ message: "Çalışma saati kaydı silindi" });
    } catch (error) {
      res.status(500).json({ message: "Çalışma saati silinirken hata oluştu" });
    }
  });

  app.get("/api/study-hours/archived", async (req, res) => {
    try {
      const studyHours = await storage.getArchivedStudyHours();
      res.json(studyHours);
    } catch (error) {
      res.status(500).json({ message: "Arşivlenmiş çalışma saatleri getirilirken hata oluştu" });
    }
  });

  // Setup routes - kurulum durumu kontrolü ve tamamlama
  app.get("/api/setup/status", async (req, res) => {
    try {
      const setupStatus = await storage.getSetupStatus();
      res.json(setupStatus || { completed: false, termsAccepted: false });
    } catch (error) {
      res.status(500).json({ message: "Kurulum durumu alınamadı" });
    }
  });

  app.post("/api/setup/complete", async (req, res) => {
    try {
      const validatedData = insertSetupCompletedSchema.parse(req.body);
      const setupRecord = await storage.completeSetup(validatedData.termsAccepted);
      res.json(setupRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Geçersiz kurulum verisi", errors: error.errors });
      } else {
        res.status(500).json({ message: "Kurulum tamamlanırken hata oluştu" });
      }
    }
  });

  // Auto-archive route - otomatik olarak eski verileri arşivle
  app.post("/api/auto-archive", async (req, res) => {
    try {
      await storage.autoArchiveOldData();
      res.json({ message: "Eski veriler başarıyla arşivlendi" });
    } catch (error) {
      res.status(500).json({ message: "Auto-archive işlemi başarısız oldu" });
    }
  });

  // Send monthly report via email
  app.post("/api/reports/send", async (req, res) => {
    try {
      // .env dosyasından email adreslerini al
      const emailUser = process.env.EMAIL_USER;
      const emailFrom = process.env.EMAIL_FROM;
      
      if (!emailUser && !emailFrom) {
        return res.status(400).json({ message: ".env dosyasında EMAIL_FROM veya EMAIL_USER tanımlı değil" });
      }
      
      // Her iki email adresini de alıcı olarak ekle (farklıysa)
      const recipients = [];
      if (emailUser) recipients.push(emailUser);
      if (emailFrom && emailFrom !== emailUser) recipients.push(emailFrom);
      const toEmails = recipients.join(', ');

      // Get all data for report
      const [tasks, questionLogs, examResults, studyHours] = await Promise.all([
        storage.getTasks(),
        storage.getQuestionLogs(),
        storage.getExamResults(),
        storage.getStudyHours()
      ]);

      // Calculate report statistics
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentQuestions = questionLogs.filter((q: any) => new Date(q.log_date) >= last30Days);
      const recentExams = examResults.filter((e: any) => new Date(e.exam_date) >= last30Days);
      const recentStudy = studyHours.filter((s: any) => new Date(s.study_date) >= last30Days);
      
      const totalQuestions = recentQuestions.reduce((sum: number, q: any) => 
        sum + (q.correct_count || 0) + (q.wrong_count || 0) + (q.empty_count || 0), 0
      );
      const totalStudyMinutes = recentStudy.reduce((sum: number, s: any) => 
        sum + (s.hours || 0) * 60 + (s.minutes || 0), 0
      );
      
      // Calculate detailed statistics
      const completedTasks = tasks.filter((t: any) => t.completed).length;
      const activeTasks = tasks.filter((t: any) => !t.completed).length;
      const totalCorrect = recentQuestions.reduce((sum: number, q: any) => sum + (q.correct_count || 0), 0);
      const totalWrong = recentQuestions.reduce((sum: number, q: any) => sum + (q.wrong_count || 0), 0);
      const totalEmpty = recentQuestions.reduce((sum: number, q: any) => sum + (q.empty_count || 0), 0);
      
      // Get wrong topics and completed topics count
      const allWrongTopics = recentQuestions.filter((q: any) => q.wrong_topics && q.wrong_topics.length > 0);
      const wrongTopicsCount = allWrongTopics.reduce((sum: number, q: any) => sum + (q.wrong_topics?.length || 0), 0);
      
      const completedTopics = tasks.filter((t: any) => t.completed && t.title?.includes('konu')).length;
      
      // Get longest study day
      const longestStudy = recentStudy.reduce((max: any, curr: any) => {
        const currMinutes = (curr.hours || 0) * 60 + (curr.minutes || 0);
        const maxMinutes = max ? (max.hours || 0) * 60 + (max.minutes || 0) : 0;
        return currMinutes > maxMinutes ? curr : max;
      }, null);
      
      const longestStudyDate = longestStudy ? new Date(longestStudy.study_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      const longestStudyTime = longestStudy ? `${String(longestStudy.hours || 0).padStart(2, '0')}:${String(longestStudy.minutes || 0).padStart(2, '0')}:${String(longestStudy.seconds || 0).padStart(2, '0')}` : '00:00:00';
      
      // Get average TYT net
      const tytNets = recentExams.map((e: any) => {
        const turkce = (e.turkce_dogru || 0) - (e.turkce_yanlis || 0) * 0.25;
        const sosyal = (e.sosyal_dogru || 0) - (e.sosyal_yanlis || 0) * 0.25;
        const mat = (e.mat_dogru || 0) - (e.mat_yanlis || 0) * 0.25;
        const fen = (e.fen_dogru || 0) - (e.fen_yanlis || 0) * 0.25;
        return turkce + sosyal + mat + fen;
      });
      const avgTytNet = tytNets.length > 0 ? (tytNets.reduce((a: number, b: number) => a + b, 0) / tytNets.length).toFixed(2) : '0.00';
      
      // Separate general and branch exams
      const generalExams = recentExams.filter((e: any) => e.exam_scope !== 'branch');
      const branchExams = recentExams.filter((e: any) => e.exam_scope === 'branch');
      
      // Calculate max TYT net
      const maxTytNet = tytNets.length > 0 ? Math.max(...tytNets).toFixed(2) : '0.00';
      
      // Create email HTML content with beautiful design
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f7f8fa; padding: 20px; }
            .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
            
            .header-red { background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); border: 4px solid white; box-shadow: 0 4px 20px rgba(211,47,47,0.4); padding: 40px 30px; text-align: center; position: relative; }
            .header-red::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #f44336, #e53935, #c62828, #b71c1c); }
            .flag-emoji { font-size: 72px; margin-bottom: 15px; display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); }
            .quote { font-style: italic; font-size: 14px; margin: 20px auto; line-height: 1.8; max-width: 550px; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
            .ataturk-name { color: white; font-weight: 700; font-size: 13px; margin-top: 15px; letter-spacing: 0.5px; }
            .signature-text { font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; font-size: 42px; margin: 15px 0; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .ataturk-emoji { font-size: 80px; margin-top: 15px; display: block; filter: grayscale(30%); }
            
            .title-section { background: linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%); color: white; padding: 30px; text-align: center; border-bottom: 4px solid #4a148c; }
            .title-section h2 { font-size: 26px; margin-bottom: 8px; font-weight: 700; letter-spacing: 1px; }
            .title-section .subtitle { font-size: 14px; opacity: 0.95; font-weight: 500; }
            .date-info { font-size: 13px; margin-top: 12px; opacity: 0.9; }
            
            .stats-top { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; background: #fafafa; }
            .stats-middle { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0 20px 20px 20px; background: #fafafa; }
            
            .stat-card { border-radius: 15px; padding: 25px 20px; text-align: center; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s; border: 3px solid rgba(255,255,255,0.3); }
            .stat-green { background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%); }
            .stat-purple { background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); }
            .stat-blue { background: linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%); }
            .stat-teal { background: linear-gradient(135deg, #26a69a 0%, #00897b 100%); }
            .stat-amber { background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); }
            
            .stat-label { font-size: 12px; opacity: 0.95; margin-bottom: 10px; font-weight: 600; letter-spacing: 0.5px; }
            .stat-value { font-size: 42px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
            .stat-value-small { font-size: 28px; font-weight: 700; }
            
            .section { padding: 25px; margin: 15px 20px; background: linear-gradient(135deg, #e8eaf6 0%, #e3f2fd 100%); border-radius: 15px; border: 2px solid #9fa8da; }
            .section-title { color: #5e35b1; font-size: 18px; font-weight: 700; margin-bottom: 15px; padding: 12px; background: white; border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            
            .longest-study { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; margin: 15px 20px; border-radius: 15px; border: 3px solid #64b5f6; text-align: center; }
            .longest-study-title { color: #1976d2; font-size: 18px; font-weight: 700; margin-bottom: 12px; }
            .longest-study-date { color: #424242; font-size: 14px; margin: 10px 0; }
            .longest-study-time { color: #1565c0; font-size: 48px; font-weight: 800; margin: 15px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .longest-study-note { color: #616161; font-size: 12px; font-style: italic; }
            
            .special-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 25px; margin: 15px 20px; background: linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%); border-radius: 15px; border: 3px solid #ce93d8; }
            .special-stat-card { background: white; border-radius: 12px; padding: 20px; text-align: center; border: 2px solid; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
            .special-stat-purple { border-color: #ab47bc; }
            .special-stat-red { border-color: #ef5350; }
            .special-stat-green { border-color: #66bb6a; }
            .special-stat-title { font-size: 11px; color: #616161; margin-bottom: 10px; font-weight: 600; }
            .special-stat-value { font-size: 36px; font-weight: 800; margin: 8px 0; }
            .special-stat-purple .special-stat-value { color: #8e24aa; }
            .special-stat-red .special-stat-value { color: #e53935; }
            .special-stat-green .special-stat-value { color: #43a047; }
            .special-stat-label { font-size: 11px; color: #9e9e9e; }
            
            .branch-record { background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-radius: 15px; padding: 20px; margin: 15px 0; text-align: center; border: 3px solid #ba68c8; }
            .branch-record-title { font-size: 14px; color: #6a1b9a; margin-bottom: 8px; font-weight: 600; }
            .branch-record-value { font-size: 36px; color: #8e24aa; font-weight: 800; }
            
            .exam-card { background: white; border: 3px solid #e0e0e0; border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .exam-name { color: #8e24aa; font-weight: 700; font-size: 17px; margin-bottom: 8px; }
            .exam-date { color: #757575; font-size: 13px; margin-bottom: 12px; }
            .net-badge { background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); color: white; padding: 15px 25px; border-radius: 12px; font-size: 22px; font-weight: 800; text-align: center; margin: 12px 0; box-shadow: 0 4px 15px rgba(142,36,170,0.3); }
            
            .performance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
            .perf-box { border: 3px solid; border-radius: 12px; padding: 15px 10px; text-align: center; }
            .perf-correct { border-color: #66bb6a; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); }
            .perf-wrong { border-color: #ef5350; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); }
            .perf-empty { border-color: #ffa726; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); }
            .perf-net { border-color: #ab47bc; background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); color: white; }
            
            .perf-label { font-size: 11px; margin-bottom: 6px; color: #666; font-weight: 600; }
            .perf-net .perf-label { color: white; opacity: 0.95; }
            .perf-value { font-size: 22px; font-weight: 800; }
            .perf-correct .perf-value { color: #43a047; }
            .perf-wrong .perf-value { color: #e53935; }
            .perf-empty .perf-value { color: #fb8c00; }
            .perf-net .perf-value { color: white; }
            
            .wrong-topics { background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border-left: 5px solid #e53935; padding: 15px; border-radius: 8px; margin-top: 12px; }
            .wrong-topics h4 { color: #c62828; font-size: 14px; margin-bottom: 10px; font-weight: 700; }
            .wrong-topics ul { margin-left: 25px; }
            .wrong-topics li { color: #424242; font-size: 13px; margin: 6px 0; }
            
            .footer-note { background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 3px solid #e53935; border-radius: 15px; padding: 20px; margin: 20px; text-align: center; color: #c62828; font-size: 14px; font-weight: 600; }
            .footer { text-align: center; padding: 25px; background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%); color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header-red">
              <span class="flag-emoji">🇹🇷</span>
              <div class="quote">"Biz her şeyi gençliğe bırakacağız... Geleceğin ümidi, ışıklı çiçekleri onlardır. Bütün ümidim gençliktedir."</div>
              <div class="ataturk-name">- Mustafa Kemal Atatürk -</div>
              <div class="signature-text">M. Kemal</div>
              <span class="ataturk-emoji">👤</span>
            </div>
            
            <div class="title-section">
              <h2>🎓 BERAT CANKIR</h2>
              <div class="subtitle">KİŞİSEL ÇALIŞMA ANALİZ RAPORU</div>
              <div class="date-info">📅 ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | ⏰ ${recentExams.length} Deneme Kaydedildi</div>
            </div>
            
            <div class="stats-top">
              <div class="stat-card stat-green">
                <div class="stat-label">📚 ÇÖZÜLEN SORU</div>
                <div class="stat-value">${totalQuestions}</div>
              </div>
              <div class="stat-card stat-purple">
                <div class="stat-label">🎯 ÇÖZÜLEN DENEME</div>
                <div class="stat-value">${recentExams.length}</div>
              </div>
            </div>
            
            <div class="stats-middle">
              <div class="stat-card stat-blue">
                <div class="stat-label">📈 TOPLAM AKTİVİTE</div>
                <div class="stat-value-small">${tasks.length}</div>
              </div>
              <div class="stat-card stat-teal">
                <div class="stat-label">✅ TAMAMLANAN GÖREVLER</div>
                <div class="stat-value-small">${completedTasks}</div>
              </div>
              <div class="stat-card stat-amber">
                <div class="stat-label">⏱️ BU AY ÇALIŞMA SÜRESİ</div>
                <div class="stat-value-small" style="font-size: 18px;">${Math.floor(totalStudyMinutes / 60)}:${String(totalStudyMinutes % 60).padStart(2, '0')}</div>
              </div>
            </div>
            
            ${longestStudy ? `
            <div class="longest-study">
              <div class="longest-study-title">⏰ ÇALIŞILAN EN UZUN GÜN</div>
              <div class="longest-study-date">📅 ${longestStudyDate}</div>
              <div class="longest-study-time">${longestStudyTime}</div>
              <div class="longest-study-note">🔥 Rekor çalışma günü! Bu tempoyu koruyarak hedefinize ulaşabilirsiniz!</div>
            </div>
            ` : ''}
            
            <div class="section">
              <div class="section-title">📊 ÖZEL İSTATİSTİKLER</div>
              <div class="special-stats">
                <div class="special-stat-card special-stat-purple">
                  <div class="special-stat-title">🔥 En Uzun Çalışma Serisi</div>
                  <div class="special-stat-value">${Math.min(recentStudy.length, 30)}</div>
                  <div class="special-stat-label">ardışık gün</div>
                </div>
                <div class="special-stat-card special-stat-red">
                  <div class="special-stat-title">❌ Bu Ay Hatalı Sorular</div>
                  <div class="special-stat-value">${wrongTopicsCount}</div>
                  <div class="special-stat-label">yanlış soru</div>
                </div>
                <div class="special-stat-card special-stat-green">
                  <div class="special-stat-title">✅ Düzeltilen Konular</div>
                  <div class="special-stat-value">${completedTopics}</div>
                  <div class="special-stat-label">konu düzeltildi</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">📚 BRANŞ DENEME REKOR NETLERİ</div>
              ${recentExams.length > 0 ? `
                <div class="branch-record">
                  <div class="branch-record-title">🏆 TYT Branş Rekor</div>
                  <div class="branch-record-value">${maxTytNet}</div>
                </div>
              ` : '<p style="text-align: center; color: #999;">Henüz deneme sınavı kaydedilmemiş.</p>'}
            </div>
            
            <div class="section">
              <div class="section-title">📋 DENEME DETAYLARI</div>
            .section-title { background: #f3e5f5; color: #7b1fa2; padding: 12px 15px; border-radius: 8px; font-size: 16px; font-weight: bold; margin-bottom: 15px; }
            .exam-card { background: #fafafa; border: 2px solid #e0e0e0; border-radius: 10px; padding: 15px; margin-bottom: 15px; }
            .exam-name { color: #9c27b0; font-weight: bold; font-size: 15px; margin-bottom: 10px; }
            .exam-date { color: #666; font-size: 12px; margin-bottom: 10px; }
            .net-badge { background: #9c27b0; color: white; padding: 10px 20px; border-radius: 8px; font-size: 20px; font-weight: bold; text-align: center; margin: 10px 0; }
            .performance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 10px 0; }
            .perf-box { border: 2px solid; border-radius: 8px; padding: 12px 8px; text-align: center; }
            .perf-correct { border-color: #43a047; background: #e8f5e9; }
            .perf-wrong { border-color: #e53935; background: #ffebee; }
            .perf-empty { border-color: #fb8c00; background: #fff3e0; }
            .perf-net { border-color: #9c27b0; background: #f3e5f5; color: white; background: #9c27b0; }
            .perf-label { font-size: 10px; margin-bottom: 5px; color: #666; }
            .perf-net .perf-label { color: white; }
            .perf-value { font-size: 18px; font-weight: bold; }
            .perf-correct .perf-value { color: #43a047; }
            .perf-wrong .perf-value { color: #e53935; }
            .perf-empty .perf-value { color: #fb8c00; }
            .perf-net .perf-value { color: white; }
            .wrong-topics { background: #ffebee; border-left: 4px solid #e53935; padding: 12px; border-radius: 5px; margin-top: 10px; }
            .wrong-topics h4 { color: #e53935; font-size: 13px; margin-bottom: 8px; }
            .wrong-topics ul { margin-left: 20px; }
            .wrong-topics li { color: #666; font-size: 12px; margin: 5px 0; }
            .footer-note { background: #ffebee; border: 2px solid #e53935; border-radius: 10px; padding: 15px; margin: 20px; text-align: center; color: #c62828; font-size: 13px; }
            .footer { text-align: center; padding: 20px; background: #fafafa; color: #666; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="flag">🇹🇷</div>
              <div class="quote">"Biz her şeyi gençliğe bırakacağız... Geleceğin ümidi, ışıklı çiçekleri onlardır. Bütün ümidim gençliktedir."</div>
              <div class="ataturk-name">- Mustafa Kemal Atatürk -</div>
              <div class="signature">M.Kemal</div>
            </div>
            
            <div class="title-section">
              <h2>🎓 BERAT CANKIR</h2>
              <div class="subtitle">KİŞİSEL ÇALIŞMA ANALİZ RAPORU</div>
              <div class="date-info">📅 ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | ⏰ ${recentExams.length} Deneme kaydedildi</div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card stat-purple">
                <div class="stat-label">✅ Çözülen Soru</div>
                <div class="stat-value">${totalQuestions}</div>
              </div>
              <div class="stat-card stat-red">
                <div class="stat-label">🔴 Çözülen Deneme</div>
                <div class="stat-value">${recentExams.length}</div>
              </div>
              <div class="stat-card stat-green">
                <div class="stat-label">📊 Toplam Aktivite</div>
                <div class="stat-value">${tasks.length}</div>
              </div>
              <div class="stat-card stat-orange">
                <div class="stat-label">⏱️ Net Çalışma Süresi</div>
                <div class="stat-value" style="font-size: 20px;">${Math.floor(totalStudyMinutes / 60)}:${String(totalStudyMinutes % 60).padStart(2, '0')}:00</div>
              </div>
            </div>
            
            ${longestStudy ? `
            <div class="section" style="background: #e8f5e9;">
              <div style="text-align: center;">
                <div style="font-size: 16px; color: #2e7d32; font-weight: bold; margin-bottom: 10px;">⏰ Çalışılan En Uzun Gün</div>
                <div style="font-size: 13px; color: #666; margin-bottom: 8px;">📅 ${longestStudyDate}</div>
                <div style="font-size: 32px; color: #43a047; font-weight: bold;">${longestStudyTime}</div>
                <div style="font-size: 11px; color: #666; margin-top: 8px;">🔥 Rekor çalışma günü! Bu tempoyu korumaya devam edin!</div>
              </div>
            </div>
            ` : ''}
            
            <div class="section" style="background: #f3e5f5;">
              <div style="text-align: center;">
                <div style="font-size: 16px; color: #7b1fa2; font-weight: bold; margin-bottom: 10px;">📈 Özel İstatistikler</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px;">
                  <div>
                    <div style="font-size: 11px; color: #666;">En Uzun Çalışma Serisi</div>
                    <div style="font-size: 24px; color: #43a047; font-weight: bold;">${recentStudy.length}</div>
                    <div style="font-size: 10px; color: #999;">ardışık gün</div>
                  </div>
                  <div>
                    <div style="font-size: 11px; color: #666;">Bir Ay Hatalı Soru</div>
                    <div style="font-size: 24px; color: #e53935; font-weight: bold;">${totalWrong}</div>
                    <div style="font-size: 10px; color: #999;">yanlış çözüldü</div>
                  </div>
                  <div>
                    <div style="font-size: 11px; color: #666;">Düzenlillik</div>
                    <div style="font-size: 24px; color: #2e7d32; font-weight: bold;">${Math.min(recentStudy.length, 30)}</div>
                    <div style="font-size: 10px; color: #999;">konu düzeltildi</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">📊 Branş Deneme Rekor Netleri</div>
              ${recentExams.length > 0 ? `
                <div style="background: #f3e5f5; border-radius: 8px; padding: 12px; margin-bottom: 10px; text-align: center;">
                  <div style="font-size: 13px; color: #666; margin-bottom: 5px;">TYT Branş Rekor</div>
                  <div style="font-size: 28px; color: #9c27b0; font-weight: bold;">${avgTytNet}</div>
                </div>
              ` : '<p style="color: #999; text-align: center;">Henüz deneme sınavı kaydedilmemiş.</p>'}
            </div>
            
            <div class="section">
              <div class="section-title">📋 Deneme Detayları</div>
              ${recentExams.slice(0, 10).map((exam: any) => {
                const net = ((exam.turkce_dogru || 0) - (exam.turkce_yanlis || 0) * 0.25) +
                           ((exam.sosyal_dogru || 0) - (exam.sosyal_yanlis || 0) * 0.25) +
                           ((exam.mat_dogru || 0) - (exam.mat_yanlis || 0) * 0.25) +
                           ((exam.fen_dogru || 0) - (exam.fen_yanlis || 0) * 0.25);
                
                const wrongTopics: string[] = [];
                if (exam.turkce_wrong_topics) wrongTopics.push(...exam.turkce_wrong_topics.split(',').map((t: string) => `Türkçe: ${t.trim()}`));
                if (exam.mat_wrong_topics) wrongTopics.push(...exam.mat_wrong_topics.split(',').map((t: string) => `Matematik: ${t.trim()}`));
                if (exam.fen_wrong_topics) wrongTopics.push(...exam.fen_wrong_topics.split(',').map((t: string) => `Fen: ${t.trim()}`));
                if (exam.sosyal_wrong_topics) wrongTopics.push(...exam.sosyal_wrong_topics.split(',').map((t: string) => `Sosyal: ${t.trim()}`));
                
                return `
                  <div class="exam-card">
                    <div class="exam-name">${exam.exam_name}</div>
                    <div class="exam-date">📅 ${new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 📚 ${exam.exam_type === 'TYT' ? 'TYT' : exam.exam_type}</div>
                    <div class="net-badge">TYT Net<br/>${net.toFixed(2)}</div>
                    <div style="margin-top: 15px; font-weight: bold; font-size: 13px; color: #333; margin-bottom: 10px;">📊 Ders Bazında Performans</div>
                    
                    ${exam.turkce_dogru !== undefined ? `
                    <div style="margin-bottom: 12px;">
                      <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">Türkçe</div>
                      <div class="performance-grid">
                        <div class="perf-box perf-correct">
                          <div class="perf-label">Doğru</div>
                          <div class="perf-value">${exam.turkce_dogru || 0}</div>
                        </div>
                        <div class="perf-box perf-wrong">
                          <div class="perf-label">Yanlış</div>
                          <div class="perf-value">${exam.turkce_yanlis || 0}</div>
                        </div>
                        <div class="perf-box perf-empty">
                          <div class="perf-label">Boş</div>
                          <div class="perf-value">${exam.turkce_bos || 0}</div>
                        </div>
                        <div class="perf-box perf-net">
                          <div class="perf-label">Net</div>
                          <div class="perf-value">${((exam.turkce_dogru || 0) - (exam.turkce_yanlis || 0) * 0.25).toFixed(2)}</div>
                        </div>
                      </div>
                      ${exam.turkce_wrong_topics ? `<div class="wrong-topics"><h4>❌ Yanlış Yapılan Konular:</h4><ul>${exam.turkce_wrong_topics.split(',').map((t: string) => `<li>${t.trim()}</li>`).join('')}</ul></div>` : ''}
                    </div>
                    ` : ''}
                    
                    ${exam.mat_dogru !== undefined ? `
                    <div style="margin-bottom: 12px;">
                      <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">Matematik</div>
                      <div class="performance-grid">
                        <div class="perf-box perf-correct">
                          <div class="perf-label">Doğru</div>
                          <div class="perf-value">${exam.mat_dogru || 0}</div>
                        </div>
                        <div class="perf-box perf-wrong">
                          <div class="perf-label">Yanlış</div>
                          <div class="perf-value">${exam.mat_yanlis || 0}</div>
                        </div>
                        <div class="perf-box perf-empty">
                          <div class="perf-label">Boş</div>
                          <div class="perf-value">${exam.mat_bos || 0}</div>
                        </div>
                        <div class="perf-box perf-net">
                          <div class="perf-label">Net</div>
                          <div class="perf-value">${((exam.mat_dogru || 0) - (exam.mat_yanlis || 0) * 0.25).toFixed(2)}</div>
                        </div>
                      </div>
                      ${exam.mat_wrong_topics ? `<div class="wrong-topics"><h4>❌ Yanlış Yapılan Konular:</h4><ul>${exam.mat_wrong_topics.split(',').map((t: string) => `<li>${t.trim()}</li>`).join('')}</ul></div>` : ''}
                    </div>
                    ` : ''}
                    
                    ${exam.fen_dogru !== undefined ? `
                    <div style="margin-bottom: 12px;">
                      <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">Fen Bilimleri</div>
                      <div class="performance-grid">
                        <div class="perf-box perf-correct">
                          <div class="perf-label">Doğru</div>
                          <div class="perf-value">${exam.fen_dogru || 0}</div>
                        </div>
                        <div class="perf-box perf-wrong">
                          <div class="perf-label">Yanlış</div>
                          <div class="perf-value">${exam.fen_yanlis || 0}</div>
                        </div>
                        <div class="perf-box perf-empty">
                          <div class="perf-label">Boş</div>
                          <div class="perf-value">${exam.fen_bos || 0}</div>
                        </div>
                        <div class="perf-box perf-net">
                          <div class="perf-label">Net</div>
                          <div class="perf-value">${((exam.fen_dogru || 0) - (exam.fen_yanlis || 0) * 0.25).toFixed(2)}</div>
                        </div>
                      </div>
                      ${exam.fen_wrong_topics ? `<div class="wrong-topics"><h4>❌ Yanlış Yapılan Konular:</h4><ul>${exam.fen_wrong_topics.split(',').map((t: string) => `<li>${t.trim()}</li>`).join('')}</ul></div>` : ''}
                    </div>
                    ` : ''}
                    
                    ${exam.sosyal_dogru !== undefined ? `
                    <div style="margin-bottom: 12px;">
                      <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px;">Sosyal Bilimler</div>
                      <div class="performance-grid">
                        <div class="perf-box perf-correct">
                          <div class="perf-label">Doğru</div>
                          <div class="perf-value">${exam.sosyal_dogru || 0}</div>
                        </div>
                        <div class="perf-box perf-wrong">
                          <div class="perf-label">Yanlış</div>
                          <div class="perf-value">${exam.sosyal_yanlis || 0}</div>
                        </div>
                        <div class="perf-box perf-empty">
                          <div class="perf-label">Boş</div>
                          <div class="perf-value">${exam.sosyal_bos || 0}</div>
                        </div>
                        <div class="perf-box perf-net">
                          <div class="perf-label">Net</div>
                          <div class="perf-value">${((exam.sosyal_dogru || 0) - (exam.sosyal_yanlis || 0) * 0.25).toFixed(2)}</div>
                        </div>
                      </div>
                      ${exam.sosyal_wrong_topics ? `<div class="wrong-topics"><h4>❌ Yanlış Yapılan Konular:</h4><ul>${exam.sosyal_wrong_topics.split(',').map((t: string) => `<li>${t.trim()}</li>`).join('')}</ul></div>` : ''}
                    </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
            
            <div class="footer-note">
              🎯 Bu rapor ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde otomatik olarak oluşturulmuştur.<br/>
              🏆 Berat Cankır Kişisel Analiz Sistemi 🏆
            </div>
            
            <div class="footer">
              Bu rapor YKS Çalışma Takip Sistemi tarafından otomatik olarak oluşturulmuştur.<br/>
              Başarılar dileriz! 🎓 BERAT CANKIR
            </div>
          </div>
        </body>
        </html>
      `;

      // Configure nodemailer transporter with Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send email
      await transporter.sendMail({
        from: `"YKS Çalışma Takip" <${emailFrom || emailUser}>`,
        to: toEmails,
        subject: `📊 Aylık İlerleme Raporu - ${new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`,
        html: htmlContent,
      });

      logActivity('Rapor Gönderildi', toEmails);
      res.json({ message: "Rapor başarıyla gönderildi" });
    } catch (error) {
      console.error("Error sending report:", error);
      res.status(500).json({ message: "Rapor gönderilirken hata oluştu. SMTP ayarlarını kontrol edin." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}


// BERAT CANKIR
// BERAT BİLAL CANKIR
// CANKIR

