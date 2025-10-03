//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/bilesenler/baslik";
import { TrendingUp, BarChart3, Target, Brain, BookOpen, Plus, CalendarDays, X, FlaskConical, Trash2, AlertTriangle, Sparkles, Award, Clock, Zap, Edit, Search, Tag, BookX, Lightbulb, Eye, Calendar } from "lucide-react";
import { Task, Goal, QuestionLog, InsertQuestionLog, ExamResult, InsertExamResult } from "@shared/sema";
import { DashboardSummaryCards } from "@/bilesenler/panel-ozet-kartlar";
import { AdvancedCharts } from "@/bilesenler/gelismis-grafikler";
import { QuestionAnalysisCharts } from "@/bilesenler/soru-analiz-grafikleri";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/bilesenler/arayuz/dialog";
import { Button } from "@/bilesenler/arayuz/button";
import { Input } from "@/bilesenler/arayuz/input";
import { Textarea } from "@/bilesenler/arayuz/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/bilesenler/arayuz/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/bilesenler/arayuz/card";
import { Badge } from "@/bilesenler/arayuz/badge";
import { Progress } from "@/bilesenler/arayuz/progress";
import { Separator } from "@/bilesenler/arayuz/separator";
import { apiRequest, sorguIstemcisi } from "@/kutuphane/sorguIstemcisi";
import { useToast } from "@/hooks/use-toast";

// Başlık harflerinin dönüştürülmesi için yardımcı işlev
const toTitleCase = (str: string): string => {
  return str.trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface DailySummary {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  moods: any[];
  productivity: number;
}

interface TopicStats {
  topic: string;
  wrongMentions: number;
  totalSessions: number;
  mentionFrequency: number;
}

interface PriorityTopic {
  topic: string;
  priority: number;
  lastSeen: string;
  improvementNeeded: boolean;
}

export default function Dashboard() {
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestionLog, setEditingQuestionLog] = useState<QuestionLog | null>(null);
  const [newQuestion, setNewQuestion] = useState({ 
    exam_type: "TYT", 
    subject: "Türkçe", 
    correct_count: "", 
    wrong_count: "", 
    blank_count: "", 
    study_date: new Date().toISOString().split('T')[0],
    wrong_topics: [] as Array<{
      topic: string;
      difficulty: 'kolay' | 'orta' | 'zor';
      category: 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik';
      notes?: string;
    }>,
    time_spent_minutes: ""
  });
  const [wrongTopicInput, setWrongTopicInput] = useState("");
  const [selectedTopicDifficulty, setSelectedTopicDifficulty] = useState<'kolay' | 'orta' | 'zor'>('kolay');
  const [selectedTopicCategory, setSelectedTopicCategory] = useState<'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik'>('kavram');
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [newExamResult, setNewExamResult] = useState({ 
    exam_name: "", 
    exam_date: new Date().toISOString().split('T')[0], 
    exam_type: "TYT" as "TYT" | "AYT",
    examScope: "full" as "full" | "branch",
    selectedSubject: "turkce" as string,
    wrongTopicsText: "",
    subjects: {
      turkce: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
      matematik: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
      sosyal: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
      fen: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
      fizik: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
      kimya: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
      biyoloji: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
      geometri: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] }
    }
  });
  const [currentWrongTopics, setCurrentWrongTopics] = useState<{[key: string]: string}>({});
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<{
    date: string;
    count: number;
    questionCount: number;
    taskCount: number;
    intensity: number;
    dayActivities: {
      questions: any[];
      tasks: any[];
      exams: any[];
    };
  } | null>(null);

  // Aylık Rapor Modal Durumu
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContactInfo, setReportContactInfo] = useState({
    email: "",
    phone: ""
  });

  // Çalışma Saati Modal Durumu
  const [showStudyHoursModal, setShowStudyHoursModal] = useState(false);
  const [newStudyHours, setNewStudyHours] = useState({
    study_date: new Date().toISOString().split('T')[0],
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Tüm mutasyonları sil
  const deleteAllQuestionLogsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/question-logs/all"),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/question-logs"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/stats"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/priority"] });
      toast({ title: "🗑️ Tüm soru kayıtları silindi", description: "Tüm soru çözüm kayıtlarınız başarıyla silindi." });
    },
    onError: () => {
      toast({ title: "❌ Hata", description: "Soru kayıtları silinemedi.", variant: "destructive" });
    },
  });

  const deleteAllExamResultsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/exam-results/all"),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-results"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-subject-nets"] });
      toast({ title: "🗑️ Tüm denemeler silindi", description: "Tüm deneme sınav sonuçlarınız başarıyla silindi." });
    },
    onError: () => {
      toast({ title: "❌ Hata", description: "Denemeler silinemedi.", variant: "destructive" });
    },
  });
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: dailySummary = [] } = useQuery<DailySummary[]>({
    queryKey: ["/api/summary/daily"],
  });
  
  const { data: questionLogs = [] } = useQuery<QuestionLog[]>({
    queryKey: ["/api/question-logs"],
  });
  
  const { data: examResults = [] } = useQuery<ExamResult[]>({
    queryKey: ["/api/exam-results"],
  });

  const { data: topicStats = [] } = useQuery<TopicStats[]>({
    queryKey: ["/api/topics/stats"],
  });

  const { data: priorityTopics = [] } = useQuery<PriorityTopic[]>({
    queryKey: ["/api/topics/priority"],
  });

  const { data: studyHours = [] } = useQuery<any[]>({
    queryKey: ["/api/study-hours"],
  });

  // 1 haftadan eski çalışma saatlerini otomatik sil
  useEffect(() => {
    const deleteOldStudyHours = async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const oldRecords = studyHours.filter((sh: any) => {
        const recordDate = new Date(sh.study_date);
        return recordDate < oneWeekAgo;
      });

      for (const record of oldRecords) {
        try {
          await apiRequest("DELETE", `/api/study-hours/${record.id}`);
        } catch (error) {
          console.error("Eski çalışma saati silinirken hata:", error);
        }
      }
      
      if (oldRecords.length > 0) {
        sorguIstemcisi.invalidateQueries({ queryKey: ["/api/study-hours"] });
      }
    };

    if (studyHours.length > 0) {
      deleteOldStudyHours();
    }
  }, [studyHours.length]);

  // Gereksiz yeniden render işlemlerini önlemek için useMemo ile optimize edilmiş hesaplamalar
  const memoizedStats = useMemo(() => {
    const totalQuestions = questionLogs.reduce((sum, log) => {
      return sum + (parseInt(log.correct_count) || 0) + (parseInt(log.wrong_count) || 0) + (parseInt(log.blank_count) || 0);
    }, 0);

    const totalCorrect = questionLogs.reduce((sum, log) => {
      return sum + (parseInt(log.correct_count) || 0);
    }, 0);

    const totalWrong = questionLogs.reduce((sum, log) => {
      return sum + (parseInt(log.wrong_count) || 0);
    }, 0);

    const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    
    return {
      totalQuestions,
      totalCorrect,
      totalWrong,
      averageAccuracy
    };
  }, [questionLogs]);

  const memoizedExamStats = useMemo(() => {
    const totalExams = examResults.length;
    const tytExams = examResults.filter(exam => exam.tyt_net && parseFloat(exam.tyt_net) > 0).length;
    const aytExams = examResults.filter(exam => exam.ayt_net && parseFloat(exam.ayt_net) > 0).length;
    
    const lastTytNet = examResults
      .filter(exam => exam.tyt_net && parseFloat(exam.tyt_net) > 0)
      .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())[0]?.tyt_net || "0";
    
    const lastAytNet = examResults
      .filter(exam => exam.ayt_net && parseFloat(exam.ayt_net) > 0)
      .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())[0]?.ayt_net || "0";

    return {
      totalExams,
      tytExams,
      aytExams,
      lastTytNet: parseFloat(lastTytNet),
      lastAytNet: parseFloat(lastAytNet)
    };
  }, [examResults]);


  const createQuestionLogMutation = useMutation({
    mutationFn: (data: InsertQuestionLog) => apiRequest("POST", "/api/question-logs", data),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/question-logs"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/stats"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/priority"] });
      toast({ title: "✅ Soru kaydı eklendi", description: "Soru çözüm kaydınız eklendi ve analiz güncellendi!" });
      setShowQuestionDialog(false);
      setNewQuestion({ 
        exam_type: "TYT", 
        subject: "Türkçe", 
        correct_count: "", 
        wrong_count: "", 
        blank_count: "", 
        study_date: new Date().toISOString().split('T')[0],
        wrong_topics: [],
        time_spent_minutes: ""
      });
      setWrongTopicInput("");
    },
    onError: () => {
      toast({ title: "❌ Hata", description: "Soru kaydı eklenemedi.", variant: "destructive" });
    },
  });

  const deleteQuestionLogMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/question-logs/${id}`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/question-logs"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/stats"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/priority"] });
      toast({ title: "🗑️ Soru kaydı silindi", description: "Soru çözüm kaydınız başarıyla silindi." });
    },
    onError: () => {
      toast({ title: "❌ Hata", description: "Soru kaydı silinemedi.", variant: "destructive" });
    },
  });

  const updateQuestionLogMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertQuestionLog> }) => 
      apiRequest("PUT", `/api/question-logs/${id}`, data),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/question-logs"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/stats"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/priority"] });
      setEditingQuestionLog(null);
      setShowQuestionDialog(false);
      toast({ title: "📝 Soru kaydı güncellendi", description: "Soru çözüm kaydınız başarıyla güncellendi." });
    },
    onError: () => {
      toast({ title: "❌ Hata", description: "Soru kaydı güncellenemedi.", variant: "destructive" });
    },
  });
  
  const createExamResultMutation = useMutation({
    mutationFn: (data: InsertExamResult) => apiRequest("POST", "/api/exam-results", data),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-results"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-subject-nets"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/question-logs"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/stats"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/priority"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/calendar"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/summary/daily"] });
      toast({ title: "Deneme sonucu eklendi", description: "Deneme sınav sonucunuz kaydedildi." });
      setShowExamDialog(false);
      setNewExamResult({ 
        exam_name: "", 
        exam_date: new Date().toISOString().split('T')[0], 
        exam_type: "TYT" as "TYT" | "AYT",
        examScope: "full" as "full" | "branch",
        selectedSubject: "turkce" as string,
        wrongTopicsText: "",
        subjects: {
          turkce: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
          matematik: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
          sosyal: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
          fen: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
          fizik: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
          kimya: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
          biyoloji: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
          geometri: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] }
        }
      });
      setCurrentWrongTopics({}); // Tüm yanlış konu giriş alanlarını temizle
    },
    onError: () => {
      toast({ title: "Hata", description: "Deneme sonucu eklenemedi.", variant: "destructive" });
    },
  });
  
  const deleteExamResultMutation = useMutation({
    mutationFn: (examId: string) => apiRequest("DELETE", `/api/exam-results/${examId}`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-results"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-subject-nets"] });
      toast({ title: "Deneme sonucu silindi", description: "Deneme sınav sonucunuz başarıyla silindi." });
    },
    onError: () => {
      toast({ title: "Hata", description: "Deneme sonucu silinemedi.", variant: "destructive" });
    },
  });

  const createStudyHoursMutation = useMutation({
    mutationFn: (data: any) => {
      // Aynı gün için zaten kayıt var mı kontrol et
      const existingEntry = studyHours.find((sh: any) => sh.study_date === data.study_date);
      if (existingEntry) {
        throw new Error("Bu tarih için zaten çalışma saati kaydı var!");
      }
      return apiRequest("POST", "/api/study-hours", data);
    },
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/study-hours"] });
      toast({ title: "⏱️ Çalışma saati eklendi", description: "Çalışma süreniz başarıyla kaydedildi!" });
      setShowStudyHoursModal(false);
      setNewStudyHours({
        study_date: new Date().toISOString().split('T')[0],
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    },
    onError: (error: any) => {
      const message = error?.message || "Çalışma saati eklenemedi.";
      toast({ title: "❌ Hata", description: message, variant: "destructive" });
    },
  });

  const deleteStudyHoursMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/study-hours/${id}`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/study-hours"] });
      toast({ title: "🗑️ Çalışma saati silindi", description: "Çalışma süreniz başarıyla silindi." });
    },
    onError: () => {
      toast({ title: "Hata", description: "Çalışma saati silinemedi.", variant: "destructive" });
    },
  });

  // Gereksiz yeniden render işlemlerini önlemek için useCallback ile optimize edilmiş olay işleyicileri
  const handleQuestionLogSubmit = useCallback(() => {
    const questionData: InsertQuestionLog = {
      exam_type: newQuestion.exam_type,
      subject: newQuestion.subject,
      correct_count: newQuestion.correct_count,
      wrong_count: newQuestion.wrong_count,
      blank_count: newQuestion.blank_count,
      study_date: newQuestion.study_date,
      wrong_topics: JSON.stringify(newQuestion.wrong_topics),
      time_spent_minutes: newQuestion.time_spent_minutes
    };

    if (editingQuestionLog) {
      updateQuestionLogMutation.mutate({ id: editingQuestionLog.id, data: questionData });
    } else {
      createQuestionLogMutation.mutate(questionData);
    }
  }, [newQuestion, editingQuestionLog, updateQuestionLogMutation, createQuestionLogMutation]);

  const handleResetQuestionForm = useCallback(() => {
    setNewQuestion({ 
      exam_type: "TYT", 
      subject: "Türkçe", 
      correct_count: "", 
      wrong_count: "", 
      blank_count: "", 
      study_date: new Date().toISOString().split('T')[0],
      wrong_topics: [],
      time_spent_minutes: ""
    });
    setWrongTopicInput("");
    setEditingQuestionLog(null);
    setShowQuestionDialog(false);
  }, []);

  const handleAddWrongTopic = useCallback(() => {
    if (wrongTopicInput.trim()) {
      const topic = {
        topic: toTitleCase(wrongTopicInput.trim()),
        difficulty: selectedTopicDifficulty,
        category: selectedTopicCategory,
        notes: ""
      };
      setNewQuestion(prev => ({
        ...prev,
        wrong_topics: [...prev.wrong_topics, topic]
      }));
      setWrongTopicInput("");
    }
  }, [wrongTopicInput, selectedTopicDifficulty, selectedTopicCategory]);

  const handleRemoveWrongTopic = useCallback((index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      wrong_topics: prev.wrong_topics.filter((_, i) => i !== index)
    }));
  }, []);

  const handleOpenQuestionDialog = useCallback(() => {
    // Diyalog penceresini açarken tarihi her zaman bugüne güncelle
    setNewQuestion(prev => ({
      ...prev,
      study_date: new Date().toISOString().split('T')[0] // Bugünün tarihine ayarla
    }));
    setShowQuestionDialog(true);
  }, []);

  const handleExamResultSubmit = useCallback(() => {
    // TYT Konuları: Türkçe, Sosyal, Matematik, Fen
    const tytSubjects = ['turkce', 'sosyal', 'matematik', 'fen'];
    // AYT Konuları: Matematik, Fizik, Kimya, Biyoloji
    const aytSubjects = ['matematik', 'fizik', 'kimya', 'biyoloji'];
    
    // TYT Net Hesapla
    let tytNet = 0;
    tytSubjects.forEach(subjectKey => {
      const subject = newExamResult.subjects[subjectKey];
      if (subject) {
        const correct = parseInt(subject.correct) || 0;
        const wrong = parseInt(subject.wrong) || 0;
        tytNet += correct - (wrong * 0.25);
      }
    });
    
    // AYT Net Hesapla
    let aytNet = 0;
    aytSubjects.forEach(subjectKey => {
      const subject = newExamResult.subjects[subjectKey];
      if (subject) {
        const correct = parseInt(subject.correct) || 0;
        const wrong = parseInt(subject.wrong) || 0;
        aytNet += correct - (wrong * 0.25);
      }
    });
    
    createExamResultMutation.mutate({
      exam_name: newExamResult.exam_name,
      exam_date: newExamResult.exam_date,
      exam_type: newExamResult.exam_type, // Kritik: TYT/AYT ayrımı için exam_type'ı dahil et
      tyt_net: Math.max(0, tytNet).toFixed(2), // Negatif olmamasını sağla ve 2 ondalık basamak
      ayt_net: Math.max(0, aytNet).toFixed(2), // Negatif olmamasını sağla ve 2 ondalık basamak
      subjects_data: JSON.stringify(newExamResult.subjects)
    });
  }, [newExamResult, createExamResultMutation]);

  // Subject options based on TYT/AYT
  const getSubjectOptions = (examType: string) => {
    if (examType === "TYT") {
      return ["Türkçe", "Sosyal Bilimler", "Matematik", "Fizik", "Kimya", "Biyoloji"];
    } else {
      return ["Matematik", "Fizik", "Kimya", "Biyoloji"];
    }
  };

  // Yıllık ısı haritası verilerini Ocak ayından mevcut tarihe kadar oluştur
  const generateYearlyHeatmapData = () => {
    const data = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Bu yılın 1 Ocak tarihinden itibaren başlayın.
    const startDate = new Date(currentYear, 0, 1); // ocak ayı 0 indekstir.
    
    // 1 Ocak'tan bugüne kadar olan verileri oluştur (bugün dahil)
    const currentDate = new Date(startDate);
    const todayDateStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    // Bugünü de dahil edene kadar devam edin
    while (currentDate.toISOString().split('T')[0] <= todayDateStr) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Bu gün için aktivite yoğunluğunu hesaplayın
      const dayQuestions = questionLogs.filter(log => log.study_date === dateStr);
      const dayTasks = tasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
        return completedDate === dateStr;
      });
      const dayStudyHours = studyHours.filter(sh => sh.study_date === dateStr);
      
      const studyIntensity = Math.min((dayQuestions.length * 2 + dayTasks.length + dayStudyHours.length * 3) / 15, 1);
      
      // Bugün olup olmadığını kontrol et - Sabit karşılaştırma
      const isToday = dateStr === todayDateStr;
      
      data.push({
        date: dateStr,
        day: currentDate.getDate(),
        month: currentDate.getMonth(),
        dayOfWeek: currentDate.getDay(), // 0 = Pazar, 1 = Pazartesi, vsvs.
        dayOfWeekISO: currentDate.getDay() === 0 ? 7 : currentDate.getDay(), // 1 = Pazartesi, 7 = Pazar
        intensity: studyIntensity,
        count: dayQuestions.length + dayTasks.length + dayStudyHours.length,
        questionCount: dayQuestions.length,
        taskCount: dayTasks.length,
        studyHoursCount: dayStudyHours.length,
        isToday: isToday
      });
      
      // Bir sonraki güne geç
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  // Isı haritası verilerini haftalara organize et (Pazartesi'den Pazar'a)
  const organizeHeatmapIntoWeeks = (data: any[]) => {
    const weeks = [];
    
    if (data.length === 0) return weeks;
    
    // Tarihe göre hızlı arama için bir harita oluşturun
    const dateMap = new Map();
    data.forEach(day => {
      dateMap.set(day.date, day);
    });
    
    // İlk tarihi bulun ve o haftanın Pazartesi gününü hesaplayın.
    const firstDate = new Date(data[0].date);
    const firstDayOfWeek = firstDate.getDay(); // 0 = Pazar, 1 = Pazartesi, ...
    const daysToMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Pazartesi'ye geri gitmek için günleri hesaplayın

    // İlk haftanın Pazartesi gününden başlayın
    const startDate = new Date(firstDate);
    startDate.setDate(firstDate.getDate() - daysToMonday);
    
    // Son tarihi bulun ve o haftanın Pazar gününü hesaplayın.
    const lastDate = new Date(data[data.length - 1].date);
    const lastDayOfWeek = lastDate.getDay();
    const daysToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek; // Pazar'a gitmek için günleri hesaplayın

    const endDate = new Date(lastDate);
    endDate.setDate(lastDate.getDate() + daysToSunday);
    
    // Pazartesi başlangıçlı ve Pazar bitişli haftalar oluşturun
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const week = [];
      
      // Bu hafta için 7 gün oluşturun (Pazartesi'den Pazar'a)
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = dateMap.get(dateStr);
        
        week.push(dayData || null);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
    }
    
    return weeks;
  };

  const yearlyHeatmapData = generateYearlyHeatmapData();
  const heatmapWeeks = organizeHeatmapIntoWeeks(yearlyHeatmapData);

  // Isı haritası gün tıklamasını işleme
  const handleHeatmapDayClick = (day: any) => {
    const dayQuestions = questionLogs.filter(log => log.study_date === day.date);
    const dayTasks = tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
      return completedDate === day.date;
    });
    const dayExams = examResults.filter(exam => exam.exam_date === day.date);
    const dayStudyHours = studyHours.filter(sh => sh.study_date === day.date);
    
    setSelectedHeatmapDay({
      ...day,
      dayActivities: {
        questions: dayQuestions,
        tasks: dayTasks,
        exams: dayExams,
        studyHours: dayStudyHours
      }
    });
  };


  // Son etkinlikler (son 10 öğe birleştirilmiş)
  const recentActivities = [
    ...questionLogs.slice(0, 5).map(log => ({
      type: 'question',
      title: `${log.exam_type} ${log.subject} - ${log.correct_count} doğru`,
      date: log.study_date,
      icon: Brain
    })),
    ...examResults.slice(0, 5).map(exam => ({
      type: 'exam',
      title: `${exam.exam_name} - TYT: ${exam.tyt_net}`,
      date: exam.exam_date,
      icon: BarChart3
    })),
    ...tasks.filter(t => t.completed).slice(0, 5).map(task => ({
      type: 'task',
      title: task.title,
      date: task.createdAt || new Date().toISOString(),
      icon: Target
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header onReportCounterClick={() => setShowReportModal(true)} />
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Modern Kontrol Paneli Başlığı */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            📊 Raporlarım
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </h1>
          <p className="text-lg text-muted-foreground">Çalışma verilerim için kapsamlı analiz ve kişiselleştirilmiş sayfa</p>
          
          {/* Çalışma Saati Ekle Butonu */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => setShowStudyHoursModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-add-study-hours"
            >
              <Clock className="mr-2 h-5 w-5" />
              ⏱️ Çalıştığım Süreyi Ekle
            </Button>
          </div>
        </div>

        {/* Çalışma Saatleri Listesi */}
        {studyHours.length > 0 && (
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-cyan-50/50 via-card to-blue-50/50 dark:from-cyan-950/30 dark:via-card dark:to-blue-950/30 backdrop-blur-sm border-2 border-cyan-200/30 dark:border-cyan-800/30 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-t-lg border-b border-cyan-200/30">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Clock className="h-6 w-6 text-cyan-500" />
                  ⏱️ Eklenen Çalışma Saatleri
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[...studyHours].sort((a, b) => new Date(b.study_date).getTime() - new Date(a.study_date).getTime()).map((sh: any) => (
                    <div
                      key={sh.id}
                      className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-cyan-200/30 dark:border-cyan-700/30 hover:shadow-md transition-shadow"
                      data-testid={`study-hour-item-${sh.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                          <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {new Date(sh.study_date).toLocaleDateString('tr-TR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              weekday: 'long'
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Çalışma Süresi: <span className="font-bold text-cyan-600 dark:text-cyan-400">
                              {sh.hours}s {sh.minutes}dk {sh.seconds}sn
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => deleteStudyHoursMutation.mutate(sh.id)}
                        variant="destructive"
                        size="sm"
                        disabled={deleteStudyHoursMutation.isPending}
                        data-testid={`button-delete-study-hour-${sh.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Özet Kartları */}
        <DashboardSummaryCards />
        
        {/* Geliştirilmiş Çalışma Isı Haritası - GitHub Stili */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-purple-50/50 via-card to-indigo-50/50 dark:from-purple-950/30 dark:via-card dark:to-indigo-950/30 backdrop-blur-sm border-2 border-purple-200/30 dark:border-purple-800/30 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-t-lg border-b border-purple-200/30">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-purple-500" />
                📈 Aylık Çalışma Heatmap
              </CardTitle>
              <p className="text-sm text-purple-600/70 dark:text-purple-400/70 font-medium">Aktif olan günler renk paletine göre parlar.</p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Taşmayı önlemek için optimize edilmiş konteyner */}
              <div className="w-full overflow-hidden">
                <div className="flex flex-col items-center max-w-full">
                  {/* Konteyner genişliğine göre optimize edilmiş ay etiketleri */}
                  <div className="w-full mb-4">
                    <div className="flex justify-start">
                      <div className="w-10"></div> {/* Gün etiketleri için alan */}
                      <div className="flex-1 relative h-8">
                        {(() => {
                          const monthNames = [
                            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
                          ];
                          const currentMonth = new Date().getMonth();
                          const monthLabels = [];
                          
                          // Her ayın hangi haftaları kapsadığını hesaplayın
                          const monthWeekMap = new Map();
                          
                          heatmapWeeks.forEach((week, weekIndex) => {
                            week.forEach(day => {
                              if (day && day.month !== undefined) {
                                const monthKey = day.month;
                                if (!monthWeekMap.has(monthKey)) {
                                  monthWeekMap.set(monthKey, { start: weekIndex, end: weekIndex });
                                } else {
                                  monthWeekMap.get(monthKey).end = weekIndex;
                                }
                              }
                            });
                          });
                          
                          // Konteynere sığan ay etiketleri oluşturun
                          monthWeekMap.forEach((range, monthIndex) => {
                            const startWeek = range.start;
                            const endWeek = range.end;
                            const centerWeek = Math.floor((startWeek + endWeek) / 2);
                            const leftPercentage = (centerWeek / Math.max(heatmapWeeks.length - 1, 1)) * 100;
                            const isCurrentMonth = monthIndex === currentMonth;
                            const weekSpan = endWeek - startWeek + 1;
                            
                            // Yeterli alan varsa ay etiketlerini göster
                            if (weekSpan >= 1) {
                              monthLabels.push(
                                <div 
                                  key={`month-${monthIndex}`} 
                                  className={`absolute text-xs font-semibold px-2 py-1 rounded-lg transition-all duration-300 transform -translate-x-1/2 ${
                                    isCurrentMonth 
                                      ? 'text-white bg-purple-500 border border-purple-400 shadow-lg' 
                                      : 'text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600'
                                  }`}
                                  style={{ 
                                    left: `${leftPercentage}%`,
                                    top: '0px'
                                  }}
                                >
                                  {monthNames[monthIndex]}
                                  {isCurrentMonth && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg" />
                                  )}
                                </div>
                              );
                            }
                          });
                          
                          return monthLabels;
                        })()}
                      </div>
                    </div>
                  </div>
                
                  {/* Isı haritası ızgarası - ortalanmış ve sınırlı */}
                  <div className="flex items-start justify-center w-full max-w-full">
                    {/* Day labels */}
                    <div className="flex flex-col justify-between mr-3 flex-shrink-0" style={{ height: '168px' }}>
                      <div className="text-xs text-muted-foreground h-6 flex items-center justify-end font-medium">Pzt</div>
                      <div className="text-xs text-transparent h-6"></div>
                      <div className="text-xs text-muted-foreground h-6 flex items-center justify-end font-medium">Çar</div>
                      <div className="text-xs text-transparent h-6"></div>
                      <div className="text-xs text-muted-foreground h-6 flex items-center justify-end font-medium">Cum</div>
                      <div className="text-xs text-transparent h-6"></div>
                      <div className="text-xs text-muted-foreground h-6 flex items-center justify-end font-medium">Paz</div>
                    </div>
                    
                    {/* Haftalık tablo - duyarlı boyutlandırma */}
                    <div className="flex gap-1 flex-wrap justify-center max-w-full">
                      {heatmapWeeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                          {week.map((day, dayIndex) => {
                            if (!day) {
                              return (
                                <div
                                  key={dayIndex}
                                  className="w-6 h-6 rounded bg-transparent"
                                />
                              );
                            }
                            
                            const opacity = day.intensity === 0 ? 0.1 : Math.max(0.2, day.intensity);
                            const currentMonth = new Date().getMonth();
                            const isCurrentMonth = day.month === currentMonth;
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`w-6 h-6 rounded transition-all duration-300 hover:scale-110 cursor-pointer relative ${
                                  day.isToday 
                                    ? 'border-2 border-purple-400 dark:border-purple-300 shadow-lg' 
                                    : day.intensity === 0 
                                      ? 'bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700' 
                                      : 'hover:brightness-110'
                                }`}
                                style={{
                                  backgroundColor: day.isToday 
                                    ? (day.intensity > 0 ? `rgba(147, 51, 234, 0.9)` : `rgba(147, 51, 234, 0.4)`)
                                    : day.intensity > 0 ? `rgba(147, 51, 234, ${opacity})` : undefined,
                                  animation: day.isToday ? 'breathingPulse 2s ease-in-out infinite' : undefined,
                                  boxShadow: day.isToday ? '0 0 15px rgba(147, 51, 234, 0.5)' : undefined
                                }}
                                title={`${day.date}${day.isToday ? ' (BUGÜN)' : ''}: ${day.count} aktivite (${day.questionCount} soru, ${day.taskCount} görev, ${day.studyHoursCount || 0} çalışma saati)`}
                                onClick={() => handleHeatmapDayClick(day)}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* yoğunluk renkleri */}
              <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground">
                <span>Az</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-purple-200 dark:bg-purple-900 rounded-sm"></div>
                  <div className="w-3 h-3 bg-purple-400 dark:bg-purple-700 rounded-sm"></div>
                  <div className="w-3 h-3 bg-purple-600 dark:bg-purple-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-purple-800 dark:bg-purple-300 rounded-sm"></div>
                </div>
                <span>Çok</span>
              </div>
            </CardContent>
          </Card>
        </div>
        

        {/* Çözülen Sorular Sayısı Bölümü ile CRUD */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50/50 via-card to-emerald-50/50 dark:from-green-950/30 dark:via-card dark:to-emerald-950/30 backdrop-blur-sm border-2 border-green-200/30 dark:border-green-800/30 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg border-b border-green-200/30">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                  📊 Çözülen Soru Sayısı
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleOpenQuestionDialog}
                    size="sm" 
                    variant="outline"
                    className="text-xs border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Soru Ekle
                  </Button>
                  {questionLogs.length > 0 && (
                    <Button 
                      onClick={() => {
                        if (window.confirm("Tüm soru kayıtlarını silmek istediğinizden emin misiniz?")) {
                          deleteAllQuestionLogsMutation.mutate();
                        }
                      }}
                      size="sm" 
                      variant="outline"
                      className="text-xs border-red-300 text-red-700 hover:bg-red-50"
                      disabled={deleteAllQuestionLogsMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {deleteAllQuestionLogsMutation.isPending ? 'Siliniyor...' : 'Tüm Soruları Sil'}
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {questionLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <h3 className="font-medium mb-1">Henüz soru kaydı yok</h3>
                  <p className="text-sm">Çözdüğünüz soruları kaydetmeye başlayın - istatistiklerinizi görmek için! 📊</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Özet İstatistikleri */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50">
                      <div className="text-2xl font-bold text-green-600">
                        {questionLogs.reduce((total, log) => total + parseInt(log.correct_count), 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Toplam Doğru</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-red-100/50 to-pink-100/50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200/50">
                      <div className="text-2xl font-bold text-red-600">
                        {questionLogs.reduce((total, log) => total + parseInt(log.wrong_count), 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Toplam Yanlış</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-yellow-100/50 to-amber-100/50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/50">
                      <div className="text-2xl font-bold text-yellow-600">
                        {questionLogs.reduce((total, log) => total + parseInt(log.blank_count || '0'), 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Toplam Boş</div>
                    </div>
                  </div>

                  {/* Soru Kayıtları Listesi - Düzenleme/Silme ile - 3 öğe ile sınırlı */}
                  <div className="space-y-3">
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {questionLogs.map((log, index) => (
                      <div key={log.id} className="p-4 bg-gradient-to-r from-green-100/30 to-emerald-100/30 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 transition-all hover:scale-102 hover:shadow-md">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">
                                {log.exam_type} - {log.subject}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.study_date).toLocaleDateString('tr-TR')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteQuestionLogMutation.mutate(log.id)}
                              disabled={deleteQuestionLogMutation.isPending}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Soru kaydını sil"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <div className="font-bold text-green-600">{log.correct_count}</div>
                            <div className="text-xs text-muted-foreground">Doğru</div>
                          </div>
                          <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <div className="font-bold text-red-600">{log.wrong_count}</div>
                            <div className="text-xs text-muted-foreground">Yanlış</div>
                          </div>
                          <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <div className="font-bold text-yellow-600">{log.blank_count || '0'}</div>
                            <div className="text-xs text-muted-foreground">Boş</div>
                          </div>
                        </div>
                        {log.wrong_topics && log.wrong_topics.length > 0 && (
                          <div className="mt-2 text-xs text-red-600">
                            {log.wrong_topics.join(', ')}
                          </div>
                        )}
                      </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Günlük Soru Analizi - Çözülen Sorulardan Sonra Buraya Taşı */}
        <div className="mb-8">
          <QuestionAnalysisCharts />
        </div>

        {/* Geliştirilmiş Deneme Sonuçları - Premium Stil */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-50/70 via-white to-green-50/40 dark:from-emerald-950/40 dark:via-slate-800/60 dark:to-green-950/30 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/30 p-8 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-700 group relative overflow-hidden">
            {/* Animasyonlu Arka Plan Öğeleri */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/15 to-green-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr from-green-500/15 to-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-emerald-400/5 to-green-400/5 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                    <Target className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">
                      🎯 Deneme Sonuçları
                    </h3>
                    <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 font-medium">Detaylı performans analizi ve ilerleme takibi</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowExamDialog(true)}
                    size="lg" 
                    className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 px-6 py-3 rounded-xl text-base font-semibold hover:scale-105 group/btn relative overflow-hidden"
                    data-testid="button-add-exam-result"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                    <Plus className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">Deneme Ekle</span>
                  </Button>
                  {examResults.length > 0 && (
                    <Button 
                      onClick={() => {
                        if (window.confirm("Tüm deneme sonuçlarını silmek istediğinizden emin misiniz?")) {
                          deleteAllExamResultsMutation.mutate();
                        }
                      }}
                      size="lg" 
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300"
                      disabled={deleteAllExamResultsMutation.isPending}
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      {deleteAllExamResultsMutation.isPending ? 'Siliniyor...' : 'Denemeleri Sil'}
                    </Button>
                  )}
                </div>
              </div>
            
            {examResults.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                  <Target className="h-16 w-16 text-emerald-500" />
                </div>
                <h4 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-4">Henüz deneme kaydı yok</h4>
                <p className="text-lg opacity-75 mb-8 max-w-md mx-auto">Deneme eklemeden veriler gözükmez.</p>
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-bounce delay-150"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-600 animate-bounce delay-300"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sadece 2 deneme sonucu ile sınırlı */}
                <div className="space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                  {examResults
                    .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())
                    .map((exam, index) => {
                  // Sınav türünü ve ilgili net puanı öğrenin
                  const examType = exam.exam_type || (parseFloat(exam.ayt_net) > 0 ? 'AYT' : 'TYT');
                  const relevantNet = examType === 'TYT' ? parseFloat(exam.tyt_net) || 0 : parseFloat(exam.ayt_net) || 0;
                  
                  // Sınav türünü ve ilgili net puanı alınBu sınav türü için sınav numarasını hesaplayın
                  const sameTypeExams = examResults
                    .filter(e => (e.exam_type || (parseFloat(e.ayt_net) > 0 ? 'AYT' : 'TYT')) === examType)
                    .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
                  const examNumber = sameTypeExams.findIndex(e => e.id === exam.id) + 1;
                  
                  // İlgili net puana dayalı performans emojisi
                  const getPerformanceEmoji = (net: number, type: string) => {
                    if (type === 'TYT') {
                      if (net >= 90) return '😎'; // çokiyi
                      if (net >= 70) return '🙂'; // eh
                      if (net >= 50) return '😐'; // vasat
                      return '😓'; // bokgibi
                    } else { // AYT
                      if (net >= 50) return '😎'; // çokiyi
                      if (net >= 40) return '🙂'; // eh
                      if (net >= 30) return '😐'; // vasat
                      return '😓'; // bokgibi
                    }
                  };
                  
                  const examEmoji = getPerformanceEmoji(relevantNet, examType);
                  
                  // Performans göstergelerini hesaplayın
                  const isRecentExam = new Date(exam.exam_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  const examDate = new Date(exam.exam_date);
                  const daysSinceExam = Math.floor((Date.now() - examDate.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Card key={exam.id} className="group bg-gradient-to-br from-white via-emerald-50/40 to-green-50/30 dark:from-slate-800/80 dark:via-emerald-900/20 dark:to-green-900/15 hover:shadow-xl transition-all duration-300 border-emerald-200/60 dark:border-emerald-700/50 relative overflow-hidden hover:bg-gradient-to-br hover:from-emerald-50/60 hover:via-emerald-100/30 hover:to-green-100/40 dark:hover:from-emerald-900/30 dark:hover:via-emerald-800/25 dark:hover:to-green-900/20">
                      {/* Hover için Geliştirilmiş Parlama Efektleri */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-green-500/0 to-emerald-400/0 group-hover:from-emerald-500/5 group-hover:via-green-500/3 group-hover:to-emerald-400/5 transition-all duration-500 rounded-xl"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/5 to-green-400/3 rounded-full blur-2xl group-hover:from-emerald-400/15 group-hover:to-green-400/10 transition-all duration-500"></div>
                      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-green-400/5 to-emerald-400/3 rounded-full blur-xl group-hover:from-green-400/15 group-hover:to-emerald-400/10 transition-all duration-500"></div>
                      
                      {isRecentExam && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-pulse">
                          🆕 YENİ
                        </div>
                      )}
                      
                      <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <span className="text-4xl filter drop-shadow-lg">{examEmoji}</span>
                              </div>
                              {relevantNet >= (examType === 'TYT' ? 90 : 50) && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-xs">⭐</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-200 transition-colors">
                                {examType} #{examNumber} • {examDate.toLocaleDateString('tr-TR', { 
                                  day: 'numeric', 
                                  month: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {daysSinceExam === 0 ? 'Bugün' : `${daysSinceExam} gün önce`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center p-4 bg-gradient-to-br from-emerald-100/80 to-emerald-50/80 dark:from-emerald-900/40 dark:to-emerald-800/30 rounded-2xl border-2 border-emerald-200/60 dark:border-emerald-700/50 shadow-lg group-hover:shadow-xl transition-all duration-300">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full shadow-sm ${examType === 'TYT' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                <span className={`text-sm font-bold ${examType === 'TYT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                  {examType} Net
                                </span>
                              </div>
                              <div className={`text-3xl font-bold mb-1 ${examType === 'TYT' ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'}`}>
                                {relevantNet.toFixed(2)}
                              </div>
                              <div className={`text-xs font-medium ${examType === 'TYT' ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-blue-600/70 dark:text-blue-400/70'}`}>
                                / {examType === 'TYT' ? '120' : '80'} soruluk
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                              
                              <button
                                onClick={() => deleteExamResultMutation.mutate(exam.id)}
                                disabled={deleteExamResultMutation.isPending}
                                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 hover:scale-110 group/delete"
                                title="Deneme sonucunu sil"
                              >
                                <Trash2 className="h-5 w-5 group-hover/delete:animate-pulse" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Konu Ayrıntıları Bölümü */}
                        {exam.subjects_data && (() => {
                          try {
                            const subjectsData = JSON.parse(exam.subjects_data);
                            const subjects = Object.entries(subjectsData).map(([key, data]: [string, any]) => {
                              const subjectNames: {[key: string]: string} = {
                                'turkce': 'Türkçe',
                                'matematik': 'Matematik',
                                'sosyal': 'Sosyal',
                                'fen': 'Fen',
                                'fizik': 'Fizik',
                                'kimya': 'Kimya',
                                'biyoloji': 'Biyoloji'
                              };
                              return {
                                name: subjectNames[key] || key,
                                correct: parseInt(data.correct) || 0,
                                wrong: parseInt(data.wrong) || 0,
                                blank: parseInt(data.blank) || 0,
                                total: (parseInt(data.correct) || 0) + (parseInt(data.wrong) || 0) + (parseInt(data.blank) || 0)
                              };
                            }).filter(subject => subject.total > 0);
                            
                            if (subjects.length > 0) {
                              return (
                                <div className="mt-6 pt-4 border-t border-emerald-200/50 dark:border-emerald-700/30">
                                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
                                    📊 Ders Detayları
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {subjects.map((subject, idx) => (
                                      <div key={idx} className="bg-gradient-to-r from-white/60 to-emerald-50/40 dark:from-gray-800/60 dark:to-emerald-900/20 rounded-xl p-3 border border-emerald-200/40 dark:border-emerald-700/30">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                                            {subject.name}
                                          </span>
                                          <span className="text-xs text-muted-foreground font-medium">
                                            {subject.total} soru
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                              <span className="text-green-600 dark:text-green-400 font-semibold">{subject.correct}D</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                              <span className="text-red-600 dark:text-red-400 font-semibold">{subject.wrong}Y</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                              <span className="text-gray-600 dark:text-gray-400 font-semibold">{subject.blank}B</span>
                                            </div>
                                          </div>
                                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                            {(subject.correct - subject.wrong * 0.25).toFixed(1)} net
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                          } catch (e) {
                            console.error('Error parsing subjects_data:', e);
                          }
                          return null;
                        })()}
                        
                        {/* Performans Göstergeleri */}
                        <div className="flex items-center justify-between pt-4 border-t border-emerald-200/50 dark:border-emerald-700/30">
                          <div className="flex items-center gap-4">
                            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              relevantNet >= (examType === 'TYT' ? 90 : 50) ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                              relevantNet >= (examType === 'TYT' ? 70 : 40) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                              relevantNet >= (examType === 'TYT' ? 50 : 30) ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                              'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {examEmoji}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {examType} #{examNumber}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Award className="h-4 w-4" />
                            <span>{examDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Analitik Grafikler - Bu önemli analitikleri koruyun */}
        <div className="space-y-8 mb-8">
          <AdvancedCharts />
        </div>

      </main>

      {/* Isı Haritası Gün Detayları Diyaloğu */}
      <Dialog open={selectedHeatmapDay !== null} onOpenChange={(open) => !open && setSelectedHeatmapDay(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-purple-500" />
              {selectedHeatmapDay && (
                <>
                  {new Date(selectedHeatmapDay.date).toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} Aktiviteleri
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Seçilen gün için detaylı aktivite bilgilerini görüntüleyin.
            </DialogDescription>
          </DialogHeader>
          {selectedHeatmapDay && (
            <div className="space-y-6">
              {/* Özet */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{selectedHeatmapDay.dayActivities.questions.length}</div>
                  <div className="text-sm text-muted-foreground">Soru Çözümü</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{selectedHeatmapDay.dayActivities.tasks.length}</div>
                  <div className="text-sm text-muted-foreground">Tamamlanan Görev</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{selectedHeatmapDay.dayActivities.exams.length}</div>
                  <div className="text-sm text-muted-foreground">Deneme Sınavı</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-600">
                    {(() => {
                      if (!selectedHeatmapDay.dayActivities.studyHours || selectedHeatmapDay.dayActivities.studyHours.length === 0) return "0s 0dk";
                      const totalSeconds = selectedHeatmapDay.dayActivities.studyHours.reduce((sum: number, sh: any) => {
                        const h = parseInt(sh.hours) || 0;
                        const m = parseInt(sh.minutes) || 0;
                        const s = parseInt(sh.seconds) || 0;
                        return sum + (h * 3600 + m * 60 + s);
                      }, 0);
                      const hours = Math.floor(totalSeconds / 3600);
                      const minutes = Math.floor((totalSeconds % 3600) / 60);
                      return `${hours}s ${minutes}dk`;
                    })()}
                  </div>
                  <div className="text-sm text-muted-foreground">Çalışma Saati</div>
                </div>
              </div>

              {/* Detaylı Aktiviteler */}
              {selectedHeatmapDay.dayActivities.questions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-500" />
                    Çözülen Sorular
                  </h3>
                  <div className="space-y-2">
                    {selectedHeatmapDay.dayActivities.questions.map((question: any, index: number) => (
                      <div key={index} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{question.exam_type} - {question.subject}</span>
                          <div className="text-xs text-muted-foreground">
                            {question.correct_count}D {question.wrong_count}Y {question.blank_count || 0}B
                          </div>
                        </div>
                        {question.wrong_topics && question.wrong_topics.length > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {question.wrong_topics.map((topic: string) => {
                              // TYT/AYT ön ekini ve "- Berat" gibi ekstra ayrıntıları kaldır
                              const cleanTopic = topic.replace(/^(TYT|AYT)\s+[^-]+-\s*/, '').split(' - ')[0];
                              return cleanTopic;
                            }).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedHeatmapDay.dayActivities.tasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Tamamlanan Görevler
                  </h3>
                  <div className="space-y-2">
                    {selectedHeatmapDay.dayActivities.tasks.map((task: any, index: number) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedHeatmapDay.dayActivities.exams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    Deneme Sınavları
                  </h3>
                  <div className="space-y-2">
                    {selectedHeatmapDay.dayActivities.exams.map((exam: any, index: number) => (
                      <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{exam.exam_name}</span>
                          <div className="text-xs text-muted-foreground">
                            TYT: {exam.tyt_net} {exam.ayt_net !== "0" && `• AYT: ${exam.ayt_net}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedHeatmapDay.count === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Bu günde herhangi bir aktivite kaydedilmemiş.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Soru Diyaloğu */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingQuestionLog ? 'Soru Kaydını Düzenle' : 'Yeni Soru Kaydı'}
            </DialogTitle>
            <DialogDescription>
              Soru çözüm kaydınızı ekleyin veya düzenleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sınav Türü</label>
                <Select value={newQuestion.exam_type} onValueChange={(value) => setNewQuestion({...newQuestion, exam_type: value as "TYT" | "AYT"})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TYT">TYT</SelectItem>
                    <SelectItem value="AYT">AYT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ders</label>
                <Select value={newQuestion.subject} onValueChange={(value) => setNewQuestion({...newQuestion, subject: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubjectOptions(newQuestion.exam_type).map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Doğru</label>
                <Input
                  type="number"
                  value={newQuestion.correct_count}
                  onChange={(e) => setNewQuestion({...newQuestion, correct_count: e.target.value})}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yanlış</label>
                <Input
                  type="number"
                  value={newQuestion.wrong_count}
                  onChange={(e) => setNewQuestion({...newQuestion, wrong_count: e.target.value})}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Boş</label>
                <Input
                  type="number"
                  value={newQuestion.blank_count}
                  onChange={(e) => setNewQuestion({...newQuestion, blank_count: e.target.value})}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tarih</label>
                <Input
                  type="date"
                  value={newQuestion.study_date}
                  onChange={(e) => setNewQuestion({...newQuestion, study_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Süre (dk)</label>
                <Input
                  type="number"
                  value={newQuestion.time_spent_minutes}
                  onChange={(e) => setNewQuestion({...newQuestion, time_spent_minutes: e.target.value})}
                  placeholder="45"
                  min="0"
                />
              </div>
            </div>

            {/* Geliştirilmiş Yanlış Konular Bölümü */}
            <div className="bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-900/10 dark:to-orange-900/10 rounded-xl p-6 border border-red-200/30 dark:border-red-700/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-md">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <label className="text-lg font-semibold text-red-700 dark:text-red-300">🔍 Yanlış Konu Analizi</label>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70">Detaylı hata analizi ile eksik konuları belirleyin</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Kategori ve Zorluk Seçimi */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">Hata Kategorisi</label>
                    <Select value={selectedTopicCategory} onValueChange={(value) => setSelectedTopicCategory(value as any)}>
                      <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border-red-200 dark:border-red-700/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kavram">🧠 Kavram Eksikliği</SelectItem>
                        <SelectItem value="hesaplama">🔢 Hesaplama Hatası</SelectItem>
                        <SelectItem value="analiz">🔍 Analiz Sorunu</SelectItem>
                        <SelectItem value="dikkatsizlik">⚠️ Dikkatsizlik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">Zorluk Derecesi</label>
                    <Select value={selectedTopicDifficulty} onValueChange={(value) => setSelectedTopicDifficulty(value as any)}>
                      <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border-red-200 dark:border-red-700/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kolay">🟢 Kolay</SelectItem>
                        <SelectItem value="orta">🟡 Orta</SelectItem>
                        <SelectItem value="zor">🔴 Zor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Geliştirilmiş Konu Girişi */}
                <div className="relative">
                  <Input
                    value={wrongTopicInput}
                    onChange={(e) => setWrongTopicInput(e.target.value)}
                    placeholder="Konu adını yazın ve Enter'a basın..."
                    className="pl-10 pr-16 h-12 text-base bg-white/80 dark:bg-gray-800/80 border-red-200 dark:border-red-700/50 focus:border-red-400 dark:focus:border-red-500 rounded-xl shadow-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && wrongTopicInput.trim()) {
                        // Title case conversion: her kelimenin baş harfini büyük yap
                        const titleCaseTopic = toTitleCase(wrongTopicInput);
                        // TYT/AYT ön ekini ekle
                        const prefixedTopic = `${newQuestion.exam_type} ${newQuestion.subject} - ${titleCaseTopic}`;
                        
                        // Yinelenenleri kontrol et
                        const isDuplicate = newQuestion.wrong_topics.some(existingTopic => 
                          existingTopic.topic.toLowerCase() === prefixedTopic.toLowerCase()
                        );
                        
                        if (!isDuplicate) {
                          setNewQuestion({
                            ...newQuestion, 
                            wrong_topics: [...newQuestion.wrong_topics, {
                              topic: prefixedTopic,
                              difficulty: selectedTopicDifficulty,
                              category: selectedTopicCategory
                            }]
                          });
                          setWrongTopicInput("");
                        } else {
                          toast({ title: "⚠️ Uyarı", description: "Bu konu zaten eklenmiş!", variant: "destructive" });
                        }
                      }
                    }}
                    data-testid="input-wrong-topics"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-400 dark:text-red-500" />
                  {wrongTopicInput.trim() && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => {
                        if (wrongTopicInput.trim()) {
                          // Başlık durumuna dönüştürme ve TYT/AYT ön ekini ekle
                          const titleCaseTopic = toTitleCase(wrongTopicInput);
                          const prefixedTopic = `${newQuestion.exam_type} ${newQuestion.subject} - ${titleCaseTopic}`;

                          // Yinelenenleri kontrol et
                          const isDuplicate = newQuestion.wrong_topics.some(existingTopic =>
                            existingTopic.topic.toLowerCase() === prefixedTopic.toLowerCase()
                          );
                          
                          if (!isDuplicate) {
                            setNewQuestion({
                              ...newQuestion, 
                              wrong_topics: [...newQuestion.wrong_topics, {
                                topic: prefixedTopic,
                                difficulty: selectedTopicDifficulty,
                                category: selectedTopicCategory
                              }]
                            });
                            setWrongTopicInput("");
                          } else {
                            toast({ title: "⚠️ Uyarı", description: "Bu konu zaten eklenmiş!", variant: "destructive" });
                          }
                        }
                      }}
                      data-testid="button-add-topic"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Geliştirilmiş Konu Etiketleri Görüntüleme */}
                {newQuestion.wrong_topics.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        Eklenen Konular ({newQuestion.wrong_topics.length})
                      </span>
                    </div>
                    <div className="space-y-3">
                      {newQuestion.wrong_topics.map((topicData, index) => {
                        const getDifficultyIcon = (difficulty: string) => {
                          switch(difficulty) {
                            case 'kolay': return '🟢';
                            case 'orta': return '🟡';
                            case 'zor': return '🔴';
                            default: return '⚪';
                          }
                        };
                        
                        const getCategoryIcon = (category: string) => {
                          switch(category) {
                            case 'kavram': return '🧠';
                            case 'hesaplama': return '🔢';
                            case 'analiz': return '🔍';
                            case 'dikkatsizlik': return '⚠️';
                            default: return '📝';
                          }
                        };
                        
                        const getDifficultyBg = (difficulty: string) => {
                          switch(difficulty) {
                            case 'kolay': return 'from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border-green-200 dark:border-green-700/50';
                            case 'orta': return 'from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 border-yellow-200 dark:border-yellow-700/50';
                            case 'zor': return 'from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 border-red-200 dark:border-red-700/50';
                            default: return 'from-gray-100 to-slate-100 dark:from-gray-900/40 dark:to-slate-900/40 border-gray-200 dark:border-gray-700/50';
                          }
                        };
                        
                        return (
                          <div
                            key={index}
                            className={`group bg-gradient-to-r ${getDifficultyBg(topicData.difficulty)} border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105`}
                            data-testid={`topic-tag-${index}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{getCategoryIcon(topicData.category)}</span>
                                    <span className="text-lg font-bold text-red-700 dark:text-red-300">
                                      {topicData.topic}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <span>{getDifficultyIcon(topicData.difficulty)}</span>
                                    <span className="capitalize text-muted-foreground">
                                      {topicData.difficulty}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="capitalize">
                                    {topicData.category === 'kavram' && 'Kavram Eksikliği'}
                                    {topicData.category === 'hesaplama' && 'Hesaplama Hatası'}
                                    {topicData.category === 'analiz' && 'Analiz Sorunu'}
                                    {topicData.category === 'dikkatsizlik' && 'Dikkatsizlik'}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-full"
                                onClick={() => {
                                  setNewQuestion({
                                    ...newQuestion,
                                    wrong_topics: newQuestion.wrong_topics.filter((_, i) => i !== index)
                                  });
                                }}
                                data-testid={`button-remove-topic-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Geliştirilmiş Konu Önizlemesi */}
                {wrongTopicInput.trim() && (
                  <div className="p-4 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-indigo-950/30 rounded-xl border border-blue-200/40 dark:border-blue-800/40">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Önizleme</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-lg">
                        {selectedTopicCategory === 'kavram' && '🧠'}
                        {selectedTopicCategory === 'hesaplama' && '🔢'}
                        {selectedTopicCategory === 'analiz' && '🔍'}
                        {selectedTopicCategory === 'dikkatsizlik' && '⚠️'}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{wrongTopicInput.trim()}</span>
                      <span className="text-sm">
                        {selectedTopicDifficulty === 'kolay' && '🟢'}
                        {selectedTopicDifficulty === 'orta' && '🟡'}
                        {selectedTopicDifficulty === 'zor' && '🔴'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // Yapılandırılmış analiz verilerini basit konu adlarından ayır
                  const wrong_topics_json = newQuestion.wrong_topics.length > 0 ? 
                    JSON.stringify(newQuestion.wrong_topics) : null;
                  const wrong_topics_simple = newQuestion.wrong_topics.map(topic => 
                    typeof topic === 'string' ? topic : topic.topic
                  );

                  if (editingQuestionLog) {
                    updateQuestionLogMutation.mutate({
                      id: editingQuestionLog.id,
                      data: {
                        exam_type: newQuestion.exam_type as "TYT" | "AYT",
                        subject: newQuestion.subject,
                        correct_count: newQuestion.correct_count,
                        wrong_count: newQuestion.wrong_count,
                        blank_count: newQuestion.blank_count || "0",
                        study_date: newQuestion.study_date,
                        wrong_topics: wrong_topics_simple,
                        wrong_topics_json: wrong_topics_json,
                        time_spent_minutes: parseInt(newQuestion.time_spent_minutes) || null
                      }
                    });
                  } else {
                    createQuestionLogMutation.mutate({
                      exam_type: newQuestion.exam_type as "TYT" | "AYT",
                      subject: newQuestion.subject,
                      correct_count: newQuestion.correct_count,
                      wrong_count: newQuestion.wrong_count,
                      blank_count: newQuestion.blank_count || "0",
                      study_date: newQuestion.study_date,
                      wrong_topics: wrong_topics_simple,
                      wrong_topics_json: wrong_topics_json,
                      time_spent_minutes: parseInt(newQuestion.time_spent_minutes) || null
                    });
                  }
                }}
                disabled={!newQuestion.correct_count || !newQuestion.wrong_count || createQuestionLogMutation.isPending}
                className="flex-1"
              >
                {createQuestionLogMutation.isPending ? 'Kaydediliyor...' : (editingQuestionLog ? 'Güncelle' : 'Kaydet')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowQuestionDialog(false);
                  setEditingQuestionLog(null);
                  setNewQuestion({ 
                    exam_type: "TYT", 
                    subject: "Türkçe", 
                    correct_count: "", 
                    wrong_count: "", 
                    blank_count: "", 
                    study_date: new Date().toISOString().split('T')[0],
                    wrong_topics: [],
                    time_spent_minutes: ""
                  });
                  setWrongTopicInput("");
                }}
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sınav Sonucu Diyaloğu */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Yeni Deneme Sonucu</DialogTitle>
            <DialogDescription>
              Deneme sınav sonuçlarınızı girin ve net analizinizi takip edin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deneme Adı</label>
                <Input
                  value={newExamResult.exam_name}
                  onChange={(e) => setNewExamResult({...newExamResult, exam_name: e.target.value})}
                  placeholder="YKS Deneme"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tarih</label>
                <Input
                  type="date"
                  value={newExamResult.exam_date}
                  onChange={(e) => setNewExamResult({...newExamResult, exam_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deneme Türü</label>
                <Select 
                  value={newExamResult.examScope} 
                  onValueChange={(value: "full" | "branch") => {
                    setNewExamResult({
                      ...newExamResult, 
                      examScope: value,
                      selectedSubject: "turkce",
                      wrongTopicsText: "",
                      subjects: {
                        turkce: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                        matematik: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                        sosyal: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                        fen: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                        fizik: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                        kimya: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                        biyoloji: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                        geometri: { correct: "", wrong: "", blank: "", wrong_topics: [] }
                      }
                    });
                  }}
                  data-testid="select-exam-scope"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Tam Deneme</SelectItem>
                    <SelectItem value="branch">Branş Denemesi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Alan</label>
                <Select 
                  value={newExamResult.exam_type} 
                  onValueChange={(value: "TYT" | "AYT") => setNewExamResult({...newExamResult, exam_type: value})}
                  data-testid="select-exam-type"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TYT">TYT</SelectItem>
                    <SelectItem value="AYT">Sayısal(AYT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Branş Denemesi Modu */}
            {newExamResult.examScope === "branch" && (
              <div className="border-2 border-purple-300 rounded-lg p-4 space-y-4 bg-purple-50 dark:bg-purple-900/10">
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Branş Denemesi</h3>
                
                {/* Ders Seçimi */}
                <div>
                  <label className="block text-sm font-medium mb-1">Ders</label>
                  <Select 
                    value={newExamResult.selectedSubject} 
                    onValueChange={(value: string) => {
                      setNewExamResult({
                        ...newExamResult, 
                        selectedSubject: value,
                        wrongTopicsText: "",
                        subjects: {
                          turkce: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                          matematik: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                          sosyal: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                          fen: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                          fizik: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                          kimya: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                          biyoloji: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                          geometri: { correct: "", wrong: "", blank: "", wrong_topics: [] }
                        }
                      });
                    }}
                    data-testid="select-branch-subject"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="turkce">Türkçe</SelectItem>
                      <SelectItem value="sosyal">Sosyal Bilimler</SelectItem>
                      <SelectItem value="matematik">Matematik</SelectItem>
                      <SelectItem value="geometri">Geometri</SelectItem>
                      <SelectItem value="fizik">Fizik</SelectItem>
                      <SelectItem value="kimya">Kimya</SelectItem>
                      <SelectItem value="biyoloji">Biyoloji</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Doğru Yanlış Boş */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Doğru</label>
                    <Input
                      type="number"
                      min="0"
                      value={newExamResult.subjects[newExamResult.selectedSubject]?.correct || ""}
                      onChange={(e) => setNewExamResult({
                        ...newExamResult,
                        subjects: {
                          ...newExamResult.subjects,
                          [newExamResult.selectedSubject]: { 
                            ...newExamResult.subjects[newExamResult.selectedSubject], 
                            correct: e.target.value 
                          }
                        }
                      })}
                      placeholder="Doğru sayısı"
                      data-testid="input-branch-correct"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Yanlış</label>
                    <Input
                      type="number"
                      min="0"
                      value={newExamResult.subjects[newExamResult.selectedSubject]?.wrong || ""}
                      onChange={(e) => setNewExamResult({
                        ...newExamResult,
                        subjects: {
                          ...newExamResult.subjects,
                          [newExamResult.selectedSubject]: { 
                            ...newExamResult.subjects[newExamResult.selectedSubject], 
                            wrong: e.target.value 
                          }
                        }
                      })}
                      placeholder="Yanlış sayısı"
                      data-testid="input-branch-wrong"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Boş</label>
                    <Input
                      type="number"
                      min="0"
                      value={newExamResult.subjects[newExamResult.selectedSubject]?.blank || ""}
                      onChange={(e) => setNewExamResult({
                        ...newExamResult,
                        subjects: {
                          ...newExamResult.subjects,
                          [newExamResult.selectedSubject]: { 
                            ...newExamResult.subjects[newExamResult.selectedSubject], 
                            blank: e.target.value 
                          }
                        }
                      })}
                      placeholder="Boş sayısı"
                      data-testid="input-branch-blank"
                    />
                  </div>
                </div>

                {/* Yanlış Konular */}
                <div>
                  <label className="block text-sm font-medium mb-1">Yanlış Yapılan Konular</label>
                  <Textarea
                    value={newExamResult.wrongTopicsText}
                    onChange={(e) => setNewExamResult({...newExamResult, wrongTopicsText: e.target.value})}
                    placeholder="konu1, konu2, konu3 şeklinde virgülle ayırarak yazın..."
                    className="h-20"
                    data-testid="textarea-branch-wrong-topics"
                  />
                  <p className="text-xs text-gray-500 mt-1">Virgülle ayırarak birden fazla konu girebilirsiniz</p>
                </div>
              </div>
            )}

            {/* TYT Konular */}
            {newExamResult.examScope === "full" && newExamResult.exam_type === "TYT" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">TYT Dersleri</h3>
                
                {/* Türkçe */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-green-600">Türkçe</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.turkce.correct}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            turkce: { ...newExamResult.subjects.turkce, correct: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.turkce.wrong}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            turkce: { ...newExamResult.subjects.turkce, wrong: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.turkce.blank}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            turkce: { ...newExamResult.subjects.turkce, blank: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.turkce.wrong) > 0 && (
                    <div className="bg-gradient-to-br from-red-50/80 via-white/60 to-orange-50/60 dark:from-red-950/30 dark:via-gray-800/60 dark:to-orange-950/30 rounded-2xl p-5 border-2 border-red-200/50 dark:border-red-700/40 shadow-lg backdrop-blur-sm mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                          <Search className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-red-800 dark:text-red-200 flex items-center gap-2">
                            🔍 Türkçe Yanlış Konu Analizi
                            <div className="text-xs bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-full text-red-700 dark:text-red-300">
                              {parseInt(newExamResult.subjects.turkce.wrong)} yanlış
                            </div>
                          </label>
                          <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                            Eksik konuları belirterek öncelik listesine ekleyin
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          value={currentWrongTopics.turkce || ""}
                          onChange={(e) => {
                            setCurrentWrongTopics({...currentWrongTopics, turkce: e.target.value});
                            const topics = e.target.value.split(',').map(t => {
                              const cleanTopic = toTitleCase(t.trim());
                              return cleanTopic ? `${newExamResult.exam_type} Türkçe - ${cleanTopic}` : '';
                            }).filter(t => t.length > 0);
                            
                            // Yinelenenleri kaldır
                            const uniqueTopics = [...new Set(topics)];
                            
                            setNewExamResult({
                              ...newExamResult,
                              subjects: {
                                ...newExamResult.subjects,
                                turkce: { ...newExamResult.subjects.turkce, wrong_topics: uniqueTopics }
                              }
                            });
                          }}
                          placeholder="Örnek: cümle çözümleme, sözcük türleri, yazım kuralları..."
                          className="bg-white/90 dark:bg-gray-800/90 border-red-300/60 dark:border-red-600/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800/50 rounded-xl shadow-sm text-sm"
                        />
                        {currentWrongTopics.turkce && (
                          <div className="flex items-center gap-2 p-3 bg-red-100/60 dark:bg-red-900/30 rounded-xl border border-red-200/60 dark:border-red-700/40">
                            <Lightbulb className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <div className="text-xs text-red-700/90 dark:text-red-300/90">
                              <strong>{currentWrongTopics.turkce.split(',').length} konu</strong> öncelik listesine eklenecek ve hata sıklığı analizinde gösterilecek
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Matematik */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-blue-600">Matematik</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.matematik.correct}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            matematik: { ...newExamResult.subjects.matematik, correct: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.matematik.wrong}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            matematik: { ...newExamResult.subjects.matematik, wrong: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.matematik.blank}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            matematik: { ...newExamResult.subjects.matematik, blank: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.matematik.wrong) > 0 && (
                    <div className="bg-gradient-to-br from-blue-50/80 via-white/60 to-cyan-50/60 dark:from-blue-950/30 dark:via-gray-800/60 dark:to-cyan-950/30 rounded-2xl p-5 border-2 border-blue-200/50 dark:border-blue-700/40 shadow-lg backdrop-blur-sm mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                          <Search className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                            🔍 Matematik Yanlış Konu Analizi
                            <div className="text-xs bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-full text-blue-700 dark:text-blue-300">
                              {parseInt(newExamResult.subjects.matematik.wrong)} yanlış
                            </div>
                          </label>
                          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                            Eksik konuları belirterek öncelik listesine ekleyin
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          value={currentWrongTopics.matematik || ""}
                          onChange={(e) => {
                            setCurrentWrongTopics({...currentWrongTopics, matematik: e.target.value});
                            const topics = e.target.value.split(',').map(t => {
                              const cleanTopic = toTitleCase(t.trim());
                              return cleanTopic ? `${newExamResult.exam_type} Matematik - ${cleanTopic}` : '';
                            }).filter(t => t.length > 0);
                            
                            // Yinelenenleri kaldır
                            const uniqueTopics = [...new Set(topics)];
                            
                            setNewExamResult({
                              ...newExamResult,
                              subjects: {
                                ...newExamResult.subjects,
                                matematik: { ...newExamResult.subjects.matematik, wrong_topics: uniqueTopics }
                              }
                            });
                          }}
                          placeholder="Örnek: türev, integral, trigonometri, fonksiyonlar..."
                          className="bg-white/90 dark:bg-gray-800/90 border-blue-300/60 dark:border-blue-600/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800/50 rounded-xl shadow-sm text-sm"
                        />
                        {currentWrongTopics.matematik && (
                          <div className="flex items-center gap-2 p-3 bg-blue-100/60 dark:bg-blue-900/30 rounded-xl border border-blue-200/60 dark:border-blue-700/40">
                            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <div className="text-xs text-blue-700/90 dark:text-blue-300/90">
                              <strong>{currentWrongTopics.matematik.split(',').length} konu</strong> öncelik listesine eklenecek ve hata sıklığı analizinde gösterilecek
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sosyal */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-purple-600">Sosyal Bilimler</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.sosyal.correct}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            sosyal: { ...newExamResult.subjects.sosyal, correct: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.sosyal.wrong}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            sosyal: { ...newExamResult.subjects.sosyal, wrong: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.sosyal.blank}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            sosyal: { ...newExamResult.subjects.sosyal, blank: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.sosyal.wrong) > 0 && (
                    <div className="bg-gradient-to-br from-purple-50/80 via-white/60 to-indigo-50/60 dark:from-purple-950/30 dark:via-gray-800/60 dark:to-indigo-950/30 rounded-2xl p-5 border-2 border-purple-200/50 dark:border-purple-700/40 shadow-lg backdrop-blur-sm mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                          <Search className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                            🔍 Sosyal Bilimler Yanlış Konu Analizi
                            <div className="text-xs bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-full text-purple-700 dark:text-purple-300">
                              {parseInt(newExamResult.subjects.sosyal.wrong)} yanlış
                            </div>
                          </label>
                          <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">
                            Eksik konuları belirterek öncelik listesine ekleyin
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          value={currentWrongTopics.sosyal || ""}
                          onChange={(e) => {
                            setCurrentWrongTopics({...currentWrongTopics, sosyal: e.target.value});
                            const topics = e.target.value.split(',').map(t => {
                              const cleanTopic = toTitleCase(t.trim());
                              return cleanTopic ? `${newExamResult.exam_type} Sosyal Bilimler - ${cleanTopic}` : '';
                            }).filter(t => t.length > 0);
                            
                            // Yinelenenleri kaldır
                            const uniqueTopics = [...new Set(topics)];
                            
                            setNewExamResult({
                              ...newExamResult,
                              subjects: {
                                ...newExamResult.subjects,
                                sosyal: { ...newExamResult.subjects.sosyal, wrong_topics: uniqueTopics }
                              }
                            });
                          }}
                          placeholder="Örnek: tarih dönemleri, coğrafya, vatandaşlık, felsefe..."
                          className="bg-white/90 dark:bg-gray-800/90 border-purple-300/60 dark:border-purple-600/50 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800/50 rounded-xl shadow-sm text-sm"
                        />
                        {currentWrongTopics.sosyal && (
                          <div className="flex items-center gap-2 p-3 bg-purple-100/60 dark:bg-purple-900/30 rounded-xl border border-purple-200/60 dark:border-purple-700/40">
                            <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                            <div className="text-xs text-purple-700/90 dark:text-purple-300/90">
                              <strong>{currentWrongTopics.sosyal.split(',').length} konu</strong> öncelik listesine eklenecek ve hata sıklığı analizinde gösterilecek
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fen */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-orange-600">Fen Bilimleri</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.fen.correct}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            fen: { ...newExamResult.subjects.fen, correct: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.fen.wrong}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            fen: { ...newExamResult.subjects.fen, wrong: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.fen.blank}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            fen: { ...newExamResult.subjects.fen, blank: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.fen.wrong) > 0 && (
                    <div className="bg-gradient-to-br from-orange-50/80 via-white/60 to-amber-50/60 dark:from-orange-950/30 dark:via-gray-800/60 dark:to-amber-950/30 rounded-2xl p-5 border-2 border-orange-200/50 dark:border-orange-700/40 shadow-lg backdrop-blur-sm mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                          <Search className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2">
                            🔍 Fen Bilimleri Yanlış Konu Analizi
                            <div className="text-xs bg-orange-100 dark:bg-orange-900/40 px-2 py-1 rounded-full text-orange-700 dark:text-orange-300">
                              {parseInt(newExamResult.subjects.fen.wrong)} yanlış
                            </div>
                          </label>
                          <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">
                            Eksik konuları belirterek öncelik listesine ekleyin
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          value={currentWrongTopics.fen || ""}
                          onChange={(e) => {
                            setCurrentWrongTopics({...currentWrongTopics, fen: e.target.value});
                            const topics = e.target.value.split(',').map(t => {
                              const cleanTopic = toTitleCase(t.trim());
                              return cleanTopic ? `${newExamResult.exam_type} Fen Bilimleri - ${cleanTopic}` : '';
                            }).filter(t => t.length > 0);
                            
                            // Yinelenenleri kaldır
                            const uniqueTopics = [...new Set(topics)];
                            
                            setNewExamResult({
                              ...newExamResult,
                              subjects: {
                                ...newExamResult.subjects,
                                fen: { ...newExamResult.subjects.fen, wrong_topics: uniqueTopics }
                              }
                            });
                          }}
                          placeholder="Örnek: fizik konuları, kimya bağları, biyoloji sistemleri..."
                          className="bg-white/90 dark:bg-gray-800/90 border-orange-300/60 dark:border-orange-600/50 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800/50 rounded-xl shadow-sm text-sm"
                        />
                        {currentWrongTopics.fen && (
                          <div className="flex items-center gap-2 p-3 bg-orange-100/60 dark:bg-orange-900/30 rounded-xl border border-orange-200/60 dark:border-orange-700/40">
                            <Lightbulb className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <div className="text-xs text-orange-700/90 dark:text-orange-300/90">
                              <strong>{currentWrongTopics.fen.split(',').length} konu</strong> öncelik listesine eklenecek ve hata sıklığı analizinde gösterilecek
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AYT Sayısal Konular */}
            {newExamResult.examScope === "full" && newExamResult.exam_type === "AYT" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AYT Sayısal Dersleri</h3>
                
                {/* Matematik */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-blue-600">Matematik</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.matematik.correct}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            matematik: { ...newExamResult.subjects.matematik, correct: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.matematik.wrong}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            matematik: { ...newExamResult.subjects.matematik, wrong: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.matematik.blank}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            matematik: { ...newExamResult.subjects.matematik, blank: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.matematik.wrong) > 0 && (
                    <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/15 rounded-xl p-4 border border-blue-200/40 dark:border-blue-700/30 mt-3">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-blue-500" />
                        <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">🔍 Matematik Eksik Konular</label>
                      </div>
                      <Input
                        value={currentWrongTopics.matematik || ""}
                        onChange={(e) => {
                          setCurrentWrongTopics({...currentWrongTopics, matematik: e.target.value});
                          const topics = e.target.value.split(',').map(t => toTitleCase(t.trim())).filter(t => t.length > 0);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              matematik: { ...newExamResult.subjects.matematik, wrong_topics: topics }
                            }
                          });
                        }}
                        placeholder="konu1, konu2, konu3 şeklinde virgülle ayırarak yazın..."
                        className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-700/50 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl shadow-sm"
                      />
                      {currentWrongTopics.matematik && (
                        <div className="mt-2 text-xs text-blue-600/70 dark:text-blue-400/70">
                          💡 Bu konular öncelik listesine eklenecek
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fizik */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-red-600">Fizik</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="14"
                        value={newExamResult.subjects.fizik.correct}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            fizik: { ...newExamResult.subjects.fizik, correct: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="14"
                        value={newExamResult.subjects.fizik.wrong}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            fizik: { ...newExamResult.subjects.fizik, wrong: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="14"
                        value={newExamResult.subjects.fizik.blank}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            fizik: { ...newExamResult.subjects.fizik, blank: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.fizik.wrong) > 0 && (
                    <div className="bg-gradient-to-r from-indigo-50/70 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/15 rounded-xl p-4 border border-indigo-200/40 dark:border-indigo-700/30 mt-3">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-indigo-500" />
                        <label className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">🔍 Fizik Eksik Konular</label>
                      </div>
                      <Input
                        value={currentWrongTopics.fizik || ""}
                        onChange={(e) => {
                          setCurrentWrongTopics({...currentWrongTopics, fizik: e.target.value});
                          const topics = e.target.value.split(',').map(t => {
                            const cleanTopic = toTitleCase(t.trim());
                            return cleanTopic ? `${newExamResult.exam_type} Fizik - ${cleanTopic}` : '';
                          }).filter(t => t.length > 0);
                          
                          // Yinelenenleri kaldır
                          const uniqueTopics = [...new Set(topics)];
                          
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              fizik: { ...newExamResult.subjects.fizik, wrong_topics: uniqueTopics }
                            }
                          });
                        }}
                        placeholder="konu1, konu2, konu3 şeklinde virgülle ayırarak yazın..."
                        className="bg-white/80 dark:bg-gray-800/80 border-indigo-200 dark:border-indigo-700/50 focus:border-indigo-400 dark:focus:border-indigo-500 rounded-xl shadow-sm"
                      />
                      {currentWrongTopics.fizik && (
                        <div className="mt-2 text-xs text-indigo-600/70 dark:text-indigo-400/70">
                          💡 Bu konular öncelik listesine eklenecek
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Kimya */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-green-600">Kimya</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.kimya.correct}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            kimya: { ...newExamResult.subjects.kimya, correct: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.kimya.wrong}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            kimya: { ...newExamResult.subjects.kimya, wrong: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.kimya.blank}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            kimya: { ...newExamResult.subjects.kimya, blank: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.kimya.wrong) > 0 && (
                    <div className="bg-gradient-to-r from-green-50/70 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/15 rounded-xl p-4 border border-green-200/40 dark:border-green-700/30 mt-3">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-green-500" />
                        <label className="text-sm font-semibold text-green-700 dark:text-green-300">🔍 Kimya Eksik Konular</label>
                      </div>
                      <Input
                        value={currentWrongTopics.kimya || ""}
                        onChange={(e) => {
                          setCurrentWrongTopics({...currentWrongTopics, kimya: e.target.value});
                          const topics = e.target.value.split(',').map(t => {
                            const cleanTopic = toTitleCase(t.trim());
                            return cleanTopic ? `${newExamResult.exam_type} Kimya - ${cleanTopic}` : '';
                          }).filter(t => t.length > 0);
                          
                          // Yinelenenleri kaldır
                          const uniqueTopics = [...new Set(topics)];
                          
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              kimya: { ...newExamResult.subjects.kimya, wrong_topics: uniqueTopics }
                            }
                          });
                        }}
                        placeholder="konu1, konu2, konu3 şeklinde virgülle ayırarak yazın..."
                        className="bg-white/80 dark:bg-gray-800/80 border-green-200 dark:border-green-700/50 focus:border-green-400 dark:focus:border-green-500 rounded-xl shadow-sm"
                      />
                      {currentWrongTopics.kimya && (
                        <div className="mt-2 text-xs text-green-600/70 dark:text-green-400/70">
                          💡 Bu konular öncelik listesine eklenecek
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Biyoloji */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-teal-600">Biyoloji</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.biyoloji.correct}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            biyoloji: { ...newExamResult.subjects.biyoloji, correct: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.biyoloji.wrong}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            biyoloji: { ...newExamResult.subjects.biyoloji, wrong: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.biyoloji.blank}
                        onChange={(e) => setNewExamResult({
                          ...newExamResult,
                          subjects: {
                            ...newExamResult.subjects,
                            biyoloji: { ...newExamResult.subjects.biyoloji, blank: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.biyoloji.wrong) > 0 && (
                    <div className="bg-gradient-to-r from-teal-50/70 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/15 rounded-xl p-4 border border-teal-200/40 dark:border-teal-700/30 mt-3">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-teal-500" />
                        <label className="text-sm font-semibold text-teal-700 dark:text-teal-300">🔍 Biyoloji Eksik Konular</label>
                      </div>
                      <Input
                        value={currentWrongTopics.biyoloji || ""}
                        onChange={(e) => {
                          setCurrentWrongTopics({...currentWrongTopics, biyoloji: e.target.value});
                          const topics = e.target.value.split(',').map(t => {
                            const cleanTopic = toTitleCase(t.trim());
                            return cleanTopic ? `${newExamResult.exam_type} Biyoloji - ${cleanTopic}` : '';
                          }).filter(t => t.length > 0);
                          
                          // Yinelenenleri kaldır
                          const uniqueTopics = [...new Set(topics)];
                          
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              biyoloji: { ...newExamResult.subjects.biyoloji, wrong_topics: uniqueTopics }
                            }
                          });
                        }}
                        placeholder="konu1, konu2, konu3 şeklinde virgülle ayırarak yazın..."
                        className="bg-white/80 dark:bg-gray-800/80 border-teal-200 dark:border-teal-700/50 focus:border-teal-400 dark:focus:border-teal-500 rounded-xl shadow-sm"
                      />
                      {currentWrongTopics.biyoloji && (
                        <div className="mt-2 text-xs text-teal-600/70 dark:text-teal-400/70">
                          💡 Bu konular öncelik listesine eklenecek
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  let tytNet = 0;
                  let aytNet = 0;
                  let submittedSubjects = { ...newExamResult.subjects };

                  if (newExamResult.examScope === "branch") {
                    // Branş Denemesi: Yanlış konuları parse et ve sadece seçilen ders için net hesapla
                    const selectedSubject = newExamResult.selectedSubject;
                    const subjectData = newExamResult.subjects[selectedSubject];
                    
                    // Yanlış konuları parse et
                    const wrongTopics = newExamResult.wrongTopicsText
                      .split(',')
                      .map(t => {
                        const cleanTopic = t.trim();
                        const subjectDisplayName = selectedSubject === 'sosyal' ? 'Sosyal Bilimler' :
                                                   selectedSubject === 'turkce' ? 'Türkçe' :
                                                   selectedSubject === 'matematik' ? 'Matematik' :
                                                   selectedSubject === 'geometri' ? 'Geometri' :
                                                   selectedSubject === 'fizik' ? 'Fizik' :
                                                   selectedSubject === 'kimya' ? 'Kimya' :
                                                   selectedSubject === 'biyoloji' ? 'Biyoloji' :
                                                   selectedSubject;
                        return cleanTopic ? `${newExamResult.exam_type} ${subjectDisplayName} - ${cleanTopic}` : '';
                      })
                      .filter(t => t.length > 0);
                    
                    // Seçilen dersin verilerini güncelle
                    submittedSubjects = {
                      turkce: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                      matematik: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                      sosyal: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                      fen: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                      fizik: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                      kimya: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                      biyoloji: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                      geometri: { correct: "", wrong: "", blank: "", wrong_topics: [] },
                      [selectedSubject]: {
                        ...subjectData,
                        wrong_topics: wrongTopics
                      }
                    };
                    
                    // Sadece seçilen ders için net hesapla
                    const correct = parseInt(subjectData.correct) || 0;
                    const wrong = parseInt(subjectData.wrong) || 0;
                    const branchNet = Math.max(0, correct - (wrong * 0.25));
                    
                    // TYT/AYT'ye göre net'i ayarla
                    if (newExamResult.exam_type === "TYT") {
                      tytNet = branchNet;
                      aytNet = 0;
                    } else {
                      tytNet = 0;
                      aytNet = branchNet;
                    }
                  } else {
                    // Tam Deneme: Tüm dersleri hesapla
                    const tytSubjects = ['turkce', 'sosyal', 'matematik', 'fen'];
                    const aytSubjects = ['matematik', 'fizik', 'kimya', 'biyoloji'];
                    
                    tytSubjects.forEach(subjectKey => {
                      const subject = newExamResult.subjects[subjectKey];
                      if (subject) {
                        const correct = parseInt(subject.correct) || 0;
                        const wrong = parseInt(subject.wrong) || 0;
                        tytNet += correct - (wrong * 0.25);
                      }
                    });
                    
                    aytSubjects.forEach(subjectKey => {
                      const subject = newExamResult.subjects[subjectKey];
                      if (subject) {
                        const correct = parseInt(subject.correct) || 0;
                        const wrong = parseInt(subject.wrong) || 0;
                        aytNet += correct - (wrong * 0.25);
                      }
                    });
                  }
                  
                  createExamResultMutation.mutate({
                    exam_name: newExamResult.exam_name,
                    exam_date: newExamResult.exam_date,
                    exam_type: newExamResult.exam_type,
                    tyt_net: Math.max(0, tytNet).toFixed(2),
                    ayt_net: Math.max(0, aytNet).toFixed(2),
                    subjects_data: JSON.stringify(submittedSubjects)
                  });
                }}
                disabled={!newExamResult.exam_name || createExamResultMutation.isPending}
                className="flex-1"
                data-testid="button-save-exam"
              >
                {createExamResultMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowExamDialog(false);
                  setNewExamResult({ 
                    exam_name: "", 
                    exam_date: new Date().toISOString().split('T')[0], 
                    exam_type: "TYT" as "TYT" | "AYT",
                    examScope: "full" as "full" | "branch",
                    selectedSubject: "turkce" as string,
                    wrongTopicsText: "",
                    subjects: {
                      turkce: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
                      matematik: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
                      sosyal: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
                      fen: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
                      fizik: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
                      kimya: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
                      biyoloji: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] },
                      geometri: { correct: "", wrong: "", blank: "", wrong_topics: [] as string[] }
                    }
                  });
                  setCurrentWrongTopics({}); // Tüm yanlış konu giriş alanlarını temizle
                }}
                data-testid="button-cancel-exam"
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Çalışma Saati Ekle Modalı */}
      <Dialog open={showStudyHoursModal} onOpenChange={setShowStudyHoursModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ⏱️ Çalıştığım Süreyi Ekle
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Bugün çalıştığınız süreyi kaydedin
            </DialogDescription>
          </DialogHeader>
          
          {/* Aylık Toplam Gösterim */}
          {(() => {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyTotal = studyHours
              .filter((sh: any) => {
                const date = new Date(sh.study_date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
              })
              .reduce((total: number, sh: any) => {
                return total + (sh.hours * 3600) + (sh.minutes * 60) + sh.seconds;
              }, 0);
            
            const totalHours = Math.floor(monthlyTotal / 3600);
            const totalMinutes = Math.floor((monthlyTotal % 3600) / 60);
            const totalSeconds = monthlyTotal % 60;
            
            return (
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-700 mb-4">
                <CardContent className="py-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Bu Ay Toplam Çalışma Sürem</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {String(totalHours).padStart(2, '0')}:{String(totalMinutes).padStart(2, '0')}:{String(totalSeconds).padStart(2, '0')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                📅 Tarih
              </label>
              <Input
                type="date"
                value={newStudyHours.study_date}
                onChange={(e) => setNewStudyHours(prev => ({ ...prev, study_date: e.target.value }))}
                className="w-full"
                data-testid="input-study-date"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  ⏰ Saat
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newStudyHours.hours}
                  onChange={(e) => setNewStudyHours(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  className="w-full"
                  data-testid="input-study-hours"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  ⏱️ Dakika
                </label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={newStudyHours.minutes}
                  onChange={(e) => setNewStudyHours(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                  className="w-full"
                  data-testid="input-study-minutes"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  ⏲️ Saniye
                </label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={newStudyHours.seconds}
                  onChange={(e) => setNewStudyHours(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                  className="w-full"
                  data-testid="input-study-seconds"
                />
              </div>
            </div>
          </div>

          {/* Eklenen Çalışma Saatleri Listesi */}
          {studyHours.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Eklenen Çalışma Saatleri
              </h3>
              <div className="max-h-[11rem] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {[...studyHours].sort((a, b) => new Date(b.study_date).getTime() - new Date(a.study_date).getTime()).map((sh: any) => (
                  <div
                    key={sh.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-700/30"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {new Date(sh.study_date).toLocaleDateString('tr-TR', { 
                            day: 'numeric', 
                            month: 'short'
                          })}
                        </div>
                        <div className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                          {sh.hours}s {sh.minutes}dk {sh.seconds}sn
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteStudyHoursMutation.mutate(sh.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                      disabled={deleteStudyHoursMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => createStudyHoursMutation.mutate(newStudyHours)}
              disabled={createStudyHoursMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              data-testid="button-save-study-hours"
            >
              💾 Kaydet
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setShowStudyHoursModal(false);
                setNewStudyHours({
                  study_date: new Date().toISOString().split('T')[0],
                  hours: 0,
                  minutes: 0,
                  seconds: 0,
                });
              }}
              className="px-6"
              data-testid="button-cancel-study-hours"
            >
              İptal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Aylık Rapor Talep Modalı */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              📊 Aylık Rapor Talep Et
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Bu ayın çalışma raporunuz hem email hem de SMS olarak gönderilecektir
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                📧 Email Adresi
              </label>
              <Input
                type="email"
                placeholder="ornek@email.com"
                value={reportContactInfo.email}
                onChange={(e) => setReportContactInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full"
                data-testid="input-email-report"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                📱 Telefon Numarası
              </label>
              <Input
                type="tel"
                placeholder="+90 5XX XXX XX XX"
                value={reportContactInfo.phone}
                onChange={(e) => setReportContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full"
                data-testid="input-phone-report"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => {
                // Yapılacaklar: Aylık raporu oluştur ve gönder
                toast({ 
                  title: "📬 Rapor Gönderiliyor", 
                  description: `Aylık rapor ${reportContactInfo.email} ve ${reportContactInfo.phone} adreslerine gönderiliyor...` 
                });
                setShowReportModal(false);
                setReportContactInfo({ email: "", phone: "" });
              }}
              disabled={!reportContactInfo.email || !reportContactInfo.phone}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              data-testid="button-send-report"
            >
              📄 Rapor Gönder
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setShowReportModal(false);
                setReportContactInfo({ email: "", phone: "" });
              }}
              className="px-6"
              data-testid="button-cancel-report"
            >
              İptal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
