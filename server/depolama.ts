//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

import { type Task, type InsertTask, type Mood, type InsertMood, type Goal, type InsertGoal, type QuestionLog, type InsertQuestionLog, type ExamResult, type InsertExamResult, type ExamSubjectNet, type InsertExamSubjectNet, type StudyHours, type InsertStudyHours, tasks, moods, goals, questionLogs, examResults, examSubjectNets, studyHours as studyHoursTable } from "@shared/sema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { promises as fs, readFileSync, existsSync } from "fs";
import path from "path";

export interface IStorage {
  // Görev işlemleri
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  toggleTaskComplete(id: string): Promise<Task | undefined>;
  archiveTask(id: string): Promise<Task | undefined>;
  getArchivedTasks(): Promise<Task[]>;
  getTasksByDateRange(startDate: string, endDate: string): Promise<Task[]>;
  getTasksByDate(dateISO: string): Promise<Task[]>;
  getDailySummary(rangeDays: number): Promise<any>;
  
  // Ruh hali işlemleri
  getMoods(): Promise<Mood[]>;
  getLatestMood(): Promise<Mood | undefined>;
  createMood(mood: InsertMood): Promise<Mood>;

  // Hedef işlemleri
  getGoals(): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // Soru günlüğü işlemi
  getQuestionLogs(): Promise<QuestionLog[]>;
  getArchivedQuestionLogs(): Promise<QuestionLog[]>;
  createQuestionLog(log: InsertQuestionLog): Promise<QuestionLog>;
  getQuestionLogsByDateRange(startDate: string, endDate: string): Promise<QuestionLog[]>;
  deleteQuestionLog(id: string): Promise<boolean>;
  deleteAllQuestionLogs(): Promise<boolean>;
  
  // konu istatistikleri işlemleri
  getTopicStats(): Promise<Array<{ topic: string; wrongMentions: number; totalSessions: number; mentionFrequency: number }>>;
  getPriorityTopics(): Promise<Array<{ topic: string; wrongMentions: number; mentionFrequency: number; priority: 'critical' | 'high' | 'medium' | 'low'; color: string }>>;
  getSubjectSolvedStats(): Promise<Array<{ subject: string; totalQuestions: number; totalTimeMinutes: number; averageTimePerQuestion: number }>>;
  
  // Sınav sonucu işlemleri
  getExamResults(): Promise<ExamResult[]>;
  getArchivedExamResults(): Promise<ExamResult[]>;
  createExamResult(result: InsertExamResult): Promise<ExamResult>;
  deleteExamResult(id: string): Promise<boolean>;
  deleteAllExamResults(): Promise<boolean>;
  
  // Sınav konusu network işlemleri
  getExamSubjectNets(): Promise<ExamSubjectNet[]>;
  getExamSubjectNetsByExamId(examId: string): Promise<ExamSubjectNet[]>;
  createExamSubjectNet(examSubjectNet: InsertExamSubjectNet): Promise<ExamSubjectNet>;
  updateExamSubjectNet(id: string, updates: Partial<InsertExamSubjectNet>): Promise<ExamSubjectNet | undefined>;
  deleteExamSubjectNet(id: string): Promise<boolean>;
  deleteExamSubjectNetsByExamId(examId: string): Promise<boolean>;
  
  // Çalışma saati işlemleri
  getStudyHours(): Promise<StudyHours[]>;
  getArchivedStudyHours(): Promise<StudyHours[]>;
  getStudyHoursByDate(date: string): Promise<StudyHours | undefined>;
  createStudyHours(studyHours: InsertStudyHours): Promise<StudyHours>;
  updateStudyHours(id: string, updates: Partial<InsertStudyHours>): Promise<StudyHours | undefined>;
  deleteStudyHours(id: string): Promise<boolean>;
  
  // Auto-archive işlemleri
  autoArchiveOldData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private moods: Map<string, Mood>;
  private goals: Map<string, Goal>;
  private questionLogs: Map<string, QuestionLog>;
  private examResults: Map<string, ExamResult>;
  private examSubjectNets: Map<string, ExamSubjectNet>;
  private studyHours: Map<string, StudyHours>;
  private dataPath: string;
  private saveTimeout: NodeJS.Timeout | null = null;
  private loaded: boolean = false;

  constructor() {
    this.tasks = new Map();
    this.moods = new Map();
    this.goals = new Map();
    this.questionLogs = new Map();
    this.examResults = new Map();
    this.examSubjectNets = new Map();
    this.studyHours = new Map();
    
    // Veri dosyası yolu - Electron'da DATA_DIR kullan, yoksa process.cwd()
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
    this.dataPath = path.join(dataDir, "kayitlar.json");
    
    console.log("Veriler şuraya kaydedilecek:", this.dataPath);
    
    // Verileri senkron olarak yükle
    this.loadFromFileSync();
  }
  
  // Dosyadan verileri senkron olarak yükle
  private loadFromFileSync(): void {
    // Dosya mevcutsa yükle
    if (existsSync(this.dataPath)) {
      try {
        const data = readFileSync(this.dataPath, "utf-8");
        const parsed = JSON.parse(data);
        
        // Map'lere dönüştür
        if (parsed.tasks) this.tasks = new Map(parsed.tasks.map((t: Task) => [t.id, { ...t, createdAt: new Date(t.createdAt) }]));
        if (parsed.moods) this.moods = new Map(parsed.moods.map((m: Mood) => [m.id, { ...m, createdAt: new Date(m.createdAt) }]));
        if (parsed.goals) this.goals = new Map(parsed.goals.map((g: Goal) => [g.id, { ...g, createdAt: new Date(g.createdAt) }]));
        if (parsed.questionLogs) this.questionLogs = new Map(parsed.questionLogs.map((q: QuestionLog) => [q.id, { ...q, createdAt: new Date(q.createdAt) }]));
        if (parsed.examResults) this.examResults = new Map(parsed.examResults.map((e: ExamResult) => [e.id, { ...e, createdAt: new Date(e.createdAt) }]));
        if (parsed.examSubjectNets) this.examSubjectNets = new Map(parsed.examSubjectNets.map((e: ExamSubjectNet) => [e.id, { ...e, createdAt: new Date(e.createdAt) }]));
        if (parsed.studyHours) this.studyHours = new Map(parsed.studyHours.map((s: StudyHours) => [s.id, { ...s, createdAt: new Date(s.createdAt) }]));
        
        console.log("✅ Veriler dosyadan yüklendi:", this.dataPath);
        this.loaded = true;
      } catch (error) {
        console.error("❌ Veri yükleme hatası:", error);
        // Parse hatası varsa dosyayı backup'la ve yeni başla
        try {
          const { renameSync } = require("fs");
          renameSync(this.dataPath, this.dataPath + ".bak");
          console.log("Hatalı dosya yedeklendi:", this.dataPath + ".bak");
        } catch {}
        this.initializeSampleGoals().catch(err => console.error("Sample goals init error:", err));
        this.loaded = true;
      }
    } else {
      // Dosya yoksa örnek hedeflerle başla
      console.log("📁 Veri dosyası bulunamadı, yeni dosya oluşturulacak:", this.dataPath);
      this.initializeSampleGoals().catch(err => console.error("Sample goals init error:", err));
      this.loaded = true;
    }
  }
  
  // Dosyaya kaydet (anında)
  private async saveToFile(): Promise<void> {
    try {
      const data = {
        tasks: Array.from(this.tasks.values()),
        moods: Array.from(this.moods.values()),
        goals: Array.from(this.goals.values()),
        questionLogs: Array.from(this.questionLogs.values()),
        examResults: Array.from(this.examResults.values()),
        examSubjectNets: Array.from(this.examSubjectNets.values()),
        studyHours: Array.from(this.studyHours.values()),
      };
      
      // data klasörünü oluştur
      await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
      
      // Dosyaya yaz
      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), "utf-8");
      console.log("Veriler dosyaya kaydedildi:", this.dataPath);
    } catch (error) {
      console.error("Veri kaydetme hatası:", error);
    }
  }
  
  private async initializeSampleGoals() {
    const sampleGoals = [
      {
        id: randomUUID(),
        title: "TYT Net Hedefi",
        description: "2026 TYT'de 75 net hedefliyorum",
        targetValue: "75",
        currentValue: "68.75",
        unit: "net",
        category: "tyt" as const,
        timeframe: "aylık" as const,
        targetDate: "2026-06-20",
        completed: false,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        title: "AYT Net Hedefi",
        description: "2026 AYT'de 60 net hedefliyorum",
        targetValue: "60",
        currentValue: "45.50",
        unit: "net",
        category: "ayt" as const,
        timeframe: "aylık" as const,
        targetDate: "2026-06-21",
        completed: false,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        title: "Sıralama Hedefi",
        description: "10.000'inci sıranın üstünde olmak istiyorum",
        targetValue: "10000",
        currentValue: "15750",
        unit: "sıralama",
        category: "siralama" as const,
        timeframe: "yıllık" as const,
        targetDate: "2026-06-21",
        completed: false,
        createdAt: new Date()
      }
    ];
    
    for (const goal of sampleGoals) {
      this.goals.set(goal.id, goal);
    }
    
    // İlk kez yükleme yapılıyorsa dosyaya kaydet
    await this.saveToFile();
  }

  // Görev işlemleri
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => !task.archived && !task.deleted)
      .sort((a, b) => {
        // Öncelik sırasına göre (yüksek -> orta -> düşük) ve ardından oluşturulma tarihine göre sırala
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      id,
      title: insertTask.title,
      description: insertTask.description ?? null,
      priority: insertTask.priority ?? "medium",
      category: insertTask.category ?? "genel",
      color: insertTask.color ?? "#8B5CF6", // mor
      completed: insertTask.completed ?? false,
      completedAt: null,
      archived: insertTask.archived ?? false,
      archivedAt: null,
      deleted: false,
      deletedAt: null,
      dueDate: insertTask.dueDate ?? null,
      recurrenceType: insertTask.recurrenceType ?? "none",
      recurrenceEndDate: insertTask.recurrenceEndDate ?? null,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    await this.saveToFile();
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return undefined;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
    };
    this.tasks.set(id, updatedTask);
    await this.saveToFile();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) return false;
    
    const updatedTask: Task = {
      ...task,
      deleted: true,
      deletedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updatedTask);
    await this.saveToFile();
    return true;
  }

  async toggleTaskComplete(id: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) {
      return undefined;
    }

    const updatedTask: Task = {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null,
    };
    this.tasks.set(id, updatedTask);
    await this.saveToFile();
    return updatedTask;
  }

  async archiveTask(id: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) {
      return undefined;
    }

    const updatedTask: Task = {
      ...task,
      archived: true,
      archivedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updatedTask);
    await this.saveToFile();
    return updatedTask;
  }

  async getArchivedTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.archived && !task.deleted)
      .sort((a, b) => {
        return new Date(b.archivedAt || b.createdAt || 0).getTime() - new Date(a.archivedAt || a.createdAt || 0).getTime();
      });
  }

  async getTasksByDateRange(startDate: string, endDate: string): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    return allTasks.filter(task => {
      if (task.archived) return false;
      if (task.deleted) return false;
      if (!task.dueDate) return false;
      const taskDate = task.dueDate.split('T')[0];
      return taskDate >= startDate && taskDate <= endDate;
    }).sort((a, b) => {
      const aDate = a.dueDate ? a.dueDate.split('T')[0] : '';
      const bDate = b.dueDate ? b.dueDate.split('T')[0] : '';
      return bDate.localeCompare(aDate);
    });
  }

  // Ruh hali işlemleri
  async getMoods(): Promise<Mood[]> {
    return Array.from(this.moods.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getLatestMood(): Promise<Mood | undefined> {
    const moods = await this.getMoods();
    return moods[0];
  }

  async createMood(insertMood: InsertMood): Promise<Mood> {
    const id = randomUUID();
    const mood: Mood = {
      id,
      mood: insertMood.mood,
      moodBg: insertMood.moodBg ?? null,
      note: insertMood.note ?? null,
      createdAt: new Date(),
    };
    this.moods.set(id, mood);
    await this.saveToFile();
    return mood;
  }

  // Yeni işlevsellik için yöntemler
  // Note: Calendar view includes deleted items for historical accuracy
  async getTasksByDate(dateISO: string): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    const today = new Date().toISOString().split('T')[0];
    
    return allTasks.filter(task => {
      if (task.archived) return false;
      // Deleted items are included in calendar view
      
      // Eğer görevin son tarihi varsa, istenen tarihle eşleşip eşleşmediğini kontrol et
      if (task.dueDate) {
        const taskDate = task.dueDate.split('T')[0];
        return taskDate === dateISO;
      }

      // Görevin son tarihi yoksa, bugün için tüm görevleri göster (tamamlanmış veya bekleyen)
      if (dateISO === today) {
        return !task.deleted; // Bugün için silinen görevleri gösterme
      }
      
      return false;
    });
  }

  // Note: Daily summary/heatmap includes deleted items for historical accuracy
  async getDailySummary(rangeDays: number = 30): Promise<any> {
    const allTasks = Array.from(this.tasks.values());
    const moods = await this.getMoods();
    
    const today = new Date();
    const summaryData = [];
    
    for (let i = 0; i < rangeDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = allTasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
        return completedDate === dateStr;
      });
      
      const dayMoods = moods.filter(mood => {
        if (!mood.createdAt) return false;
        const moodDate = new Date(mood.createdAt).toISOString().split('T')[0];
        return moodDate === dateStr;
      });
      
      summaryData.push({
        date: dateStr,
        tasksCompleted: dayTasks.length,
        totalTasks: allTasks.filter(task => {
          if (!task.createdAt) return false;
          const createdDate = new Date(task.createdAt).toISOString().split('T')[0];
          return createdDate <= dateStr;
        }).length,
        moods: dayMoods,
        productivity: dayTasks.length > 0 ? Math.min(dayTasks.length * 20, 100) : 0
      });
    }
    
    return summaryData;
  }
  
  // Hedef operasyonları
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      id,
      title: insertGoal.title,
      description: insertGoal.description ?? null,
      category: insertGoal.category ?? "genel",
      targetDate: insertGoal.targetDate ?? null,
      completed: insertGoal.completed ?? false,
      currentValue: insertGoal.currentValue ?? "0",
      targetValue: insertGoal.targetValue ?? "100",
      unit: insertGoal.unit ?? "net",
      timeframe: insertGoal.timeframe ?? "aylık",
      createdAt: new Date(),
    };
    this.goals.set(id, goal);
    await this.saveToFile();
    return goal;
  }

  async updateGoal(id: string, updates: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existingGoal = this.goals.get(id);
    if (!existingGoal) {
      return undefined;
    }

    const updatedGoal: Goal = {
      ...existingGoal,
      ...updates,
    };
    this.goals.set(id, updatedGoal);
    await this.saveToFile();
    return updatedGoal;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = this.goals.delete(id);
    if (result) await this.saveToFile();
    return result;
  }

  // Soru günlüğü işlemleri
  async getQuestionLogs(): Promise<QuestionLog[]> {
    return Array.from(this.questionLogs.values())
      .filter(log => !log.deleted && !log.archived)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async getArchivedQuestionLogs(): Promise<QuestionLog[]> {
    return Array.from(this.questionLogs.values())
      .filter(log => !log.deleted && log.archived)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async createQuestionLog(insertLog: InsertQuestionLog): Promise<QuestionLog> {
    const id = randomUUID();
    
    // Yanlış konuları normalleştirerek konu öneklerini kaldırın
    const normalizedWrongTopics = insertLog.wrong_topics ? 
      insertLog.wrong_topics
        .filter(topic => topic != null && topic !== '')
        .map(topic => this.normalizeTopic(String(topic))) : [];
    
    const log: QuestionLog = {
      id,
      exam_type: insertLog.exam_type,
      subject: insertLog.subject,
      topic: insertLog.topic ?? null,
      correct_count: insertLog.correct_count,
      wrong_count: insertLog.wrong_count,
      blank_count: insertLog.blank_count ?? "0",
      wrong_topics: normalizedWrongTopics,
      wrong_topics_json: insertLog.wrong_topics_json ?? null,
      time_spent_minutes: insertLog.time_spent_minutes ?? null,
      study_date: insertLog.study_date,
      deleted: false,
      deletedAt: null,
      archived: false,
      archivedAt: null,
      createdAt: new Date(),
    };
    this.questionLogs.set(id, log);
    await this.saveToFile();
    return log;
  }

  async getQuestionLogsByDateRange(startDate: string, endDate: string): Promise<QuestionLog[]> {
    const logs = Array.from(this.questionLogs.values());
    return logs.filter(log => {
      const logDate = log.study_date;
      return logDate >= startDate && logDate <= endDate;
    }).sort((a, b) => new Date(b.study_date).getTime() - new Date(a.study_date).getTime());
  }

  async deleteQuestionLog(id: string): Promise<boolean> {
    const log = this.questionLogs.get(id);
    if (!log) return false;
    
    const updatedLog: QuestionLog = {
      ...log,
      deleted: true,
      deletedAt: new Date().toISOString(),
    };
    this.questionLogs.set(id, updatedLog);
    await this.saveToFile();
    return true;
  }

  async deleteAllQuestionLogs(): Promise<boolean> {
    this.questionLogs.clear();
    await this.saveToFile();
    return true;
  }
  
  // Sınav sonucu işlemleri
  async getExamResults(): Promise<ExamResult[]> {
    return Array.from(this.examResults.values())
      .filter(result => !result.deleted && !result.archived)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async getArchivedExamResults(): Promise<ExamResult[]> {
    return Array.from(this.examResults.values())
      .filter(result => !result.deleted && result.archived)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async createExamResult(insertResult: InsertExamResult): Promise<ExamResult> {
    const id = randomUUID();
    
    let displayName = insertResult.exam_name;
    
    if (insertResult.exam_scope === "full") {
      if (insertResult.exam_type) {
        displayName = `Genel ${insertResult.exam_type} Deneme`;
      } else {
        displayName = "Genel Deneme";
      }
    } else if (insertResult.exam_scope === "branch") {
      const parts = [];
      if (insertResult.exam_type) parts.push(insertResult.exam_type);
      if (insertResult.selected_subject) parts.push(insertResult.selected_subject);
      parts.push("Branş Denemesi");
      displayName = parts.join(" ");
    }
    
    const result: ExamResult = {
      id,
      exam_name: insertResult.exam_name,
      display_name: displayName,
      exam_date: insertResult.exam_date,
      exam_type: insertResult.exam_type ?? null,
      exam_scope: insertResult.exam_scope ?? null,
      selected_subject: insertResult.selected_subject ?? null,
      notes: insertResult.notes ?? null,
      ranking: insertResult.ranking ?? null,
      tyt_net: insertResult.tyt_net ?? "0",
      ayt_net: insertResult.ayt_net ?? "0",
      subjects_data: insertResult.subjects_data ?? null,
      deleted: false,
      deletedAt: null,
      archived: false,
      archivedAt: null,
      createdAt: new Date(),
    };
    this.examResults.set(id, result);
    await this.saveToFile();
    return result;
  }

  async deleteExamResult(id: string): Promise<boolean> {
    const examResult = this.examResults.get(id);
    if (!examResult) return false;
    
    const updatedResult: ExamResult = {
      ...examResult,
      deleted: true,
      deletedAt: new Date().toISOString(),
    };
    this.examResults.set(id, updatedResult);
    await this.saveToFile();
    return true;
  }

  async deleteAllExamResults(): Promise<boolean> {
    this.examResults.clear();
    this.examSubjectNets.clear(); // Ayrıca tüm konu ağlarını temizle
    await this.saveToFile();
    return true;
  }
  // Flashcard işlemleri (silinecek)
  
  // TYT/AYT konu öneklerini kaldırarak konu adlarını normalleştirin
  private normalizeTopic(topic: string): string {
    // TYT veya AYT ile başlayan ve ardından herhangi bir karakter dizisi, boşluk, tire ve ardından gerçek konu adı gelen konuları normalleştir
    if (typeof topic !== 'string') {
      return String(topic || '').trim();
    }
    return topic.replace(/^(TYT|AYT)\s+[^-]+\s+-\s+/, '').trim();
  }

  // Konu istatistik işlemleri (kullanıcılar tarafından belirtilen belirli yanlış konular)
  async getTopicStats(): Promise<Array<{ topic: string; wrongMentions: number; totalSessions: number; mentionFrequency: number }>> {
    const logs = Array.from(this.questionLogs.values());
    const examSubjectNets = Array.from(this.examSubjectNets.values());
    const topicStats = new Map<string, { wrongMentions: number; sessionsAppeared: Set<string> }>();

    // Süreç soru günlükleri
    logs.forEach(log => {
      // Sadece özellikle belirtilen yanlış konuları takip et, genel konuları değil
      if (log.wrong_topics && log.wrong_topics.length > 0) {
        log.wrong_topics.forEach(topic => {
          const normalizedTopic = this.normalizeTopic(topic);
          if (!topicStats.has(normalizedTopic)) {
            topicStats.set(normalizedTopic, { wrongMentions: 0, sessionsAppeared: new Set() });
          }
          const topicStat = topicStats.get(normalizedTopic)!;
          topicStat.wrongMentions += 1; // Bu konunun yanlış olarak ne kadar sıklıkla belirtildiğini say
          topicStat.sessionsAppeared.add(log.id); // Bu konunun göründüğü benzersiz oturumları takip et
        });
      }
    });

    // exam_subject_nets tablosundan wrong_topics_json'u parse et
    examSubjectNets.forEach(subjectNet => {
      if (subjectNet.wrong_topics_json) {
        try {
          const wrongTopicsData = JSON.parse(subjectNet.wrong_topics_json);
          if (Array.isArray(wrongTopicsData)) {
            wrongTopicsData.forEach((topicEntry: any) => {
              const topicName = typeof topicEntry === 'string' ? topicEntry : topicEntry.topic;
              if (topicName && topicName.trim().length > 0) {
                const normalizedTopic = this.normalizeTopic(topicName);
                if (!topicStats.has(normalizedTopic)) {
                  topicStats.set(normalizedTopic, { wrongMentions: 0, sessionsAppeared: new Set() });
                }
                const topicStat = topicStats.get(normalizedTopic)!;
                topicStat.wrongMentions += 2; // Ağırlık hataları daha yüksek (2 kat)
                topicStat.sessionsAppeared.add(`examnet_${subjectNet.id}`);
              }
            });
          }
        } catch (e) {
          // Bozuk JSON'ları atla
        }
      }
    });

    const totalUniqueSessions = topicStats.size > 0 
      ? Math.max(logs.length, Array.from(new Set(
          [...Array.from(topicStats.values()).flatMap(s => Array.from(s.sessionsAppeared))]
        )).length)
      : logs.length;
    
    return Array.from(topicStats.entries())
      .map(([topic, stats]) => ({
        topic,
        wrongMentions: stats.wrongMentions,
        totalSessions: stats.sessionsAppeared.size,
        mentionFrequency: totalUniqueSessions > 0 ? (stats.sessionsAppeared.size / totalUniqueSessions) * 100 : 0
      }))
      .filter(stat => stat.wrongMentions >= 2) // Gürültüyü önlemek için en az iki kez bahsedilen konuları göster
      .sort((a, b) => b.wrongMentions - a.wrongMentions);
  }

  async getPriorityTopics(): Promise<Array<{ topic: string; wrongMentions: number; mentionFrequency: number; priority: 'critical' | 'high' | 'medium' | 'low'; color: string }>> {
    const topicStats = await this.getTopicStats();
    
    return topicStats.map(stat => {
      let priority: 'critical' | 'high' | 'medium' | 'low';
      let color: string;
      
      // Yanlış bahsetme sayısı ve sıklığına göre öncelik
      if (stat.wrongMentions >= 10 || stat.mentionFrequency >= 50) {
        priority = 'critical';
        color = '#DC2626'; // Kırmızı
      } else if (stat.wrongMentions >= 6 || stat.mentionFrequency >= 30) {
        priority = 'high';
        color = '#EA580C'; // Turuncu
      } else if (stat.wrongMentions >= 3 || stat.mentionFrequency >= 15) {
        priority = 'medium';
        color = '#D97706'; // Amber
      } else {
        priority = 'low';
        color = '#16A34A'; // Yeşil
      }
      
      return {
        topic: stat.topic,
        wrongMentions: stat.wrongMentions,
        mentionFrequency: stat.mentionFrequency,
        priority,
        color
      };
    });
  }

  async getSubjectSolvedStats(): Promise<Array<{ subject: string; totalQuestions: number; totalTimeMinutes: number; averageTimePerQuestion: number }>> {
    const logs = Array.from(this.questionLogs.values());
    const subjectStats = new Map<string, { totalQuestions: number; totalTimeMinutes: number }>();

    logs.forEach(log => {
      const totalQuestions = parseInt(log.correct_count) + parseInt(log.wrong_count) + parseInt(log.blank_count || "0");
      const timeSpent = log.time_spent_minutes || 0;
      
      if (!subjectStats.has(log.subject)) {
        subjectStats.set(log.subject, { totalQuestions: 0, totalTimeMinutes: 0 });
      }
      
      const stats = subjectStats.get(log.subject)!;
      stats.totalQuestions += totalQuestions;
      stats.totalTimeMinutes += timeSpent;
    });

    return Array.from(subjectStats.entries())
      .map(([subject, stats]) => ({
        subject,
        totalQuestions: stats.totalQuestions,
        totalTimeMinutes: stats.totalTimeMinutes,
        averageTimePerQuestion: stats.totalQuestions > 0 ? stats.totalTimeMinutes / stats.totalQuestions : 0
      }))
      .filter(stat => stat.totalQuestions > 0)
      .sort((a, b) => b.totalQuestions - a.totalQuestions);
  }

  // Yanlış bahsetme sayısı ve sıklığına göre öncelikSınav konusu ağ işlemleri
  async getExamSubjectNets(): Promise<ExamSubjectNet[]> {
    return Array.from(this.examSubjectNets.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getExamSubjectNetsByExamId(examId: string): Promise<ExamSubjectNet[]> {
    return Array.from(this.examSubjectNets.values())
      .filter(net => net.exam_id === examId)
      .sort((a, b) => a.subject.localeCompare(b.subject));
  }

  async createExamSubjectNet(insertNet: InsertExamSubjectNet): Promise<ExamSubjectNet> {
    // Sınavın varlığını doğrulayın
    const examExists = this.examResults.has(insertNet.exam_id);
    if (!examExists) {
      throw new Error(`Exam with id ${insertNet.exam_id} does not exist`);
    }
    
    const id = randomUUID();
    const examSubjectNet: ExamSubjectNet = {
      id,
      exam_id: insertNet.exam_id,
      exam_type: insertNet.exam_type,
      subject: insertNet.subject,
      net_score: insertNet.net_score,
      correct_count: insertNet.correct_count ?? "0",
      wrong_count: insertNet.wrong_count ?? "0",
      blank_count: insertNet.blank_count ?? "0",
      wrong_topics_json: insertNet.wrong_topics_json ?? null,
      createdAt: new Date(),
    };
    this.examSubjectNets.set(id, examSubjectNet);
    await this.saveToFile();
    return examSubjectNet;
  }

  async updateExamSubjectNet(id: string, updates: Partial<InsertExamSubjectNet>): Promise<ExamSubjectNet | undefined> {
    const existing = this.examSubjectNets.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: ExamSubjectNet = {
      ...existing,
      ...updates,
    };
    this.examSubjectNets.set(id, updated);
    await this.saveToFile();
    return updated;
  }

  async deleteExamSubjectNet(id: string): Promise<boolean> {
    const result = this.examSubjectNets.delete(id);
    if (result) await this.saveToFile();
    return result;
  }

  async deleteExamSubjectNetsByExamId(examId: string): Promise<boolean> {
    const netsToDelete = Array.from(this.examSubjectNets.entries())
      .filter(([_, net]) => net.exam_id === examId);
    
    let deletedAny = false;
    for (const [id, _] of netsToDelete) {
      if (this.examSubjectNets.delete(id)) {
        deletedAny = true;
      }
    }
    if (deletedAny) await this.saveToFile();
    return deletedAny;
  }

  // Çalışma saati işlemleri
  async getStudyHours(): Promise<StudyHours[]> {
    return Array.from(this.studyHours.values())
      .filter(sh => !sh.deleted && !sh.archived)
      .sort((a, b) => 
        new Date(b.study_date).getTime() - new Date(a.study_date).getTime()
      );
  }

  async getArchivedStudyHours(): Promise<StudyHours[]> {
    return Array.from(this.studyHours.values())
      .filter(sh => !sh.deleted && sh.archived)
      .sort((a, b) => 
        new Date(b.study_date).getTime() - new Date(a.study_date).getTime()
      );
  }

  async getStudyHoursByDate(date: string): Promise<StudyHours | undefined> {
    return Array.from(this.studyHours.values()).find(sh => sh.study_date === date);
  }

  async createStudyHours(insertHours: InsertStudyHours): Promise<StudyHours> {
    const id = randomUUID();
    const studyHours: StudyHours = {
      id,
      study_date: insertHours.study_date,
      hours: insertHours.hours ?? 0,
      minutes: insertHours.minutes ?? 0,
      seconds: insertHours.seconds ?? 0,
      deleted: false,
      deletedAt: null,
      archived: false,
      archivedAt: null,
      createdAt: new Date(),
    };
    this.studyHours.set(id, studyHours);
    await this.saveToFile();
    return studyHours;
  }

  async updateStudyHours(id: string, updates: Partial<InsertStudyHours>): Promise<StudyHours | undefined> {
    const existing = this.studyHours.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: StudyHours = {
      ...existing,
      ...updates,
    };
    this.studyHours.set(id, updated);
    await this.saveToFile();
    return updated;
  }

  async deleteStudyHours(id: string): Promise<boolean> {
    const studyHour = this.studyHours.get(id);
    if (!studyHour) return false;
    
    const updatedStudyHour: StudyHours = {
      ...studyHour,
      deleted: true,
      deletedAt: new Date().toISOString(),
    };
    this.studyHours.set(id, updatedStudyHour);
    await this.saveToFile();
    return true;
  }

  async autoArchiveOldData(): Promise<void> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    let hasChanges = false;

    for (const [id, log] of this.questionLogs.entries()) {
      if (!log.archived && !log.deleted && log.study_date) {
        const logDateStr = log.study_date.split('T')[0];
        if (logDateStr < today) {
          const updated = {
            ...log,
            archived: true,
            archivedAt: now.toISOString(),
          };
          this.questionLogs.set(id, updated);
          hasChanges = true;
        }
      }
    }

    for (const [id, result] of this.examResults.entries()) {
      if (!result.archived && !result.deleted && result.exam_date) {
        const examDateStr = result.exam_date.split('T')[0];
        if (examDateStr < today) {
          const updated = {
            ...result,
            archived: true,
            archivedAt: now.toISOString(),
          };
          this.examResults.set(id, updated);
          hasChanges = true;
        }
      }
    }

    for (const [id, sh] of this.studyHours.entries()) {
      if (!sh.archived && !sh.deleted && sh.study_date) {
        const shDateStr = sh.study_date.split('T')[0];
        if (shDateStr < today) {
          const updated = {
            ...sh,
            archived: true,
            archivedAt: now.toISOString(),
          };
          this.studyHours.set(id, updated);
          hasChanges = true;
        }
      }
    }

    for (const [id, task] of this.tasks.entries()) {
      if (!task.archived && !task.deleted && task.dueDate) {
        const taskDateStr = task.dueDate.split('T')[0];
        if (taskDateStr < today) {
          const updated = {
            ...task,
            archived: true,
            archivedAt: now.toISOString(),
          };
          this.tasks.set(id, updated);
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      await this.saveToFile();
      console.log("✅ Eski veriler otomatik olarak arşivlendi");
    }
  }
}
// PostgreSQL veritabanı bağlantısı
//const connectionString = process.env.DATABASE_URL;
//if (!connectionString) {
//  throw new Error("DATABASE_URL environment variable is not set");
//}
const connectionString = "postgres://postgres:senin_sifren@localhost:5432/yksanaliz";  // Geçici bağlantı
const sqlConnection = neon(connectionString);
const db = drizzle(sqlConnection);

// PostgreSQL tabanlı depolama (kalıcı veri)
export class DbStorage implements IStorage {
  // Görev işlemleri
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.archived, false)).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(insertTask as any).returning();
    return result[0];
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async toggleTaskComplete(id: string): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const result = await db.update(tasks).set({
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null,
    } as any).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async archiveTask(id: string): Promise<Task | undefined> {
    const result = await db.update(tasks).set({
      archived: true,
      archivedAt: new Date().toISOString(),
    } as any).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async getArchivedTasks(): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.archived, true)).orderBy(desc(tasks.archivedAt));
  }

  async getTasksByDateRange(startDate: string, endDate: string): Promise<Task[]> {
    const allTasks = await db.select().from(tasks);
    return allTasks.filter(task => {
      if (task.archived) return false;
      if (!task.dueDate) return false;
      const taskDate = task.dueDate.split('T')[0];
      return taskDate >= startDate && taskDate <= endDate;
    }).sort((a, b) => {
      const aDate = a.dueDate ? a.dueDate.split('T')[0] : '';
      const bDate = b.dueDate ? b.dueDate.split('T')[0] : '';
      return bDate.localeCompare(aDate);
    });
  }

  async getTasksByDate(dateISO: string): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const allTasks = await db.select().from(tasks);
    
    return allTasks.filter(task => {
      if (task.archived) return false;
      
      if (task.dueDate) {
        const taskDate = task.dueDate.split('T')[0];
        return taskDate === dateISO;
      }
      if (dateISO === today) {
        return true;
      }
      return false;
    });
  }

  async getDailySummary(rangeDays: number = 30): Promise<any> {
    const allTasks = await db.select().from(tasks);
    const allMoods = await db.select().from(moods);
    
    const today = new Date();
    const summaryData = [];
    
    for (let i = 0; i < rangeDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = allTasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
        return completedDate === dateStr;
      });
      
      const dayMoods = allMoods.filter(mood => {
        if (!mood.createdAt) return false;
        const moodDate = new Date(mood.createdAt).toISOString().split('T')[0];
        return moodDate === dateStr;
      });
      
      summaryData.push({
        date: dateStr,
        tasksCompleted: dayTasks.length,
        totalTasks: allTasks.filter(task => {
          if (!task.createdAt) return false;
          const createdDate = new Date(task.createdAt).toISOString().split('T')[0];
          return createdDate <= dateStr;
        }).length,
        moods: dayMoods,
        productivity: dayTasks.length > 0 ? Math.min(dayTasks.length * 20, 100) : 0
      });
    }
    
    return summaryData;
  }

  // Ruh hali işlemleri
  async getMoods(): Promise<Mood[]> {
    return await db.select().from(moods).orderBy(desc(moods.createdAt));
  }

  async getLatestMood(): Promise<Mood | undefined> {
    const result = await db.select().from(moods).orderBy(desc(moods.createdAt)).limit(1);
    return result[0];
  }

  async createMood(insertMood: InsertMood): Promise<Mood> {
    const result = await db.insert(moods).values(insertMood as any).returning();
    return result[0];
  }

  // Hedef işlemleri
  async getGoals(): Promise<Goal[]> {
    return await db.select().from(goals).orderBy(desc(goals.createdAt));
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const result = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
    return result[0];
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const result = await db.insert(goals).values(insertGoal as any).returning();
    return result[0];
  }

  async updateGoal(id: string, updates: Partial<InsertGoal>): Promise<Goal | undefined> {
    const result = await db.update(goals).set(updates).where(eq(goals.id, id)).returning();
    return result[0];
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Soru günlüğü işlemleri
  async getQuestionLogs(): Promise<QuestionLog[]> {
    return await db.select().from(questionLogs).orderBy(desc(questionLogs.createdAt));
  }

  async createQuestionLog(insertLog: InsertQuestionLog): Promise<QuestionLog> {
    const result = await db.insert(questionLogs).values(insertLog as any).returning();
    return result[0];
  }

  async getQuestionLogsByDateRange(startDate: string, endDate: string): Promise<QuestionLog[]> {
    return await db.select().from(questionLogs)
      .where(and(
        gte(questionLogs.study_date, startDate),
        lte(questionLogs.study_date, endDate)
      ))
      .orderBy(desc(questionLogs.study_date));
  }

  async deleteQuestionLog(id: string): Promise<boolean> {
    const result = await db.delete(questionLogs).where(eq(questionLogs.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async deleteAllQuestionLogs(): Promise<boolean> {
    await db.delete(questionLogs);
    return true;
  }

  // Konu istatistikleri işlemleri
  async getTopicStats(): Promise<Array<{ topic: string; wrongMentions: number; totalSessions: number; mentionFrequency: number }>> {
    const logs = await this.getQuestionLogs();
    const examSubjectNets = await this.getExamSubjectNets();
    const topicStats = new Map<string, { wrongMentions: number; sessionsAppeared: Set<string> }>();

    logs.forEach(log => {
      if (log.wrong_topics && log.wrong_topics.length > 0) {
        log.wrong_topics.forEach(topic => {
          const normalizedTopic = this.normalizeTopic(topic);
          if (!topicStats.has(normalizedTopic)) {
            topicStats.set(normalizedTopic, { wrongMentions: 0, sessionsAppeared: new Set() });
          }
          const topicStat = topicStats.get(normalizedTopic)!;
          topicStat.wrongMentions += 1;
          topicStat.sessionsAppeared.add(log.id);
        });
      }
    });

    // exam_subject_nets tablosundan wrong_topics_json'u parse et
    examSubjectNets.forEach(subjectNet => {
      if (subjectNet.wrong_topics_json) {
        try {
          const wrongTopicsData = JSON.parse(subjectNet.wrong_topics_json);
          if (Array.isArray(wrongTopicsData)) {
            wrongTopicsData.forEach((topicEntry: any) => {
              const topicName = typeof topicEntry === 'string' ? topicEntry : topicEntry.topic;
              if (topicName && topicName.trim().length > 0) {
                const normalizedTopic = this.normalizeTopic(topicName);
                if (!topicStats.has(normalizedTopic)) {
                  topicStats.set(normalizedTopic, { wrongMentions: 0, sessionsAppeared: new Set() });
                }
                const topicStat = topicStats.get(normalizedTopic)!;
                topicStat.wrongMentions += 2;
                topicStat.sessionsAppeared.add(`examnet_${subjectNet.id}`);
              }
            });
          }
        } catch (e) {
          // Skip broken JSON
        }
      }
    });

    const totalUniqueSessions = topicStats.size > 0 
      ? Math.max(logs.length, Array.from(new Set(
          [...Array.from(topicStats.values()).flatMap(s => Array.from(s.sessionsAppeared))]
        )).length)
      : logs.length;
    
    return Array.from(topicStats.entries())
      .map(([topic, stats]) => ({
        topic,
        wrongMentions: stats.wrongMentions,
        totalSessions: stats.sessionsAppeared.size,
        mentionFrequency: totalUniqueSessions > 0 ? (stats.sessionsAppeared.size / totalUniqueSessions) * 100 : 0
      }))
      .filter(stat => stat.wrongMentions >= 2)
      .sort((a, b) => b.wrongMentions - a.wrongMentions);
  }

  async getPriorityTopics(): Promise<Array<{ topic: string; wrongMentions: number; mentionFrequency: number; priority: 'critical' | 'high' | 'medium' | 'low'; color: string }>> {
    const topicStats = await this.getTopicStats();
    
    return topicStats.map(stat => {
      let priority: 'critical' | 'high' | 'medium' | 'low';
      let color: string;
      
      if (stat.wrongMentions >= 10 || stat.mentionFrequency >= 50) {
        priority = 'critical';
        color = '#DC2626';
      } else if (stat.wrongMentions >= 6 || stat.mentionFrequency >= 30) {
        priority = 'high';
        color = '#EA580C';
      } else if (stat.wrongMentions >= 3 || stat.mentionFrequency >= 15) {
        priority = 'medium';
        color = '#D97706';
      } else {
        priority = 'low';
        color = '#16A34A';
      }
      
      return {
        topic: stat.topic,
        wrongMentions: stat.wrongMentions,
        mentionFrequency: stat.mentionFrequency,
        priority,
        color
      };
    });
  }

  async getSubjectSolvedStats(): Promise<Array<{ subject: string; totalQuestions: number; totalTimeMinutes: number; averageTimePerQuestion: number }>> {
    const logs = await this.getQuestionLogs();
    const subjectStats = new Map<string, { totalQuestions: number; totalTimeMinutes: number }>();

    logs.forEach(log => {
      const totalQuestions = parseInt(log.correct_count) + parseInt(log.wrong_count) + parseInt(log.blank_count || "0");
      const timeSpent = log.time_spent_minutes || 0;
      
      if (!subjectStats.has(log.subject)) {
        subjectStats.set(log.subject, { totalQuestions: 0, totalTimeMinutes: 0 });
      }
      
      const stats = subjectStats.get(log.subject)!;
      stats.totalQuestions += totalQuestions;
      stats.totalTimeMinutes += timeSpent;
    });

    return Array.from(subjectStats.entries())
      .map(([subject, stats]) => ({
        subject,
        totalQuestions: stats.totalQuestions,
        totalTimeMinutes: stats.totalTimeMinutes,
        averageTimePerQuestion: stats.totalQuestions > 0 ? stats.totalTimeMinutes / stats.totalQuestions : 0
      }))
      .filter(stat => stat.totalQuestions > 0)
      .sort((a, b) => b.totalQuestions - a.totalQuestions);
  }

  private normalizeTopic(topic: string): string {
    return topic.replace(/^(TYT|AYT)\s+[^-]+\s+-\s+/, '').trim();
  }

  // Sınav sonucu işlemleri
  async getExamResults(): Promise<ExamResult[]> {
    return await db.select().from(examResults).orderBy(desc(examResults.createdAt));
  }

  async createExamResult(insertResult: InsertExamResult): Promise<ExamResult> {
    const result = await db.insert(examResults).values(insertResult as any).returning();
    return result[0];
  }

  async deleteExamResult(id: string): Promise<boolean> {
    await this.deleteExamSubjectNetsByExamId(id);
    const result = await db.delete(examResults).where(eq(examResults.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async deleteAllExamResults(): Promise<boolean> {
    await db.delete(examSubjectNets);
    await db.delete(examResults);
    return true;
  }

  // Sınav konusu ağ işlemleri
  async getExamSubjectNets(): Promise<ExamSubjectNet[]> {
    return await db.select().from(examSubjectNets).orderBy(desc(examSubjectNets.createdAt));
  }

  async getExamSubjectNetsByExamId(examId: string): Promise<ExamSubjectNet[]> {
    return await db.select().from(examSubjectNets).where(eq(examSubjectNets.exam_id, examId));
  }

  async createExamSubjectNet(insertNet: InsertExamSubjectNet): Promise<ExamSubjectNet> {
    const result = await db.insert(examSubjectNets).values(insertNet as any).returning();
    return result[0];
  }

  async updateExamSubjectNet(id: string, updates: Partial<InsertExamSubjectNet>): Promise<ExamSubjectNet | undefined> {
    const result = await db.update(examSubjectNets).set(updates).where(eq(examSubjectNets.id, id)).returning();
    return result[0];
  }

  async deleteExamSubjectNet(id: string): Promise<boolean> {
    const result = await db.delete(examSubjectNets).where(eq(examSubjectNets.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async deleteExamSubjectNetsByExamId(examId: string): Promise<boolean> {
    await db.delete(examSubjectNets).where(eq(examSubjectNets.exam_id, examId));
    return true;
  }

  // Çalışma saati işlemleri
  async getStudyHours(): Promise<StudyHours[]> {
    return await db.select().from(studyHoursTable).orderBy(desc(studyHoursTable.study_date));
  }

  async getStudyHoursByDate(date: string): Promise<StudyHours | undefined> {
    const result = await db.select().from(studyHoursTable).where(eq(studyHoursTable.study_date, date)).limit(1);
    return result[0];
  }

  async createStudyHours(insertHours: InsertStudyHours): Promise<StudyHours> {
    const result = await db.insert(studyHoursTable).values(insertHours as any).returning();
    return result[0];
  }

  async updateStudyHours(id: string, updates: Partial<InsertStudyHours>): Promise<StudyHours | undefined> {
    const result = await db.update(studyHoursTable).set(updates).where(eq(studyHoursTable.id, id)).returning();
    return result[0];
  }

  async deleteStudyHours(id: string): Promise<boolean> {
    const result = await db.delete(studyHoursTable).where(eq(studyHoursTable.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

// Bellek içi depolama kullan (PostgreSQL yerine)
export const storage = new MemStorage();
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

