// BERAT CANKIR
// BERAT BİLAL CANKIR
// CANKIR


const fs = require('fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');
const { execSync } = require('child_process');

const IHLAL_LOGS_DIR = path.join(app.getPath('userData'), 'ihlal-logs');

const ensureIhlalDirsExist = () => {
  const dirs = [
    IHLAL_LOGS_DIR,
    path.join(IHLAL_LOGS_DIR, 'user-info'),
    path.join(IHLAL_LOGS_DIR, 'violations'),
    path.join(IHLAL_LOGS_DIR, 'mac-address'),
    path.join(IHLAL_LOGS_DIR, 'ip-address'),
    path.join(IHLAL_LOGS_DIR, 'pc-specs'),
    path.join(IHLAL_LOGS_DIR, 'location'),
    path.join(IHLAL_LOGS_DIR, 'wifi-specs'),
    path.join(IHLAL_LOGS_DIR, 'install-counter'),
    path.join(IHLAL_LOGS_DIR, 'network-connections'),
    path.join(IHLAL_LOGS_DIR, 'gateway-dns'),
    path.join(IHLAL_LOGS_DIR, 'wifi-details'),
    path.join(IHLAL_LOGS_DIR, 'vpn-status'),
    path.join(IHLAL_LOGS_DIR, 'gpu-info')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

const getMACAddress = () => {
  try {
    const networkInterfaces = os.networkInterfaces();
    const macs = [];
    
    for (const name in networkInterfaces) {
      const interfaces = networkInterfaces[name];
      for (const iface of interfaces) {
        if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
          macs.push({
            interface: name,
            mac: iface.mac,
            family: iface.family,
            address: iface.address
          });
        }
      }
    }
    
    return macs.length > 0 ? macs : [{ error: 'MAC-UNAVAILABLE' }];
  } catch (error) {
    return [{ error: `MAC-ERROR: ${error.message}` }];
  }
};

const getIPAddress = async () => {
  try {
    const https = require('https');
    return new Promise((resolve) => {
      https.get('https://api.ipify.org?format=json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const ip = JSON.parse(data).ip;
            resolve(ip || 'IP-UNAVAILABLE');
          } catch {
            resolve('IP-UNAVAILABLE');
          }
        });
      }).on('error', () => resolve('IP-ERROR'));
    });
  } catch (error) {
    return `IP-ERROR: ${error.message}`;
  }
};

const getPCSpecs = () => {
  try {
    const cpuInfo = os.cpus();
    return {
      platform: os.platform(),
      platformVersion: os.version(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      cpuCores: cpuInfo.length,
      cpuModel: cpuInfo[0]?.model || 'Unknown',
      cpuSpeed: cpuInfo[0]?.speed ? `${cpuInfo[0].speed} MHz` : 'Unknown',
      totalMemory: `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`,
      usedMemory: `${((os.totalmem() - os.freemem()) / (1024 ** 3)).toFixed(2)} GB`,
      memoryUsagePercent: `${((1 - os.freemem() / os.totalmem()) * 100).toFixed(2)}%`,
      uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
      userInfo: {
        username: os.userInfo().username,
        homedir: os.userInfo().homedir,
        shell: os.userInfo().shell
      },
      tmpdir: os.tmpdir(),
      endianness: os.endianness(),
      eol: os.EOL === '\n' ? 'LF' : 'CRLF'
    };
  } catch (error) {
    return { error: error.message };
  }
};

const getNetworkConnections = () => {
  try {
    const platform = os.platform();
    let connections = [];
    
    if (platform === 'win32') {
      const output = execSync('netstat -ano', { encoding: 'utf-8', timeout: 5000 });
      const lines = output.split('\n').filter(line => line.trim());
      
      connections = lines.slice(4).map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          return {
            protocol: parts[0],
            localAddress: parts[1],
            foreignAddress: parts[2],
            state: parts[3],
            pid: parts[4]
          };
        }
        return null;
      }).filter(conn => conn !== null);
    } else if (platform === 'linux') {
      const output = execSync('ss -tunap 2>/dev/null || netstat -tunap 2>/dev/null', { encoding: 'utf-8', timeout: 5000 });
      const lines = output.split('\n').filter(line => line.trim());
      connections = lines.map(line => ({ raw: line }));
    } else if (platform === 'darwin') {
      const output = execSync('netstat -an', { encoding: 'utf-8', timeout: 5000 });
      const lines = output.split('\n').filter(line => line.trim());
      connections = lines.map(line => ({ raw: line }));
    }
    
    return {
      totalConnections: connections.length,
      connections: connections.slice(0, 50), // İlk 50 bağlantı
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { error: error.message };
  }
};

const getGatewayAndDNS = () => {
  try {
    const platform = os.platform();
    let gateway = 'Unknown';
    let dns = [];
    
    if (platform === 'win32') {
      try {
        const gatewayOutput = execSync('ipconfig | findstr /i "Default Gateway"', { encoding: 'utf-8', timeout: 5000 });
        const gatewayMatch = gatewayOutput.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (gatewayMatch) gateway = gatewayMatch[1];
      } catch (e) {}
      
      try {
        const dnsOutput = execSync('ipconfig /all | findstr /i "DNS Servers"', { encoding: 'utf-8', timeout: 5000 });
        const dnsMatches = dnsOutput.match(/(\d+\.\d+\.\d+\.\d+)/g);
        if (dnsMatches) dns = dnsMatches;
      } catch (e) {}
    } else if (platform === 'linux') {
      try {
        const gatewayOutput = execSync('ip route | grep default', { encoding: 'utf-8', timeout: 5000 });
        const gatewayMatch = gatewayOutput.match(/default via (\d+\.\d+\.\d+\.\d+)/);
        if (gatewayMatch) gateway = gatewayMatch[1];
      } catch (e) {}
      
      try {
        if (fs.existsSync('/etc/resolv.conf')) {
          const resolv = fs.readFileSync('/etc/resolv.conf', 'utf-8');
          const nameservers = resolv.match(/nameserver\s+(\d+\.\d+\.\d+\.\d+)/g);
          if (nameservers) {
            dns = nameservers.map(ns => ns.split(/\s+/)[1]);
          }
        }
      } catch (e) {}
    } else if (platform === 'darwin') {
      try {
        const gatewayOutput = execSync('netstat -rn | grep default', { encoding: 'utf-8', timeout: 5000 });
        const gatewayMatch = gatewayOutput.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (gatewayMatch) gateway = gatewayMatch[1];
      } catch (e) {}
      
      try {
        const dnsOutput = execSync('scutil --dns | grep nameserver', { encoding: 'utf-8', timeout: 5000 });
        const dnsMatches = dnsOutput.match(/(\d+\.\d+\.\d+\.\d+)/g);
        if (dnsMatches) dns = [...new Set(dnsMatches)];
      } catch (e) {}
    }
    
    return {
      defaultGateway: gateway,
      dnsServers: dns.length > 0 ? dns : ['Unknown']
    };
  } catch (error) {
    return { error: error.message };
  }
};

const getWiFiDetails = () => {
  try {
    const platform = os.platform();
    let ssid = 'Unknown';
    let signal = 'Unknown';
    let channel = 'Unknown';
    
    if (platform === 'win32') {
      try {
        const output = execSync('netsh wlan show interfaces', { encoding: 'utf-8', timeout: 5000 });
        const ssidMatch = output.match(/SSID\s*:\s*(.+)/);
        const signalMatch = output.match(/Signal\s*:\s*(\d+)%/);
        const channelMatch = output.match(/Channel\s*:\s*(\d+)/);
        
        if (ssidMatch) ssid = ssidMatch[1].trim();
        if (signalMatch) signal = `${signalMatch[1]}%`;
        if (channelMatch) channel = channelMatch[1];
      } catch (e) {}
    } else if (platform === 'darwin') {
      try {
        const output = execSync('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I', { encoding: 'utf-8', timeout: 5000 });
        const ssidMatch = output.match(/\sSSID:\s*(.+)/);
        const signalMatch = output.match(/agrCtlRSSI:\s*(-?\d+)/);
        const channelMatch = output.match(/channel:\s*(\d+)/);
        
        if (ssidMatch) ssid = ssidMatch[1].trim();
        if (signalMatch) signal = `${signalMatch[1]} dBm`;
        if (channelMatch) channel = channelMatch[1];
      } catch (e) {}
    } else if (platform === 'linux') {
      try {
        const output = execSync('iwconfig 2>/dev/null', { encoding: 'utf-8', timeout: 5000 });
        const ssidMatch = output.match(/ESSID:"(.+?)"/);
        const signalMatch = output.match(/Signal level=(-?\d+)/);
        
        if (ssidMatch) ssid = ssidMatch[1];
        if (signalMatch) signal = `${signalMatch[1]} dBm`;
      } catch (e) {}
    }
    
    return {
      ssid,
      signalStrength: signal,
      channel,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { error: error.message };
  }
};

const checkVPNStatus = () => {
  try {
    const platform = os.platform();
    let vpnDetected = false;
    let vpnInterfaces = [];
    
    const networkInterfaces = os.networkInterfaces();
    const vpnKeywords = ['vpn', 'tun', 'tap', 'wg', 'wireguard', 'pptp', 'l2tp', 'openvpn', 'nordvpn', 'expressvpn'];
    
    for (const name in networkInterfaces) {
      const lowerName = name.toLowerCase();
      if (vpnKeywords.some(keyword => lowerName.includes(keyword))) {
        vpnDetected = true;
        vpnInterfaces.push({
          name,
          addresses: networkInterfaces[name].map(i => i.address)
        });
      }
    }
    
    if (platform === 'win32') {
      try {
        const output = execSync('netsh interface show interface', { encoding: 'utf-8', timeout: 5000 });
        const vpnLines = output.split('\n').filter(line => {
          const lower = line.toLowerCase();
          return vpnKeywords.some(keyword => lower.includes(keyword));
        });
        if (vpnLines.length > 0) {
          vpnDetected = true;
        }
      } catch (e) {}
    }
    
    return {
      vpnDetected,
      vpnInterfaces,
      checked: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { error: error.message, vpnDetected: false };
  }
};

const getGPUInfo = () => {
  try {
    const platform = os.platform();
    let gpuInfo = [];
    
    if (platform === 'win32') {
      try {
        const output = execSync('wmic path win32_VideoController get name,adapterram,driverversion', { encoding: 'utf-8', timeout: 5000 });
        const lines = output.split('\n').filter(line => line.trim() && !line.includes('AdapterRAM'));
        gpuInfo = lines.map(line => {
          const parts = line.trim().split(/\s{2,}/);
          return {
            name: parts[2] || 'Unknown',
            memory: parts[0] ? `${(parseInt(parts[0]) / (1024 ** 3)).toFixed(2)} GB` : 'Unknown',
            driver: parts[1] || 'Unknown'
          };
        });
      } catch (e) {}
    } else if (platform === 'linux') {
      try {
        const output = execSync('lspci | grep -i vga', { encoding: 'utf-8', timeout: 5000 });
        gpuInfo = output.split('\n').filter(line => line.trim()).map(line => ({
          name: line.split(': ')[1] || line,
          type: 'VGA'
        }));
      } catch (e) {}
    } else if (platform === 'darwin') {
      try {
        const output = execSync('system_profiler SPDisplaysDataType', { encoding: 'utf-8', timeout: 5000 });
        const chipsetMatch = output.match(/Chipset Model:\s*(.+)/);
        const vramMatch = output.match(/VRAM.*:\s*(.+)/);
        
        gpuInfo = [{
          name: chipsetMatch ? chipsetMatch[1].trim() : 'Unknown',
          memory: vramMatch ? vramMatch[1].trim() : 'Unknown'
        }];
      } catch (e) {}
    }
    
    return gpuInfo.length > 0 ? gpuInfo : [{ name: 'GPU bilgisi alınamadı' }];
  } catch (error) {
    return [{ error: error.message }];
  }
};

const getWiFiSpecs = () => {
  try {
    const networkInterfaces = os.networkInterfaces();
    const wifiData = [];
    
    for (const name in networkInterfaces) {
      const interfaces = networkInterfaces[name];
      interfaces.forEach(iface => {
        wifiData.push({
          interfaceName: name,
          family: iface.family,
          address: iface.address,
          netmask: iface.netmask,
          mac: iface.mac,
          internal: iface.internal,
          cidr: iface.cidr,
          scopeid: iface.scopeid
        });
      });
    }
    
    return {
      networkInterfaces: wifiData,
      totalInterfaces: wifiData.length,
      activeInterfaces: wifiData.filter(i => !i.internal).length
    };
  } catch (error) {
    return { error: error.message };
  }
};

const getLocationWithCoordinates = async () => {
  try {
    const https = require('https');
    return new Promise((resolve) => {
      https.get('https://ipapi.co/json/', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const location = JSON.parse(data);
            resolve({
              city: location.city || 'Unknown',
              region: location.region || 'Unknown',
              regionCode: location.region_code || 'Unknown',
              country: location.country_name || 'Unknown',
              countryCode: location.country_code || 'Unknown',
              continent: location.continent_code || 'Unknown',
              postal: location.postal || 'Unknown',
              latitude: location.latitude || 'Unknown',
              longitude: location.longitude || 'Unknown',
              timezone: location.timezone || 'Unknown',
              utcOffset: location.utc_offset || 'Unknown',
              countryCallingCode: location.country_calling_code || 'Unknown',
              currency: location.currency || 'Unknown',
              currencyName: location.currency_name || 'Unknown',
              languages: location.languages || 'Unknown',
              asn: location.asn || 'Unknown',
              org: location.org || 'Unknown',
              isp: location.isp || 'Unknown'
            });
          } catch {
            resolve({ error: 'LOCATION-PARSE-ERROR' });
          }
        });
      }).on('error', () => resolve({ error: 'LOCATION-REQUEST-ERROR' }));
    });
  } catch (error) {
    return { error: error.message };
  }
};

const saveLog = (category, data) => {
  try {
    const timestamp = new Date().toISOString();
    const filename = `${timestamp.replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(IHLAL_LOGS_DIR, category, filename);
    
    const logData = {
      timestamp,
      category,
      ...data
    };
    
    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2), 'utf-8');
    return filepath;
  } catch (error) {
    console.error(`İhlal Log kaydetme hatası [${category}]:`, error);
    return null;
  }
};

const incrementInstallCounter = () => {
  try {
    const counterFile = path.join(IHLAL_LOGS_DIR, 'install-counter', 'counter.json');
    let count = 0;
    
    if (fs.existsSync(counterFile)) {
      const data = JSON.parse(fs.readFileSync(counterFile, 'utf-8'));
      count = data.count || 0;
    }
    
    count++;
    
    const counterData = {
      count,
      lastInstall: new Date().toISOString(),
      installs: []
    };
    
    if (fs.existsSync(counterFile)) {
      const oldData = JSON.parse(fs.readFileSync(counterFile, 'utf-8'));
      if (oldData.installs) {
        counterData.installs = oldData.installs;
      }
    }
    
    counterData.installs.push({
      timestamp: new Date().toISOString(),
      installNumber: count
    });
    
    fs.writeFileSync(counterFile, JSON.stringify(counterData, null, 2), 'utf-8');
    
    return count;
  } catch (error) {
    console.error('Kurulum sayacı güncelleme hatası:', error);
    return null;
  }
};

const cleanOldLogs = () => {
  try {
    const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
    const categories = ['user-info', 'violations', 'mac-address', 'ip-address', 'pc-specs', 'location', 'wifi-specs', 'network-connections', 'gateway-dns', 'wifi-details', 'vpn-status', 'gpu-info'];
    
    categories.forEach(category => {
      const categoryDir = path.join(IHLAL_LOGS_DIR, category);
      if (!fs.existsSync(categoryDir)) return;
      
      const files = fs.readdirSync(categoryDir);
      files.forEach(file => {
        const filepath = path.join(categoryDir, file);
        const stats = fs.statSync(filepath);
        
        if (stats.mtimeMs < sixMonthsAgo) {
          fs.unlinkSync(filepath);
          console.log(`🗑️ Eski ihlal log silindi: ${file}`);
        }
      });
    });
  } catch (error) {
    console.error('Eski log temizleme hatası:', error);
  }
};

const sendToCentralServer = async (data, centralServerUrl) => {
  try {
    const https = require('https');
    const http = require('http');
    const url = new URL(centralServerUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = protocol.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            resolve(response);
          } catch {
            resolve({ success: true, raw: responseData });
          }
        });
      });
      
      req.on('error', (error) => reject(error));
      req.write(postData);
      req.end();
    });
  } catch (error) {
    throw new Error(`Merkezi sunucuya gönderim hatası: ${error.message}`);
  }
};

const collectAndSaveIhlalData = async (userConsent = true, userInfo = null, violationInfo = null) => {
  if (!userConsent) {
    console.log('❌ İHLAL: Kullanıcı onayı yok, veri toplanmadı');
    return { success: false, reason: 'NO_CONSENT' };
  }
  
  try {
    ensureIhlalDirsExist();
    
    console.log('📊 İHLAL: Veri toplama başlatıldı...');
    
    const macAddresses = getMACAddress();
    const ipAddress = await getIPAddress();
    const pcSpecs = getPCSpecs();
    const wifiSpecs = getWiFiSpecs();
    const location = await getLocationWithCoordinates();
    const installCount = incrementInstallCounter();
    
    // Yeni detaylı bilgiler
    const networkConnections = getNetworkConnections();
    const gatewayDNS = getGatewayAndDNS();
    const wifiDetails = getWiFiDetails();
    const vpnStatus = checkVPNStatus();
    const gpuInfo = getGPUInfo();
    
    // Kullanıcı bilgileri
    const fullUserInfo = userInfo || {
      firstName: 'Belirtilmedi',
      lastName: 'Belirtilmedi',
      email: 'Belirtilmedi'
    };
    
    const IS_CENTRAL_PC = process.env.IHLAL_CENTRAL_PC === 'true';
    const CENTRAL_SERVER_URL = process.env.IHLAL_CENTRAL_SERVER_URL || 'http://localhost:45123/api/ihlal/report';
    
    if (IS_CENTRAL_PC) {
      // Kullanıcı bilgilerini kaydet
      saveLog('user-info', { userInfo: fullUserInfo, timestamp: new Date().toISOString() });
      console.log('✅ İHLAL: Kullanıcı bilgileri kaydedildi:', fullUserInfo.firstName, fullUserInfo.lastName);
      
      saveLog('mac-address', { macAddresses, userInfo: fullUserInfo });
      console.log('✅ İHLAL: MAC adresleri kaydedildi:', macAddresses.length, 'adet');
      
      saveLog('ip-address', { ipAddress, userInfo: fullUserInfo });
      console.log('✅ İHLAL: IP adresi kaydedildi:', ipAddress);
      
      saveLog('pc-specs', { ...pcSpecs, userInfo: fullUserInfo });
      console.log('✅ İHLAL: PC özellikleri kaydedildi');
      
      saveLog('wifi-specs', { ...wifiSpecs, userInfo: fullUserInfo });
      console.log('✅ İHLAL: WiFi özellikleri kaydedildi:', wifiSpecs.totalInterfaces, 'interface');
      
      saveLog('location', { ...location, userInfo: fullUserInfo });
      console.log('✅ İHLAL: Konum bilgisi kaydedildi:', location.city, location.country);
      console.log('📍 İHLAL: Koordinatlar:', location.latitude, ',', location.longitude);
      
      saveLog('network-connections', { ...networkConnections, userInfo: fullUserInfo });
      console.log('✅ İHLAL: Ağ bağlantıları kaydedildi:', networkConnections.totalConnections, 'bağlantı');
      
      saveLog('gateway-dns', { ...gatewayDNS, userInfo: fullUserInfo });
      console.log('✅ İHLAL: Gateway ve DNS kaydedildi:', gatewayDNS.defaultGateway);
      
      saveLog('wifi-details', { ...wifiDetails, userInfo: fullUserInfo });
      console.log('✅ İHLAL: WiFi detayları kaydedildi:', wifiDetails.ssid);
      
      saveLog('vpn-status', { ...vpnStatus, userInfo: fullUserInfo });
      console.log('✅ İHLAL: VPN durumu kaydedildi:', vpnStatus.vpnDetected ? 'VPN TESPİT EDİLDİ!' : 'VPN yok');
      
      saveLog('gpu-info', { gpuInfo, userInfo: fullUserInfo });
      console.log('✅ İHLAL: GPU bilgisi kaydedildi:', gpuInfo.length, 'GPU');
      
      // İhlal bilgilerini kaydet (varsa)
      if (violationInfo) {
        saveLog('violations', { ...violationInfo, userInfo: fullUserInfo, allData: { macAddresses, ipAddress, pcSpecs, location } });
        console.log('🚨 İHLAL: İhlal bilgisi kaydedildi:', violationInfo.violationType);
      }
      
      console.log(`✅ İHLAL: Kurulum sayacı güncellendi: ${installCount}`);
      console.log('🏠 İHLAL: Bu MERKEZ PC - Veriler local kaydedildi');
    } else {
      console.log('🌐 İHLAL: Client PC tespit edildi, merkezi sunucuya gönderiliyor...');
      
      const reportData = {
        userInfo: fullUserInfo,
        macAddresses,
        ipAddress,
        pcSpecs,
        location,
        wifiSpecs,
        networkConnections,
        gatewayDNS,
        wifiDetails,
        vpnStatus,
        gpuInfo,
        installCount,
        violationInfo,
        timestamp: new Date().toISOString()
      };
      
      try {
        const response = await sendToCentralServer(reportData, CENTRAL_SERVER_URL);
        console.log('✅ İHLAL: Veriler merkezi sunucuya gönderildi:', response);
      } catch (error) {
        console.error('❌ İHLAL: Merkezi sunucuya gönderim başarısız:', error.message);
        console.log('📁 İHLAL: Yedek olarak local kayıt yapılıyor...');
        saveLog('user-info', { userInfo: fullUserInfo });
        saveLog('mac-address', { macAddresses, userInfo: fullUserInfo });
        saveLog('ip-address', { ipAddress, userInfo: fullUserInfo });
        saveLog('pc-specs', { ...pcSpecs, userInfo: fullUserInfo });
        saveLog('wifi-specs', { ...wifiSpecs, userInfo: fullUserInfo });
        saveLog('location', { ...location, userInfo: fullUserInfo });
        saveLog('network-connections', { ...networkConnections, userInfo: fullUserInfo });
        saveLog('gateway-dns', { ...gatewayDNS, userInfo: fullUserInfo });
        saveLog('wifi-details', { ...wifiDetails, userInfo: fullUserInfo });
        saveLog('vpn-status', { ...vpnStatus, userInfo: fullUserInfo });
        saveLog('gpu-info', { gpuInfo, userInfo: fullUserInfo });
        if (violationInfo) {
          saveLog('violations', { ...violationInfo, userInfo: fullUserInfo });
        }
      }
    }
    
    cleanOldLogs();
    console.log('🧹 İHLAL: Eski loglar temizlendi (6 ay+)');
    
    console.log(`📁 İHLAL: İşlem tamamlandı: ${IHLAL_LOGS_DIR}`);
    
    return {
      success: true,
      installCount,
      logsDirectory: IHLAL_LOGS_DIR,
      isCentralPC: IS_CENTRAL_PC,
      summary: {
        macAddresses: macAddresses.length,
        ipAddress,
        location: `${location.city}, ${location.country}`,
        coordinates: `${location.latitude}, ${location.longitude}`,
        networkInterfaces: wifiSpecs.totalInterfaces
      }
    };
  } catch (error) {
    console.error('❌ İHLAL veri toplama hatası:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  collectAndSaveIhlalData,
  cleanOldLogs,
  IHLAL_LOGS_DIR
};


