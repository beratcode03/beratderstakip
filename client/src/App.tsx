//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

import { Switch, Route } from "wouter";
import { sorguIstemcisi } from "./kutuphane/sorguIstemcisi";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/bilesenler/arayuz/toaster";
import { TooltipProvider } from "@/bilesenler/arayuz/tooltip";
import { ThemeProvider } from "@/bilesenler/tema-saglayici";
import Homepage from "@/sayfalar/anasayfa-detay";
import Home from "@/sayfalar/anasayfa";
import Dashboard from "@/sayfalar/panel";
import NetCalculator from "@/sayfalar/net-hesaplayici";
import Timer from "@/sayfalar/sayac";
import NotFound from "@/sayfalar/bulunamadi";
import { useEffect } from "react";
import { apiRequest } from "@/kutuphane/sorguIstemcisi";

function Router() {
  // Otomatik arşivleme - gün değişiminde çalışır
  useEffect(() => {
    const checkAndArchive = async () => {
      const lastArchiveDate = localStorage.getItem('last-archive-date');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastArchiveDate !== today) {
        try {
          await apiRequest('POST', '/api/auto-archive');
          localStorage.setItem('last-archive-date', today);
          console.log('Otomatik arşivleme tamamlandı:', today);
        } catch (error) {
          console.error('Otomatik arşivleme hatası:', error);
        }
      }
    };
    
    checkAndArchive();
    
    // Her 30 dakikada bir kontrol et (gün değişimi için)
    const interval = setInterval(checkAndArchive, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Switch>
      <Route path="/" component={Homepage} />
      <Route path="/tasks" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/net-calculator" component={NetCalculator} />
      <Route path="/timer" component={Timer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={sorguIstemcisi}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
