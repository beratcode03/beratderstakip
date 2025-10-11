//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

import { Sun, Moon, Clock, Home, CheckSquare, BarChart3, Calculator, Timer, Minus, Square, X } from "lucide-react";
import { useTheme } from "./tema-saglayici";
import { useState, useEffect } from "react";
import { EmojiPicker } from "./emoji-secici";
import { MotivationalQuote } from "./motivasyon-sozu";
import { Link, useLocation } from "wouter";

// Electron API - type-safe
declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      isMaximized: () => Promise<boolean>;
      onMaximizeChange: (callback: (isMaximized: boolean) => void) => void;
    };
  }
}

interface HeaderProps {
  hideClockOnHomepage?: boolean;
  onReportCounterClick?: () => void;
}

export function Header({ hideClockOnHomepage = false, onReportCounterClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [note, setNote] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  // Check if running in Electron
  useEffect(() => {
    setIsElectron(!!window.electronAPI);
    
    if (window.electronAPI) {
      // Get initial maximize state
      window.electronAPI.isMaximized().then(setIsMaximized);
      
      // Listen to maximize changes
      window.electronAPI.onMaximizeChange(setIsMaximized);
    }
  }, []);
  
  // Yerel depolamadan yükle
  useEffect(() => {
    const savedEmoji = localStorage.getItem('userEmoji');
    const savedNote = localStorage.getItem('userNote');
    if (savedEmoji) setSelectedEmoji(savedEmoji);
    if (savedNote) setNote(savedNote);
  }, []);
  
  // Yerel depolamaya kaydet
  useEffect(() => {
    localStorage.setItem('userEmoji', selectedEmoji);
  }, [selectedEmoji]);
  
  useEffect(() => {
    localStorage.setItem('userNote', note);
  }, [note]);

  // Her saniye güncelleme zamanı
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Sakarya Serdivan (Türkiye saat dilimi) için tarih ve saati biçimlendir
  const formatDateTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Europe/Istanbul',
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const dateStr = currentTime.toLocaleDateString('tr-TR', options);
    const timeStr = currentTime.toLocaleTimeString('tr-TR', timeOptions);
    
    return { dateStr, timeStr };
  };

  const isHomepage = location === '/';
  const isDashboard = location === '/dashboard';

  // Aylık rapor geri sayım hesaplaması
  const getMonthlyReportCountdown = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = lastDayOfMonth - currentDay;
    const isLastDay = currentDay === lastDayOfMonth;
    
    return { daysRemaining, isLastDay };
  };

  const { daysRemaining, isLastDay } = getMonthlyReportCountdown();

  return (
    <header className="bg-card border-b border-border shadow-sm transition-colors duration-300">
      {/* Custom Titlebar - Only in Electron */}
      {isElectron && (
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-900 dark:to-violet-900 text-white select-none flex items-center justify-between h-8 px-2" style={{ WebkitAppRegion: 'drag' } as any}>
          <div className="flex items-center gap-2">
            <img src="/icons/app-icon.png" alt="App Icon" className="w-5 h-5 rounded" />
            <span className="text-sm font-semibold">BERAT CANKIR - YKS Analiz Sistemi</span>
          </div>
          
          <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <button
              onClick={() => window.electronAPI?.minimizeWindow()}
              className="h-8 px-3 hover:bg-white/10 transition-colors flex items-center justify-center"
              data-testid="button-window-minimize"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => window.electronAPI?.maximizeWindow()}
              className="h-8 px-3 hover:bg-white/10 transition-colors flex items-center justify-center"
              data-testid="button-window-maximize"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => window.electronAPI?.closeWindow()}
              className="h-8 px-3 hover:bg-red-500 transition-colors flex items-center justify-center"
              data-testid="button-window-close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Motivasyon Sözü - Her sayfada en üstte ortada */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
        <div className="py-3 px-4">
          <div className="max-w-7xl mx-auto">
            <MotivationalQuote />
          </div>
        </div>
      </div>
      
      {/* Saat/Tarih/konum Bölümü - Her sayfada gösterilir */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
        <div className="flex justify-between items-center py-2">
          {/* Kompakt Saat ve Tarih Gösterimi - Tamamen Solda Hizalanmış */}
          <div className="flex items-start space-x-3 pl-3">
              {/* Saat Simgesi - Daha Büyük */}
              <div className="relative">
                <div className="relative w-8 h-8 bg-black/10 dark:bg-purple-950/20 backdrop-blur-xl border border-purple-500/20 dark:border-purple-400/20 rounded-lg flex items-center justify-center shadow-md">
                  <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400 drop-shadow-lg" />
                </div>
              </div>
              
              {/* Saat ve Tarih Düzeni - Dikey, daha büyük ekran */}
              <div className="flex flex-col space-y-1">
                {/* Saat Simgesi - Daha Büyük */}
                <div className="text-base font-bold bg-gradient-to-r from-purple-600 via-violet-700 to-black dark:from-purple-400 dark:via-violet-500 dark:to-gray-300 bg-clip-text text-transparent font-mono" data-testid="text-time-header">
                  {formatDateTime().timeStr}
                </div>
                
                {/* DTarih ve Yer - Yatay düzen, daha büyük metin */}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="bg-gradient-to-r from-purple-800 to-black dark:from-purple-300 dark:to-gray-200 bg-clip-text text-transparent font-medium" data-testid="text-date-header">
                    {formatDateTime().dateStr}
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <span className="text-sm">📍</span>
                    <span className="font-medium bg-gradient-to-r from-purple-600 to-violet-700 dark:from-purple-400 dark:to-violet-500 bg-clip-text text-transparent">
                      Sakarya, Serdivan
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Üst Sağ - Tema ve Profil - Tamamen sağa eğilimli */}
            <div className="flex items-center space-x-2 pr-0">
              {/* Tema Değiştirme */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors duration-200"
                title="Tema Değiştir"
                data-testid="button-theme-toggle"
              >
                {theme === "light" ? (
                  <Sun className="h-4 w-4 text-secondary-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-secondary-foreground" />
                )}
              </button>

              {/* Profil Bölümü */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground hidden sm:block">Hoşgeldiniz</span>
                <span className="font-medium text-foreground hidden sm:block">Berat Cankır</span>
                <div className="relative">
                  <button
                    onClick={() => setEmojiPickerOpen(true)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                    data-testid="button-emoji-picker"
                  >
                    {/* Profil Fotoğrafı - Her Zaman 'B' Gösterir */}
                    <span className="text-lg font-bold">B</span>
                    
                    {/* Emoji Balonu - Sağ Üst (Her Zaman emoji seçildiğinde gösterilir) */}
                    {selectedEmoji && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full border-2 border-primary flex items-center justify-center shadow-lg">
                        <span className="text-xs">{selectedEmoji}</span>
                      </div>
                    )}
                    
                    {/* Not Balonu - Alt Sağ */}
                    {note.trim() && (
                      <div className="absolute -bottom-1 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold">!</span>
                      </div>
                    )}
                    
                    {/* Araç ipucu - Artık aşağıda gösterilcek */}
                    {showTooltip && (
                      <div className="absolute top-full left-1/2 mt-2 px-2 py-1 bg-card text-card-foreground text-xs rounded shadow-lg border border-border transform -translate-x-1/2 whitespace-nowrap animate-in fade-in-0 zoom-in-95 z-50">
                        Emoji seç & Not bırak
                        {note.trim() && (
                          <div className="mt-1 text-xs italic text-muted-foreground max-w-40 truncate">
                            "{note.trim()}"
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
      </div>
      
      {/* Navigasyon Bölümü */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          <div className="flex items-center space-x-6">
            <Link href="/">
              <button 
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 ${
                  location === '/' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
                }`}
                data-testid="link-homepage"
              >
                <Home className="w-5 h-5" />
                <span>Anasayfa</span>
              </button>
            </Link>
            <Link href="/tasks">
              <button 
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 ${
                  location === '/tasks' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
                }`}
                data-testid="link-todos"
              >
                <CheckSquare className="w-5 h-5" />
                <span>Yapılacaklar</span>
              </button>
            </Link>
            <Link href="/dashboard">
              <button 
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 ${
                  location === '/dashboard' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
                }`}
                data-testid="link-dashboard"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Raporlarım</span>
              </button>
            </Link>
            <Link href="/net-calculator">
              <button 
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 ${
                  location === '/net-calculator' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
                }`}
              >
                <Calculator className="w-5 h-5" />
                <span>Net Hesapla</span>
              </button>
            </Link>
            <Link href="/timer">
              <button 
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 ${
                  location === '/timer' 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
                }`}
                data-testid="link-timer"
              >
                <Timer className="w-5 h-5" />
                <span>Sayaç</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* eöoji seçme modalı */}
      <EmojiPicker 
        open={emojiPickerOpen} 
        onOpenChange={setEmojiPickerOpen}
        selectedEmoji={selectedEmoji}
        onEmojiSelect={setSelectedEmoji}
        note={note}
        onNoteChange={setNote}
      />
    </header>
  );
}
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
