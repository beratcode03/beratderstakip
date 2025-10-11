//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

const { app, BrowserWindow, Tray, Menu, nativeImage, shell, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const { collectAndSaveIhlalData, cleanOldLogs } = require('./ihlal-logger.cjs');
const { startCentralIhlalServer } = require('./central-ihlal-server.cjs');

let mainWindow = null;
let tray = null;
let serverProcess = null;
let centralIhlalServer = null;
let isQuitting = false;
let PORT = 3000;
const isPackaged = app.isPackaged;

const logMessages = [];
const MAX_LOG_MESSAGES = 1000;

function log(message, type = 'INFO') {
  const timestamp = new Date().toLocaleTimeString('tr-TR');
  const logEntry = `[${timestamp}] [${type}] ${message}`;
  console.log(logEntry);
  
  logMessages.push(logEntry);
  if (logMessages.length > MAX_LOG_MESSAGES) {
    logMessages.shift();
  }
}

function listDirectory(dirPath, depth = 0, maxDepth = 2) {
  if (depth > maxDepth || !fs.existsSync(dirPath)) return '';
  
  try {
    const items = fs.readdirSync(dirPath);
    let output = '';
    items.slice(0, 20).forEach(item => {
      const indent = '  '.repeat(depth);
      output += `${indent}- ${item}\n`;
      if (depth < maxDepth) {
        const fullPath = path.join(dirPath, item);
        if (fs.statSync(fullPath).isDirectory()) {
          output += listDirectory(fullPath, depth + 1, maxDepth);
        }
      }
    });
    return output;
  } catch (err) {
    return `Hata: ${err.message}\n`;
  }
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 100; port++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`${startPort} ile ${startPort + 100} arasinda bos port bulunamadi!`);
}

function logError(message, error) {
  const timestamp = new Date().toLocaleTimeString('tr-TR');
  const logEntry = `[${timestamp}] [ERROR] ${message}`;
  if (error) {
    console.error(logEntry, error);
    logMessages.push(`${logEntry}\n${error.stack || error.message || error}`);
  } else {
    console.error(logEntry);
    logMessages.push(logEntry);
  }
  
  if (logMessages.length > MAX_LOG_MESSAGES) {
    logMessages.shift();
  }
}

// Kullanıcı veri klasörünü environment variable olarak ayarla
const userDataPath = app.getPath('userData');
process.env.DATA_DIR = userDataPath;

log(`📁 Veri dizini: ${userDataPath}`);
log(`📦 Packaged: ${isPackaged}`);
log(`💻 Platform: ${process.platform}`);

// .env dosyasını yükle
function loadEnvFile() {
  try {
    const envPath = isPackaged 
      ? path.join(process.resourcesPath, '.env')
      : path.join(__dirname, '..', '.env');
    
    if (fs.existsSync(envPath)) {
      log(`✅ .env dosyası bulundu: ${envPath}`);
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
          }
        }
      });
      log('✅ .env dosyası yüklendi');
    } else {
      log(`⚠️ .env dosyası bulunamadı: ${envPath}`, 'WARN');
      log('⚠️ Gmail ve OpenWeather özellikleri çalışmayabilir', 'WARN');
    }
  } catch (error) {
    logError('❌ .env dosyası yükleme hatası', error);
  }
}

loadEnvFile();

// Kurulum durumunu kontrol et ve sakla
function getSetupFilePath() {
  return path.join(userDataPath, 'setup-completed.json');
}

function isSetupCompleted() {
  try {
    const setupFile = getSetupFilePath();
    if (fs.existsSync(setupFile)) {
      const data = JSON.parse(fs.readFileSync(setupFile, 'utf-8'));
      return data.completed === true;
    }
    return false;
  } catch (err) {
    log('⚠️ Kurulum dosyası okunamadı', 'WARN');
    return false;
  }
}

function saveSetupCompleted() {
  try {
    const setupFile = getSetupFilePath();
    fs.writeFileSync(setupFile, JSON.stringify({
      completed: true,
      completedAt: new Date().toISOString()
    }), 'utf-8');
    log('✅ Kurulum tamamlandı olarak kaydedildi');
    return true;
  } catch (err) {
    logError('❌ Kurulum dosyası yazılamadı', err);
    return false;
  }
}

// Kurulum penceresi oluştur
function createSetupWindow() {
  log('🎬 Kurulum penceresi oluşturuluyor...');
  
  const setupWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    frame: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icons', 'app-icon.png'),
    title: 'Kurulum - BERAT CANKIR YKS Analiz Sistemi',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    show: false
  });

  setupWindow.once('ready-to-show', () => {
    log('✅ Kurulum penceresi hazır');
    setupWindow.show();
    setupWindow.focus();
  });

  const setupHtml = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kurulum</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .logo {
          font-size: 48px;
          text-align: center;
          margin-bottom: 10px;
        }
        
        h1 {
          text-align: center;
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .subtitle {
          text-align: center;
          opacity: 0.9;
          margin-bottom: 30px;
        }
        
        .step {
          display: none;
        }
        
        .step.active {
          display: block;
        }
        
        .step-content {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 30px;
          margin: 20px 0;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .step-content h2 {
          margin-bottom: 15px;
          font-size: 20px;
        }
        
        .step-content p {
          line-height: 1.6;
          margin-bottom: 15px;
          opacity: 0.95;
        }
        
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        .checkbox-container input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        
        .checkbox-container label {
          cursor: pointer;
          user-select: none;
        }
        
        .buttons {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
        }
        
        button {
          padding: 12px 30px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        button.primary {
          background: white;
          color: #667eea;
        }
        
        button.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
        }
        
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .success {
          text-align: center;
          padding: 40px;
        }
        
        .success-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🎓</div>
        <h1>BERAT CANKIR</h1>
        <div class="subtitle">YKS Analiz ve Takip Sistemi</div>
        
        <!-- Hoş Geldiniz -->
        <div class="step active" id="step-welcome">
          <div class="step-content">
            <h2>Hoş Geldiniz!</h2>
            <p>YKS Analiz ve Takip Sistemi'ne hoş geldiniz.</p>
            <p>Bu uygulama, YKS sınavına hazırlananlar için geliştirilmiş profesyonel bir analiz sistemidir.</p>
            <p>Özellikler:</p>
            <ul style="margin-left: 20px; line-height: 1.8;">
              <li>✅ Deneme sınavı sonuç analizi</li>
              <li>✅ Soru bazlı istatistikler</li>
              <li>✅ Net hesaplayıcı</li>
              <li>✅ Çalışma takibi ve görev yönetimi</li>
              <li>✅ Detaylı performans raporları</li>
            </ul>
          </div>
          <div class="buttons">
            <button class="primary" onclick="nextStep()">İleri</button>
          </div>
        </div>
        
        <!-- KVKK -->
        <div class="step" id="step-kvkk">
          <div class="step-content">
            <h2>KVKK - Kişisel Verilerin Korunması</h2>
            <p><strong>Veri Toplama ve Kullanımı:</strong></p>
            <p>Bu uygulama, tüm verilerinizi sadece bilgisayarınızda depolar. Hiçbir veri internete gönderilmez veya üçüncü taraflarla paylaşılmaz.</p>
            <p><strong>Saklanan Bilgiler:</strong></p>
            <ul style="margin-left: 20px; line-height: 1.8;">
              <li>• Deneme sınavı sonuçlarınız</li>
              <li>• Çalışma süreleriniz ve görevleriniz</li>
              <li>• Soru çözüm istatistikleriniz</li>
            </ul>
            <p><strong>Veri Güvenliği:</strong></p>
            <p>Tüm verileriniz şifreli olarak bilgisayarınızda saklanır ve sadece siz erişebilirsiniz.</p>
            <p style="margin-top: 15px;"><strong>Devam ederek, verilerinizin yukarıda belirtilen şekilde işlenmesini kabul etmiş olursunuz.</strong></p>
          </div>
          <div class="checkbox-container">
            <input type="checkbox" id="kvkk-accept" onchange="updateAcceptButton()">
            <label for="kvkk-accept">KVKK aydınlatma metnini okudum ve kabul ediyorum</label>
          </div>
          <div class="buttons">
            <button class="primary" id="accept-button" disabled onclick="acceptKVKK()">Kabul Et ve Devam</button>
          </div>
        </div>
        
        <!-- Yükleme -->
        <div class="step" id="step-loading">
          <div class="loading">
            <div class="spinner"></div>
            <p>Uygulama hazırlanıyor...</p>
          </div>
        </div>
        
        <!-- Tamamlandı -->
        <div class="step" id="step-complete">
          <div class="success">
            <div class="success-icon">✅</div>
            <h2>Kurulum Tamamlandı!</h2>
            <p style="margin-top: 15px;">Uygulama kullanıma hazır.</p>
          </div>
          <div class="buttons">
            <button class="primary" onclick="completeSetup()">Uygulamayı Başlat</button>
          </div>
        </div>
      </div>
      
      <script>
        let currentStep = 0;
        const steps = ['welcome', 'kvkk', 'loading', 'complete'];
        
        function nextStep() {
          document.getElementById(\`step-\${steps[currentStep]}\`).classList.remove('active');
          currentStep++;
          document.getElementById(\`step-\${steps[currentStep]}\`).classList.add('active');
        }
        
        function updateAcceptButton() {
          const checkbox = document.getElementById('kvkk-accept');
          const button = document.getElementById('accept-button');
          button.disabled = !checkbox.checked;
        }
        
        function acceptKVKK() {
          nextStep(); // loading
          
          // 2 saniye sonra tamamlandı ekranına geç
          setTimeout(() => {
            nextStep(); // complete
          }, 2000);
        }
        
        function completeSetup() {
          window.electron.setupComplete();
        }
      </script>
    </body>
    </html>
  `;

  setupWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(setupHtml));
  
  return setupWindow;
}

// Ana pencereyi oluştur
function createWindow() {
  log('🪟 Ana pencere oluşturuluyor...');
  
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: false,
    frame: false, // Custom titlebar için frameless window
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icons', 'app-icon.png'),
    title: 'BERAT CANKIR - YKS Analiz Sistemi',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: process.env.ENABLE_DEVTOOLS === 'true' || !isPackaged // Dev mode veya ENABLE_DEVTOOLS=true ise acik
    },
    show: false // Hazır olana kadar gizli tut
  });

  mainWindow.once('ready-to-show', () => {
    log('✅ Pencere hazır, gösteriliyor...');
    mainWindow.show();
    mainWindow.focus();
  });

  // Pencere kapatma
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      log('📦 Pencere gizlendi (arka planda çalışıyor)');
      
      if (tray && process.platform === 'win32') {
        tray.displayBalloon({
          title: 'BERAT CANKIR - YKS Analiz Sistemi',
          content: 'Uygulama arka planda çalışmaya devam ediyor.'
        });
      }
    }
  });

  mainWindow.on('closed', () => {
    log('🔴 Ana pencere kapatıldı');
    mainWindow = null;
  });

  // Maximize/unmaximize durumunu dinle
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximize-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximize-change', false);
  });

  // F11 tuşu için tam ekran toggle
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      const isFullScreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullScreen);
      log(`🪟 F11 - Tam ekran: ${!isFullScreen ? 'AÇIK' : 'KAPALI'}`);
    }
  });

  return mainWindow;
}

// Sistem tepsisi ikonu oluştur
function createTray() {
  log('🎯 Sistem tepsisi ikonu oluşturuluyor...');
  
  let iconPath;
  if (process.platform === 'win32') {
    iconPath = path.join(__dirname, 'icons', 'app-icon.ico');
  } else {
    iconPath = path.join(__dirname, 'icons', 'app-icon.png');
  }
  
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'YKS Analiz Sistemi',
      enabled: false,
      icon: icon.resize({ width: 16, height: 16 })
    },
    { type: 'separator' },
    {
      label: 'Uygulamayı Aç',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
          log('🪟 Uygulama açıldı (tray menüsünden)');
        }
      }
    },
    {
      label: 'Tam Ekran',
      type: 'checkbox',
      checked: true,
      click: (menuItem) => {
        if (mainWindow) {
          mainWindow.setFullScreen(menuItem.checked);
          log(`🪟 Tam ekran: ${menuItem.checked ? 'AÇIK' : 'KAPALI'}`);
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Logları Görüntüle',
      click: () => {
        showLogsWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Server Yeniden Başlat',
      click: () => {
        log('🔄 Server yeniden başlatılıyor...');
        if (serverProcess) {
          try {
            serverProcess.kill();
            log('✅ Eski server kapatıldı');
          } catch (err) {
            log('⚠️ Server kapatma hatası (görmezden geliniyor)', 'WARN');
          }
        }
        setTimeout(() => {
          startServer()
            .then(() => {
              log('✅ Server yeniden başlatıldı');
              if (mainWindow) {
                mainWindow.reload();
                log('🔄 Sayfa yenilendi');
              }
            })
            .catch(err => {
              logError('❌ Server yeniden başlatma hatası', err);
              dialog.showErrorBox('Hata', 'Server yeniden başlatılamadı. Lütfen uygulamayı kapatıp tekrar açın.');
            });
        }, 1000);
      }
    },
    {
      label: 'Uygulamayı Tamamen Yeniden Başlat',
      click: () => {
        log('🔄 Uygulama tamamen yeniden başlatılıyor...');
        isQuitting = true;
        
        // Server'ı kapat
        if (serverProcess) {
          try {
            serverProcess.kill();
          } catch (err) {
            log('⚠️ Server kapatma hatası', 'WARN');
          }
        }
        
        // Uygulamayı yeniden başlat
        app.relaunch();
        app.quit();
      }
    },
    {
      label: 'Çıkış',
      click: () => {
        log('👋 Uygulama kapatılıyor (kullanıcı isteği)...');
        isQuitting = true;
        
        // Server'ı önce düzgün kapat
        if (serverProcess) {
          try {
            log('🔴 Server kapatılıyor...');
            serverProcess.kill('SIGTERM');
            setTimeout(() => {
              if (serverProcess) {
                serverProcess.kill('SIGKILL');
              }
            }, 2000);
          } catch (err) {
            log('⚠️ Server kapatma hatası', 'WARN');
          }
        }
        
        // Uygulamayı kapat
        setTimeout(() => {
          app.quit();
        }, 500);
      }
    }
  ]);
  
  tray.setToolTip('BERAT CANKIR - YKS Analiz Sistemi');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
        log('📦 Pencere gizlendi (tray tıklama)');
      } else {
        mainWindow.show();
        mainWindow.focus();
        log('🪟 Pencere gösterildi (tray tıklama)');
      }
    }
  });
  
  if (process.platform === 'win32') {
    tray.on('balloon-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }
  
  log('✅ Sistem tepsisi ikonu oluşturuldu');
}

// Log görüntüleme penceresi
function showLogsWindow() {
  const logWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'Uygulama Logları',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const logsHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Uygulama Logları</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Consolas', 'Monaco', monospace;
          background: #1a1a1a;
          color: #e0e0e0;
          padding: 20px;
        }
        h1 {
          color: #8b5cf6;
          margin-bottom: 20px;
          font-size: 24px;
        }
        .log-container {
          background: #0a0a0a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 15px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }
        .log-entry {
          padding: 8px 12px;
          margin: 4px 0;
          border-left: 3px solid #444;
          font-size: 13px;
          line-height: 1.5;
          background: rgba(255, 255, 255, 0.02);
        }
        .log-entry:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .log-entry.info {
          border-left-color: #3b82f6;
        }
        .log-entry.warn {
          border-left-color: #f59e0b;
          color: #fbbf24;
        }
        .log-entry.error {
          border-left-color: #ef4444;
          color: #fca5a5;
        }
        .controls {
          margin-bottom: 15px;
          display: flex;
          gap: 10px;
        }
        button {
          padding: 8px 16px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        button:hover {
          background: #7c3aed;
        }
        .stats {
          margin-top: 15px;
          padding: 12px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 6px;
          color: #a78bfa;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <h1>📋 Uygulama Logları</h1>
      <div class="controls">
        <button onclick="location.reload()">🔄 Yenile</button>
        <button onclick="scrollToBottom()">⬇️ En Alta Git</button>
        <button onclick="copyLogs()">📋 Kopyala</button>
      </div>
      <div class="stats">
        Toplam Log: ${logMessages.length} | Son Güncelleme: ${new Date().toLocaleTimeString('tr-TR')}
      </div>
      <div class="log-container" id="logs">
        ${logMessages.map(log => {
          let className = 'info';
          if (log.includes('[ERROR]')) className = 'error';
          if (log.includes('[WARN]')) className = 'warn';
          return `<div class="log-entry ${className}">${escapeHtml(log)}</div>`;
        }).join('')}
      </div>
      <script>
        function scrollToBottom() {
          const container = document.getElementById('logs');
          container.scrollTop = container.scrollHeight;
        }
        function copyLogs() {
          const logs = ${JSON.stringify(logMessages.join('\n'))};
          navigator.clipboard.writeText(logs).then(() => {
            alert('Loglar panoya kopyalandı!');
          });
        }
        function escapeHtml(text) {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }
        scrollToBottom();
      </script>
    </body>
    </html>
  `;

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (char) => {
      const escape = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return escape[char];
    });
  }

  logWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(logsHtml));
  log('📋 Log görüntüleme penceresi açıldı');
}

// Server başlat
function startServer() {
  return new Promise((resolve, reject) => {
    // Eğer server zaten çalışıyorsa, önce kapat
    if (serverProcess) {
      log('⚠️ Server zaten çalışıyor, önce kapatılıyor...', 'WARN');
      try {
        serverProcess.kill();
        serverProcess = null;
      } catch (err) {
        log('⚠️ Server kapatma hatası (görmezden geliniyor)', 'WARN');
      }
    }

    log('⚡ Server başlatılıyor...');

    const isWin = process.platform === 'win32';
    const rootDir = path.join(__dirname, '..');

    let command, args, options;
    let serverPath;

    if (isPackaged) {
      const resourcesPath = process.resourcesPath;
      
      const possiblePaths = [
        path.join(resourcesPath, 'app.asar.unpacked', 'dist', 'index.cjs'),
        path.join(resourcesPath, 'app.asar', 'dist', 'index.cjs'),
        path.join(resourcesPath, 'app', 'dist', 'index.cjs'),
        path.join(resourcesPath, 'dist', 'index.cjs'),
        path.join(__dirname, '..', 'dist', 'index.cjs'),
      ];
      
      log('📁 Server path\'leri kontrol ediliyor...');
      log(`📁 resourcesPath: ${resourcesPath}`);
      log(`📁 __dirname: ${__dirname}`);
      
      for (const p of possiblePaths) {
        log(`   Deneniyor: ${p} ${fs.existsSync(p) ? '✅' : '❌'}`);
        if (fs.existsSync(p)) {
          serverPath = p;
          log(`✅ Server bulundu: ${serverPath}`);
          break;
        }
      }
      
      if (!serverPath) {
        const errorMsg = `Server dosyasi bulunamadi!\n\nKontrol edilen konumlar:\n${possiblePaths.map(p => `- ${p}`).join('\n')}\n\nDosya yapisi:\n${listDirectory(resourcesPath)}\n\nUygulamayi yeniden kurun veya destek alin.`;
        logError(errorMsg);
        dialog.showErrorBox('Server Hatasi', errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      log(`📦 Production - Server: ${serverPath}`);

      const distPublicPath = path.join(path.dirname(serverPath), 'public');
      if (!fs.existsSync(distPublicPath)) {
        const errorMsg = `Frontend dosyalari bulunamadi!\n\nBeklenen konum: ${distPublicPath}\n\nUygulamayi yeniden kurun.`;
        logError(errorMsg);
        dialog.showErrorBox('Frontend Hatasi', errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      command = process.execPath;
      args = [serverPath];
      options = {
        cwd: path.dirname(serverPath),
        env: { 
          ...process.env,
          ELECTRON_RUN_AS_NODE: '1',
          NODE_ENV: 'production',
          PORT: PORT.toString(),
          DATA_DIR: userDataPath
        },
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      };

    } else {
      // Development modu
      const npmCmd = isWin ? 'npm.cmd' : 'npm';
      command = npmCmd;
      args = ['run', 'dev'];
      options = {
        cwd: rootDir,
        env: { 
          ...process.env, 
          NODE_ENV: 'development',
          PORT: PORT.toString(),
          DATA_DIR: userDataPath
        },
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
      };
      log('🔧 Development modu - npm run dev');
    }

    log(`💻 Komut: ${command} ${args.join(' ')}`);
    log(`💻 CWD: ${options.cwd}`);

    try {
      serverProcess = spawn(command, args, options);
    } catch (spawnError) {
      logError('❌ Server process spawn hatası', spawnError);
      reject(spawnError);
      return;
    }

    let serverStarted = false;
    let startupErrors = [];

    serverProcess.stdout.on('data', (data) => {
      const text = data.toString().trim();
      if (text) {
        log(`[SERVER] ${text}`);

        if (!serverStarted && (text.includes('localhost:5000') || text.includes('Dersime dönebilirim') || text.includes('0.0.0.0:5000'))) {
          serverStarted = true;
          log('✅ Server başarıyla başlatıldı!');
          log(`🌐 URL: http://localhost:${PORT}`);
          setTimeout(resolve, 1500);
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const errorMsg = data.toString().trim();
      if (errorMsg && !errorMsg.includes('ExperimentalWarning') && !errorMsg.includes('deprecated')) {
        log(`[SERVER ERROR] ${errorMsg}`, 'ERROR');
        if (!serverStarted) {
          startupErrors.push(errorMsg);
        }
      }
    });

    serverProcess.on('error', (error) => {
      logError('❌ Server başlatma hatası', error);
      
      let errorMsg = 'Server başlatılamadı.\n\n';
      
      if (error.code === 'ENOENT') {
        errorMsg += `Gerekli dosya bulunamadı: ${error.path || command}\n\n`;
        errorMsg += `Komut: ${command} ${args.join(' ')}\n`;
        errorMsg += `Çalışma dizini: ${options.cwd}\n\n`;
        errorMsg += `ÇÖZÜM:\n`;
        errorMsg += `1. Uygulamayı tamamen kapatın\n`;
        errorMsg += `2. Uygulamayı yeniden kurun (npm run electron:build)\n`;
        errorMsg += `3. dist/index.cjs dosyasının oluşturulduğundan emin olun\n\n`;
        errorMsg += `Sorun devam ederse loglara bakın (Tray > Logları Görüntüle)`;
      } else if (error.code === 'EACCES') {
        errorMsg += `Dosyaya erişim izni yok.\n\n`;
        errorMsg += `Uygulamayı yönetici olarak çalıştırmayı deneyin.`;
      } else {
        errorMsg += `Hata: ${error.message}\n`;
        errorMsg += `Kod: ${error.code || 'Bilinmiyor'}\n\n`;
        errorMsg += `Uygulamayı yeniden başlatmayı deneyin.`;
      }
      
      dialog.showErrorBox('Server Başlatma Hatası', errorMsg);
      reject(error);
    });

    serverProcess.on('close', (code) => {
      log(`🔴 Server kapandı (kod: ${code})`);
      
      if (code !== 0 && code !== null && startupErrors.length > 0) {
        log(`❌ Server başlatma hataları:\n${startupErrors.join('\n')}`, 'ERROR');
      }
      
      serverProcess = null;

      // Sadece beklenmedik kapanmalarda yeniden başlat
      // Normal kapanma (kod: 0) veya uygulama kapanıyorsa yeniden başlatma
      if (!isQuitting && code !== 0 && code !== null) {
        log(`🔄 Server beklenmedik şekilde kapandı (kod: ${code}), 5 saniye sonra yeniden başlatılıyor...`, 'WARN');
        setTimeout(() => {
          if (!isQuitting) {
            log('🔄 Server yeniden başlatılıyor...');
            startServer().catch(err => {
              logError('❌ Server yeniden başlatma hatası', err);
              // 3 kez denedikten sonra kullanıcıya bildir
              dialog.showErrorBox(
                'Server Hatası', 
                'Server sürekli kapanıyor. Lütfen uygulamayı kapatıp yeniden açın.\n\nSorun devam ederse uygulamayı yeniden kurun.'
              );
            });
          }
        }, 5000);
      }
    });

    // Timeout süresini artır
    setTimeout(() => {
      if (!serverStarted) {
        if (startupErrors.length > 0) {
          log(`⚠️ Server 60 saniyede başlamadı. Hatalar:\n${startupErrors.join('\n')}`, 'WARN');
        } else {
          log('⚠️ Server 60 saniyede başlamadı ama devam ediliyor...', 'WARN');
        }
        resolve();
      }
    }, 60000);
  });
}

// Uygulamayı yükle
async function loadApp(window) {
  log('🌐 Uygulama yükleniyor...');
  
  // HER ZAMAN localhost'tan yükle
  // Çünkü:
  // 1. Server zaten static files'ı serve ediyor
  // 2. Vite build'i absolute path kullanıyor (/assets/...)
  // 3. loadFile ile file:// protokolü çalışmıyor (absolute paths çalışmaz)
  try {
    log(`🌐 Localhost'tan yukleniyor: http://localhost:${PORT}`);
    await window.loadURL(`http://localhost:${PORT}`);
    log('✅ Uygulama basariyla yuklendi!');
    return true;
  } catch (err) {
    logError('❌ Localhost yukleme hatasi', err);
    return false;
  }
}

// Ana başlatma fonksiyonu
async function initialize() {
  try {
    log('\n==============================================');
    log('  BERAT CANKIR - YKS Analiz Sistemi     ');
    log('  Yapimci: BERAT BILAL CANKIR                      ');
    log('==============================================\n');
    
    // Kurulum kontrolü
    const setupCompleted = isSetupCompleted();
    
    if (!setupCompleted) {
      log('🎬 İlk kurulum gerekiyor...');
      const setupWindow = createSetupWindow();
      
      // Kurulum tamamlanınca ana uygulamayı başlat
      ipcMain.once('setup-complete', async () => {
        log('✅ Kurulum tamamlandı, ana uygulama başlatılıyor...');
        saveSetupCompleted();
        setupWindow.close();
        
        // Ana uygulama akışını başlat
        await startMainApp();
      });
      
      return;
    }
    
    // Kurulum zaten tamamlanmış, direkt ana uygulamayı başlat
    await startMainApp();
    
  } catch (error) {
    logError('\n❌ Baslatma hatası', error);
    
    if (!tray) {
      createTray();
    }
    
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`
        if (window.showError) {
          window.showError('Baslatma hatası: ${error.message}. Lutfen uygulamayı yeniden baslatin.');
        }
      `);
    }
  }
}

// Ana uygulamayı başlat
async function startMainApp() {
  // 1. Sistem tepsisi
  log('🎯 1/4: Sistem tepsisi ikonu olusturuluyor...');
  createTray();
  
  // 2. Ana pencere
  log('🎯 2/4: Ana pencere olusturuluyor...');
  const window = createWindow();
  
  // Loading ekranı göster
  const loadingPath = path.join(__dirname, 'loading.html');
  await window.loadFile(loadingPath);
  log('⏳ Loading ekranı gosteriliyor...');
  
  // 3. Port kontrolü ve server başlat
  log('🎯 3/5: Port kontrolü yapılıyor...');
  
  const portAvailable = await isPortAvailable(PORT);
  if (!portAvailable) {
    log(`⚠️ Port ${PORT} kullanımda, boş port aranıyor...`, 'WARN');
    try {
      PORT = await findAvailablePort(PORT + 1);
      log(`✅ Boş port bulundu: ${PORT}`);
    } catch (err) {
      logError('❌ Boş port bulunamadı', err);
      dialog.showErrorBox('Port Hatası', 'Uygulamayı başlatmak için boş port bulunamadı.\n\nDiğer programları kapatıp tekrar deneyin.');
    }
  } else {
    log(`✅ Port ${PORT} kullanılabilir`);
  }
  
  log('🎯 4/5: Backend server başlatılıyor...');
  
  try {
    await Promise.race([
      startServer(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Server timeout (30s)')), 30000)
      )
    ]);
    log('✅ Server başlatıldı');
  } catch (err) {
    logError('⚠️ Server başlatma hatası (devam ediliyor)', err);
  }
  
  // 5. Uygulamayı yükle
  log('🎯 5/5: Ana uygulama yukleniyor...');
  
  // Kısa bekleme
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const loaded = await loadApp(window);
  
  if (!loaded) {
    logError('❌ Uygulama yuklenemedi!');
    window.webContents.executeJavaScript(`
      if (window.showError) {
        window.showError('Uygulama yuklenemedi. Lutfen uygulamayı yeniden baslatin.');
      }
    `);
    return;
  }
  
  log('\n==============================================');
  log('    ✅ BERAT CANKIR UYGULAMA HAZIR!                ');
  log('==============================================\n');
  log('📱 Uygulama tam ekran modunda acildi');
  log('🎯 Sistem tepsisinde ikon var');
  log('💾 Verileriniz: ' + userDataPath);
  log('\n📝 Kisayollar:');
  log('   • F11         : Tam ekran ac/kapa');
  log('   • Alt+F4      : Arka plana gonder');
  log('   • Tray Ikon   : Goster/Gizle');
  log('   • Tray Menu   : Sag tik -> Loglari Goruntule\n');

  // Otomatik güncelleme kontrolü (sadece production'da)
  if (isPackaged) {
    log('🔄 Güncelleme kontrolü yapılıyor...');
    autoUpdater.checkForUpdatesAndNotify();
  }

  // Windows bildirimi
  if (process.platform === 'win32' && tray) {
    setTimeout(() => {
      tray.displayBalloon({
        title: 'YKS Analiz Sistemi',
        content: 'Uygulama calisiyor! Sistem tepsisinden kontrol edebilirsiniz.',
        icon: nativeImage.createFromPath(path.join(__dirname, 'icons', 'app-icon.png'))
      });
    }, 2000);
  }
}

// Uygulama kapatılırken temizlik
app.on('before-quit', (e) => {
  if (!isQuitting) {
    e.preventDefault();
    log('⚠️ Cikis engellendi - sadece sistem tepsisi menusunden cikabilirsiniz', 'WARN');
    return false;
  }
  
  log('🔴 Uygulama kapatiliyor...');
  
  // Server'ı kapat
  if (serverProcess) {
    log('🛑 Server kapatiliyor...');
    try {
      if (process.platform === 'win32') {
        try {
          execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' });
          log('✅ Server kapatildi (Windows)');
        } catch (err) {
          log('⚠️ Server kapatma hatasi (Windows)', 'WARN');
        }
      } else {
        serverProcess.kill('SIGKILL');
        log('✅ Server kapatildi ');
      }
    } catch (err) {
      logError('Server kapatma hatasi', err);
    }
    serverProcess = null;
  }
  
  // Port temizliği (Windows)
  if (process.platform === 'win32') {
    try {
      const output = execSync('netstat -ano | findstr :5000', { encoding: 'utf8', stdio: 'pipe' }).toString();
      const lines = output.split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const match = line.match(/\s+(\d+)\s*$/);
        if (match && match[1]) {
          pids.add(match[1]);
        }
      });
      
      pids.forEach(pid => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          log(`✅ Port 5000 temizlendi (PID: ${pid})`);
        } catch (err) {}
      });
    } catch (err) {}
  }
});

app.on('will-quit', () => {
  log('👋 Hoşçakal!');
});

app.on('window-all-closed', () => {
  log('📦 Tüm pencereler kapandı - arka planda çalışıyor');
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

async function checkAndCollectKVKKData() {
  try {
    const consentFile = path.join(app.getPath('userData'), 'kvkk-consent.json');
    
    if (fs.existsSync(consentFile)) {
      const consent = JSON.parse(fs.readFileSync(consentFile, 'utf-8'));
      if (consent.accepted) {
        log('✅ KVKK: Kullanıcı daha önce onay vermiş, veri toplama atlanıyor');
        cleanOldLogs();
        return;
      }
    }
    
    const response = await dialog.showMessageBox({
      type: 'info',
      title: 'KVKK - Veri İşleme ve Gizlilik Aydınlatması',
      message: 'YKS Analiz Takip Sistemi - Kullanım Koşulları',
      detail: `Bu yazılımı kullanmak için lütfen aşağıdaki koşulları okuyun ve kabul edin:\n\n🔒 VERİ İŞLEME VE GİZLİLİK AYDINLATMASI\n\nUygulama, yalnızca lisans/telif ihlallerini tespit etmek amacıyla sınırlı teknik veriler toplayabilir:\n\n• Bilgisayar/cihaz özellikleri (işletim sistemi, donanım, sürüm bilgisi)\n• IP adresi\n• MAC adresi\n• Yaklaşık konum bilgisi\n• Kullanıcı adı ve bilgisayar adı\n\nToplanan veriler:\n✓ YALNIZCA lisans ihlallerinin tespiti için kullanılır\n✓ Reklam, pazarlama, satış amaçlı kullanılmaz\n✓ Üçüncü taraflarla paylaşılmaz\n✓ 6 ay (180 gün) sonra otomatik silinir\n\nDetaylı bilgi için LICENSE.txt dosyasını okuyabilirsiniz.\n\n"Kabul Ediyorum" seçeneğini tıklayarak bu koşulları kabul etmiş olursunuz.`,
      buttons: ['Kabul Ediyorum', 'Reddet ve Çık'],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    });
    
    if (response.response === 0) {
      log('✅ KVKK: Kullanıcı onay verdi, kullanıcı bilgileri soruluyor...');
      
      // Kullanıcı bilgilerini al
      const userInfo = await collectUserInfo();
      
      fs.writeFileSync(consentFile, JSON.stringify({
        accepted: true,
        timestamp: new Date().toISOString(),
        version: app.getVersion(),
        userInfo
      }, null, 2), 'utf-8');
      
      const result = await collectAndSaveIhlalData(true, userInfo);
      
      if (result.success) {
        log(`✅ KVKK: Veriler başarıyla toplandı. Kurulum #${result.installCount}`);
        log(`📁 KVKK: Loglar: ${result.logsDirectory}`);
      } else {
        logError('❌ KVKK: Veri toplama başarısız', new Error(result.error || result.reason));
      }
    } else {
      log('❌ KVKK: Kullanıcı onay vermedi, uygulama kapatılıyor');
      app.quit();
    }
  } catch (error) {
    logError('❌ KVKK onay kontrolü hatası', error);
  }
}

async function collectUserInfo() {
  try {
    // Kullanıcıdan isim soyisim bilgisini al
    const userInfoWindow = new BrowserWindow({
      width: 500,
      height: 400,
      modal: true,
      frame: false,
      resizable: false,
      backgroundColor: '#0a0a0a',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    const formHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: white;
          }
          .container {
            background: rgba(10, 10, 10, 0.95);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            width: 90%;
            max-width: 450px;
          }
          h2 {
            margin-bottom: 10px;
            color: #a78bfa;
            font-size: 24px;
          }
          p {
            margin-bottom: 30px;
            color: #d1d5db;
            font-size: 14px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            color: #e5e7eb;
            font-size: 14px;
            font-weight: 500;
          }
          input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #374151;
            border-radius: 10px;
            background: #1f2937;
            color: white;
            font-size: 15px;
            transition: all 0.3s;
          }
          input:focus {
            outline: none;
            border-color: #8b5cf6;
            background: #111827;
          }
          button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
          }
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .info-text {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 15px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🎓 Kullanıcı Bilgileri</h2>
          <p>Lütfen bilgilerinizi girin (lisans doğrulama için)</p>
          <form id="userForm">
            <div class="form-group">
              <label for="firstName">Ad</label>
              <input type="text" id="firstName" required placeholder="Adınız">
            </div>
            <div class="form-group">
              <label for="lastName">Soyad</label>
              <input type="text" id="lastName" required placeholder="Soyadınız">
            </div>
            <div class="form-group">
              <label for="email">E-posta (Opsiyonel)</label>
              <input type="email" id="email" placeholder="email@ornek.com">
            </div>
            <button type="submit">Devam Et</button>
            <p class="info-text">🔒 Bilgileriniz güvenli bir şekilde saklanır</p>
          </form>
        </div>
        <script>
          const { ipcRenderer } = require('electron');
          document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const userInfo = {
              firstName: document.getElementById('firstName').value.trim(),
              lastName: document.getElementById('lastName').value.trim(),
              email: document.getElementById('email').value.trim() || 'Belirtilmedi'
            };
            ipcRenderer.send('user-info-submit', userInfo);
          });
        </script>
      </body>
      </html>
    `;

    userInfoWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(formHtml));

    return new Promise((resolve) => {
      ipcMain.once('user-info-submit', (event, userInfo) => {
        userInfoWindow.close();
        log(`👤 Kullanıcı bilgileri alındı: ${userInfo.firstName} ${userInfo.lastName}`);
        resolve(userInfo);
      });
    });
  } catch (error) {
    logError('❌ Kullanıcı bilgisi toplama hatası', error);
    return {
      firstName: 'Belirtilmedi',
      lastName: 'Belirtilmedi',
      email: 'Belirtilmedi'
    };
  }
}

// İhlal izleme sistemi
function startViolationMonitoring() {
  try {
    const appPath = app.getAppPath();
    const execPath = process.execPath;
    const installLocationFile = path.join(app.getPath('userData'), 'install-location.json');
    
    // İlk kurulum lokasyonunu kaydet
    if (!fs.existsSync(installLocationFile)) {
      const installInfo = {
        appPath,
        execPath,
        installDate: new Date().toISOString(),
        platform: process.platform,
        computerName: require('os').hostname()
      };
      fs.writeFileSync(installLocationFile, JSON.stringify(installInfo, null, 2), 'utf-8');
      log(`📍 Kurulum lokasyonu kaydedildi: ${appPath}`);
    } else {
      // Lokasyon değişikliği kontrolü
      const savedLocation = JSON.parse(fs.readFileSync(installLocationFile, 'utf-8'));
      
      if (savedLocation.appPath !== appPath || savedLocation.execPath !== execPath) {
        log('🚨 İHLAL TESPİT EDİLDİ: Uygulama farklı bir lokasyondan çalıştırılıyor!', 'WARN');
        log(`   Orijinal: ${savedLocation.appPath}`, 'WARN');
        log(`   Şimdiki: ${appPath}`, 'WARN');
        
        // İhlal kaydı oluştur
        collectAndSaveIhlalData(true, null, {
          violationType: 'LOCATION_CHANGE',
          originalPath: savedLocation.appPath,
          currentPath: appPath,
          originalExec: savedLocation.execPath,
          currentExec: execPath,
          detectedAt: new Date().toISOString()
        });
      }
    }
    
    // Arşiv dosyası kontrolü (Her 30 saniyede bir)
    setInterval(() => {
      checkForArchiveViolation();
    }, 30000);
    
    log('🔒 İhlal izleme sistemi başlatıldı');
  } catch (error) {
    logError('❌ İhlal izleme başlatma hatası', error);
  }
}

function checkForArchiveViolation() {
  try {
    const appPath = app.getAppPath();
    const parentDir = path.dirname(appPath);
    
    // .asar, .zip, .rar gibi arşiv formatlarını kontrol et
    const archiveExtensions = ['.asar', '.zip', '.rar', '.7z', '.tar', '.gz'];
    const isInArchive = archiveExtensions.some(ext => appPath.toLowerCase().includes(ext));
    
    if (isInArchive && !appPath.includes('app.asar')) {
      log('🚨 İHLAL TESPİT EDİLDİ: Uygulama arşiv dosyası içinde!', 'WARN');
      
      collectAndSaveIhlalData(true, null, {
        violationType: 'ARCHIVE_DETECTED',
        archivePath: appPath,
        detectedAt: new Date().toISOString()
      });
    }
    
    // Desktop dışında bir yerde mi kontrolü
    const desktopPath = path.join(require('os').homedir(), 'Desktop');
    const documentsPath = path.join(require('os').homedir(), 'Documents');
    const downloadsPath = path.join(require('os').homedir(), 'Downloads');
    
    const isInUnauthorizedLocation = !appPath.includes(desktopPath) && 
                                     !appPath.includes(documentsPath) &&
                                     !appPath.includes(downloadsPath) &&
                                     !appPath.includes('Program Files') &&
                                     !appPath.includes('AppData');
    
    if (isInUnauthorizedLocation && !appPath.includes('app.asar')) {
      log('⚠️ Uyarı: Uygulama yetkisiz bir konumda çalışıyor', 'WARN');
    }
  } catch (error) {
    // Hata loglamaya gerek yok, sessizce devam et
  }
}

// IPC Handlers - Window Controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.hide();
    log('📦 Pencere gizlendi (window controls)');
  }
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Uygulama hazır
app.whenReady().then(async () => {
  // KVKK onayını kontrol et ve gerekirse kullanıcıya sor
  const consentFile = path.join(app.getPath('userData'), 'kvkk-consent.json');
  
  if (!fs.existsSync(consentFile)) {
    // İlk kurulum - KVKK onayı al ve veri topla
    log('🔒 İlk kurulum tespit edildi, KVKK onayı isteniyor...');
    await checkAndCollectKVKKData();
  } else {
    // Önceden onay verilmiş
    const consent = JSON.parse(fs.readFileSync(consentFile, 'utf-8'));
    if (consent.accepted) {
      log('✅ KVKK onayı mevcut, veri toplama atlanıyor');
      cleanOldLogs();
    }
  }
  
  // Merkezi İhlal Sunucusu (Sadece Ana PC'de çalışır)
  if (process.env.IHLAL_CENTRAL_PC === 'true') {
    try {
      centralIhlalServer = startCentralIhlalServer();
      log('🌐 Merkezi İhlal Sunucusu başlatıldı (Ana PC)', 'INFO');
    } catch (error) {
      logError('❌ Merkezi İhlal Sunucusu başlatma hatası', error);
    }
  } else {
    log('📱 Client PC tespit edildi - Merkezi sunucu başlatılmadı', 'INFO');
  }
  
  // Uygulama lokasyonu ve ihlal kontrolü başlat
  startViolationMonitoring();
  
  initialize();
});

// GPU hızlandırmasını devre dışı bırak
app.disableHardwareAcceleration();

// Tek instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  log('⚠️ Uygulama zaten çalışıyor!', 'WARN');
  app.quit();
} else {
  app.on('second-instance', () => {
    log('⚠️ Uygulama tekrar başlatılmaya çalışıldı,hemen engelliyorum ! - mevcut pencere gösteriliyor', 'WARN');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ============================================
// OTOMATIK GÜNCELLEME SİSTEMİ
// ============================================

// Güncelleme kontrolü yapılırken
autoUpdater.on('checking-for-update', () => {
  log('🔍 Güncelleme kontrolü yapılıyor...');
});

// Güncelleme bulunduğunda
autoUpdater.on('update-available', (info) => {
  log(`✨ Yeni sürüm bulundu: ${info.version}`);
  
  if (mainWindow && process.platform === 'win32' && tray) {
    tray.displayBalloon({
      title: 'Yeni Güncelleme Mevcut!',
      content: `Sürüm ${info.version} indiriliyor...`,
      icon: nativeImage.createFromPath(path.join(__dirname, 'icons', 'app-icon.png'))
    });
  }
});

// Güncelleme yoksa
autoUpdater.on('update-not-available', (info) => {
  log('✅ Uygulama güncel (sürüm: ' + (info?.version || app.getVersion()) + ')');
});

// Güncelleme indiriliyor
autoUpdater.on('download-progress', (progressObj) => {
  const logMessage = `📥 İndiriliyor: ${Math.round(progressObj.percent)}% (${(progressObj.transferred / 1024 / 1024).toFixed(2)}MB / ${(progressObj.total / 1024 / 1024).toFixed(2)}MB)`;
  log(logMessage);
});

// Güncelleme indirildi
autoUpdater.on('update-downloaded', (info) => {
  log(`✅ Güncelleme indirildi: ${info.version}`);
  
  // Kullanıcıya bildir ve uygulamayı yeniden başlat
  if (mainWindow) {
    dialog.showMessageBox({
      type: 'info',
      title: 'Güncelleme Hazır',
      message: `Yeni sürüm (${info.version}) indirildi!`,
      detail: 'Güncellemeyi uygulamak için uygulama şimdi yeniden başlatılacak.',
      buttons: ['Şimdi Yeniden Başlat', '5 Dakika Sonra'],
      defaultId: 0,
      cancelId: 1
    }).then(result => {
      if (result.response === 0) {
        log('🔄 Kullanıcı onayladı, uygulama yeniden başlatılıyor...');
        isQuitting = true;
        autoUpdater.quitAndInstall();
      } else {
        log('⏰ Güncelleme 5 dakika ertelendi');
        setTimeout(() => {
          log('🔄 5 dakika doldu, uygulama yeniden başlatılıyor...');
          isQuitting = true;
          autoUpdater.quitAndInstall();
        }, 5 * 60 * 1000);
      }
    });
  }
});

// Güncelleme hatası
autoUpdater.on('error', (error) => {
  logError('❌ Güncelleme hatası', error);
});

log('📌 Electron Main Process Yüklendi');
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
