const express = require('express');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const CENTRAL_SERVER_PORT = 45123;
const IHLAL_LOGS_DIR = path.join(app.getPath('userData'), 'merkezi-ihlal-logs');

const ensureCentralDirsExist = () => {
  const dirs = [
    IHLAL_LOGS_DIR,
    path.join(IHLAL_LOGS_DIR, 'client-data'),
    path.join(IHLAL_LOGS_DIR, 'user-info'),
    path.join(IHLAL_LOGS_DIR, 'violations'),
    path.join(IHLAL_LOGS_DIR, 'mac-addresses'),
    path.join(IHLAL_LOGS_DIR, 'ip-addresses'),
    path.join(IHLAL_LOGS_DIR, 'pc-specs'),
    path.join(IHLAL_LOGS_DIR, 'locations'),
    path.join(IHLAL_LOGS_DIR, 'install-reports')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

const startCentralIhlalServer = () => {
  ensureCentralDirsExist();
  
  const centralApp = express();
  centralApp.use(express.json({ limit: '50mb' }));
  
  centralApp.post('/api/ihlal/report', (req, res) => {
    try {
      const {
        userInfo,
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
        timestamp
      } = req.body;

      const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const reportTimestamp = timestamp || new Date().toISOString();
      const filename = `${reportTimestamp.replace(/[:.]/g, '-')}-${clientId}.json`;
      
      const reportData = {
        clientId,
        timestamp: reportTimestamp,
        receivedAt: new Date().toISOString(),
        data: {
          userInfo,
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
          violationInfo
        }
      };
      
      const reportPath = path.join(IHLAL_LOGS_DIR, 'client-data', filename);
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf-8');
      
      // Kullanıcı bilgilerini kaydet
      if (userInfo) {
        const userPath = path.join(IHLAL_LOGS_DIR, 'user-info', `${clientId}.json`);
        fs.writeFileSync(userPath, JSON.stringify({ clientId, timestamp: reportTimestamp, userInfo }, null, 2));
      }
      
      // İhlal bilgilerini kaydet
      if (violationInfo) {
        const violationPath = path.join(IHLAL_LOGS_DIR, 'violations', `${clientId}-${violationInfo.violationType}.json`);
        fs.writeFileSync(violationPath, JSON.stringify({ 
          clientId, 
          timestamp: reportTimestamp, 
          violationInfo,
          userInfo,
          location,
          ipAddress,
          macAddresses
        }, null, 2));
      }
      
      if (macAddresses && macAddresses.length > 0) {
        const macPath = path.join(IHLAL_LOGS_DIR, 'mac-addresses', `${clientId}.json`);
        fs.writeFileSync(macPath, JSON.stringify({ clientId, timestamp: reportTimestamp, macAddresses, userInfo }, null, 2));
      }
      
      if (ipAddress) {
        const ipPath = path.join(IHLAL_LOGS_DIR, 'ip-addresses', `${clientId}.json`);
        fs.writeFileSync(ipPath, JSON.stringify({ clientId, timestamp: reportTimestamp, ipAddress, userInfo }, null, 2));
      }
      
      if (location) {
        const locationPath = path.join(IHLAL_LOGS_DIR, 'locations', `${clientId}.json`);
        fs.writeFileSync(locationPath, JSON.stringify({ clientId, timestamp: reportTimestamp, location, userInfo }, null, 2));
      }
      
      if (pcSpecs) {
        const specsPath = path.join(IHLAL_LOGS_DIR, 'pc-specs', `${clientId}.json`);
        fs.writeFileSync(specsPath, JSON.stringify({ clientId, timestamp: reportTimestamp, pcSpecs, userInfo }, null, 2));
      }
      
      const summaryPath = path.join(IHLAL_LOGS_DIR, 'install-reports', 'summary.json');
      let summary = { totalInstalls: 0, violations: 0, clients: [] };
      
      if (fs.existsSync(summaryPath)) {
        summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      }
      
      summary.totalInstalls++;
      if (violationInfo) {
        summary.violations = (summary.violations || 0) + 1;
      }
      
      summary.clients.push({
        clientId,
        timestamp: reportTimestamp,
        userInfo: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Unknown',
        ipAddress,
        location: location ? `${location.city}, ${location.country}` : 'Unknown',
        pcName: pcSpecs?.hostname || 'Unknown',
        violationType: violationInfo?.violationType || 'NORMAL_INSTALL'
      });
      
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log(`✅ Merkezi İhlal Raporu Alındı: ${clientId}`);
      if (userInfo) {
        console.log(`   Kullanıcı: ${userInfo.firstName} ${userInfo.lastName} (${userInfo.email})`);
      }
      console.log(`   IP: ${ipAddress}`);
      console.log(`   Konum: ${location?.city}, ${location?.country}`);
      if (violationInfo) {
        console.log(`   🚨 İHLAL TİPİ: ${violationInfo.violationType}`);
      }
      console.log(`   Toplam Kurulum: ${summary.totalInstalls} | Toplam İhlal: ${summary.violations || 0}`);
      
      res.json({
        success: true,
        message: 'İhlal raporu merkeze kaydedildi',
        clientId,
        totalInstalls: summary.totalInstalls,
        totalViolations: summary.violations || 0
      });
      
    } catch (error) {
      console.error('❌ Merkezi ihlal raporu kaydetme hatası:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  centralApp.get('/api/ihlal/stats', (req, res) => {
    try {
      const summaryPath = path.join(IHLAL_LOGS_DIR, 'install-reports', 'summary.json');
      
      if (!fs.existsSync(summaryPath)) {
        return res.json({
          success: true,
          totalInstalls: 0,
          clients: []
        });
      }
      
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      res.json({
        success: true,
        ...summary
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  const server = centralApp.listen(CENTRAL_SERVER_PORT, '0.0.0.0', () => {
    console.log(`🌐 Merkezi İhlal Sunucusu Aktif: http://0.0.0.0:${CENTRAL_SERVER_PORT}`);
    console.log(`📁 Loglar: ${IHLAL_LOGS_DIR}`);
    console.log(`🔗 Diğer PC'ler bu adrese veri gönderebilir`);
  });
  
  return server;
};

module.exports = {
  startCentralIhlalServer,
  CENTRAL_SERVER_PORT,
  IHLAL_LOGS_DIR
};
