// BERAT CANKIR
// BERAT BİLAL CANKIR
// CANKIR


import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/bilesenler/baslik";
import { TrendingUp, BarChart3, Target, Brain, BookOpen, Plus, CalendarDays, X, FlaskConical, Trash2, AlertTriangle, Sparkles, Award, Clock, Zap, Edit, Search, Tag, BookX, Lightbulb, Eye, Calendar, FileText, Archive, CheckCircle, Circle } from "lucide-react";
import { Task, Goal, QuestionLog, InsertQuestionLog, ExamResult, InsertExamResult, SUBJECT_LIMITS } from "@shared/sema";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/bilesenler/arayuz/popover";
import { Calendar as CalendarComponent } from "@/bilesenler/arayuz/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/bilesenler/arayuz/alert-dialog";
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

// Sayı inputlarından önde gelen sıfırları temizleyen yardımcı fonksiyon
const cleanNumberInput = (value: string): string => {
  // Boş string veya sadece "0" ise olduğu gibi bırak
  if (value === '' || value === '0') return value;
  // Önde gelen sıfırları temizle (örn: "015" -> "15")
  return value.replace(/^0+/, '') || '0';
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
  const [showDeleteAllQuestionsDialog, setShowDeleteAllQuestionsDialog] = useState(false);
  const [showDeleteAllExamsDialog, setShowDeleteAllExamsDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ 
    exam_type: "TYT" as "TYT" | "AYT", 
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
  const [editingExam, setEditingExam] = useState<ExamResult | null>(null);
  const [newExamResult, setNewExamResult] = useState({ 
    exam_name: "", 
    display_name: "",
    exam_date: new Date().toISOString().split('T')[0], 
    exam_type: "TYT" as "TYT" | "AYT",
    examScope: "full" as "full" | "branch",
    selectedSubject: "turkce" as string,
    wrongTopicsText: "",
    time_spent_minutes: "",
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
      studyHours?: any[];
    };
  } | null>(null);
  const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());

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

  // Arşivlenen Veriler Modal Durumu
  const [showArchivedDataModal, setShowArchivedDataModal] = useState(false);
  const [archivedTab, setArchivedTab] = useState<'questions' | 'exams' | 'tasks' | 'studyHours'>('questions');
  const [nextArchiveCountdown, setNextArchiveCountdown] = useState<string>("");
  const [showDeleteAllDataDialog, setShowDeleteAllDataDialog] = useState(false);

  // Arşivlenen verileri getir (modal için)
  const { data: archivedQuestionsModal = [] } = useQuery<QuestionLog[]>({
    queryKey: ["/api/question-logs/archived"],
    enabled: showArchivedDataModal,
  });

  const { data: archivedExamsModal = [] } = useQuery<ExamResult[]>({
    queryKey: ["/api/exam-results/archived"],
    enabled: showArchivedDataModal,
  });

  const { data: archivedTasksModal = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/archived"],
    enabled: showArchivedDataModal,
  });

  const { data: archivedStudyHoursModal = [] } = useQuery<any[]>({
    queryKey: ["/api/study-hours/archived"],
    enabled: showArchivedDataModal,
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

  // TÜM VERİLERİ VE CACHE'LERİ TEMİZLE
  const deleteAllDataMutation = useMutation({
    mutationFn: async () => {
      // Tüm verileri sil
      await apiRequest("DELETE", "/api/tasks/all");
      await apiRequest("DELETE", "/api/question-logs/all");
      await apiRequest("DELETE", "/api/exam-results/all");
      await apiRequest("DELETE", "/api/study-hours/all");
      
      // localStorage'daki cache'leri temizle
      const keysToRemove = [
        'completedQuestionErrors',
        'completedGeneralExamErrors', 
        'completedBranchExamErrors',
        'removedTopics',
        'celebratingTopics',
        'tytTargetNet',
        'aytTargetNet',
        'tytBranchTargetNet',
        'aytBranchTargetNet'
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      return { success: true };
    },
    onSuccess: () => {
      // Tüm query cache'lerini temizle
      sorguIstemcisi.clear();
      
      // Tüm queryKey'leri invalidate et
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/tasks"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/question-logs"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-results"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/study-hours"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-subject-nets"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/stats"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/priority"] });
      
      toast({ 
        title: "🗑️ Tüm veriler temizlendi", 
        description: "Tüm verileriniz ve cache'ler başarıyla silindi. Uygulama yenileniyor...",
        duration: 3000
      });
      
      // 2 saniye sonra sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    onError: () => {
      toast({ title: "❌ Hata", description: "Veriler temizlenemedi.", variant: "destructive" });
    },
  });

  // Arşivden silme mutations
  const deleteArchivedQuestionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/question-logs/${id}`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/question-logs/archived"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/question-logs"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/stats"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/priority"] });
      toast({ title: "🗑️ Soru silindi", description: "Arşivlenen soru başarıyla silindi." });
    },
  });

  const deleteArchivedExamMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/exam-results/${id}`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-results/archived"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-results"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-subject-nets"] });
      toast({ title: "🗑️ Deneme silindi", description: "Arşivlenen deneme başarıyla silindi." });
    },
  });

  const deleteArchivedTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/tasks/archived"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "🗑️ Görev silindi", description: "Arşivlenen görev başarıyla silindi." });
    },
  });

  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    staleTime: 30000,
    gcTime: 300000,
  });

  const { data: archivedTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/archived"],
    staleTime: 60000,
    gcTime: 600000,
  });

  const { data: dailySummary = [] } = useQuery<DailySummary[]>({
    queryKey: ["/api/summary/daily"],
    staleTime: 60000,
    gcTime: 600000,
  });
  
  const { data: questionLogs = [] } = useQuery<QuestionLog[]>({
    queryKey: ["/api/question-logs"],
    staleTime: 30000,
    gcTime: 300000,
  });

  const { data: archivedQuestionLogs = [] } = useQuery<QuestionLog[]>({
    queryKey: ["/api/question-logs/archived"],
    staleTime: 60000,
    gcTime: 600000,
  });
  
  const { data: examResults = [] } = useQuery<ExamResult[]>({
    queryKey: ["/api/exam-results"],
    staleTime: 30000,
    gcTime: 300000,
  });

  const { data: archivedExamResults = [] } = useQuery<ExamResult[]>({
    queryKey: ["/api/exam-results/archived"],
    staleTime: 60000,
    gcTime: 600000,
  });

  const { data: topicStats = [] } = useQuery<TopicStats[]>({
    queryKey: ["/api/topics/stats"],
    staleTime: 30000,
    gcTime: 300000,
  });

  const { data: priorityTopics = [] } = useQuery<PriorityTopic[]>({
    queryKey: ["/api/topics/priority"],
    staleTime: 30000,
    gcTime: 300000,
  });

  const { data: studyHours = [] } = useQuery<any[]>({
    queryKey: ["/api/study-hours"],
    staleTime: 30000,
    gcTime: 300000,
  });

  const { data: archivedStudyHours = [] } = useQuery<any[]>({
    queryKey: ["/api/study-hours/archived"],
    staleTime: 60000,
    gcTime: 600000,
  });

  // Heatmap/takvim ve raporlar için TÜM verileri birleştir (arşivli + aktif)
  const allTasks = useMemo(() => [...tasks, ...archivedTasks], [tasks, archivedTasks]);
  const allQuestionLogs = useMemo(() => [...questionLogs, ...archivedQuestionLogs], [questionLogs, archivedQuestionLogs]);
  const allStudyHours = useMemo(() => [...studyHours, ...archivedStudyHours], [studyHours, archivedStudyHours]);
  const allExamResults = useMemo(() => [...examResults, ...archivedExamResults], [examResults, archivedExamResults]);

  // Eski çalışma saatlerini SİLME - ar şivleme sistemi kullan
  // useEffect kaldırıldı - veriler artık otomatik arşivleniyor, silinmiyor

  // Gereksiz yeniden render işlemlerini önlemek için useMemo ile optimize edilmiş hesaplamalar
  // ARŞİVLENEN VERİLERİ DAHİL ET - Arşivlenen veriler de performans özetinde gösterilecek
  const memoizedStats = useMemo(() => {
    const totalQuestions = allQuestionLogs.reduce((sum, log) => {
      return sum + (parseInt(log.correct_count) || 0) + (parseInt(log.wrong_count) || 0) + (parseInt(log.blank_count) || 0);
    }, 0);

    const totalCorrect = allQuestionLogs.reduce((sum, log) => {
      return sum + (parseInt(log.correct_count) || 0);
    }, 0);

    const totalWrong = allQuestionLogs.reduce((sum, log) => {
      return sum + (parseInt(log.wrong_count) || 0);
    }, 0);

    const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    
    return {
      totalQuestions,
      totalCorrect,
      totalWrong,
      averageAccuracy
    };
  }, [allQuestionLogs]);

  const memoizedExamStats = useMemo(() => {
    const totalExams = allExamResults.length;
    const tytExams = allExamResults.filter(exam => exam.tyt_net && parseFloat(exam.tyt_net) > 0).length;
    const aytExams = allExamResults.filter(exam => exam.ayt_net && parseFloat(exam.ayt_net) > 0).length;
    
    const lastTytNet = allExamResults
      .filter(exam => exam.tyt_net && parseFloat(exam.tyt_net) > 0)
      .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())[0]?.tyt_net || "0";
    
    const lastAytNet = allExamResults
      .filter(exam => exam.ayt_net && parseFloat(exam.ayt_net) > 0)
      .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())[0]?.ayt_net || "0";

    return {
      totalExams,
      tytExams,
      aytExams,
      lastTytNet: parseFloat(lastTytNet),
      lastAytNet: parseFloat(lastAytNet)
    };
  }, [allExamResults]);


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

  const updateExamResultMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertExamResult> }) => 
      apiRequest("PUT", `/api/exam-results/${id}`, data),
    onSuccess: () => {
      setEditingExam(null);
      setShowExamDialog(false);
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-results"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/exam-subject-nets"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/stats"] });
      sorguIstemcisi.invalidateQueries({ queryKey: ["/api/topics/priority"] });
      toast({ title: "📝 Deneme güncellendi", description: "Deneme sınav sonucunuz başarıyla güncellendi." });
      setCurrentWrongTopics({});
      setNewExamResult({ 
        exam_name: "", 
        display_name: "",
        exam_date: new Date().toISOString().split('T')[0], 
        exam_type: "TYT" as "TYT" | "AYT",
        examScope: "full" as "full" | "branch",
        selectedSubject: "turkce" as string,
        wrongTopicsText: "",
        time_spent_minutes: "",
        subjects: {
          turkce: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
          matematik: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
          sosyal: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
          fen: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
          fizik: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
          kimya: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
          biyoloji: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
          geometri: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' }
        }
      });
    },
    onError: () => {
      toast({ title: "❌ Hata", description: "Deneme güncellenemedi.", variant: "destructive" });
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
      setEditingExam(null);
      setNewExamResult({ 
        exam_name: "", 
        display_name: "",
        exam_date: new Date().toISOString().split('T')[0], 
        exam_type: "TYT" as "TYT" | "AYT",
        examScope: "full" as "full" | "branch",
        selectedSubject: "turkce" as string,
        wrongTopicsText: "",
        time_spent_minutes: "",
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
      wrong_topics_json: JSON.stringify(newQuestion.wrong_topics),
      time_spent_minutes: newQuestion.time_spent_minutes ? parseInt(newQuestion.time_spent_minutes) : null
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
    // Soru limitleri - SUBJECT_LIMITS'den alınacak
    const getSubjectLimit = (examType: string, subject: string): number => {
      // Subject key mapping
      const subjectMap: Record<string, string> = {
        'turkce': 'Türkçe',
        'sosyal': 'Sosyal Bilimler',
        'matematik': 'Matematik',
        'geometri': 'Geometri',
        'fen': 'Fen Bilimleri',
        'fizik': 'Fizik',
        'kimya': 'Kimya',
        'biyoloji': 'Biyoloji'
      };
      const mappedSubject = subjectMap[subject] || subject;
      return SUBJECT_LIMITS[examType]?.[mappedSubject] || 100;
    };
    
    // Soru sayısı kontrolü yap
    const tytSubjects = ['turkce', 'sosyal', 'matematik', 'geometri', 'fen'];
    const aytSubjects = ['matematik', 'geometri', 'fizik', 'kimya', 'biyoloji'];
    
    for (const subjectKey of tytSubjects) {
      const subject = newExamResult.subjects[subjectKey];
      if (subject) {
        const correct = parseInt(subject.correct) || 0;
        const wrong = parseInt(subject.wrong) || 0;
        const blank = parseInt(subject.blank) || 0;
        const total = correct + wrong + blank;
        const limit = getSubjectLimit('TYT', subjectKey);
        
        if (total > limit) {
          toast({ 
            title: "❌ Hata", 
            description: `TYT ${subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1)} için toplam soru sayısı ${limit}'i geçemez! (Girilen: ${total})`,
            variant: "destructive" 
          });
          return;
        }
      }
    }
    
    for (const subjectKey of aytSubjects) {
      const subject = newExamResult.subjects[subjectKey];
      if (subject) {
        const correct = parseInt(subject.correct) || 0;
        const wrong = parseInt(subject.wrong) || 0;
        const blank = parseInt(subject.blank) || 0;
        const total = correct + wrong + blank;
        const limit = getSubjectLimit('AYT', subjectKey);
        
        if (total > limit) {
          toast({ 
            title: "❌ Hata", 
            description: `AYT ${subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1)} için toplam soru sayısı ${limit}'i geçemez! (Girilen: ${total})`,
            variant: "destructive" 
          });
          return;
        }
      }
    }
    
    // Branş denemesiyse, wrongTopicsText'i subjects array'ine ekle
    let updatedSubjects = { ...newExamResult.subjects };
    if (newExamResult.examScope === "branch" && newExamResult.wrongTopicsText && newExamResult.wrongTopicsText.trim()) {
      const topics = newExamResult.wrongTopicsText
        .split(',')
        .map(t => toTitleCase(t.trim()))
        .filter(t => t.length > 0);
      const uniqueTopics = [...new Set(topics)];
      
      updatedSubjects = {
        ...updatedSubjects,
        [newExamResult.selectedSubject]: {
          ...updatedSubjects[newExamResult.selectedSubject],
          wrong_topics: uniqueTopics
        }
      };
    }
    
    // TYT ve AYT Net Hesapla - SADECE seçilen sınav tipi için hesaplama yap
    let tytNet = 0;
    let aytNet = 0;
    
    // TYT seçildiyse sadece TYT netini hesapla
    if (newExamResult.exam_type === 'TYT') {
      tytSubjects.forEach(subjectKey => {
        const subject = updatedSubjects[subjectKey];
        if (subject) {
          const correct = parseInt(subject.correct) || 0;
          const wrong = parseInt(subject.wrong) || 0;
          tytNet += correct - (wrong * 0.25);
        }
      });
    }
    
    // AYT seçildiyse sadece AYT netini hesapla
    if (newExamResult.exam_type === 'AYT') {
      aytSubjects.forEach(subjectKey => {
        const subject = updatedSubjects[subjectKey];
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
      exam_type: newExamResult.exam_type, // Kritik: TYT/AYT ayrımı için exam_type'ı dahil et
      tyt_net: Math.max(0, tytNet).toFixed(2), // Negatif olmamasını sağla ve 2 ondalık basamak
      ayt_net: Math.max(0, aytNet).toFixed(2), // Negatif olmamasını sağla ve 2 ondalık basamak
      subjects_data: JSON.stringify(updatedSubjects),
      time_spent_minutes: parseInt(newExamResult.time_spent_minutes) || null
    });
  }, [newExamResult, createExamResultMutation]);

  // Subject options based on TYT/AYT
  const getSubjectOptions = (examType: string) => {
    if (examType === "TYT") {
      return ["Türkçe", "Sosyal Bilimler", "Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji"];
    } else {
      return ["Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji"];
    }
  };

  // Heatmap verilerini oluştur - 1 Ocak'tan bugüne kadar tam yıl (OPTIMIZED with pre-computed maps)
  const generateYearlyHeatmapData = () => {
    const data = [];
    // Türkiye saati (GMT+3) için bugünün tarihini al
    const today = new Date();
    const turkeyTimeString = today.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' });
    const turkeyDate = new Date(turkeyTimeString);
    const currentYear = turkeyDate.getFullYear();
    const currentMonth = turkeyDate.getMonth();
    const currentDay = turkeyDate.getDate();
    
    // Türkiye saatinde YYYY-MM-DD formatını al (UTC kaymadan)
    const todayDateStr = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Europe/Istanbul' 
    }).format(today);
    
    // Pre-compute date maps for O(1) lookups instead of O(n) filters
    const questionsByDate = new Map<string, number>();
    const tasksByDate = new Map<string, number>();
    const studyHoursByDate = new Map<string, number>();
    const deletedQuestionsByDate = new Map<string, number>();
    const deletedTasksByDate = new Map<string, number>();
    const deletedStudyHoursByDate = new Map<string, number>();
    const archivedTasksByDate = new Map<string, number>();
    const archivedQuestionsByDate = new Map<string, number>();
    const archivedStudyHoursByDate = new Map<string, number>();
    
    allQuestionLogs.forEach(log => {
      questionsByDate.set(log.study_date, (questionsByDate.get(log.study_date) || 0) + 1);
      if (log.deleted) {
        deletedQuestionsByDate.set(log.study_date, (deletedQuestionsByDate.get(log.study_date) || 0) + 1);
      }
      if (log.archived) {
        archivedQuestionsByDate.set(log.study_date, (archivedQuestionsByDate.get(log.study_date) || 0) + 1);
      }
    });
    
    allTasks.forEach(task => {
      // Görevleri şu öncelikle göster:
      // 1. Arşivlenmişse -> archivedAt tarihinde
      // 2. Silinmişse -> deletedAt tarihinde (varsa)
      // 3. Tamamlanmışsa -> completedAt tarihinde
      // 4. Değilse -> dueDate veya createdAt'te
      let taskDate: string | null = null;
      
      if (task.archived && task.archivedAt) {
        taskDate = new Date(task.archivedAt).toISOString().split('T')[0];
      } else if (task.deleted && task.deletedAt) {
        taskDate = new Date(task.deletedAt).toISOString().split('T')[0];
      } else if (task.completedAt) {
        taskDate = new Date(task.completedAt).toISOString().split('T')[0];
      } else if (task.dueDate) {
        taskDate = task.dueDate.split('T')[0];
      } else if (task.createdAt) {
        taskDate = new Date(task.createdAt).toISOString().split('T')[0];
      }
      
      if (taskDate) {
        tasksByDate.set(taskDate, (tasksByDate.get(taskDate) || 0) + 1);
        if (task.deleted) {
          deletedTasksByDate.set(taskDate, (deletedTasksByDate.get(taskDate) || 0) + 1);
        }
        if (task.archived) {
          archivedTasksByDate.set(taskDate, (archivedTasksByDate.get(taskDate) || 0) + 1);
        }
      }
    });
    
    allStudyHours.forEach(sh => {
      studyHoursByDate.set(sh.study_date, (studyHoursByDate.get(sh.study_date) || 0) + 1);
      if (sh.deleted) {
        deletedStudyHoursByDate.set(sh.study_date, (deletedStudyHoursByDate.get(sh.study_date) || 0) + 1);
      }
      if (sh.archived) {
        archivedStudyHoursByDate.set(sh.study_date, (archivedStudyHoursByDate.get(sh.study_date) || 0) + 1);
      }
    });
    
    // 1 Ocak'tan bugüne kadar tüm günleri oluştur (bugün DAHİL)
    const startDate = new Date(currentYear, 0, 1);
    
    // Tüm günleri oluştur - bugünkü tarihe ulaşana kadar
    for (let i = 0; ; i++) {
      const currentDate = new Date(currentYear, 0, 1 + i, 12, 0, 0); // Öğlen saati = timezone safe
      const dateStr = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      // Bugünü geçtikse dur
      if (dateStr > todayDateStr) break;
      
      // O(1) lookup from pre-computed maps
      const questionCount = questionsByDate.get(dateStr) || 0;
      const taskCount = tasksByDate.get(dateStr) || 0;
      const studyHoursCount = studyHoursByDate.get(dateStr) || 0;
      const deletedQuestionCount = deletedQuestionsByDate.get(dateStr) || 0;
      const deletedTaskCount = deletedTasksByDate.get(dateStr) || 0;
      const deletedStudyHoursCount = deletedStudyHoursByDate.get(dateStr) || 0;
      const archivedTaskCount = archivedTasksByDate.get(dateStr) || 0;
      const archivedQuestionCount = archivedQuestionsByDate.get(dateStr) || 0;
      const archivedStudyHoursCount = archivedStudyHoursByDate.get(dateStr) || 0;
      
      const studyIntensity = Math.min((questionCount * 2 + taskCount + studyHoursCount * 3) / 15, 1);
      
      // Bugün olup olmadığını kontrol et
      const isToday = dateStr === todayDateStr;
      
      data.push({
        date: dateStr,
        day: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        dayOfWeek: currentDate.getDay(), // 0=Pazar, 1=Pazartesi, ...
        intensity: studyIntensity,
        count: questionCount + taskCount + studyHoursCount,
        questionCount: questionCount,
        taskCount: taskCount,
        studyHoursCount: studyHoursCount,
        deletedQuestionCount: deletedQuestionCount,
        deletedTaskCount: deletedTaskCount,
        deletedStudyHoursCount: deletedStudyHoursCount,
        archivedTaskCount: archivedTaskCount,
        archivedQuestionCount: archivedQuestionCount,
        archivedStudyHoursCount: archivedStudyHoursCount,
        isToday: isToday
      });
    }
    
    return data;
  };

  // Heatmap'i haftalara organize et - sadece bugüne kadar
  const organizeHeatmapIntoWeeks = (data: any[]) => {
    const weeks = [];
    
    if (data.length === 0) return weeks;
    
    // İlk günden başla
    const firstDate = new Date(data[0].date);
    const firstDayOfWeek = firstDate.getDay(); // 0=Paz, 1=Pzt, ...
    const daysToMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Hafta başlangıcı (Pazartesi)
    const startDate = new Date(firstDate);
    startDate.setDate(firstDate.getDate() - daysToMonday);
    
    // Bugüne kadar - haftayı tamamlama
    const today = new Date();
    
    // Veri haritası oluştur
    const dateMap = new Map();
    data.forEach(day => {
      dateMap.set(day.date, day);
    });
    
    // Haftaları oluştur
    const currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const week = [];
      
      // Her hafta 7 gün (Pzt-Paz)
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = dateMap.get(dateStr);
        
        // Sadece bugüne kadar olan günleri ekle
        if (currentDate <= today) {
          week.push(dayData || null);
        } else {
          week.push(null);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Haftanın en az bir gerçek günü varsa ekle
      const hasRealDay = week.some(day => day !== null);
      if (hasRealDay) {
        weeks.push(week);
      }
    }
    
    // Maksimum gösterilecek hafta sayısı (ekrana sığacak kadar, en az 1 sütun boşluk bırakarak)
    // Her sütun ~28px genişliğinde, sayfa genişliği ~1280px olduğunda yaklaşık 40 hafta sığar
    const MAX_WEEKS = 40;
    
    // Eğer hafta sayısı maksimumdan fazlaysa, en soldaki haftaları sil
    if (weeks.length > MAX_WEEKS) {
      const weeksToRemove = weeks.length - MAX_WEEKS;
      return weeks.slice(weeksToRemove); // En soldaki haftaları sil
    }
    
    return weeks;
  };

  // OPTIMIZED: useMemo ile performans iyileştirmesi
  const yearlyHeatmapData = useMemo(() => {
    return generateYearlyHeatmapData();
  }, [allQuestionLogs, allTasks, allStudyHours]);
  
  const heatmapWeeks = useMemo(() => {
    return organizeHeatmapIntoWeeks(yearlyHeatmapData);
  }, [yearlyHeatmapData]);

  // Isı haritası gün tıklamasını işleme (ARŞİVLİ VERİLER DAHİL) - OPTIMIZED
  const handleHeatmapDayClick = useCallback((day: any) => {
    const dayQuestions = allQuestionLogs.filter(log => log.study_date === day.date);
    const dayTasks = allTasks.filter(task => {
      // Görevleri şu öncelikle filtrele:
      // 1. Arşivlenmişse -> archivedAt tarihinde
      // 2. Silinmişse -> deletedAt tarihinde
      // 3. Tamamlanmışsa -> completedAt tarihinde
      // 4. Değilse -> dueDate veya createdAt'te
      let taskDate: string | null = null;
      
      if (task.archived && task.archivedAt) {
        taskDate = new Date(task.archivedAt).toISOString().split('T')[0];
      } else if (task.deleted && task.deletedAt) {
        taskDate = new Date(task.deletedAt).toISOString().split('T')[0];
      } else if (task.completedAt) {
        taskDate = new Date(task.completedAt).toISOString().split('T')[0];
      } else if (task.dueDate) {
        taskDate = task.dueDate.split('T')[0];
      } else if (task.createdAt) {
        taskDate = new Date(task.createdAt).toISOString().split('T')[0];
      }
      
      return taskDate === day.date;
    });
    const dayExams = allExamResults.filter(exam => exam.exam_date === day.date);
    const dayStudyHours = allStudyHours.filter(sh => sh.study_date === day.date);
    
    setSelectedHeatmapDay({
      ...day,
      dayActivities: {
        questions: dayQuestions,
        tasks: dayTasks,
        exams: dayExams,
        studyHours: dayStudyHours
      }
    });
  }, [allQuestionLogs, allTasks, allExamResults, allStudyHours]);

  // Modal açıkken veriler değiştiğinde (ör. görev arşivlendiğinde) modal içeriğini güncelle
  useEffect(() => {
    if (selectedHeatmapDay) {
      const dayQuestions = allQuestionLogs.filter(log => log.study_date === selectedHeatmapDay.date);
      const dayTasks = allTasks.filter(task => {
        // Görevleri şu öncelikle filtrele:
        // 1. Arşivlenmişse -> archivedAt tarihinde
        // 2. Silinmişse -> deletedAt tarihinde
        // 3. Tamamlanmışsa -> completedAt tarihinde
        // 4. Değilse -> dueDate veya createdAt'te
        let taskDate: string | null = null;
        
        if (task.archived && task.archivedAt) {
          taskDate = new Date(task.archivedAt).toISOString().split('T')[0];
        } else if (task.deleted && task.deletedAt) {
          taskDate = new Date(task.deletedAt).toISOString().split('T')[0];
        } else if (task.completedAt) {
          taskDate = new Date(task.completedAt).toISOString().split('T')[0];
        } else if (task.dueDate) {
          taskDate = task.dueDate.split('T')[0];
        } else if (task.createdAt) {
          taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        }
        
        return taskDate === selectedHeatmapDay.date;
      });
      const dayExams = allExamResults.filter(exam => exam.exam_date === selectedHeatmapDay.date);
      const dayStudyHours = allStudyHours.filter(sh => sh.study_date === selectedHeatmapDay.date);
      
      setSelectedHeatmapDay({
        ...selectedHeatmapDay,
        dayActivities: {
          questions: dayQuestions,
          tasks: dayTasks,
          exams: dayExams,
          studyHours: dayStudyHours
        }
      });
    }
  }, [allQuestionLogs, allTasks, allExamResults, allStudyHours]);

  // Countdown timer for next archive (Sunday 23:59 Turkey time)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const turkeyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
      
      // Calculate next Sunday 23:59
      const nextSunday = new Date(turkeyTime);
      const currentDay = nextSunday.getDay(); // 0 = Sunday
      
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
      
      // Convert to days, hours, minutes, seconds
      const days = Math.floor(msUntilSunday / (1000 * 60 * 60 * 24));
      const hours = Math.floor((msUntilSunday % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((msUntilSunday % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((msUntilSunday % (1000 * 60)) / 1000);
      
      let countdownText = "Bir sonraki otomatik arşivleme: ";
      if (days > 0) {
        countdownText += `${days} gün ${hours} saat`;
      } else if (hours > 0) {
        countdownText += `${hours} saat ${minutes} dakika`;
      } else if (minutes > 0) {
        countdownText += `${minutes} dakika ${seconds} saniye`;
      } else {
        countdownText += `${seconds} saniye`;
      }
      countdownText += " sonra (Pazar 23:59)";
      
      setNextArchiveCountdown(countdownText);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Electron IPC listener - Tray'den "Tüm Verileri Temizle" modal açma
  useEffect(() => {
    const handleOpenDeleteAllModal = () => {
      setShowDeleteAllDataDialog(true);
    };

    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.on('open-delete-all-data-modal', handleOpenDeleteAllModal);
      
      return () => {
        window.electron.ipcRenderer.removeListener('open-delete-all-data-modal', handleOpenDeleteAllModal);
      };
    }
  }, []);

  // Son etkinlikler (son 10 öğe birleştirilmiş) - OPTIMIZED
  const recentActivities = useMemo(() => [
    ...questionLogs.slice(0, 5).map(log => ({
      type: 'question',
      title: `${log.exam_type} ${log.subject} - ${log.correct_count} doğru`,
      date: log.study_date,
      icon: Brain
    })),
    ...examResults.slice(0, 5).map(exam => ({
      type: 'exam',
      title: `${typeof (exam.display_name || exam.exam_name) === 'string' ? (exam.display_name || exam.exam_name) : 'Deneme'} - TYT: ${exam.tyt_net}`,
      date: exam.exam_date,
      icon: BarChart3
    })),
    ...tasks.filter(t => t.completed).slice(0, 5).map(task => ({
      type: 'task',
      title: task.title,
      date: task.createdAt || new Date().toISOString(),
      icon: Target
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8), [questionLogs, examResults, tasks]);


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
          
          {/* Çalışma Saati Ekle ve Arşiv Butonları */}
          <div className="mt-6 flex justify-center gap-4">
            <Button
              onClick={() => setShowStudyHoursModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-add-study-hours"
            >
              <Clock className="mr-2 h-5 w-5" />
              ⏱️ Çalıştığım Süreyi Ekle
            </Button>
            <Button
              onClick={() => setShowArchivedDataModal(true)}
              variant="outline"
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-view-archived"
            >
              <Archive className="mr-2 h-5 w-5" />
              📁 Arşivlenen Veriler
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
                <div className={`space-y-3 ${studyHours.length > 3 ? 'max-h-[20rem] overflow-y-auto custom-scrollbar pr-2' : ''}`}>
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
                            {sh.deleted && <span className="ml-2 text-xs text-red-500">(silinen)</span>}
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
                📈 Yıllık Aktivite Heatmap
              </CardTitle>
              <p className="text-sm text-purple-600/70 dark:text-purple-400/70 font-medium">1 Ocak {new Date().getFullYear()} - Bugün • Her gün için aktivite yoğunluğu</p>
            </CardHeader>
            <CardContent className="p-4">
              {/* Heatmap Container - Düzgün Boyut ve Boşluklar */}
              <div className="w-full">
                <div className="flex flex-col gap-2">
                  {/* Ay Etiketleri */}
                  <div className="flex gap-1 pl-10 relative h-5 mb-1">
                    {(() => {
                      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                      const currentMonth = new Date().getMonth();
                      
                      const monthsMap = new Map();
                      heatmapWeeks.forEach((week, weekIndex) => {
                        week.forEach((day) => {
                          if (day) {
                            if (!monthsMap.has(day.month)) {
                              monthsMap.set(day.month, { start: weekIndex, end: weekIndex });
                            } else {
                              monthsMap.get(day.month).end = weekIndex;
                            }
                          }
                        });
                      });
                      
                      return Array.from(monthsMap.entries())
                        .sort((a, b) => a[0] - b[0])
                        .map(([monthIdx, { start, end }]) => {
                          const weeks = end - start + 1;
                          const w = weeks * 28;
                          const centerPosition = start * 28 + (w * 0.35);
                          
                          return (
                            <div 
                              key={monthIdx}
                              className={`absolute text-xs font-semibold ${
                                monthIdx === currentMonth 
                                  ? 'text-purple-600 dark:text-purple-400 font-bold' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                              style={{ left: `${centerPosition}px` }}
                            >
                              {months[monthIdx]}
                            </div>
                          );
                        });
                    })()}
                  </div>
                  
                  {/* Heatmap Grid */}
                  <div className="flex gap-1">
                    {/* Gün İsimleri */}
                    <div className="flex flex-col gap-1 w-9 pr-1">
                      <div className="h-6 flex items-center justify-end text-[10px] font-medium text-gray-500 dark:text-gray-400">Pzt</div>
                      <div className="h-6 flex items-center justify-end text-[10px] font-medium text-gray-500 dark:text-gray-400">Sal</div>
                      <div className="h-6 flex items-center justify-end text-[10px] font-medium text-gray-500 dark:text-gray-400">Çar</div>
                      <div className="h-6 flex items-center justify-end text-[10px] font-medium text-gray-500 dark:text-gray-400">Per</div>
                      <div className="h-6 flex items-center justify-end text-[10px] font-medium text-gray-500 dark:text-gray-400">Cum</div>
                      <div className="h-6 flex items-center justify-end text-[10px] font-medium text-gray-500 dark:text-gray-400">Cmt</div>
                      <div className="h-6 flex items-center justify-end text-[10px] font-medium text-gray-500 dark:text-gray-400">Paz</div>
                    </div>
                    
                    {/* Heatmap Kutuları - Daha Büyük ve Rahat */}
                    <div className="flex gap-1">
                      {heatmapWeeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                          {week.map((day, dayIndex) => {
                            if (!day) {
                              return (
                                <div
                                  key={dayIndex}
                                  className="w-6 h-6 rounded-sm bg-transparent"
                                />
                              );
                            }
                            
                            // Aktivite sayısına göre renk belirleme (görevler, sorular, denemeler, çalışma saatleri)
                            const activityCount = day.count;
                            
                            // Mor ve pembe tonlarında renk gradyan sistemi - Aktivite sayısına göre renk belirleme
                            let bgColor = '';
                            
                            // Aktivite sayısına göre rengi belirle (1-3, 3-6, 6-9, 9-12, 12-15, 15-18, 18-21+)
                            if (activityCount === 0) {
                              bgColor = 'bg-gray-200/80 dark:bg-gray-800/80';
                            } else if (activityCount <= 3) {
                              // 1-3 aktivite - çok açık mor/pembe
                              bgColor = 'bg-purple-100 dark:bg-purple-900/40';
                            } else if (activityCount <= 6) {
                              // 3-6 aktivite - açık mor/pembe
                              bgColor = 'bg-purple-200 dark:bg-purple-800/60';
                            } else if (activityCount <= 9) {
                              // 6-9 aktivite - orta açık mor/pembe
                              bgColor = 'bg-purple-300 dark:bg-purple-700/80';
                            } else if (activityCount <= 12) {
                              // 9-12 aktivite - orta mor
                              bgColor = 'bg-purple-400 dark:bg-purple-600';
                            } else if (activityCount <= 15) {
                              // 12-15 aktivite - orta koyu mor
                              bgColor = 'bg-purple-500 dark:bg-purple-500';
                            } else if (activityCount <= 18) {
                              // 15-18 aktivite - koyu mor
                              bgColor = 'bg-purple-600 dark:bg-purple-400';
                            } else if (activityCount <= 21) {
                              // 18-21 aktivite - çok koyu mor
                              bgColor = 'bg-purple-700 dark:bg-purple-300';
                            } else {
                              // 21+ aktivite - en koyu mor/pembe
                              bgColor = 'bg-purple-800 dark:bg-purple-200';
                            }
                            
                            // BUGÜN ise ekstra parlak gölge efekti ekle (renk aktiviteye göre kalsın)
                            if (day.isToday) {
                              bgColor += ' shadow-lg shadow-purple-400/60 dark:shadow-purple-500/60';
                            }
                            
                            return (
                              <div
                                key={dayIndex}
                                className={`w-6 h-6 rounded-sm cursor-pointer transition-all duration-200 relative ${bgColor} ${
                                  day.isToday 
                                    ? 'ring-4 ring-purple-400 dark:ring-purple-300 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 z-20 scale-110' 
                                    : 'hover:scale-125 hover:z-10 hover:shadow-md'
                                } ${
                                  activityCount === 0 
                                    ? 'hover:bg-gray-300 dark:hover:bg-gray-700' 
                                    : ''
                                }`}
                                style={{
                                  animation: day.isToday ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, purpleGlow 2s ease-in-out infinite' : undefined
                                }}
                                onClick={() => handleHeatmapDayClick(day)}
                                data-testid={`heatmap-day-${day.date}`}
                              >
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Aktivite göstergesi - Renk Paleti */}
              <div className="flex flex-col gap-3 mt-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">Aktivite Seviyesi</span>
                </div>
                <div className="flex gap-2 items-center justify-center">
                  <span className="text-xs text-muted-foreground mr-1">Az</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/40 rounded-sm"></div>
                    <div className="w-4 h-4 bg-purple-200 dark:bg-purple-800/60 rounded-sm"></div>
                    <div className="w-4 h-4 bg-purple-300 dark:bg-purple-700/80 rounded-sm"></div>
                    <div className="w-4 h-4 bg-purple-400 dark:bg-purple-600 rounded-sm"></div>
                    <div className="w-4 h-4 bg-purple-500 dark:bg-purple-500 rounded-sm"></div>
                    <div className="w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-sm"></div>
                    <div className="w-4 h-4 bg-purple-700 dark:bg-purple-300 rounded-sm"></div>
                    <div className="w-4 h-4 bg-purple-800 dark:bg-purple-200 rounded-sm"></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">Çok</span>
                </div>
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
                  📊 Çözülmüş Sorular
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
                      onClick={() => setShowDeleteAllQuestionsDialog(true)}
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
                  {/* Özet İstatistikleri - İyileştirilmiş Tasarım */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Toplam Doğru */}
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-green-50/80 dark:from-green-950/40 dark:via-emerald-950/30 dark:to-green-950/40 border border-green-200/50 dark:border-green-700/40 p-3 hover:scale-105 transition-all duration-300 hover:shadow-lg">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-1.5 bg-green-100/80 dark:bg-green-900/40 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-1">
                          {allQuestionLogs.reduce((total, log) => total + parseInt(log.correct_count), 0)}
                        </div>
                        <div className="text-xs font-semibold text-green-700/80 dark:text-green-300/80">✓ Toplam Doğru</div>
                      </div>
                    </div>

                    {/* Toplam Yanlış */}
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50/80 via-rose-50/60 to-red-50/80 dark:from-red-950/40 dark:via-rose-950/30 dark:to-red-950/40 border border-red-200/50 dark:border-red-700/40 p-3 hover:scale-105 transition-all duration-300 hover:shadow-lg">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-1.5 bg-red-100/80 dark:bg-red-900/40 rounded-lg">
                            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-red-600 dark:text-red-400 mb-1">
                          {allQuestionLogs.reduce((total, log) => total + parseInt(log.wrong_count), 0)}
                        </div>
                        <div className="text-xs font-semibold text-red-700/80 dark:text-red-300/80">✗ Toplam Yanlış</div>
                      </div>
                    </div>

                    {/* Toplam Boş */}
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-amber-50/80 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-950/40 border border-amber-200/50 dark:border-amber-700/40 p-3 hover:scale-105 transition-all duration-300 hover:shadow-lg">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-1.5 bg-amber-100/80 dark:bg-amber-900/40 rounded-lg">
                            <Circle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mb-1">
                          {allQuestionLogs.reduce((total, log) => total + parseInt(log.blank_count || '0'), 0)}
                        </div>
                        <div className="text-xs font-semibold text-amber-700/80 dark:text-amber-300/80">○ Toplam Boş</div>
                      </div>
                    </div>
                  </div>

                  {/* Soru Kayıtları Listesi - Düzenleme/Silme ile - ARŞİVLİ VERİLER DAHİL */}
                  <div className="space-y-3">
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {allQuestionLogs.map((log, index) => (
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
                              <div className="text-xs flex items-center gap-2">
                                <span className="text-muted-foreground">{new Date(log.study_date).toLocaleDateString('tr-TR')}</span>
                                {log.time_spent_minutes && log.time_spent_minutes > 0 && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 rounded-full border border-emerald-200 dark:border-emerald-700">
                                    <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                      {Math.floor(log.time_spent_minutes / 60) > 0 && `${Math.floor(log.time_spent_minutes / 60)}s `}
                                      {log.time_spent_minutes % 60}dk
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteQuestionLogMutation.mutate(log.id)}
                              disabled={deleteQuestionLogMutation.isPending}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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

        {/* Kompakt Deneme Sonuçları */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Card className="border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/40 via-white/60 to-green-50/40 dark:from-emerald-950/30 dark:via-gray-900/60 dark:to-green-950/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Target className="h-5 w-5" />
                  🎯 Deneme Sonuçları
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowExamDialog(true)}
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    data-testid="button-add-exam-result"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Deneme Ekle
                  </Button>
                  {allExamResults.length > 0 && (
                    <Button 
                      onClick={() => setShowDeleteAllExamsDialog(true)}
                      size="sm" 
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                      disabled={deleteAllExamResultsMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {deleteAllExamResultsMutation.isPending ? 'Siliniyor...' : 'Sil'}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
            
            {allExamResults.length === 0 ? (
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
                {/* ARŞİVLİ VERİLER DAHİL - Tüm denemeler gösterilecek */}
                <div className="space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                  {allExamResults
                    .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())
                    .map((exam, index) => {
                  // Sınav türünü ve ilgili net puanı öğrenin
                  const examType = exam.exam_type || (parseFloat(exam.ayt_net) > 0 ? 'AYT' : 'TYT');
                  const relevantNet = examType === 'TYT' ? parseFloat(exam.tyt_net) || 0 : parseFloat(exam.ayt_net) || 0;
                  
                  // Sınav türünü ve ilgili net puanı alınBu sınav türü için sınav numarasını hesaplayın
                  const sameTypeExams = allExamResults
                    .filter(e => (e.exam_type || (parseFloat(e.ayt_net) > 0 ? 'AYT' : 'TYT')) === examType)
                    .sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
                  const examNumber = sameTypeExams.findIndex(e => e.id === exam.id) + 1;
                  
                  // İlgili net puana dayalı performans emojisi
                  const getPerformanceEmoji = (net: number, type: string, examScope?: string, selectedSubject?: string) => {
                    let maxQuestions = type === 'TYT' ? 120 : 80;
                    
                    // Branş denemesi ise o dersin max soru sayısını al
                    if (examScope === 'branch' && selectedSubject) {
                      const subjectLimits: {[key: string]: {TYT?: number, AYT?: number}} = {
                        turkce: { TYT: 40 },
                        sosyal: { TYT: 20 },
                        matematik: { TYT: 30, AYT: 30 },
                        geometri: { TYT: 10, AYT: 10 },
                        fen: { TYT: 20 },
                        fizik: { TYT: 7, AYT: 14 },
                        kimya: { TYT: 7, AYT: 13 },
                        biyoloji: { TYT: 6, AYT: 13 }
                      };
                      maxQuestions = subjectLimits[selectedSubject]?.[type as 'TYT' | 'AYT'] || maxQuestions;
                    }
                    
                    // Yüzde hesapla
                    const percentage = (net / maxQuestions) * 100;
                    
                    if (percentage >= 75) return '😎'; // çok iyi
                    if (percentage >= 58) return '🙂'; // iyi
                    if (percentage >= 42) return '😐'; // orta
                    return '😓'; // zayıf
                  };
                  
                  const examEmoji = getPerformanceEmoji(relevantNet, examType, exam.exam_scope, exam.selected_subject);
                  
                  // Performans göstergelerini hesaplayın
                  const isRecentExam = new Date(exam.exam_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  const examDate = new Date(exam.exam_date);
                  const daysSinceExam = Math.floor((Date.now() - examDate.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Card key={exam.id} className="group bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-200 border-emerald-200/60 dark:border-emerald-700/50 relative overflow-hidden">
                      
                      <CardContent className="p-4 relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <span className="text-2xl">{examEmoji}</span>
                              </div>
                              {relevantNet >= (examType === 'TYT' ? 90 : 50) && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <span className="text-xs">⭐</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                                {typeof (exam.display_name || exam.exam_name) === 'string' 
                                  ? (exam.display_name || exam.exam_name) 
                                  : 'Deneme'} • {examDate.toLocaleDateString('tr-TR', { 
                                  day: 'numeric', 
                                  month: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground">
                                  {daysSinceExam === 0 ? 'Bugün' : `${daysSinceExam} gün önce`}
                                </span>
                                {exam.time_spent_minutes && exam.time_spent_minutes > 0 && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 rounded-full border border-cyan-200 dark:border-cyan-700">
                                    <Clock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                                    <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                                      {Math.floor(exam.time_spent_minutes / 60) > 0 && `${Math.floor(exam.time_spent_minutes / 60)}s `}
                                      {exam.time_spent_minutes % 60}dk
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                              <div className="flex items-center justify-center gap-1.5 mb-1">
                                <div className={`w-2 h-2 rounded-full ${examType === 'TYT' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                <span className={`text-xs font-bold ${examType === 'TYT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                  {examType}
                                </span>
                              </div>
                              <div className={`text-2xl font-bold ${examType === 'TYT' ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'}`}>
                                {relevantNet.toFixed(2)}
                              </div>
                              <div className={`text-xs ${examType === 'TYT' ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-blue-600/70 dark:text-blue-400/70'}`}>
                                / {(() => {
                                  // Branş denemesi ise belirli dersin soru sayısını göster
                                  if (exam.exam_scope === 'branch' && exam.selected_subject) {
                                    const subjectLimits: {[key: string]: {TYT?: number, AYT?: number}} = {
                                      turkce: { TYT: 40 },
                                      sosyal: { TYT: 20 },
                                      matematik: { TYT: 30, AYT: 30 },
                                      geometri: { TYT: 10, AYT: 10 },
                                      fen: { TYT: 20 },
                                      fizik: { TYT: 7, AYT: 14 },
                                      kimya: { TYT: 7, AYT: 13 },
                                      biyoloji: { TYT: 6, AYT: 13 }
                                    };
                                    return subjectLimits[exam.selected_subject]?.[examType as 'TYT' | 'AYT'] || '?';
                                  }
                                  // Tam deneme ise standart soru sayısını göster
                                  return examType === 'TYT' ? '120' : '80';
                                })()} soruluk
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedExams);
                                  if (newExpanded.has(exam.id)) {
                                    newExpanded.delete(exam.id);
                                  } else {
                                    newExpanded.add(exam.id);
                                  }
                                  setExpandedExams(newExpanded);
                                }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingExam(exam);
                                  setNewExamResult({
                                    exam_name: exam.exam_name || exam.display_name || "",
                                    display_name: exam.display_name || exam.exam_name || "",
                                    exam_date: exam.exam_date.split('T')[0],
                                    tyt_net: exam.tyt_net || "",
                                    ayt_net: exam.ayt_net || "",
                                    exam_type: exam.exam_type || "TYT",
                                    exam_scope: exam.exam_scope || "full",
                                    selected_subject: exam.selected_subject || undefined,
                                    time_spent_minutes: (exam.time_spent_minutes || 0).toString(),
                                    subjects_data: exam.subjects_data || ""
                                  });
                                  setShowExamDialog(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteExamResultMutation.mutate(exam.id)}
                                disabled={deleteExamResultMutation.isPending}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Konu Ayrıntıları Bölümü - COLLAPSED by default */}
                        {expandedExams.has(exam.id) && exam.subjects_data && (() => {
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
                              {examDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Award className="h-4 w-4" />
                            <span>{exam.display_name || exam.exam_name}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                </div>
              </div>
            )}
            </CardContent>
          </Card>
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
                  {new Date(selectedHeatmapDay.date + 'T12:00:00').toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    timeZone: 'Europe/Istanbul'
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
                          <span className="font-medium">
                            {question.exam_type} - {question.subject}
                            {question.deleted && <span className="ml-2 text-xs text-red-500">(silinen)</span>}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {question.correct_count}D {question.wrong_count}Y {question.blank_count || 0}B
                          </div>
                        </div>
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
                        <div className="font-medium">
                          {task.title}
                          {task.archived && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">(arşivlendi)</span>}
                          {task.deleted && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">(silindi)</span>}
                        </div>
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
                          <span className="font-medium">
                            {exam.display_name || exam.exam_name}
                            {exam.deleted && <span className="ml-2 text-xs text-red-500">(silinen)</span>}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {exam.exam_type === 'TYT' ? (
                              `TYT: ${exam.tyt_net}`
                            ) : exam.exam_type === 'AYT' ? (
                              `AYT: ${exam.ayt_net}`
                            ) : (
                              // Exam_type yoksa netlere göre karar ver
                              parseFloat(exam.tyt_net) > 0 && parseFloat(exam.ayt_net) > 0 ? (
                                `TYT: ${exam.tyt_net} • AYT: ${exam.ayt_net}`
                              ) : parseFloat(exam.tyt_net) > 0 ? (
                                `TYT: ${exam.tyt_net}`
                              ) : (
                                `AYT: ${exam.ayt_net}`
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aktivite yok mesajı - sadece gerçekten hiçbir aktivite yoksa göster */}
              {selectedHeatmapDay.dayActivities.questions.length === 0 && 
               selectedHeatmapDay.dayActivities.tasks.length === 0 && 
               selectedHeatmapDay.dayActivities.exams.length === 0 && 
               (!selectedHeatmapDay.dayActivities.studyHours || selectedHeatmapDay.dayActivities.studyHours.length === 0) && (
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
                  onChange={(e) => {
                    const maxLimit = SUBJECT_LIMITS[newQuestion.exam_type]?.[newQuestion.subject] || 100;
                    const inputValue = parseInt(e.target.value) || 0;
                    const currentWrong = parseInt(newQuestion.wrong_count) || 0;
                    const currentBlank = parseInt(newQuestion.blank_count) || 0;
                    const remaining = maxLimit - currentWrong - currentBlank;
                    const value = Math.min(Math.max(0, inputValue), remaining);
                    setNewQuestion({...newQuestion, correct_count: value.toString()});
                  }}
                  placeholder="0"
                  min="0"
                  max={SUBJECT_LIMITS[newQuestion.exam_type]?.[newQuestion.subject] || 100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yanlış</label>
                <Input
                  type="number"
                  value={newQuestion.wrong_count}
                  onChange={(e) => {
                    const maxLimit = SUBJECT_LIMITS[newQuestion.exam_type]?.[newQuestion.subject] || 100;
                    const inputValue = parseInt(e.target.value) || 0;
                    const currentCorrect = parseInt(newQuestion.correct_count) || 0;
                    const currentBlank = parseInt(newQuestion.blank_count) || 0;
                    const remaining = maxLimit - currentCorrect - currentBlank;
                    const value = Math.min(Math.max(0, inputValue), remaining);
                    setNewQuestion({...newQuestion, wrong_count: value.toString()});
                  }}
                  placeholder="0"
                  min="0"
                  max={SUBJECT_LIMITS[newQuestion.exam_type]?.[newQuestion.subject] || 100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Boş</label>
                <Input
                  type="number"
                  value={newQuestion.blank_count}
                  onChange={(e) => {
                    const maxLimit = SUBJECT_LIMITS[newQuestion.exam_type]?.[newQuestion.subject] || 100;
                    const inputValue = parseInt(e.target.value) || 0;
                    const currentCorrect = parseInt(newQuestion.correct_count) || 0;
                    const currentWrong = parseInt(newQuestion.wrong_count) || 0;
                    const remaining = maxLimit - currentCorrect - currentWrong;
                    const value = Math.min(Math.max(0, inputValue), remaining);
                    setNewQuestion({...newQuestion, blank_count: value.toString()});
                  }}
                  placeholder="0"
                  min="0"
                  max={SUBJECT_LIMITS[newQuestion.exam_type]?.[newQuestion.subject] || 100}
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
                  onChange={(e) => {
                    const value = e.target.value.replace(/^0+(?=\d)/, '');
                    setNewQuestion({...newQuestion, time_spent_minutes: value});
                  }}
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
                  // Doğru + Yanlış + Boş toplamı kontrolü
                  const maxLimit = SUBJECT_LIMITS[newQuestion.exam_type]?.[newQuestion.subject] || 100;
                  const totalAnswered = (parseInt(newQuestion.correct_count) || 0) + (parseInt(newQuestion.wrong_count) || 0) + (parseInt(newQuestion.blank_count) || 0);
                  
                  if (totalAnswered > maxLimit) {
                    toast({
                      title: "⚠️ Uyarı",
                      description: `Doğru + Yanlış + Boş toplamı (${totalAnswered}) maksimum soru sayısını (${maxLimit}) aşamaz!`,
                      variant: "destructive"
                    });
                    return;
                  }

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
      <Dialog open={showExamDialog} onOpenChange={(open) => {
        setShowExamDialog(open);
        if (!open) {
          setEditingExam(null);
          setNewExamResult({ 
            exam_name: "", 
            display_name: "",
            exam_date: new Date().toISOString().split('T')[0], 
            exam_type: "TYT" as "TYT" | "AYT",
            examScope: "full" as "full" | "branch",
            selectedSubject: "turkce" as string,
            wrongTopicsText: "",
            time_spent_minutes: "",
            subjects: {
              turkce: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
              matematik: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
              sosyal: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
              fen: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
              fizik: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
              kimya: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
              biyoloji: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' },
              geometri: { correct: "", wrong: "", blank: "", wrong_topics: [], selectedDifficulty: 'kolay' as 'kolay' | 'orta' | 'zor', selectedCategory: 'kavram' as 'kavram' | 'hesaplama' | 'analiz' | 'dikkatsizlik' }
            }
          });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editingExam ? "Deneme Düzenle" : "Yeni Deneme Sonucu"}</DialogTitle>
            <DialogDescription>
              {editingExam ? "Deneme adı ve süresini düzenleyin." : "Deneme sınav sonuçlarınızı girin ve net analizinizi takip edin."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingExam && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tarih</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {newExamResult.exam_date ? new Date(newExamResult.exam_date).toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        }) : "Tarih seçin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newExamResult.exam_date ? new Date(newExamResult.exam_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setNewExamResult({
                              ...newExamResult, 
                              exam_date: date.toLocaleDateString('en-CA')
                            });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Süre (dakika)</label>
                  <Input
                    type="number"
                    value={newExamResult.time_spent_minutes}
                    onChange={(e) => {
                      const value = e.target.value.replace(/^0+(?=\d)/, '');
                      setNewExamResult({...newExamResult, time_spent_minutes: value});
                    }}
                    placeholder="120"
                    min="0"
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            )}
            
            {editingExam && (
              <div>
                <label className="block text-sm font-medium mb-1">Süre (dakika)</label>
                <Input
                  type="number"
                  value={newExamResult.time_spent_minutes}
                  onChange={(e) => setNewExamResult({...newExamResult, time_spent_minutes: e.target.value})}
                  placeholder="120"
                  min="0"
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Deneme İsmi {!editingExam && "(Opsiyonel)"}
              </label>
              <Input
                type="text"
                placeholder="Örn: Ocak Ayı 1. Deneme, Hızlı Matematik Denemesi"
                value={newExamResult.display_name}
                onChange={(e) => setNewExamResult({...newExamResult, display_name: e.target.value})}
                className="bg-white dark:bg-gray-800"
              />
              {!editingExam && (
                <p className="text-xs text-muted-foreground mt-1">
                  Boş bırakırsanız otomatik isim oluşturulacak
                </p>
              )}
            </div>

            {!editingExam && (
              <>
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
                      <SelectItem value="full">Genel Deneme</SelectItem>
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
                      {newExamResult.exam_type === "TYT" ? (
                        <>
                          <SelectItem value="turkce">Türkçe</SelectItem>
                          <SelectItem value="sosyal">Sosyal Bilimler</SelectItem>
                          <SelectItem value="matematik">Matematik</SelectItem>
                          <SelectItem value="geometri">Geometri</SelectItem>
                          <SelectItem value="fizik">Fizik</SelectItem>
                          <SelectItem value="kimya">Kimya</SelectItem>
                          <SelectItem value="biyoloji">Biyoloji</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="matematik">Matematik</SelectItem>
                          <SelectItem value="geometri">Geometri</SelectItem>
                          <SelectItem value="fizik">Fizik</SelectItem>
                          <SelectItem value="kimya">Kimya</SelectItem>
                          <SelectItem value="biyoloji">Biyoloji</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Doğru Yanlış Boş */}
                {(() => {
                  // Branş deneme soru limitleri
                  const getMaxQuestions = (subject: string, examType: string) => {
                    const limits: {[key: string]: {TYT?: number, AYT?: number}} = {
                      turkce: { TYT: 40 },
                      sosyal: { TYT: 20 },
                      matematik: { TYT: 30, AYT: 30 },
                      geometri: { TYT: 10, AYT: 10 },
                      fen: { TYT: 20 },
                      fizik: { TYT: 7, AYT: 14 },
                      kimya: { TYT: 7, AYT: 13 },
                      biyoloji: { TYT: 6, AYT: 13 }
                    };
                    return limits[subject]?.[examType as 'TYT' | 'AYT'] || 100;
                  };

                  const maxQuestions = getMaxQuestions(newExamResult.selectedSubject, newExamResult.exam_type);
                  const currentCorrect = parseInt(newExamResult.subjects[newExamResult.selectedSubject]?.correct || "0");
                  const currentWrong = parseInt(newExamResult.subjects[newExamResult.selectedSubject]?.wrong || "0");
                  const currentBlank = parseInt(newExamResult.subjects[newExamResult.selectedSubject]?.blank || "0");
                  const totalAnswered = currentCorrect + currentWrong + currentBlank;

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          📝 Soru Girişi
                        </span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                          {totalAnswered} / {maxQuestions} soru
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Doğru</label>
                          <Input
                            type="number"
                            min="0"
                            max={maxQuestions}
                            value={newExamResult.subjects[newExamResult.selectedSubject]?.correct || ""}
                            onChange={(e) => {
                              const inputValue = parseInt(e.target.value) || 0;
                              const remaining = maxQuestions - currentWrong - currentBlank;
                              const value = Math.min(Math.max(0, inputValue), remaining);
                              setNewExamResult({
                                ...newExamResult,
                                subjects: {
                                  ...newExamResult.subjects,
                                  [newExamResult.selectedSubject]: { 
                                    ...newExamResult.subjects[newExamResult.selectedSubject], 
                                    correct: value.toString()
                                  }
                                }
                              });
                            }}
                            placeholder="Doğru sayısı"
                            data-testid="input-branch-correct"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Yanlış</label>
                          <Input
                            type="number"
                            min="0"
                            max={maxQuestions}
                            value={newExamResult.subjects[newExamResult.selectedSubject]?.wrong || ""}
                            onChange={(e) => {
                              const inputValue = parseInt(e.target.value) || 0;
                              const remaining = maxQuestions - currentCorrect - currentBlank;
                              const value = Math.min(Math.max(0, inputValue), remaining);
                              setNewExamResult({
                                ...newExamResult,
                                subjects: {
                                  ...newExamResult.subjects,
                                  [newExamResult.selectedSubject]: { 
                                    ...newExamResult.subjects[newExamResult.selectedSubject], 
                                    wrong: value.toString()
                                  }
                                }
                              });
                            }}
                            placeholder="Yanlış sayısı"
                            data-testid="input-branch-wrong"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Boş</label>
                          <Input
                            type="number"
                            min="0"
                            max={maxQuestions}
                            value={newExamResult.subjects[newExamResult.selectedSubject]?.blank || ""}
                            onChange={(e) => {
                              const inputValue = parseInt(e.target.value) || 0;
                              const remaining = maxQuestions - currentCorrect - currentWrong;
                              const value = Math.min(Math.max(0, inputValue), remaining);
                              setNewExamResult({
                                ...newExamResult,
                                subjects: {
                                  ...newExamResult.subjects,
                                  [newExamResult.selectedSubject]: { 
                                    ...newExamResult.subjects[newExamResult.selectedSubject], 
                                    blank: value.toString()
                                  }
                                }
                              });
                            }}
                            placeholder="Boş sayısı"
                            data-testid="input-branch-blank"
                          />
                        </div>
                      </div>
                      {totalAnswered > maxQuestions && (
                        <div className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700/40">
                          <span className="text-xs text-red-700 dark:text-red-300">
                            ⚠️ Toplam soru sayısı {maxQuestions}'i geçemez!
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Yanlış Konular - Geliştirilmiş Önizleme ile */}
                {(() => {
                  const subjectColors: {[key: string]: {bg: string; border: string; text: string; icon: string; badge: string; input: string}} = {
                    turkce: {
                      bg: "from-green-50/80 via-white/60 to-emerald-50/60 dark:from-green-950/30 dark:via-gray-800/60 dark:to-emerald-950/30",
                      border: "border-green-200/50 dark:border-green-700/40",
                      text: "text-green-800 dark:text-green-200",
                      icon: "from-green-500 to-green-600",
                      badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
                      input: "border-green-300/60 dark:border-green-600/50 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800/50"
                    },
                    matematik: {
                      bg: "from-blue-50/80 via-white/60 to-cyan-50/60 dark:from-blue-950/30 dark:via-gray-800/60 dark:to-cyan-950/30",
                      border: "border-blue-200/50 dark:border-blue-700/40",
                      text: "text-blue-800 dark:text-blue-200",
                      icon: "from-blue-500 to-blue-600",
                      badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
                      input: "border-blue-300/60 dark:border-blue-600/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800/50"
                    },
                    fizik: {
                      bg: "from-indigo-50/80 via-white/60 to-purple-50/60 dark:from-indigo-950/30 dark:via-gray-800/60 dark:to-purple-950/30",
                      border: "border-indigo-200/50 dark:border-indigo-700/40",
                      text: "text-indigo-800 dark:text-indigo-200",
                      icon: "from-indigo-500 to-indigo-600",
                      badge: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
                      input: "border-indigo-300/60 dark:border-indigo-600/50 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800/50"
                    },
                    kimya: {
                      bg: "from-emerald-50/80 via-white/60 to-green-50/60 dark:from-emerald-950/30 dark:via-gray-800/60 dark:to-green-950/30",
                      border: "border-emerald-200/50 dark:border-emerald-700/40",
                      text: "text-emerald-800 dark:text-emerald-200",
                      icon: "from-emerald-500 to-emerald-600",
                      badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
                      input: "border-emerald-300/60 dark:border-emerald-600/50 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800/50"
                    },
                    biyoloji: {
                      bg: "from-teal-50/80 via-white/60 to-cyan-50/60 dark:from-teal-950/30 dark:via-gray-800/60 dark:to-cyan-950/30",
                      border: "border-teal-200/50 dark:border-teal-700/40",
                      text: "text-teal-800 dark:text-teal-200",
                      icon: "from-teal-500 to-teal-600",
                      badge: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
                      input: "border-teal-300/60 dark:border-teal-600/50 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800/50"
                    },
                    sosyal: {
                      bg: "from-amber-50/80 via-white/60 to-yellow-50/60 dark:from-amber-950/30 dark:via-gray-800/60 dark:to-yellow-950/30",
                      border: "border-amber-200/50 dark:border-amber-700/40",
                      text: "text-amber-800 dark:text-amber-200",
                      icon: "from-amber-500 to-amber-600",
                      badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
                      input: "border-amber-300/60 dark:border-amber-600/50 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800/50"
                    },
                    fen: {
                      bg: "from-purple-50/80 via-white/60 to-pink-50/60 dark:from-purple-950/30 dark:via-gray-800/60 dark:to-pink-950/30",
                      border: "border-purple-200/50 dark:border-purple-700/40",
                      text: "text-purple-800 dark:text-purple-200",
                      icon: "from-purple-500 to-purple-600",
                      badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
                      input: "border-purple-300/60 dark:border-purple-600/50 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800/50"
                    },
                    geometri: {
                      bg: "from-pink-50/80 via-white/60 to-rose-50/60 dark:from-pink-950/30 dark:via-gray-800/60 dark:to-rose-950/30",
                      border: "border-pink-200/50 dark:border-pink-700/40",
                      text: "text-pink-800 dark:text-pink-200",
                      icon: "from-pink-500 to-pink-600",
                      badge: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
                      input: "border-pink-300/60 dark:border-pink-600/50 focus:border-pink-500 dark:focus:border-pink-400 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800/50"
                    }
                  };

                  const subjectExamples: {[key: string]: string} = {
                    turkce: "Örnek: cümle çözümleme, sözcük türleri, yazım kuralları, anlatım bozuklukları...",
                    matematik: "Örnek: türev, integral, logaritma, fonksiyonlar, diziler...",
                    fizik: "Örnek: hareket, kuvvet, enerji, elektrik, manyetizma...",
                    kimya: "Örnek: mol kavramı, kimyasal bağlar, asit-baz, elektrokimya...",
                    biyoloji: "Örnek: hücre, kalıtım, ekosistem, sinir sistemi, fotosentez...",
                    sosyal: "Örnek: Osmanlı tarihi, coğrafya, felsefe, Atatürk ilkeleri...",
                    fen: "Örnek: madde ve özellikleri, ışık, ses, basınç, ekosistem...",
                    geometri: "Örnek: üçgenler, dörtgenler, çember, analitik geometri, trigonometri..."
                  };

                  const selectedSubject = newExamResult.selectedSubject;
                  const colors = subjectColors[selectedSubject] || subjectColors.turkce;
                  const placeholder = subjectExamples[selectedSubject] || subjectExamples.turkce;

                  return (
                    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-5 border-2 ${colors.border} shadow-lg backdrop-blur-sm`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 bg-gradient-to-br ${colors.icon} rounded-xl shadow-lg`}>
                          <Search className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <label className={`text-sm font-bold ${colors.text} flex items-center gap-2`}>
                            🔍 Yanlış Konu Analizi
                            {parseInt(newExamResult.subjects[newExamResult.selectedSubject]?.wrong) > 0 && (
                              <div className={`text-xs ${colors.badge} px-2 py-1 rounded-full`}>
                                {parseInt(newExamResult.subjects[newExamResult.selectedSubject]?.wrong)} yanlış
                              </div>
                            )}
                          </label>
                          <p className={`text-xs ${colors.text} opacity-80 mt-1`}>
                            Eksik konuları belirterek öncelik listesine ekleyin
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Textarea
                          value={newExamResult.wrongTopicsText}
                          onChange={(e) => setNewExamResult({...newExamResult, wrongTopicsText: e.target.value})}
                          placeholder={placeholder}
                          className={`h-20 bg-white/90 dark:bg-gray-800/90 ${colors.input} rounded-xl shadow-sm`}
                          data-testid="textarea-branch-wrong-topics"
                        />
                        <p className="text-xs text-gray-500/80 dark:text-gray-400/80">Virgülle ayırarak birden fazla konu girebilirsiniz</p>
                    
                        {newExamResult.wrongTopicsText && newExamResult.wrongTopicsText.trim() && (
                          <div className="flex items-center gap-2 p-3 bg-red-100/60 dark:bg-red-900/30 rounded-xl border border-red-200/60 dark:border-red-700/40">
                            <Lightbulb className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <div className="text-xs text-red-700/90 dark:text-red-300/90">
                              <strong>{newExamResult.wrongTopicsText.split(',').filter(t => t.trim()).length} konu</strong> öncelik listesine eklenecek ve hata sıklığı analizinde gösterilecek
                            </div>
                          </div>
                        )}
                        
                        {newExamResult.wrongTopicsText && newExamResult.wrongTopicsText.trim() && (
                          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 border border-purple-200/60 dark:border-purple-700/40">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-purple-500 rounded-lg">
                                <FileText className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Konu Önizlemesi</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {newExamResult.wrongTopicsText.split(',').filter(t => t.trim()).map((topic, index) => (
                                <div key={index} className="px-3 py-1.5 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-lg border border-purple-200 dark:border-purple-700 text-xs font-medium text-purple-800 dark:text-purple-200 shadow-sm">
                                  {topic.trim()}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
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
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.turkce.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.turkce.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Türkçe'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              turkce: { ...newExamResult.subjects.turkce, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.turkce.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.turkce.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.turkce.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Türkçe'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              turkce: { ...newExamResult.subjects.turkce, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="40"
                        value={newExamResult.subjects.turkce.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.turkce.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.turkce.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Türkçe'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              turkce: { ...newExamResult.subjects.turkce, blank: limitedValue.toString() }
                            }
                          });
                        }}
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
                            const topics = e.target.value.split(',').map(t => toTitleCase(t.trim())).filter(t => t.length > 0);
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
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.sosyal.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.sosyal.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Sosyal Bilimler'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              sosyal: { ...newExamResult.subjects.sosyal, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.sosyal.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.sosyal.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.sosyal.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Sosyal Bilimler'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              sosyal: { ...newExamResult.subjects.sosyal, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.sosyal.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.sosyal.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.sosyal.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Sosyal Bilimler'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              sosyal: { ...newExamResult.subjects.sosyal, blank: limitedValue.toString() }
                            }
                          });
                        }}
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
                            const topics = e.target.value.split(',').map(t => toTitleCase(t.trim())).filter(t => t.length > 0);
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
                {/* Matematik */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-blue-600">Matematik</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        value={newExamResult.subjects.matematik.correct}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.matematik.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.matematik.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Matematik'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              matematik: { ...newExamResult.subjects.matematik, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        value={newExamResult.subjects.matematik.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.matematik.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.matematik.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Matematik'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              matematik: { ...newExamResult.subjects.matematik, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        value={newExamResult.subjects.matematik.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.matematik.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.matematik.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Matematik'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              matematik: { ...newExamResult.subjects.matematik, blank: limitedValue.toString() }
                            }
                          });
                        }}
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
                            const topics = e.target.value.split(',').map(t => toTitleCase(t.trim())).filter(t => t.length > 0);
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
                {/* TYT Geometri */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-pink-600">Geometri</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={newExamResult.subjects.geometri.correct}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
                          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.geometri.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.geometri.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Geometri'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              geometri: { ...newExamResult.subjects.geometri, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={newExamResult.subjects.geometri.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
                          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.geometri.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.geometri.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Geometri'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              geometri: { ...newExamResult.subjects.geometri, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={newExamResult.subjects.geometri.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
                          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.geometri.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.geometri.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Geometri'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              geometri: { ...newExamResult.subjects.geometri, blank: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.geometri.wrong) > 0 && (
                    <div className="bg-gradient-to-br from-pink-50/80 via-white/60 to-rose-50/60 dark:from-pink-950/30 dark:via-gray-800/60 dark:to-rose-950/30 rounded-2xl p-5 border-2 border-pink-200/50 dark:border-pink-700/40 shadow-lg backdrop-blur-sm mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                          <Search className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-pink-800 dark:text-pink-200 flex items-center gap-2">
                            🔍 Geometri Yanlış Konu Analizi
                            <div className="text-xs bg-pink-100 dark:bg-pink-900/40 px-2 py-1 rounded-full text-pink-700 dark:text-pink-300">
                              {parseInt(newExamResult.subjects.geometri.wrong)} yanlış
                            </div>
                          </label>
                          <p className="text-xs text-pink-600/80 dark:text-pink-400/80 mt-1">
                            Eksik konuları belirterek öncelik listesine ekleyin
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          value={currentWrongTopics.geometri || ""}
                          onChange={(e) => {
                            setCurrentWrongTopics({...currentWrongTopics, geometri: e.target.value});
                            const topics = e.target.value.split(',').map(t => toTitleCase(t.trim())).filter(t => t.length > 0);
                            const uniqueTopics = [...new Set(topics)];
                            setNewExamResult({
                              ...newExamResult,
                              subjects: {
                                ...newExamResult.subjects,
                                geometri: { ...newExamResult.subjects.geometri, wrong_topics: uniqueTopics }
                              }
                            });
                          }}
                          placeholder="Örnek: üçgenler, dörtgenler, çember, trigonometri..."
                          className="bg-white/90 dark:bg-gray-800/90 border-pink-300/60 dark:border-pink-600/50 focus:border-pink-500 dark:focus:border-pink-400 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800/50 rounded-xl shadow-sm text-sm"
                        />
                        {currentWrongTopics.geometri && (
                          <div className="flex items-center gap-2 p-3 bg-pink-100/60 dark:bg-pink-900/30 rounded-xl border border-pink-200/60 dark:border-pink-700/40">
                            <Lightbulb className="h-4 w-4 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                            <div className="text-xs text-pink-700/90 dark:text-pink-300/90">
                              <strong>{currentWrongTopics.geometri.split(',').length} konu</strong> öncelik listesine eklenecek ve hata sıklığı analizinde gösterilecek
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
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.fen.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.fen.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Fen Bilimleri'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              fen: { ...newExamResult.subjects.fen, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.fen.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.fen.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.fen.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Fen Bilimleri'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              fen: { ...newExamResult.subjects.fen, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={newExamResult.subjects.fen.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.fen.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.fen.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.TYT['Fen Bilimleri'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              fen: { ...newExamResult.subjects.fen, blank: limitedValue.toString() }
                            }
                          });
                        }}
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
                        max="30"
                        value={newExamResult.subjects.matematik.correct}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.matematik.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.matematik.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Matematik'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              matematik: { ...newExamResult.subjects.matematik, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        value={newExamResult.subjects.matematik.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.matematik.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.matematik.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Matematik'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              matematik: { ...newExamResult.subjects.matematik, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        value={newExamResult.subjects.matematik.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.matematik.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.matematik.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Matematik'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              matematik: { ...newExamResult.subjects.matematik, blank: limitedValue.toString() }
                            }
                          });
                        }}
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
                          const uniqueTopics = [...new Set(topics)];
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              matematik: { ...newExamResult.subjects.matematik, wrong_topics: uniqueTopics }
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

                {/* AYT Geometri */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-pink-600">Geometri</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Doğru</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={newExamResult.subjects.geometri.correct}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.geometri.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.geometri.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Geometri'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              geometri: { ...newExamResult.subjects.geometri, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={newExamResult.subjects.geometri.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.geometri.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.geometri.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Geometri'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              geometri: { ...newExamResult.subjects.geometri, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={newExamResult.subjects.geometri.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.geometri.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.geometri.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Geometri'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              geometri: { ...newExamResult.subjects.geometri, blank: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                  {parseInt(newExamResult.subjects.geometri.wrong) > 0 && (
                    <div className="bg-gradient-to-r from-pink-50/70 to-rose-50/50 dark:from-pink-900/20 dark:to-rose-900/15 rounded-xl p-4 border border-pink-200/40 dark:border-pink-700/30 mt-3">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-pink-500" />
                        <label className="text-sm font-semibold text-pink-700 dark:text-pink-300">🔍 Geometri Eksik Konular</label>
                      </div>
                      <Input
                        value={currentWrongTopics.geometri || ""}
                        onChange={(e) => {
                          setCurrentWrongTopics({...currentWrongTopics, geometri: e.target.value});
                          const topics = e.target.value.split(',').map(t => toTitleCase(t.trim())).filter(t => t.length > 0);
                          const uniqueTopics = [...new Set(topics)];
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              geometri: { ...newExamResult.subjects.geometri, wrong_topics: uniqueTopics }
                            }
                          });
                        }}
                        placeholder="konu1, konu2, konu3 şeklinde virgülle ayırarak yazın..."
                        className="bg-white/80 dark:bg-gray-800/80 border-pink-200 dark:border-pink-700/50 focus:border-pink-400 dark:focus:border-pink-500 rounded-xl shadow-sm"
                      />
                      {currentWrongTopics.geometri && (
                        <div className="mt-2 text-xs text-pink-600/70 dark:text-pink-400/70">
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
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.fizik.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.fizik.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Fizik'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              fizik: { ...newExamResult.subjects.fizik, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="14"
                        value={newExamResult.subjects.fizik.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.fizik.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.fizik.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Fizik'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              fizik: { ...newExamResult.subjects.fizik, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="14"
                        value={newExamResult.subjects.fizik.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.fizik.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.fizik.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Fizik'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              fizik: { ...newExamResult.subjects.fizik, blank: limitedValue.toString() }
                            }
                          });
                        }}
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
                          const topics = e.target.value.split(',').map(t => toTitleCase(t.trim())).filter(t => t.length > 0);
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
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.kimya.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.kimya.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Kimya'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              kimya: { ...newExamResult.subjects.kimya, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.kimya.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.kimya.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.kimya.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Kimya'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              kimya: { ...newExamResult.subjects.kimya, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.kimya.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.kimya.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.kimya.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Kimya'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              kimya: { ...newExamResult.subjects.kimya, blank: limitedValue.toString() }
                            }
                          });
                        }}
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
                          const topics = e.target.value.split(',').map(t => toTitleCase(t.trim())).filter(t => t.length > 0);
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
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const wrong = parseInt(newExamResult.subjects.biyoloji.wrong) || 0;
                          const blank = parseInt(newExamResult.subjects.biyoloji.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Biyoloji'] - wrong - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              biyoloji: { ...newExamResult.subjects.biyoloji, correct: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Yanlış</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.biyoloji.wrong}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.biyoloji.correct) || 0;
                          const blank = parseInt(newExamResult.subjects.biyoloji.blank) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Biyoloji'] - correct - blank;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              biyoloji: { ...newExamResult.subjects.biyoloji, wrong: limitedValue.toString() }
                            }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Boş</label>
                      <Input
                        type="number"
                        min="0"
                        max="13"
                        value={newExamResult.subjects.biyoloji.blank}
                        onChange={(e) => {
                          const cleanedValue = cleanNumberInput(e.target.value);
          const value = parseInt(cleanedValue) || 0;
                          const correct = parseInt(newExamResult.subjects.biyoloji.correct) || 0;
                          const wrong = parseInt(newExamResult.subjects.biyoloji.wrong) || 0;
                          const maxAllowed = SUBJECT_LIMITS.AYT['Biyoloji'] - correct - wrong;
                          const limitedValue = Math.min(value, maxAllowed);
                          setNewExamResult({
                            ...newExamResult,
                            subjects: {
                              ...newExamResult.subjects,
                              biyoloji: { ...newExamResult.subjects.biyoloji, blank: limitedValue.toString() }
                            }
                          });
                        }}
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
                          const topics = e.target.value.split(',').map(t => toTitleCase(t.trim())).filter(t => t.length > 0);
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
            </>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (editingExam) {
                    // Düzenleme modu - sadece display_name ve time_spent_minutes güncelle
                    updateExamResultMutation.mutate({
                      id: editingExam.id,
                      data: {
                        display_name: newExamResult.display_name.trim() || undefined,
                        time_spent_minutes: parseInt(newExamResult.time_spent_minutes) || null
                      }
                    });
                  } else {
                    // Yeni kayıt modu - tüm deneme verisini kaydet
                    let tytNet = 0;
                    let aytNet = 0;
                    let submittedSubjects = { ...newExamResult.subjects };
                    let generatedExamName = '';

                    const getSubjectDisplayName = (subjectKey: string) => {
                      const subjectMap: {[key: string]: string} = {
                        'sosyal': 'Sosyal Bilimler',
                        'turkce': 'Türkçe',
                        'matematik': 'Matematik',
                        'geometri': 'Geometri',
                        'fizik': 'Fizik',
                        'kimya': 'Kimya',
                        'biyoloji': 'Biyoloji',
                        'fen': 'Fen Bilimleri'
                      };
                      return subjectMap[subjectKey] || subjectKey;
                    };

                    if (newExamResult.examScope === "branch") {
                      const selectedSubject = newExamResult.selectedSubject;
                      const subjectData = newExamResult.subjects[selectedSubject];
                      const subjectDisplayName = getSubjectDisplayName(selectedSubject);
                      
                      generatedExamName = `${newExamResult.exam_type} ${subjectDisplayName} Branş Denemesi`;
                      
                      const wrongTopics = newExamResult.wrongTopicsText
                        .split(',')
                        .map(t => toTitleCase(t.trim()))
                        .filter(t => t.length > 0);
                      
                      const uniqueWrongTopics = [...new Set(wrongTopics)];
                      
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
                          wrong_topics: uniqueWrongTopics
                        }
                      };
                      
                      const correct = parseInt(subjectData.correct) || 0;
                      const wrong = parseInt(subjectData.wrong) || 0;
                      const branchNet = Math.max(0, correct - (wrong * 0.25));
                      
                      if (newExamResult.exam_type === "TYT") {
                        tytNet = branchNet;
                        aytNet = 0;
                      } else {
                        tytNet = 0;
                        aytNet = branchNet;
                      }
                    } else {
                      generatedExamName = `Genel ${newExamResult.exam_type} Deneme`;
                      
                      // TYT dersleri: Türkçe, Sosyal, Matematik, Geometri, Fen, Fizik, Kimya, Biyoloji
                      const tytSubjects = ['turkce', 'sosyal', 'matematik', 'geometri', 'fen', 'fizik', 'kimya', 'biyoloji'];
                      // AYT dersleri: Matematik, Geometri, Fizik, Kimya, Biyoloji
                      const aytSubjects = ['matematik', 'geometri', 'fizik', 'kimya', 'biyoloji'];
                      
                      // SADECE seçilen sınav tipi için hesaplama yap
                      if (newExamResult.exam_type === 'TYT') {
                        tytSubjects.forEach(subjectKey => {
                          const subject = newExamResult.subjects[subjectKey];
                          if (subject) {
                            const correct = parseInt(subject.correct) || 0;
                            const wrong = parseInt(subject.wrong) || 0;
                            tytNet += correct - (wrong * 0.25);
                          }
                        });
                        aytNet = 0; // AYT netini 0 yap
                      } else if (newExamResult.exam_type === 'AYT') {
                        aytSubjects.forEach(subjectKey => {
                          const subject = newExamResult.subjects[subjectKey];
                          if (subject) {
                            const correct = parseInt(subject.correct) || 0;
                            const wrong = parseInt(subject.wrong) || 0;
                            aytNet += correct - (wrong * 0.25);
                          }
                        });
                        tytNet = 0; // TYT netini 0 yap
                      }
                    }
                    
                    createExamResultMutation.mutate({
                      exam_name: generatedExamName,
                      display_name: newExamResult.display_name.trim() || undefined,
                      exam_date: newExamResult.exam_date,
                      exam_type: newExamResult.exam_type,
                      exam_scope: newExamResult.examScope,
                      selected_subject: newExamResult.examScope === 'branch' ? newExamResult.selectedSubject : undefined,
                      tyt_net: Math.max(0, tytNet).toFixed(2),
                      ayt_net: Math.max(0, aytNet).toFixed(2),
                      subjects_data: JSON.stringify(submittedSubjects),
                      time_spent_minutes: parseInt(newExamResult.time_spent_minutes) || null
                    });
                  }
                }}
                disabled={editingExam ? updateExamResultMutation.isPending : createExamResultMutation.isPending}
                className="flex-1"
                data-testid="button-save-exam"
              >
                {editingExam 
                  ? (updateExamResultMutation.isPending ? 'Güncelleniyor...' : 'Güncelle')
                  : (createExamResultMutation.isPending ? 'Kaydediliyor...' : 'Kaydet')
                }
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowExamDialog(false);
                  setNewExamResult({ 
                    exam_name: "", 
                    display_name: "",
                    exam_date: new Date().toISOString().split('T')[0], 
                    exam_type: "TYT" as "TYT" | "AYT",
                    examScope: "full" as "full" | "branch",
                    selectedSubject: "turkce" as string,
                    wrongTopicsText: "",
                    time_spent_minutes: "",
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
              <div className={`space-y-2 pr-2 custom-scrollbar ${studyHours.length > 3 ? 'max-h-[15rem] overflow-y-auto' : ''}`}>
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

      {/* Arşivlenen Veriler Modalı */}
      <Dialog open={showArchivedDataModal} onOpenChange={setShowArchivedDataModal}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              📁 Arşivlenen Veriler
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p className="text-muted-foreground">
                Her Pazar 23:59'da otomatik olarak arşivlenen eski verileriniz
              </p>
              {nextArchiveCountdown && (
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg py-2 px-4 inline-block">
                  ⏳ {nextArchiveCountdown}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b pb-2">
              <Button
                variant={archivedTab === 'questions' ? 'default' : 'outline'}
                onClick={() => setArchivedTab('questions')}
                className="flex-1"
              >
                📝 Sorular ({archivedQuestionsModal.length})
              </Button>
              <Button
                variant={archivedTab === 'exams' ? 'default' : 'outline'}
                onClick={() => setArchivedTab('exams')}
                className="flex-1"
              >
                🎯 Denemeler ({archivedExamsModal.length})
              </Button>
              <Button
                variant={archivedTab === 'tasks' ? 'default' : 'outline'}
                onClick={() => setArchivedTab('tasks')}
                className="flex-1"
              >
                ✓ Görevler ({archivedTasksModal.length})
              </Button>
              <Button
                variant={archivedTab === 'studyHours' ? 'default' : 'outline'}
                onClick={() => setArchivedTab('studyHours')}
                className="flex-1"
              >
                ⏱️ Çalışma ({archivedStudyHoursModal.length})
              </Button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {archivedTab === 'questions' && (
                <div className={`space-y-3 ${archivedQuestionsModal.length > 5 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
                  {archivedQuestionsModal.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookX className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p>Arşivlenmiş soru kaydı yok</p>
                    </div>
                  ) : (
                    archivedQuestionsModal.map((log) => {
                      const correct = parseInt(log.correct_count) || 0;
                      const wrong = parseInt(log.wrong_count) || 0;
                      const blank = parseInt(log.blank_count) || 0;
                      const netScore = correct - (wrong * 0.25);
                      
                      return (
                        <div key={log.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-foreground text-lg">{log.exam_type} - {log.subject}</div>
                              {log.topic && <div className="text-sm font-medium text-muted-foreground">📚 Konu: {log.topic}</div>}
                              <div className="text-sm text-muted-foreground">📅 {new Date(log.study_date).toLocaleDateString('tr-TR')}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteArchivedQuestionMutation.mutate(log.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              data-testid={`button-delete-archived-question-${log.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                              ✅ Doğru: {correct}
                            </Badge>
                            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                              ❌ Yanlış: {wrong}
                            </Badge>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
                              ⭕ Boş: {blank}
                            </Badge>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-bold">
                              📊 Net: {netScore.toFixed(2)}
                            </Badge>
                          </div>
                          
                          {log.wrong_topics && log.wrong_topics.length > 0 && (
                            <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                              <div className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">🔍 Yanlış Yapılan Konular:</div>
                              <div className="flex flex-wrap gap-1">
                                {log.wrong_topics.map((topic, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded">
                                    {typeof topic === 'string' ? topic : (topic as any).topic || (topic as any).name || ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {archivedTab === 'exams' && (
                <div className={`space-y-3 ${archivedExamsModal.length > 5 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
                  {archivedExamsModal.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p>Arşivlenmiş deneme yok</p>
                    </div>
                  ) : (
                    archivedExamsModal.map((exam) => {
                      // Parse subjects data if available
                      let subjects: any[] = [];
                      if (exam.subjects_data) {
                        try {
                          const subjectsData = JSON.parse(exam.subjects_data);
                          const subjectNames: {[key: string]: string} = {
                            'turkce': 'Türkçe', 'matematik': 'Matematik', 'sosyal': 'Sosyal', 'fen': 'Fen',
                            'fizik': 'Fizik', 'kimya': 'Kimya', 'biyoloji': 'Biyoloji'
                          };
                          subjects = Object.entries(subjectsData).map(([key, data]: [string, any]) => {
                            const correct = parseInt(data.correct) || 0;
                            const wrong = parseInt(data.wrong) || 0;
                            const blank = parseInt(data.blank) || 0;
                            const netScore = correct - (wrong * 0.25);
                            return {
                              name: subjectNames[key] || key,
                              correct,
                              wrong,
                              blank,
                              netScore,
                              wrong_topics: data.wrong_topics || []
                            };
                          }).filter(s => (s.correct + s.wrong + s.blank) > 0);
                        } catch (e) {
                          console.error('Error parsing subjects_data:', e);
                        }
                      }
                      
                      const examTypeLabel = exam.exam_scope === 'full' ? 'Genel Deneme' : 'Branş Denemesi';
                      
                      return (
                        <div key={exam.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-foreground text-lg">{exam.display_name || exam.exam_name}</div>
                              <div className="text-sm font-medium text-muted-foreground">{examTypeLabel}</div>
                              <div className="text-sm text-muted-foreground">📅 {new Date(exam.exam_date).toLocaleDateString('tr-TR')}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteArchivedExamMutation.mutate(exam.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              data-testid={`button-delete-archived-exam-${exam.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-2">
                            {exam.exam_type === 'TYT' || exam.exam_scope === 'full' ? (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-bold">
                                📊 TYT Net: {exam.tyt_net}
                              </Badge>
                            ) : null}
                            {exam.exam_type === 'AYT' || exam.exam_scope === 'full' ? (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 font-bold">
                                📊 AYT Net: {exam.ayt_net}
                              </Badge>
                            ) : null}
                          </div>
                          
                          {subjects.length > 0 && (
                            <div className="mt-2 space-y-2">
                              <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">📚 Ders Detayları:</div>
                              {subjects.map((subject, idx) => (
                                <div key={idx} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-blue-200/50 dark:border-blue-700/30 space-y-2">
                                  <div className="font-semibold text-sm">{subject.name}</div>
                                  <div className="flex gap-2 flex-wrap text-xs">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      ✅ {subject.correct}
                                    </Badge>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                      ❌ {subject.wrong}
                                    </Badge>
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                                      ⭕ {subject.blank}
                                    </Badge>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold">
                                      Net: {subject.netScore.toFixed(2)}
                                    </Badge>
                                  </div>
                                  
                                  {subject.wrong_topics && subject.wrong_topics.length > 0 && (
                                    <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                                      <div className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">🔍 Yanlış Konular:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {subject.wrong_topics.map((topic: any, tIdx: number) => (
                                          <span key={tIdx} className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded">
                                            {typeof topic === 'string' ? topic : topic.topic || topic.name || ''}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {archivedTab === 'tasks' && (
                <div className={`space-y-3 ${archivedTasksModal.length > 5 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
                  {archivedTasksModal.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p>Arşivlenmiş görev yok</p>
                    </div>
                  ) : (
                    archivedTasksModal.map((task) => {
                      // Get the most relevant date (archivedAt > completedAt > dueDate > createdAt)
                      let displayDate = task.archivedAt || task.completedAt || task.dueDate || task.createdAt;
                      let dateLabel = task.archivedAt ? 'Arşivlenme' : task.completedAt ? 'Tamamlanma' : task.dueDate ? 'Bitiş' : 'Oluşturma';
                      
                      return (
                        <div key={task.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-foreground text-lg">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-muted-foreground mt-1 p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded border border-purple-200/50 dark:border-purple-700/30">
                                  📝 {task.description}
                                </div>
                              )}
                              {displayDate && (
                                <div className="text-xs text-muted-foreground mt-2">
                                  📅 {dateLabel} Tarihi: {new Date(displayDate).toLocaleDateString('tr-TR')}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteArchivedTaskMutation.mutate(task.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 ml-2"
                              data-testid={`button-delete-archived-task-${task.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-2">
                            {task.completed && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                ✅ Tamamlandı
                              </Badge>
                            )}
                            {!task.completed && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                                ⏳ Tamamlanmadı
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {archivedTab === 'studyHours' && (
                <div className={`space-y-3 ${archivedStudyHoursModal.length > 5 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
                  {archivedStudyHoursModal.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p>Arşivlenmiş çalışma saati yok</p>
                    </div>
                  ) : (
                    archivedStudyHoursModal.map((sh: any) => (
                      <div key={sh.id} className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">
                              {sh.hours}s {sh.minutes}d {sh.seconds}sn
                            </div>
                            <div className="text-sm text-muted-foreground">{new Date(sh.study_date).toLocaleDateString('tr-TR')}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400">
                              ⏱️ Çalışma Saati
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteStudyHoursMutation.mutate(sh.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              disabled={deleteStudyHoursMutation.isPending}
                              data-testid={`button-delete-archived-study-hour-${sh.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowArchivedDataModal(false)}
            >
              Kapat
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
              onClick={async () => {
                try {
                  toast({ 
                    title: "📬 Rapor Gönderiliyor", 
                    description: `Aylık rapor ${reportContactInfo.email} adresine gönderiliyor...` 
                  });
                  
                  const response = await apiRequest("POST", "/api/send-report", {
                    email: reportContactInfo.email,
                    phone: reportContactInfo.phone
                  });
                  
                  const data = await response.json();
                  
                  if (data.success) {
                    toast({ 
                      title: "✅ Rapor Gönderildi", 
                      description: `Aylık rapor başarıyla ${reportContactInfo.email} adresine gönderildi!` 
                    });
                  } else {
                    toast({ 
                      title: "❌ Hata", 
                      description: data.message || "Rapor gönderilemedi",
                      variant: "destructive"
                    });
                  }
                  
                  setShowReportModal(false);
                  setReportContactInfo({ email: "", phone: "" });
                } catch (error) {
                  console.error("Rapor gönderme hatası:", error);
                  toast({ 
                    title: "❌ Hata", 
                    description: "Rapor gönderilirken bir hata oluştu",
                    variant: "destructive"
                  });
                }
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

      {/* Tüm Soruları Sil Onay Modalı */}
      <AlertDialog open={showDeleteAllQuestionsDialog} onOpenChange={setShowDeleteAllQuestionsDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 dark:text-red-400 text-xl flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Tüm Soru Kayıtlarını Sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Tüm soru çözüm kayıtlarınızı silmek üzeresiniz. Bu işlem geri alınamaz!
            </AlertDialogDescription>
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">⚠️ Uyarı:</p>
              <ul className="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                <li>Tüm soru çözüm kayıtlarınız silinecek</li>
                <li>İstatistikler ve analizler etkilenecek</li>
                <li>Bu işlem geri alınamaz</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 dark:border-gray-700">İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                deleteAllQuestionLogsMutation.mutate();
                setShowDeleteAllQuestionsDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Evet, Tümünü Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tüm Denemeleri Sil Onay Modalı */}
      <AlertDialog open={showDeleteAllExamsDialog} onOpenChange={setShowDeleteAllExamsDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 dark:text-red-400 text-xl flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Tüm Deneme Sonuçlarını Sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Tüm deneme sınav sonuçlarınızı silmek üzeresiniz. Bu işlem geri alınamaz!
            </AlertDialogDescription>
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">⚠️ Uyarı:</p>
              <ul className="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                <li>Tüm deneme sonuçlarınız silinecek</li>
                <li>Net grafikleri ve analizler sıfırlanacak</li>
                <li>Bu işlem geri alınamaz</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 dark:border-gray-700">İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                deleteAllExamResultsMutation.mutate();
                setShowDeleteAllExamsDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Evet, Tümünü Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* TÜM VERİLERİ TEMİZLE MODAL */}
      <AlertDialog open={showDeleteAllDataDialog} onOpenChange={setShowDeleteAllDataDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border-red-300 dark:border-red-700 max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700 dark:text-red-300 text-2xl flex items-center gap-3">
              <Trash2 className="h-8 w-8 animate-pulse" />
              🗑️ TÜM VERİLERİ TEMİZLE
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 dark:text-gray-300 text-base">
              Bu işlem <span className="font-bold text-red-600 dark:text-red-400">TÜM UYGULAMAI VERİLERİNİZİ VE CACHE'LERİ</span> kalıcı olarak silecektir!
            </AlertDialogDescription>
            <div className="mt-6 space-y-4">
              <div className="p-5 bg-red-50 dark:bg-red-950/40 rounded-xl border-2 border-red-300 dark:border-red-700">
                <p className="text-base font-bold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                  ⚠️ UYARI: Bu İşlem Geri Alınamaz!
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  Aşağıdaki <span className="font-semibold">TÜM veriler kalıcı olarak</span> silinecektir:
                </p>
                <ul className="space-y-2 text-sm text-red-600 dark:text-red-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">🗑️</span>
                    <span><strong>Görevler:</strong> Tamamlanan ve bekleyen tüm görevleriniz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">🗑️</span>
                    <span><strong>Soru Kayıtları:</strong> Çözdüğünüz tüm sorular ve istatistikler</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">🗑️</span>
                    <span><strong>Deneme Sonuçları:</strong> TYT/AYT tüm deneme sınav kayıtları</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">🗑️</span>
                    <span><strong>Çalışma Saatleri:</strong> Tüm çalışma saati kayıtları</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">🗑️</span>
                    <span><strong>Cache & Ayarlar:</strong> Düzeltilen konular, hedef netler, tüm localStorage verileri</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-300 dark:border-orange-700">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                  ℹ️ İşlem Sonrası:
                </p>
                <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1 list-disc list-inside">
                  <li>Uygulama otomatik olarak yenilenecek</li>
                  <li>Tüm veriler sıfırlanacak (sıfırdan başlayacaksınız)</li>
                  <li>Bu işlem 2-3 saniye sürebilir</li>
                </ul>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel 
              className="border-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={deleteAllDataMutation.isPending}
            >
              ❌ İptal Et
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                deleteAllDataMutation.mutate();
              }}
              disabled={deleteAllDataMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6"
            >
              {deleteAllDataMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Temizleniyor...
                </span>
              ) : (
                '🗑️ Evet, Tüm Verileri Temizle'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


