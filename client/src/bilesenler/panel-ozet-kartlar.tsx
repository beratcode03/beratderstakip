// BERAT CANKIR
// BERAT BİLAL CANKIR
// CANKIR


import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Target, BookOpen, Award, Brain, Zap, Calendar, BarChart3, Sparkles, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { ExamResult, QuestionLog } from "@shared/sema";
import { useState, useEffect } from "react";

export function DashboardSummaryCards() {
  const [animationDelay, setAnimationDelay] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedErrorTopicsCount, setCompletedErrorTopicsCount] = useState(0);
  
  const { data: examResults = [], isLoading: examLoading } = useQuery<ExamResult[]>({
    queryKey: ["/api/exam-results"],
  });
  
  const { data: archivedExamResults = [] } = useQuery<ExamResult[]>({
    queryKey: ["/api/exam-results/archived"],
  });
  
  const { data: questionLogs = [], isLoading: questionLoading } = useQuery<QuestionLog[]>({
    queryKey: ["/api/question-logs"],
  });
  
  const { data: archivedQuestionLogs = [] } = useQuery<QuestionLog[]>({
    queryKey: ["/api/question-logs/archived"],
  });

  const { data: studyHours = [], isLoading: studyHoursLoading } = useQuery<any[]>({
    queryKey: ["/api/study-hours"],
  });
  
  const { data: archivedStudyHours = [] } = useQuery<any[]>({
    queryKey: ["/api/study-hours/archived"],
  });
  
  // Arşivlenmiş ve aktif verileri birleştir
  const allExamResults = [...examResults, ...archivedExamResults];
  const allQuestionLogs = [...questionLogs, ...archivedQuestionLogs];
  const allStudyHours = [...studyHours, ...archivedStudyHours];

  const { data: examSubjectNets = [] } = useQuery<any[]>({
    queryKey: ["/api/exam-subject-nets"],
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // localStorage'dan düzeltilen konuları yükle (Sadece Hata Sıklığı Analizi bölümünden)
  useEffect(() => {
    try {
      const savedCompletedQuestionErrors = localStorage.getItem('completedQuestionErrors');
      
      let totalCount = 0;
      
      // Sadece soru etiketli hataları say (exam etiketliler sayılmaz)
      if (savedCompletedQuestionErrors) {
        const questionErrors = JSON.parse(savedCompletedQuestionErrors);
        totalCount = questionErrors.length || 0;
      }
      
      setCompletedErrorTopicsCount(totalCount);
    } catch (error) {
      console.error('Error loading completed topics:', error);
    }
    
    // localStorage değişikliklerini dinle
    const handleStorageChange = () => {
      try {
        const savedCompletedQuestionErrors = localStorage.getItem('completedQuestionErrors');
        
        let totalCount = 0;
        
        // Sadece soru etiketli hataları say (exam etiketliler sayılmaz)
        if (savedCompletedQuestionErrors) {
          const questionErrors = JSON.parse(savedCompletedQuestionErrors);
          totalCount = questionErrors.length || 0;
        }
        
        setCompletedErrorTopicsCount(totalCount);
      } catch (error) {
        console.error('Error loading completed topics:', error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event ile aynı sekmede yapılan değişiklikleri dinle (interval yerine)
    window.addEventListener('localStorageUpdate', handleStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleStorageChange as EventListener);
    };
  }, []);

  const isLoading = examLoading || questionLoading || studyHoursLoading;
  

  // TYT ve AYT net ortalamalarını hesapla - SADECE GENEL DENEMELER
  const calculateNetAverages = () => {
    // Sadece genel denemeleri al (branş denemelerini dahil etme) - ARŞİVLENMİŞLER DAHİL
    const generalExams = allExamResults.filter(exam => exam.exam_scope === 'full');
    // Sınav tarihine göre azalan şekilde sırala ve son 5 sınavı al
    const sortedExams = [...generalExams].sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime());
    const last5Exams = sortedExams.slice(0, 5);
    const tytNets = last5Exams.filter(exam => exam.tyt_net !== undefined && exam.tyt_net !== null && exam.tyt_net !== '').map(exam => parseFloat(exam.tyt_net.toString()));
    const aytNets = last5Exams.filter(exam => exam.ayt_net !== undefined && exam.ayt_net !== null && exam.ayt_net !== '').map(exam => parseFloat(exam.ayt_net.toString()));
    
    const tytAvg = tytNets.length > 0 ? tytNets.reduce((sum, net) => sum + net, 0) / tytNets.length : 0;
    const aytAvg = aytNets.length > 0 ? aytNets.reduce((sum, net) => sum + net, 0) / aytNets.length : 0;
    
    // Checkbox işaretli (çözülmüş) GENEL DENEME HATALARI hesapla
    let solvedExamErrorsCount = 0;
    let todaySolvedExamErrors = 0;
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD formatında yerel tarih
    
    try {
      const savedCompletedGeneralExamErrors = localStorage.getItem('completedGeneralExamErrors');
      if (savedCompletedGeneralExamErrors) {
        const completedGeneralExamErrorsArray = JSON.parse(savedCompletedGeneralExamErrors);
        solvedExamErrorsCount = completedGeneralExamErrorsArray.length;
        
        // Bugün düzeltilenleri say
        todaySolvedExamErrors = completedGeneralExamErrorsArray.filter((item: any) => {
          // Yeni format: {key, completedAt}
          if (typeof item === 'object' && item.completedAt) {
            const completedDate = new Date(item.completedAt).toLocaleDateString('en-CA');
            return completedDate === today;
          }
          // Eski format: string - bugün sayma
          return false;
        }).length;
      }
    } catch (error) {
      console.error('Error calculating solved general exam errors:', error);
    }
    
    return { tytAvg: tytAvg.toFixed(1), aytAvg: aytAvg.toFixed(1), examCount: last5Exams.length, solvedExamErrorsCount, todaySolvedExamErrors };
  };

  // Toplam çözülmüş soruları ve günlük ortalamayı hesapla - ARŞİVLENMİŞLER DAHİL
  const calculateQuestionStats = () => {
    const totalCorrect = allQuestionLogs.reduce((total, log) => total + (Number(log.correct_count) || 0), 0);
    const totalWrong = allQuestionLogs.reduce((total, log) => total + (Number(log.wrong_count) || 0), 0);
    const totalBlank = allQuestionLogs.reduce((total, log) => total + (Number(log.blank_count) || 0), 0);
    const totalQuestions = totalCorrect + totalWrong + totalBlank;

    // Günlük ortalamayı benzersiz tarihlere göre hesapla
    const uniqueDates = Array.from(new Set(allQuestionLogs.map(log => log.study_date)));
    const dailyAverage = uniqueDates.length > 0 ? (totalQuestions / uniqueDates.length).toFixed(1) : '0';

    // En aktif günü bul
    const dayActivity: { [key: string]: number } = {};
    allQuestionLogs.forEach(log => {
      const date = log.study_date;
      const count = (Number(log.correct_count) || 0) + (Number(log.wrong_count) || 0) + (Number(log.blank_count) || 0);
      dayActivity[date] = (dayActivity[date] || 0) + count;
    });
    
    let mostActiveDay: string | null = null;
    let maxActivity = 0;
    Object.entries(dayActivity).forEach(([date, count]) => {
      if (count > maxActivity) {
        maxActivity = count;
        mostActiveDay = date;
      }
    });

    // Checkbox işaretli (çözülmüş) hataları hesapla - SADECE SORU ETİKETLİLER
    let solvedErrorsCount = 0;
    let todaySolvedQuestionErrors = 0;
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD formatında yerel tarih
    
    try {
      const savedCompletedQuestionErrors = localStorage.getItem('completedQuestionErrors');
      if (savedCompletedQuestionErrors) {
        const completedQuestionErrorsArray = JSON.parse(savedCompletedQuestionErrors);
        solvedErrorsCount = completedQuestionErrorsArray.length;
        
        // Bugün düzeltilenleri say
        todaySolvedQuestionErrors = completedQuestionErrorsArray.filter((item: any) => {
          // Yeni format: {key, completedAt}
          if (typeof item === 'object' && item.completedAt) {
            const completedDate = new Date(item.completedAt).toLocaleDateString('en-CA');
            return completedDate === today;
          }
          // Eski format: string - bugün sayma
          return false;
        }).length;
      }
    } catch (error) {
      console.error('Error calculating solved errors:', error);
    }
    
    return { 
      totalQuestions, 
      dailyAverage, 
      totalCorrect, 
      totalWrong,
      solvedErrorsCount,
      todaySolvedQuestionErrors,
      activeDays: uniqueDates.length,
      mostActiveDay,
      maxActivity
    };
  };

  // Çalışma saati istatistiklerini hesapla - ARŞİVLENMİŞLER DAHİL
  const calculateStudyHoursStats = () => {
    const totalSeconds = allStudyHours.reduce((total: number, sh: any) => {
      const hours = parseInt(sh.hours) || 0;
      const minutes = parseInt(sh.minutes) || 0;
      const seconds = parseInt(sh.seconds) || 0;
      return total + (hours * 3600 + minutes * 60 + seconds);
    }, 0);
    
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    
    // Günlük ortalama
    const uniqueDates = Array.from(new Set(allStudyHours.map((sh: any) => sh.study_date)));
    const avgSecondsPerDay = uniqueDates.length > 0 ? totalSeconds / uniqueDates.length : 0;
    const avgHoursPerDay = Math.floor(avgSecondsPerDay / 3600);
    const avgMinutesPerDay = Math.floor((avgSecondsPerDay % 3600) / 60);
    
    // En uzun çalışma günü
    const dayActivity: { [key: string]: number } = {};
    allStudyHours.forEach((sh: any) => {
      const date = sh.study_date;
      const hours = parseInt(sh.hours) || 0;
      const minutes = parseInt(sh.minutes) || 0;
      const seconds = parseInt(sh.seconds) || 0;
      const totalSec = hours * 3600 + minutes * 60 + seconds;
      dayActivity[date] = (dayActivity[date] || 0) + totalSec;
    });
    
    let longestStudyDay: string | null = null;
    let maxStudySeconds = 0;
    Object.entries(dayActivity).forEach(([date, seconds]) => {
      if (seconds > maxStudySeconds) {
        maxStudySeconds = seconds;
        longestStudyDay = date;
      }
    });
    
    const longestHours = Math.floor(maxStudySeconds / 3600);
    const longestMinutes = Math.floor((maxStudySeconds % 3600) / 60);
    
    // En uzun çalışma serisi (ardışık günler)
    const sortedDates = uniqueDates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = sortedDates[i - 1];
        const currDate = sortedDates[i];
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    
    // En çok çalışılan ayı hesapla
    const monthActivity: { [key: string]: number } = {};
    allStudyHours.forEach((sh: any) => {
      const date = new Date(sh.study_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const hours = parseInt(sh.hours) || 0;
      const minutes = parseInt(sh.minutes) || 0;
      const seconds = parseInt(sh.seconds) || 0;
      const totalSec = hours * 3600 + minutes * 60 + seconds;
      monthActivity[monthKey] = (monthActivity[monthKey] || 0) + totalSec;
    });
    
    let mostStudiedMonth: string | null = null;
    let maxMonthSeconds = 0;
    Object.entries(monthActivity).forEach(([month, seconds]) => {
      if (seconds > maxMonthSeconds) {
        maxMonthSeconds = seconds;
        mostStudiedMonth = month;
      }
    });
    
    const mostStudiedMonthHours = Math.floor(maxMonthSeconds / 3600);
    const mostStudiedMonthName = mostStudiedMonth ? new Date(mostStudiedMonth + '-01').toLocaleDateString('tr-TR', { 
      month: 'long', 
      year: 'numeric' 
    }) : null;
    
    return {
      totalHours,
      totalMinutes,
      avgHoursPerDay,
      avgMinutesPerDay,
      activeDays: uniqueDates.length,
      longestStudyDay,
      longestHours,
      longestMinutes,
      longestStreak,
      mostStudiedMonth: mostStudiedMonthName,
      mostStudiedMonthHours
    };
  };

  // TYT ve AYT net başarı oranlarına göre en güçlü, geliştirilmesi gereken ve en zayıf konuları hesapla - ARŞİVLENMİŞLER DAHİL
  // SADECE MANUEL GİRİLEN SORU KAYITLARI (questionLogs) - Deneme sonuçları dahil değil
  const calculateSubjectPerformance = () => {
    // TYT ve AYT için ayrı istatistikler
    const tytStats: { [key: string]: { correct: number; attempted: number } } = {};
    const aytStats: { [key: string]: { correct: number; attempted: number } } = {};
    
    // SADECE soru loglarından veri topla (deneme sonuçları hariç)
    allQuestionLogs.forEach(log => {
      const subject = log.subject;
      const examType = log.exam_type;
      const correct = Number(log.correct_count) || 0;
      const wrong = Number(log.wrong_count) || 0;
      const attempted = correct + wrong;
      
      if (examType === 'TYT') {
        if (!tytStats[subject]) {
          tytStats[subject] = { correct: 0, attempted: 0 };
        }
        tytStats[subject].correct += correct;
        tytStats[subject].attempted += attempted;
      } else if (examType === 'AYT') {
        if (!aytStats[subject]) {
          aytStats[subject] = { correct: 0, attempted: 0 };
        }
        aytStats[subject].correct += correct;
        aytStats[subject].attempted += attempted;
      }
    });
    
    // NOT: Deneme sonuçları (examResults/examSubjectNets) Soru İstatistikleri'ne dahil edilmez
    // Bunlar sadece "Genel Deneme Ortalamaları" ve "Branş Deneme Ortalamaları" bölümlerinde gösterilir
    
    // TYT dersleri için analiz
    const tytSubjects = Object.entries(tytStats)
      .map(([subject, stats]) => ({
        subject,
        successRate: stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0,
        totalQuestions: stats.attempted
      }))
      .filter(s => s.totalQuestions >= 5)
      .sort((a, b) => b.successRate - a.successRate);
    
    const tytStrongest = tytSubjects[0];
    const tytMedium = tytSubjects.length >= 3 ? tytSubjects[Math.floor(tytSubjects.length / 2)] : null;
    const tytWeakest = tytSubjects.length > 0 ? tytSubjects[tytSubjects.length - 1] : null;
    
    // AYT dersleri için analiz
    const aytSubjects = Object.entries(aytStats)
      .map(([subject, stats]) => ({
        subject,
        successRate: stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0,
        totalQuestions: stats.attempted
      }))
      .filter(s => s.totalQuestions >= 5)
      .sort((a, b) => b.successRate - a.successRate);
    
    const aytStrongest = aytSubjects[0];
    const aytMedium = aytSubjects.length >= 3 ? aytSubjects[Math.floor(aytSubjects.length / 2)] : null;
    const aytWeakest = aytSubjects.length > 0 ? aytSubjects[aytSubjects.length - 1] : null;
    
    return { 
      tyt: { strongest: tytStrongest, medium: tytMedium, weakest: tytWeakest },
      ayt: { strongest: aytStrongest, medium: aytMedium, weakest: aytWeakest }
    };
  };

  // Branş Deneme Ortalamalarını hesapla - ARŞİVLENMİŞLER DAHİL
  const calculateBranchExamAverages = () => {
    const branchExams = allExamResults.filter(exam => exam.exam_scope === 'branch');
    
    const tytSubjects = ['Türkçe', 'Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji'];
    const aytSubjects = ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji'];
    
    const tytAverages: { [key: string]: number } = {};
    const aytAverages: { [key: string]: number } = {};
    const tytCounts: { [key: string]: number } = {};
    const aytCounts: { [key: string]: number } = {};
    
    branchExams.forEach(exam => {
      const examType = exam.exam_type;
      if (!examType) return;
      
      const subjectData = exam.subjects_data ? JSON.parse(exam.subjects_data) : {};
      const subjectKey = exam.selected_subject || '';
      const data = subjectData[subjectKey] || {};
      const correct = parseInt(data.correct) || 0;
      const wrong = parseInt(data.wrong) || 0;
      const net = correct - (wrong * 0.25);
      
      const subjectNameMap: {[key: string]: string} = {
        'turkce': 'Türkçe',
        'matematik': 'Matematik',
        'geometri': 'Geometri',
        'fizik': 'Fizik',
        'kimya': 'Kimya',
        'biyoloji': 'Biyoloji',
        'sosyal': 'Sosyal Bilimler',
        'fen': 'Fen Bilimleri'
      };
      
      const subject = subjectNameMap[subjectKey.toLowerCase()] || subjectKey;
      
      if (examType === 'TYT') {
        if (!tytAverages[subject]) {
          tytAverages[subject] = 0;
          tytCounts[subject] = 0;
        }
        tytAverages[subject] += net;
        tytCounts[subject]++;
      } else if (examType === 'AYT') {
        if (!aytAverages[subject]) {
          aytAverages[subject] = 0;
          aytCounts[subject] = 0;
        }
        aytAverages[subject] += net;
        aytCounts[subject]++;
      }
    });
    
    const tytResults: { [key: string]: number } = {};
    const aytResults: { [key: string]: number } = {};
    
    for (const subject of tytSubjects) {
      tytResults[subject] = tytCounts[subject] > 0 ? tytAverages[subject] / tytCounts[subject] : 0;
    }
    
    for (const subject of aytSubjects) {
      aytResults[subject] = aytCounts[subject] > 0 ? aytAverages[subject] / aytCounts[subject] : 0;
    }
    
    // Branş deneme hatalarını hesapla
    let totalBranchErrors = 0;
    let todayBranchErrors = 0;
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD formatı
    
    try {
      const savedBranchErrors = localStorage.getItem('completedBranchExamErrors');
      if (savedBranchErrors) {
        const branchErrors = JSON.parse(savedBranchErrors);
        if (Array.isArray(branchErrors)) {
          totalBranchErrors = branchErrors.length;
          todayBranchErrors = branchErrors.filter((item: any) => {
            if (!item || !item.completedAt) return false;
            const completedDate = new Date(item.completedAt).toLocaleDateString('en-CA');
            return completedDate === today;
          }).length;
        }
      }
    } catch (error) {
      console.error('Error loading completed branch exam errors:', error);
    }
    
    // En yüksek net yapılan dersleri bul
    let tytHighestSubject = null;
    let tytHighestNet = 0;
    for (const subject of tytSubjects) {
      if (tytResults[subject] > tytHighestNet && tytCounts[subject] > 0) {
        tytHighestNet = tytResults[subject];
        tytHighestSubject = subject;
      }
    }
    
    let aytHighestSubject = null;
    let aytHighestNet = 0;
    for (const subject of aytSubjects) {
      if (aytResults[subject] > aytHighestNet && aytCounts[subject] > 0) {
        aytHighestNet = aytResults[subject];
        aytHighestSubject = subject;
      }
    }
    
    // Yüzdeleri hesapla (40 soru üzerinden TYT, 40 soru üzerinden AYT)
    const tytPercentage = tytHighestNet > 0 ? ((tytHighestNet / 40) * 100) : 0;
    const aytPercentage = aytHighestNet > 0 ? ((aytHighestNet / 40) * 100) : 0;
    
    return { 
      tyt: tytResults, 
      ayt: aytResults, 
      tytCounts, 
      aytCounts,
      totalBranchErrors,
      todayBranchErrors,
      tytHighest: { subject: tytHighestSubject, net: tytHighestNet, percentage: tytPercentage },
      aytHighest: { subject: aytHighestSubject, net: aytHighestNet, percentage: aytPercentage }
    };
  };

  // Genel Deneme Ders Bazlı Ortalamalarını hesapla - ARŞİVLENMİŞLER DAHİL
  const calculateGeneralExamSubjectAverages = () => {
    // Sadece genel denemeleri al ve son 5'ini kullan (calculateNetAverages ile aynı mantık)
    const generalExams = allExamResults.filter(exam => exam.exam_scope === 'full');
    const sortedExams = [...generalExams].sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime());
    const last5Exams = sortedExams.slice(0, 5);
    
    const tytSubjects = ['Türkçe', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Sosyal Bilimler'];
    const aytSubjects = ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji'];
    
    const tytAverages: { [key: string]: number } = {};
    const aytAverages: { [key: string]: number } = {};
    const tytCounts: { [key: string]: number } = {};
    const aytCounts: { [key: string]: number } = {};
    
    // exam_subject_nets'ten veri topla (sadece son 5 deneme için)
    last5Exams.forEach(exam => {
      const examType = exam.exam_type;
      if (!examType) return;
      
      const subjectNets = examSubjectNets.filter(net => net.exam_id === exam.id);
      subjectNets.forEach(net => {
        const subject = net.subject;
        const correct = Number(net.correct) || 0;
        const wrong = Number(net.wrong) || 0;
        const netScore = correct - (wrong * 0.25);
        
        if (examType === 'TYT') {
          if (!tytAverages[subject]) {
            tytAverages[subject] = 0;
            tytCounts[subject] = 0;
          }
          tytAverages[subject] += netScore;
          tytCounts[subject]++;
        } else if (examType === 'AYT') {
          if (!aytAverages[subject]) {
            aytAverages[subject] = 0;
            aytCounts[subject] = 0;
          }
          aytAverages[subject] += netScore;
          aytCounts[subject]++;
        }
      });
    });
    
    const tytResults: { [key: string]: number } = {};
    const aytResults: { [key: string]: number } = {};
    
    for (const subject of tytSubjects) {
      tytResults[subject] = tytCounts[subject] > 0 ? tytAverages[subject] / tytCounts[subject] : 0;
    }
    
    for (const subject of aytSubjects) {
      aytResults[subject] = aytCounts[subject] > 0 ? aytAverages[subject] / aytCounts[subject] : 0;
    }
    
    return { 
      tyt: tytResults, 
      ayt: aytResults, 
      tytCounts, 
      aytCounts
    };
  };

  const netAverages = calculateNetAverages();
  const questionStats = calculateQuestionStats();
  const studyHoursStats = calculateStudyHoursStats();
  const subjectPerformance = calculateSubjectPerformance();
  const branchAverages = calculateBranchExamAverages();
  const generalSubjectAverages = calculateGeneralExamSubjectAverages();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-900/50 dark:to-gray-800/30 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 relative overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 dark:from-purple-400/10 dark:to-blue-400/10"></div>
            <div className="relative space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-12">
      {/* Başlık */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Performans Özeti
          </h2>
        </div>
        <p className="text-muted-foreground"></p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Geliştirilmiş TYT/AYT Net Ortalamaları Kartı */}
        <div className="group bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 relative overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-lg hover:shadow-2xl" data-testid="card-exam-averages">
          {/* Animasyonlu Arka Plan Öğeleri */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-green-500/15 to-emerald-600/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          
          {/* Işıltılı Animasyon */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Genel Deneme Ortalamaları</h3>
                  <p className="text-sm text-muted-foreground">Son {netAverages.examCount} genel deneme</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* YENİ HİYERARŞİ: Ders Bazlı Net Ortalamaları EN ÜSTTE */}
              <div className="space-y-4">
                {/* TYT Ders Ortalamaları */}
                <div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">TYT Ders Bazlı Net Ortalamalar</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Türkçe', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Sosyal Bilimler'].map((subject) => {
                      const avg = generalSubjectAverages.tyt[subject] || 0;
                      const subjectColors: {[key: string]: string} = {
                        'Türkçe': 'from-red-500 to-red-600',
                        'Matematik': 'from-blue-500 to-blue-600',
                        'Fizik': 'from-violet-500 to-violet-600',
                        'Kimya': 'from-pink-500 to-pink-600',
                        'Biyoloji': 'from-cyan-500 to-cyan-600',
                        'Sosyal Bilimler': 'from-orange-500 to-orange-600'
                      };
                      return (
                        <div key={subject} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200/30 dark:border-gray-700/30">
                          <div className={`text-sm font-bold bg-gradient-to-r ${subjectColors[subject]} bg-clip-text text-transparent mb-1`}>
                            {avg.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{subject}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* AYT Ders Ortalamaları */}
                <div>
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">AYT Ders Bazlı Net Ortalamalar</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji'].map((subject) => {
                      const avg = generalSubjectAverages.ayt[subject] || 0;
                      const subjectColors: {[key: string]: string} = {
                        'Matematik': 'from-blue-500 to-blue-600',
                        'Geometri': 'from-purple-500 to-purple-600',
                        'Fizik': 'from-violet-500 to-violet-600',
                        'Kimya': 'from-pink-500 to-pink-600',
                        'Biyoloji': 'from-cyan-500 to-cyan-600'
                      };
                      return (
                        <div key={subject} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200/30 dark:border-gray-700/30">
                          <div className={`text-sm font-bold bg-gradient-to-r ${subjectColors[subject]} bg-clip-text text-transparent mb-1`}>
                            {avg.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{subject}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* TYT Net Ortalama */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1" data-testid="text-tyt-average">
                      {netAverages.tytAvg}
                    </div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">TYT Net Ortalama</div>
                    <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((parseFloat(netAverages.tytAvg) / 120) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">TYT</span>
                  </div>
                </div>
              </div>
              
              {/* AYT Net Ortalama */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-1" data-testid="text-ayt-average">
                      {netAverages.aytAvg}
                    </div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">AYT Net Ortalama</div>
                    <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((parseFloat(netAverages.aytAvg) / 80) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">AYT</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-700/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400" data-testid="text-solved-exam-errors">
                      {netAverages.solvedExamErrorsCount}
                    </div>
                    <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Toplam Düzeltilen Genel Deneme Hataları</div>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-900/30 dark:to-emerald-900/20 rounded-xl p-4 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-700/40 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-1" data-testid="text-today-solved-exam-errors">
                      {netAverages.todaySolvedExamErrors}
                    </div>
                    <div className="text-xs font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Bugün Düzeltilen Konular
                    </div>
                  </div>
                  <div className="p-2.5 bg-green-100 dark:bg-green-900/40 rounded-lg">
                    <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              
              {netAverages.examCount === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium mb-1">Henüz deneme kaydı bulunmuyor</p>
                  <p className="text-sm">İlk denememi eklemeden gözükmez.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Branş Deneme Ortalamaları Kartı */}
        <div className="group bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 relative overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-lg hover:shadow-2xl" data-testid="card-branch-averages">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-pink-500/15 to-rose-600/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Branş Deneme Ortalamaları</h3>
                  <p className="text-sm text-muted-foreground">Ders bazlı ortalamalar</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* TYT Branş Ortalamaları */}
              <div>
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3">TYT</div>
                <div className="grid grid-cols-3 gap-2">
                  {['Türkçe', 'Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji'].map((subject) => {
                    const avg = branchAverages.tyt[subject] || 0;
                    const count = branchAverages.tytCounts[subject] || 0;
                    const subjectColors: {[key: string]: string} = {
                      'Türkçe': 'from-red-500 to-red-600',
                      'Matematik': 'from-blue-500 to-blue-600',
                      'Geometri': 'from-purple-500 to-purple-600',
                      'Fizik': 'from-violet-500 to-violet-600',
                      'Kimya': 'from-pink-500 to-pink-600',
                      'Biyoloji': 'from-cyan-500 to-cyan-600'
                    };
                    return (
                      <div key={subject} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
                        <div className={`text-lg font-bold bg-gradient-to-r ${subjectColors[subject]} bg-clip-text text-transparent`}>
                          {avg.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{subject}</div>
                        {count > 0 && <div className="text-xs text-muted-foreground">{count} deneme</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AYT Branş Ortalamaları */}
              <div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">AYT</div>
                <div className="grid grid-cols-3 gap-2">
                  {['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji'].map((subject) => {
                    const avg = branchAverages.ayt[subject] || 0;
                    const count = branchAverages.aytCounts[subject] || 0;
                    const subjectColors: {[key: string]: string} = {
                      'Matematik': 'from-blue-500 to-blue-600',
                      'Geometri': 'from-purple-500 to-purple-600',
                      'Fizik': 'from-violet-500 to-violet-600',
                      'Kimya': 'from-pink-500 to-pink-600',
                      'Biyoloji': 'from-cyan-500 to-cyan-600'
                    };
                    return (
                      <div key={subject} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
                        <div className={`text-lg font-bold bg-gradient-to-r ${subjectColors[subject]} bg-clip-text text-transparent`}>
                          {avg.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{subject}</div>
                        {count > 0 && <div className="text-xs text-muted-foreground">{count} deneme</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* EN YÜKSEK NET KARTLARI */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                {/* TYT En Yüksek Net */}
                {branchAverages.tytHighest.subject && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/30">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      TYT En Yüksek Net
                    </div>
                    <div className="text-lg font-black text-blue-700 dark:text-blue-300 mb-1">
                      {branchAverages.tytHighest.subject}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {branchAverages.tytHighest.net.toFixed(1)}
                      </span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        %{branchAverages.tytHighest.percentage.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(branchAverages.tytHighest.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* AYT En Yüksek Net */}
                {branchAverages.aytHighest.subject && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-200/50 dark:border-green-700/30">
                    <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                      AYT En Yüksek Net
                    </div>
                    <div className="text-lg font-black text-green-700 dark:text-green-300 mb-1">
                      {branchAverages.aytHighest.subject}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {branchAverages.aytHighest.net.toFixed(1)}
                      </span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        %{branchAverages.aytHighest.percentage.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-green-100 dark:bg-green-900/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(branchAverages.aytHighest.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Düzeltilen Hatalar İstatistikleri - Her zaman göster */}
              <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{branchAverages.totalBranchErrors}</div>
                        <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Toplam Düzeltilen Branş Deneme Hataları</div>
                      </div>
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-900/30 dark:to-indigo-900/20 rounded-xl p-4 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-700/40 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1">{branchAverages.todayBranchErrors}</div>
                        <div className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Bugün Düzeltilen Branş Deneme Konuları
                        </div>
                      </div>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branş denemesi yoksa mesaj göster - En altta */}
              {Object.values(branchAverages.tytCounts).every(c => c === 0) && Object.values(branchAverages.aytCounts).every(c => c === 0) && (
                <div className="text-center py-8 text-muted-foreground border-t border-gray-200/50 dark:border-gray-700/50">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium mb-1">Henüz branş denemesi bulunmuyor</p>
                  <p className="text-sm">İlk branş denememi ekle</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Geliştirilmiş Soru İstatistikleri Kartı */}
        <div className="group bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 relative overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-lg hover:shadow-2xl" data-testid="card-question-stats">
          {/* Animasyonlu Arka Plan Öğeleri */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-orange-500/15 to-red-600/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          
          {/* Enerji Simgesi Animasyonu */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Zap className="h-5 w-5 text-yellow-500 animate-bounce" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Soru İstatistikleri</h3>
                <p className="text-sm text-muted-foreground">
                  {questionStats.mostActiveDay ? (
                    <span className="flex items-center gap-1">
                      En Aktif Olunan Gün → 
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {new Date(questionStats.mostActiveDay).toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'short'
                        })} ({questionStats.maxActivity} soru)
                      </span>
                    </span>
                  ) : (
                    'Henüz aktif gün bulunmuyor'
                  )}
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Toplam Çözülen Soru */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1" data-testid="text-total-questions">
                      {questionStats.totalQuestions.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Toplam Çözülen Soru</div>
                    <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((questionStats.totalQuestions / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              
              {/* Günlük Ortalama */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1" data-testid="text-daily-average">
                      {questionStats.dailyAverage}
                    </div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Günlük Ortalama</div>
                  </div>
                  <div className="ml-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              
              {/* Toplam Çözülen Soru Hataları */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-red-200/30 dark:border-red-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-black text-red-600 dark:text-red-400 mb-1" data-testid="text-total-errors">
                      {questionStats.solvedErrorsCount.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm font-medium text-red-700 dark:text-red-300">Toplam Düzeltilen Soru Hataları</div>
                  </div>
                  <div className="ml-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              {/* Bugün Düzeltilen Sorular */}
              <div className="bg-gradient-to-br from-rose-50/80 to-pink-50/60 dark:from-rose-900/30 dark:to-pink-900/20 rounded-xl p-4 backdrop-blur-sm border-2 border-rose-200/50 dark:border-rose-700/40 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mb-1" data-testid="text-today-solved-question-errors">
                      {questionStats.todaySolvedQuestionErrors}
                    </div>
                    <div className="text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Bugün Düzeltilen Sorular
                    </div>
                  </div>
                  <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
                    <Sparkles className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                </div>
              </div>

              {/* Toplam Doğru ve Yanlış */}
              <div className="grid grid-cols-2 gap-3">
                {/* Doğru Cevaplar Kutusu */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-600 dark:text-green-400 mb-1" data-testid="text-total-correct">
                      {questionStats.totalCorrect.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Toplam Doğru</div>
                    <div className="w-full bg-green-200/50 dark:bg-green-900/40 rounded-full h-2 mt-1 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${questionStats.totalQuestions > 0 ? (questionStats.totalCorrect / questionStats.totalQuestions) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="text-xs font-medium text-green-700 dark:text-green-300 mt-1">
                      {questionStats.totalQuestions > 0 ? Math.round((questionStats.totalCorrect / questionStats.totalQuestions) * 100) : 0}%
                    </div>
                  </div>
                </div>

                {/* Yanlış Cevaplar Kutusu */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm border border-red-200/30 dark:border-red-700/30">
                  <div className="text-center">
                    <div className="text-2xl font-black text-red-600 dark:text-red-400 mb-1" data-testid="text-total-wrong">
                      {questionStats.totalWrong.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Toplam Yanlış</div>
                    <div className="w-full bg-red-200/50 dark:bg-red-900/40 rounded-full h-2 mt-1 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${questionStats.totalQuestions > 0 ? (questionStats.totalWrong / questionStats.totalQuestions) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="text-xs font-medium text-red-700 dark:text-red-300 mt-1">
                      {questionStats.totalQuestions > 0 ? Math.round((questionStats.totalWrong / questionStats.totalQuestions) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Çalışma Saatleri İstatistikleri Kartı */}
        <div className="group bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 relative overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-lg hover:shadow-2xl" data-testid="card-study-hours">
          {/* Animasyonlu Arka Plan Öğeleri */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-teal-500/15 to-cyan-600/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          
          {/* Saat Simgesi Animasyonu */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Clock className="h-5 w-5 text-cyan-500 animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Çalışma Saatleri</h3>
                <p className="text-sm text-muted-foreground">
                  {studyHoursStats.longestStudyDay ? (
                    <span className="flex items-center gap-1">
                      En uzun gün → 
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        {new Date(studyHoursStats.longestStudyDay).toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'short'
                        })} ({studyHoursStats.longestHours}s {studyHoursStats.longestMinutes}dk)
                      </span>
                    </span>
                  ) : (
                    'Henüz çalışma kaydı bulunmuyor'
                  )}
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Toplam Çalışma Süresi */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-cyan-200/30 dark:border-cyan-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mb-1" data-testid="text-total-study-hours">
                      {studyHoursStats.totalHours}s {studyHoursStats.totalMinutes}dk
                    </div>
                    <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Toplam Çalışma Süresi</div>
                  </div>
                  <div className="ml-4 p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                    <Clock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
              </div>
              
              {/* Günlük Ortalama */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1" data-testid="text-avg-daily-study">
                      {studyHoursStats.avgHoursPerDay}s {studyHoursStats.avgMinutesPerDay}dk
                    </div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Günlük Ortalama</div>
                  </div>
                  <div className="ml-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Aktif Çalışma Günü */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-teal-200/30 dark:border-teal-700/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-3xl font-black text-teal-600 dark:text-teal-400 mb-1" data-testid="text-active-study-days">
                      {studyHoursStats.activeDays}
                    </div>
                    <div className="text-sm font-medium text-teal-700 dark:text-teal-300">Aktif Çalışma Günü</div>
                  </div>
                  <div className="ml-4 p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                    <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
                <div className="w-full bg-teal-100 dark:bg-teal-900/30 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((studyHoursStats.activeDays / 30) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* En Uzun Seri */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1" data-testid="text-longest-streak">
                      {studyHoursStats.longestStreak} gün
                    </div>
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">En Uzun Seri</div>
                  </div>
                  <div className="ml-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((studyHoursStats.longestStreak / 30) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* En Çok Çalışılan Ay */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    {studyHoursStats.mostStudiedMonth ? (
                      <>
                        <div className="text-lg font-black text-amber-700 dark:text-amber-300 mb-1" data-testid="text-most-studied-month">
                          {studyHoursStats.mostStudiedMonth}
                        </div>
                        <div className="text-sm font-medium text-amber-600 dark:text-amber-400">En Çok Çalışılan Ay</div>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                          {studyHoursStats.mostStudiedMonthHours} saat
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg font-black text-amber-700 dark:text-amber-300 mb-1">
                          -
                        </div>
                        <div className="text-sm font-medium text-amber-600 dark:text-amber-400">En Çok Çalışılan Ay</div>
                        <div className="text-xs text-amber-600/60 dark:text-amber-400/60 mt-2">
                          Henüz çalışma verisi yok
                        </div>
                      </>
                    )}
                  </div>
                  <div className="ml-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Geliştirilmiş Ders Performansı Kartı - TYT ve AYT Ayrı - Tam Genişlik */}
        <div className="xl:col-span-4 group bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 relative overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-lg hover:shadow-2xl" data-testid="card-subject-performance">
          {/* Animasyonlu Arka Plan Öğeleri */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-yellow-500/15 to-orange-600/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

          {/* Kupa Animasyonu */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Award className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Ders Performansı</h3>
                <p className="text-sm text-muted-foreground">Genel ve branş denemeler dahil</p>
              </div>
            </div>
            
            {subjectPerformance.tyt.strongest || subjectPerformance.ayt.strongest ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TYT Performansı */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">TYT</span>
                    </div>
                  </div>
                  
                  {subjectPerformance.tyt.strongest && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-200/50 dark:border-green-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-500 rounded-lg">
                            <TrendingUp className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-green-700 dark:text-green-300">
                              {subjectPerformance.tyt.strongest.subject}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">En güçlü</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-green-600 dark:text-green-400">
                            {subjectPerformance.tyt.strongest.successRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            {subjectPerformance.tyt.strongest.totalQuestions} soru
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-green-200 dark:bg-green-800/30 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${subjectPerformance.tyt.strongest.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {subjectPerformance.tyt.medium && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-3 border border-yellow-200/50 dark:border-yellow-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-yellow-500 rounded-lg">
                            <AlertCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-yellow-700 dark:text-yellow-300">
                              {subjectPerformance.tyt.medium.subject}
                            </div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400">Geliştirilmesi gereken</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-yellow-600 dark:text-yellow-400">
                            {subjectPerformance.tyt.medium.successRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400">
                            {subjectPerformance.tyt.medium.totalQuestions} soru
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-yellow-200 dark:bg-yellow-800/30 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-amber-600 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${subjectPerformance.tyt.medium.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {subjectPerformance.tyt.weakest && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-3 border border-red-200/50 dark:border-red-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-red-500 rounded-lg">
                            <TrendingDown className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-red-700 dark:text-red-300">
                              {subjectPerformance.tyt.weakest.subject}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400">En zayıf</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-red-600 dark:text-red-400">
                            {subjectPerformance.tyt.weakest.successRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-400">
                            {subjectPerformance.tyt.weakest.totalQuestions} soru
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-red-200 dark:bg-red-800/30 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-pink-600 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${subjectPerformance.tyt.weakest.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AYT Performansı */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">AYT</span>
                    </div>
                  </div>
                  
                  {subjectPerformance.ayt.strongest && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 border border-green-200/50 dark:border-green-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-500 rounded-lg">
                            <TrendingUp className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-green-700 dark:text-green-300">
                              {subjectPerformance.ayt.strongest.subject}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">En güçlü</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-green-600 dark:text-green-400">
                            {subjectPerformance.ayt.strongest.successRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            {subjectPerformance.ayt.strongest.totalQuestions} soru
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-green-200 dark:bg-green-800/30 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${subjectPerformance.ayt.strongest.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {subjectPerformance.ayt.medium && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-3 border border-yellow-200/50 dark:border-yellow-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-yellow-500 rounded-lg">
                            <AlertCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-yellow-700 dark:text-yellow-300">
                              {subjectPerformance.ayt.medium.subject}
                            </div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400">Geliştirilmesi gereken</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-yellow-600 dark:text-yellow-400">
                            {subjectPerformance.ayt.medium.successRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400">
                            {subjectPerformance.ayt.medium.totalQuestions} soru
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-yellow-200 dark:bg-yellow-800/30 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-amber-600 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${subjectPerformance.ayt.medium.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {subjectPerformance.ayt.weakest && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-3 border border-red-200/50 dark:border-red-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-red-500 rounded-lg">
                            <TrendingDown className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-red-700 dark:text-red-300">
                              {subjectPerformance.ayt.weakest.subject}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400">En zayıf</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-red-600 dark:text-red-400">
                            {subjectPerformance.ayt.weakest.successRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-400">
                            {subjectPerformance.ayt.weakest.totalQuestions} soru
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-red-200 dark:bg-red-800/30 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-pink-600 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${subjectPerformance.ayt.weakest.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="relative mb-4">
                  <Brain className="h-16 w-16 mx-auto opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full animate-spin"></div>
                  </div>
                </div>
                <p className="font-medium text-lg mb-2">Yeterli veri bulunmuyor</p>
                <p className="text-sm">Her dersten en az 5 soru çöz</p>
                <div className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full text-xs font-medium text-purple-700 dark:text-purple-300 inline-block">
                  Analiz için veri topluyorum...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



