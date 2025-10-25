; BERAT CANKIR - Türkçe Kurulum Sihirbazı
; YKS Analiz Takip Sistemi - Özel Kurulum Metinleri

!macro customHeader
  !verbose push
  !verbose 0
  
  ; Türkçe dil seçimi
  !define MUI_LANGDLL_ALLLANGUAGES
  
  ; Kurulum başlığı ve hoş geldiniz metni
  !define MUI_WELCOMEPAGE_TITLE "Berat Cankır YKS Analiz Takip Sistemi'ne Hoş Geldiniz"
  !define MUI_WELCOMEPAGE_TEXT "Bu sihirbaz, bilgisayarınıza Berat Cankır YKS Analiz Takip Sistemi'ni kuracaktır.$\r$\n$\r$\nDevam etmeden önce diğer tüm uygulamaları kapatmanız önerilir.$\r$\n$\r$\nKuruluma başlamak için İleri'ye tıklayın."
  
  ; Lisans sayfası başlıkları
  !define MUI_LICENSEPAGE_TEXT_TOP "Lütfen lisans sözleşmesini okuyun. Kuruluma devam etmek için sözleşmeyi kabul etmelisiniz."
  !define MUI_LICENSEPAGE_TEXT_BOTTOM "Sözleşmenin tüm şartlarını kabul ediyorsanız, aşağıdaki onay kutusunu işaretleyin. Kuruluma devam etmek için sözleşmeyi kabul etmelisiniz."
  !define MUI_LICENSEPAGE_BUTTON "İleri >"
  
  ; Dizin seçimi sayfası
  !define MUI_DIRECTORYPAGE_TEXT_TOP "Kurulum programı, Berat Cankır YKS Analiz Takip Sistemi'ni aşağıdaki klasöre kuracaktır. Farklı bir klasöre kurmak için Gözat'a tıklayın."
  !define MUI_DIRECTORYPAGE_TEXT_DESTINATION "Kurulum Klasörü"
  
  ; Kurulum işlemi
  !define MUI_INSTFILESPAGE_TITLE "Kurulum devam ediyor"
  !define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "Kurulum tamamlandı"
  !define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "Kurulum başarıyla tamamlandı."
  
  ; Bitiş sayfası
  !define MUI_FINISHPAGE_TITLE "Berat Cankır YKS Analiz Takip Sistemi Kurulumu Tamamlandı"
  !define MUI_FINISHPAGE_TEXT "Berat Cankır YKS Analiz Takip Sistemi bilgisayarınıza kuruldu.$\r$\n$\r$\nKurulumu tamamlamak için Son'a tıklayın."
  !define MUI_FINISHPAGE_RUN "Berat Cankır YKS Analiz Takip Sistemi'ni Çalıştır"
  !define MUI_FINISHPAGE_RUN_TEXT "Uygulamayı şimdi başlat"
  !define MUI_FINISHPAGE_LINK "Berat Cankır GitHub Hesabı"
  !define MUI_FINISHPAGE_LINK_LOCATION "https://github.com/beratcode03"
  
  ; Kaldırma işlemi
  !define MUI_UNCONFIRMPAGE_TEXT_TOP "Berat Cankır YKS Analiz Takip Sistemi bilgisayarınızdan kaldırılacaktır."
  
  ; Buton metinleri
  !define MUI_BUTTONTEXT_FINISH "Bitir"
  !define MUI_BUTTONTEXT_ABORT "İptal"
  !define MUI_TEXT_ABORT_TITLE "Kurulum İptal Edildi"
  !define MUI_TEXT_ABORT_SUBTITLE "Kurulum tamamlanmadı."
  
  !verbose pop
!macroend

!macro customInstall
  ; Kurulum sonrası özel işlemler
  DetailPrint "Berat Cankır YKS Analiz Takip Sistemi kuruluyor..."
  DetailPrint "Dosyalar kopyalanıyor..."
!macroend

!macro customUnInstall
  ; Kaldırma işlemi
  DetailPrint "Berat Cankır YKS Analiz Takip Sistemi kaldırılıyor..."
  
  ; Kullanıcı verilerini koruma seçeneği
  MessageBox MB_YESNO|MB_ICONQUESTION "Kullanıcı verileri ve ayarları da silinsin mi?$\r$\n$\r$\n'Hayır' seçeneği ile verileriniz korunacak ve yeniden kurulumda kullanılabilecektir." IDYES removeData IDNO keepData
  
  removeData:
    DetailPrint "Kullanıcı verileri siliniyor..."
    RMDir /r "$APPDATA\beratcankir"
    RMDir /r "$LOCALAPPDATA\beratcankir"
    Goto done
  
  keepData:
    DetailPrint "Kullanıcı verileri korunuyor..."
  
  done:
    DetailPrint "Kaldırma işlemi tamamlandı."
!macroend

; BERAT CANKIR
; BERAT BILAL CANKIR
; CANKIR
