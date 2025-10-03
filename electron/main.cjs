//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

const { app, BrowserWindow, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');

// Global değişkenler
let mainWindow = null;
let tray = null;
let serverProcess = null;
let isQuitting = false;
const PORT = 5000;
const isPackaged = app.isPackaged;

// Log sistemi - konsola ve dosyaya yaz
const logMessages = [];
const MAX_LOG_MESSAGES = 1000;

function log(message, type = 'INFO') {
  const timestamp = new Date().toLocaleTimeString('tr-TR');
  const logEntry = `[${timestamp}] [${type}] ${message}`;
  console.log(logEntry);
  
  // Log'u bellekte sakla
  logMessages.push(logEntry);
  if (logMessages.length > MAX_LOG_MESSAGES) {
    logMessages.shift();
  }
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

// Ana pencereyi oluştur
function createWindow() {
  log('🪟 Ana pencere oluşturuluyor...');
  
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icons', 'app-icon.png'),
    title: 'BERAT CANKIR - YKS Analiz Sistemi',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
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
      label: 'Yeniden Başlat',
      click: () => {
        log('🔄 Uygulama yeniden başlatılıyor...');
        isQuitting = true;
        app.relaunch();
        app.quit();
      }
    },
    {
      label: 'Çıkış',
      click: () => {
        log('👋 Uygulama kapatılıyor (kullanıcı isteği)...');
        isQuitting = true;
        app.quit();
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
    log('⚡ Server başlatılıyor...');

    const isWin = process.platform === 'win32';
    const rootDir = path.join(__dirname, '..');

    let command, args, options;
    let serverPath;

    if (isPackaged) {
      // .exe icinden calisacak sekilde path ayarla
      const resourcesPath = process.resourcesPath;
      
      // Olasi path'leri kontrol et
      const possiblePaths = [
        path.join(resourcesPath, 'app.asar', 'dist', 'index.cjs'),
        path.join(resourcesPath, 'app', 'dist', 'index.cjs'),
        path.join(resourcesPath, 'dist', 'index.cjs'),
        path.join(__dirname, '..', 'dist', 'index.cjs'),
      ];
      
      log('📁 Olasi server path\'leri kontrol ediliyor...');
      for (const p of possiblePaths) {
        log(`   - ${p}: ${fs.existsSync(p) ? '✅ VAR' : '❌ YOK'}`);
        if (fs.existsSync(p)) {
          serverPath = p;
          break;
        }
      }
      
      if (!serverPath) {
        const errorMsg = `Server dosyasi bulunamadi! Kontrol edilen yerler:\n${possiblePaths.join('\n')}`;
        logError(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      log(`📦 Production modu - Server: ${serverPath}`);

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
        stdio: ['ignore', 'pipe', 'pipe']
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

    serverProcess = spawn(command, args, options);
    let serverStarted = false;

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
      }
    });

    serverProcess.on('error', (error) => {
      logError('❌ Server başlatma hatası', error);
      reject(error);
    });

    serverProcess.on('close', (code) => {
      log(`🔴 Server kapandı (kod: ${code})`);
      serverProcess = null;

      if (!isQuitting && code !== 0 && code !== null) {
        log('🔄 Server beklenmedik şekilde kapandı, 3 saniye sonra yeniden başlatılıyor...', 'WARN');
        setTimeout(() => {
          if (!isQuitting) startServer().catch(err => logError('❌ Yeniden başlatma hatası', err));
        }, 3000);
      }
    });

    setTimeout(() => {
      if (!serverStarted) {
        log('⚠️ Server 45 saniyede başlamadı ama devam ediliyor...', 'WARN');
        resolve();
      }
    }, 45000);
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
    
    // 3. Server başlat
    log('🎯 3/4: Backend server baslatılıyor...');
    
    try {
      await Promise.race([
        startServer(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Server timeout (30s)')), 30000)
        )
      ]);
      log('✅ Server baslatildi');
    } catch (err) {
      logError('⚠️ Server baslatma hatası (devam ediliyor)', err);
    }
    
    // 4. Uygulamayı yükle
    log('🎯 4/4: Ana uygulama yukleniyor...');
    
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

// Uygulama hazır
app.whenReady().then(() => {
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

log('📌 Electron Main Process Yüklendi');
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
