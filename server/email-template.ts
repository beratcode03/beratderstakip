// Modern Email Template Function
export function generateModernEmailTemplate(data: {
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  totalEmpty: number;
  successRate: string;
  recentExams: any[];
  generalExams: any[];
  branchExams: any[];
  tasks: any[];
  completedTasks: number;
  totalActivities: number;
  activityMotivation: string;
  activityColor: string;
  longestStreak: number;
  wrongTopicsCount: number;
  completedTopics: number;
  maxTytNet: string;
  branchRecords: any;
  mostQuestionsDate: string;
  mostQuestionsCount: number;
  mostWrongSubjects: any[];
  mostSolvedSubjects: any[];
  mostCorrectSubjects: any[];
  examSubjectNets: any[];
}) {
  const {
    totalQuestions,
    totalCorrect,
    totalWrong,
    totalEmpty,
    successRate,
    recentExams,
    generalExams,
    branchExams,
    tasks,
    completedTasks,
    totalActivities,
    activityMotivation,
    activityColor,
    longestStreak,
    wrongTopicsCount,
    completedTopics,
    maxTytNet,
    branchRecords,
    mostQuestionsDate,
    mostQuestionsCount,
    mostWrongSubjects,
    mostSolvedSubjects,
    mostCorrectSubjects,
    examSubjectNets
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kişisel Analiz Raporu</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .email-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        /* ATATÜRK SECTION */
        .ataturk-section {
          background: white;
          padding: 40px 30px;
          text-align: center;
          border-bottom: 6px solid #d32f2f;
        }
        
        .ataturk-section img.flag {
          width: 180px;
          height: auto;
          margin-bottom: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .quote {
          font-style: italic;
          font-size: 17px;
          line-height: 1.7;
          color: #1a1a1a;
          margin: 20px auto;
          max-width: 600px;
          font-weight: 600;
        }
        
        .ataturk-name {
          color: #c62828;
          font-weight: 900;
          font-size: 16px;
          margin: 20px 0;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Arial Black', Arial, sans-serif;
        }
        
        .ataturk-section img.signature {
          width: 180px;
          height: auto;
          margin: 20px auto;
          display: block;
        }
        
        .ataturk-section img.portrait {
          width: 200px;
          height: auto;
          margin: 20px auto 0;
          display: block;
          border-radius: 15px;
          border: 4px solid #e0e0e0;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        
        /* TITLE SECTION */
        .title-section {
          background: white;
          color: #1a1a1a;
          padding: 30px 25px;
          text-align: center;
        }
        
        .title-section h1 {
          font-size: 28px;
          margin-bottom: 8px;
          font-weight: 900;
          letter-spacing: 1px;
          color: #8e24aa;
        }
        
        .title-section .subtitle {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
          color: #424242;
        }
        
        .title-section .date-info {
          font-size: 15px;
          font-weight: 600;
          color: #666;
        }
        
        /* SOLVED QUESTIONS/EXAMS SECTION */
        .stats-top-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 25px;
          background: #f8f9fa;
        }
        
        .stat-card-large {
          border-radius: 18px;
          padding: 30px 25px;
          text-align: center;
          color: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .stat-purple {
          background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
        }
        
        .stat-red {
          background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
        }
        
        .stat-card-large .label {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 15px;
          opacity: 0.95;
          letter-spacing: 0.5px;
        }
        
        .stat-card-large .value {
          font-size: 48px;
          font-weight: 900;
          text-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
        
        /* ALL QUESTIONS SECTION */
        .section {
          padding: 25px;
          margin: 20px 25px;
          background: #f8f9fa;
          border-radius: 16px;
          border: 2px solid #e0e0e0;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 20px;
          color: #424242;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .question-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .question-stat-box {
          border: 3px solid;
          border-radius: 14px;
          padding: 20px 15px;
          text-align: center;
          background: white;
        }
        
        .question-stat-box.correct {
          border-color: #66bb6a;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        }
        
        .question-stat-box.wrong {
          border-color: #ef5350;
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
        }
        
        .question-stat-box.empty {
          border-color: #ffa726;
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        }
        
        .question-stat-box .qlabel {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .question-stat-box .qvalue {
          font-size: 36px;
          font-weight: 900;
        }
        
        .question-stat-box.correct .qvalue { color: #43a047; }
        .question-stat-box.wrong .qvalue { color: #e53935; }
        .question-stat-box.empty .qvalue { color: #fb8c00; }
        
        .success-rate-box {
          border: 3px solid #7c4dff;
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          background: linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%);
        }
        
        .success-rate-box .rate {
          font-size: 42px;
          font-weight: 900;
          color: #6a1b9a;
          margin-bottom: 8px;
        }
        
        .success-rate-box .label {
          font-size: 14px;
          color: #424242;
          font-weight: 600;
        }
        
        /* ACTIVITY SECTION */
        .activity-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          padding: 25px;
          background: #f8f9fa;
        }
        
        .activity-card {
          border-radius: 18px;
          padding: 28px 22px;
          text-align: center;
          color: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .activity-green {
          background: linear-gradient(135deg, #26a69a 0%, #00897b 100%);
        }
        
        .activity-purple {
          background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%);
        }
        
        .activity-card .title {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 15px;
          opacity: 0.95;
          letter-spacing: 0.5px;
        }
        
        .activity-card .number {
          font-size: 46px;
          font-weight: 900;
          margin-bottom: 10px;
          text-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
        
        .activity-card .subtitle {
          font-size: 13px;
          opacity: 0.9;
          font-weight: 600;
        }
        
        .motivation-box {
          grid-column: 1 / -1;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        /* SPECIAL STATS */
        .special-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        
        .special-stat-card {
          border: 3px solid;
          border-radius: 14px;
          padding: 22px 18px;
          text-align: center;
          background: white;
        }
        
        .special-stat-card.purple-border {
          border-color: #ab47bc;
          background: linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%);
        }
        
        .special-stat-card.red-border {
          border-color: #ef5350;
          background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);
        }
        
        .special-stat-card.green-border {
          border-color: #66bb6a;
          background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);
        }
        
        .special-stat-card .stitle {
          font-size: 11px;
          color: #757575;
          margin-bottom: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        .special-stat-card .svalue {
          font-size: 38px;
          font-weight: 900;
          margin: 10px 0;
        }
        
        .special-stat-card.purple-border .svalue { color: #8e24aa; }
        .special-stat-card.red-border .svalue { color: #e53935; }
        .special-stat-card.green-border .svalue { color: #43a047; }
        
        .special-stat-card .slabel {
          font-size: 11px;
          color: #9e9e9e;
          font-weight: 500;
        }
        
        /* RECORD NETS SECTION */
        .record-nets-box {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-radius: 16px;
          padding: 25px;
          margin: 20px 25px;
        }
        
        .record-title {
          font-size: 17px;
          font-weight: 800;
          color: #1565c0;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .nets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin-bottom: 18px;
        }
        
        .net-card {
          border: 3px solid;
          border-radius: 14px;
          padding: 20px;
          text-align: center;
          background: white;
        }
        
        .net-card.purple-b {
          border-color: #ab47bc;
        }
        
        .net-card.red-b {
          border-color: #ef5350;
        }
        
        .net-card .netlabel {
          font-size: 13px;
          color: #666;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .net-card .netvalue {
          font-size: 40px;
          font-weight: 900;
        }
        
        .net-card.purple-b .netvalue { color: #8e24aa; }
        .net-card.red-b .netvalue { color: #e53935; }
        
        .date-card {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
          border: 3px solid #ffa726;
          border-radius: 14px;
          padding: 20px;
          text-align: center;
        }
        
        .date-card .datetitle {
          font-size: 13px;
          color: #e65100;
          margin-bottom: 12px;
          font-weight: 700;
        }
        
        .date-card .datetext {
          font-size: 15px;
          color: #424242;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .date-card .datevalue {
          font-size: 36px;
          color: #f57c00;
          font-weight: 900;
        }
        
        .date-card .datelabel {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
        
        /* SUBJECT STATS */
        .subject-stats-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        .subject-box {
          border-radius: 16px;
          padding: 22px;
        }
        
        .subject-box.blue-bg {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border: 3px solid #42a5f5;
        }
        
        .subject-box.green-bg {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 3px solid #66bb6a;
        }
        
        .subject-box.purple-bg {
          background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
          border: 3px solid #ab47bc;
        }
        
        .subject-box .boxtitle {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .subject-box.blue-bg .boxtitle { color: #1565c0; }
        .subject-box.green-bg .boxtitle { color: #2e7d32; }
        .subject-box.purple-bg .boxtitle { color: #6a1b9a; }
        
        .subject-list {
          background: white;
          border-radius: 10px;
          padding: 15px 20px;
        }
        
        .subject-item {
          font-size: 14px;
          color: #424242;
          font-weight: 600;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .subject-item:last-child {
          border-bottom: none;
        }
        
        .subject-item .number {
          font-weight: 900;
          font-size: 15px;
        }
        
        .subject-box.blue-bg .number { color: #1976d2; }
        .subject-box.green-bg .number { color: #43a047; }
        .subject-box.purple-bg .number { color: #8e24aa; }
        
        /* EXAM DETAILS */
        .exam-card {
          background: white;
          border: 3px solid #e0e0e0;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
          border-top: 5px solid #2196f3;
        }
        
        .exam-title {
          color: #1565c0;
          font-size: 19px;
          font-weight: 900;
          margin-bottom: 8px;
        }
        
        .exam-date {
          color: #666;
          font-size: 13px;
          margin-bottom: 18px;
          font-weight: 600;
        }
        
        .exam-net-badge {
          background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
          color: white;
          padding: 18px 28px;
          border-radius: 14px;
          font-size: 24px;
          font-weight: 900;
          text-align: center;
          margin: 15px 0;
          box-shadow: 0 6px 18px rgba(124,77,255,0.3);
        }
        
        .exam-subject-title {
          font-size: 13px;
          font-weight: 700;
          margin: 20px 0 12px 0;
          color: #5e35b1;
        }
        
        .exam-perf-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 15px;
        }
        
        .perf-box {
          border: 3px solid;
          border-radius: 12px;
          padding: 16px 10px;
          text-align: center;
        }
        
        .perf-box.correct {
          border-color: #66bb6a;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        }
        
        .perf-box.wrong {
          border-color: #ef5350;
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
        }
        
        .perf-box.empty {
          border-color: #ffa726;
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        }
        
        .perf-box.net {
          border-color: #ab47bc;
          background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%);
          color: white;
        }
        
        .perf-box .perflabel {
          font-size: 10px;
          margin-bottom: 8px;
          font-weight: 700;
        }
        
        .perf-box.correct .perflabel,
        .perf-box.wrong .perflabel,
        .perf-box.empty .perflabel {
          color: #666;
        }
        
        .perf-box.net .perflabel {
          color: white;
          opacity: 0.95;
        }
        
        .perf-box .perfvalue {
          font-size: 22px;
          font-weight: 900;
        }
        
        .perf-box.correct .perfvalue { color: #43a047; }
        .perf-box.wrong .perfvalue { color: #e53935; }
        .perf-box.empty .perfvalue { color: #fb8c00; }
        .perf-box.net .perfvalue { color: white; }
        
        .wrong-topics {
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          border: 3px solid #e53935;
          border-left: 8px solid #c62828;
          border-radius: 12px;
          padding: 18px 22px;
          margin-top: 15px;
        }
        
        .wrong-topics h4 {
          font-size: 14px;
          color: #b71c1c;
          margin-bottom: 12px;
          font-weight: 900;
        }
        
        .wrong-topics ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .wrong-topics li {
          color: #424242;
          font-size: 13px;
          margin: 8px 0;
          font-weight: 600;
          padding: 8px 14px;
          background: rgba(255,255,255,0.6);
          border-radius: 8px;
          border-left: 4px solid #f44336;
        }
        
        .wrong-topics li::before {
          content: '✗ ';
          color: #e53935;
          font-weight: 900;
          margin-right: 6px;
        }
        
        .no-wrong-topics {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 3px solid #66bb6a;
          border-radius: 12px;
          padding: 15px;
          margin-top: 15px;
          text-align: center;
          color: #2e7d32;
          font-weight: 700;
          font-size: 13px;
        }
        
        /* FOOTER */
        .footer-note {
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          border: 3px solid #ef5350;
          border-radius: 16px;
          padding: 20px;
          margin: 25px;
          text-align: center;
        }
        
        .footer-note .date-line {
          color: #c62828;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .footer-note .system-line {
          color: #d32f2f;
          font-size: 15px;
          font-weight: 900;
        }
        
        .final-footer {
          text-align: center;
          padding: 25px;
          background: #f5f5f5;
          color: #757575;
          font-size: 12px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- ATATÜRK SECTION -->
        <div class="ataturk-section">
          <img src="cid:turkbayragi" alt="Türk Bayrağı" class="flag" />
          <div class="quote">"Biz her şeyi gençliğe bırakacağız... Geleceğin ümidi, ışıklı çiçekleri onlardır. Bütün ümidim gençliktedir."</div>
          <div class="ataturk-name">— MUSTAFA KEMAL ATATÜRK —</div>
          <img src="cid:ataturkimza" alt="Atatürk İmza" class="signature" />
          <img src="cid:ataturk" alt="Mustafa Kemal Atatürk" class="portrait" />
        </div>
        
        <!-- TITLE SECTION -->
        <div class="title-section">
          <h1>🎓 BERAT CANKIR</h1>
          <div class="subtitle">KİŞİSEL ÇALIŞMA ANALİZ RAPORU</div>
          <div class="date-info">📅 ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 🎯 Üniversite Kazanılacak !</div>
        </div>
        
        <!-- ÇÖZÜLEN SORU VE DENEME -->
        <div class="stats-top-row">
          <div class="stat-card-large stat-purple">
            <div class="label">📚 ÇÖZÜLEN SORU</div>
            <div class="value">${totalQuestions}</div>
          </div>
          <div class="stat-card-large stat-red">
            <div class="label">🎯 ÇÖZÜLEN DENEME</div>
            <div class="value">${recentExams.length}</div>
          </div>
        </div>
        
        <!-- ÇÖZÜLEN TÜM SORULAR -->
        <div class="section">
          <div class="section-title">📊 Çözülen Tüm Sorular</div>
          <div class="question-stats-grid">
            <div class="question-stat-box correct">
              <div class="qlabel">✓ Doğru</div>
              <div class="qvalue">${totalCorrect}</div>
            </div>
            <div class="question-stat-box wrong">
              <div class="qlabel">✗ Yanlış</div>
              <div class="qvalue">${totalWrong}</div>
            </div>
            <div class="question-stat-box empty">
              <div class="qlabel">○ Boş</div>
              <div class="qvalue">${totalEmpty}</div>
            </div>
          </div>
          <div class="success-rate-box">
            <div class="rate">${successRate}%</div>
            <div class="label">Başarı Oranım</div>
          </div>
        </div>
        
        <!-- TOPLAM AKTİVİTE VE GÖREVLER -->
        <div class="activity-grid">
          <div class="activity-card activity-green">
            <div class="title">📈 TOPLAM AKTİVİTE</div>
            <div class="number">${totalActivities}</div>
            <div class="subtitle">kayıtlı aktivite</div>
          </div>
          <div class="activity-card activity-purple">
            <div class="title">✅ TAMAMLANAN GÖREVLER</div>
            <div class="number">${completedTasks}</div>
            <div class="subtitle">Toplam ${tasks.length} görevden ${completedTasks} tanesini tamamladım!</div>
          </div>
          <div class="motivation-box" style="background: ${activityColor};">
            ${activityMotivation}
          </div>
        </div>
        
        <!-- ÖZEL İSTATİSTİKLER -->
        <div class="section">
          <div class="section-title">📊 ÖZEL İSTATİSTİKLER</div>
          <div class="special-stats-grid">
            <div class="special-stat-card purple-border">
              <div class="stitle">🔥 En Uzun Çalışma Serisi</div>
              <div class="svalue">${longestStreak}</div>
              <div class="slabel">ardışık gün</div>
            </div>
            <div class="special-stat-card red-border">
              <div class="stitle">❌ Bu Ay Hatalı Sorular</div>
              <div class="svalue">${wrongTopicsCount}</div>
              <div class="slabel">yanlış soru</div>
            </div>
            <div class="special-stat-card green-border">
              <div class="stitle">✅ Düzeltilen Konular</div>
              <div class="svalue">${completedTopics}</div>
              <div class="slabel">konu düzeltildi</div>
            </div>
          </div>
        </div>
        
        <!-- BU AYIN REKOR NETLERİ -->
        ${(generalExams.length > 0 || Object.keys(branchRecords).length > 0) ? `
        <div class="record-nets-box">
          <div class="record-title">🏆 BU AYIN REKOR DENEME NETLERİ</div>
          <div class="nets-grid">
            ${generalExams.length > 0 ? `
            <div class="net-card purple-b">
              <div class="netlabel">TYT Rekor Net</div>
              <div class="netvalue">${maxTytNet}</div>
            </div>
            ` : ''}
            ${Object.keys(branchRecords).length > 0 ? Object.entries(branchRecords).slice(0, 1).map(([subject, record]: any) => `
            <div class="net-card red-b">
              <div class="netlabel">${subject} Rekor Net</div>
              <div class="netvalue">${record.net}</div>
            </div>
            `).join('') : ''}
          </div>
          ${mostQuestionsDate ? `
          <div class="date-card">
            <div class="datetitle">🗓️ EN ÇOK SORU ÇÖZÜLEN TARİH</div>
            <div class="datetext">${mostQuestionsDate}</div>
            <div class="datevalue">${mostQuestionsCount}</div>
            <div class="datelabel">soru çözdüm</div>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- DERS İSTATİSTİKLERİ -->
        ${(mostWrongSubjects.length > 0 || mostSolvedSubjects.length > 0 || mostCorrectSubjects.length > 0) ? `
        <div class="section">
          <div class="subject-stats-container">
            ${mostWrongSubjects.length > 0 ? `
            <div class="subject-box blue-bg">
              <div class="boxtitle">📉 EN ÇOK HATA YAPILAN DERSLER</div>
              <div class="subject-list">
                ${mostWrongSubjects.map(([subject, stats]: any, index) => `
                <div class="subject-item">${index + 1}. ${subject}<span class="number"> ${stats.wrong} hata</span></div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            ${mostSolvedSubjects.length > 0 ? `
            <div class="subject-box green-bg">
              <div class="boxtitle">📚 EN ÇOK SORU ÇÖZÜLEN DERSLER</div>
              <div class="subject-list">
                ${mostSolvedSubjects.map(([subject, stats]: any, index) => `
                <div class="subject-item">${index + 1}. ${subject}<span class="number"> ${stats.total} soru</span></div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            ${mostCorrectSubjects.length > 0 ? `
            <div class="subject-box purple-bg">
              <div class="boxtitle">🏆 EN ÇOK DOĞRU YAPILAN DERSLER</div>
              <div class="subject-list">
                ${mostCorrectSubjects.map(([subject, stats]: any, index) => `
                <div class="subject-item">${index + 1}. ${subject}<span class="number"> ${stats.correct} doğru</span></div>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <!-- GENEL DENEME DETAYLARI -->
        ${generalExams.length > 0 ? `
        <div class="section">
          <div class="section-title">📋 DENEME DETAYLARI - Genel Denemeler</div>
          ${generalExams.map((exam: any) => {
            const net = ((exam.turkce_dogru || 0) - (exam.turkce_yanlis || 0) * 0.25) +
                       ((exam.sosyal_dogru || 0) - (exam.sosyal_yanlis || 0) * 0.25) +
                       ((exam.mat_dogru || 0) - (exam.mat_yanlis || 0) * 0.25) +
                       ((exam.fen_dogru || 0) - (exam.fen_yanlis || 0) * 0.25);
            
            const examNets = examSubjectNets.filter((n: any) => n.exam_id === exam.id);
            const getWrongTopics = (subject: string) => {
              const subjectNet = examNets.find((n: any) => n.subject === subject);
              if (subjectNet && subjectNet.wrong_topics_json) {
                try {
                  const topics = JSON.parse(subjectNet.wrong_topics_json);
                  return topics.map((t: any) => t.topic).join(', ');
                } catch(e) {
                  return '';
                }
              }
              return '';
            };
            
            return `
              <div class="exam-card">
                <div class="exam-title">${exam.exam_name}</div>
                <div class="exam-date">📅 ${new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 📚 ${exam.exam_type}</div>
                <div class="exam-net-badge">TYT Net: ${net.toFixed(2)}</div>
                
                ${exam.turkce_dogru !== undefined ? `
                <div class="exam-subject-title">📖 TÜRKÇE</div>
                <div class="exam-perf-grid">
                  <div class="perf-box correct"><div class="perflabel">✓ Doğru</div><div class="perfvalue">${exam.turkce_dogru || 0}</div></div>
                  <div class="perf-box wrong"><div class="perflabel">✗ Yanlış</div><div class="perfvalue">${exam.turkce_yanlis || 0}</div></div>
                  <div class="perf-box empty"><div class="perflabel">○ Boş</div><div class="perfvalue">${exam.turkce_bos || 0}</div></div>
                  <div class="perf-box net"><div class="perflabel">★ Net</div><div class="perfvalue">${((exam.turkce_dogru || 0) - (exam.turkce_yanlis || 0) * 0.25).toFixed(2)}</div></div>
                </div>
                ${getWrongTopics('Türkçe') ? `<div class="wrong-topics"><h4>❌ Yanlış Yapılan Konular:</h4><ul>${getWrongTopics('Türkçe').split(',').map((t: string) => `<li>${t.trim()}</li>`).join('')}</ul></div>` : '<div class="no-wrong-topics">✅ Bu derste yanlış konu kaydı yok</div>'}
                ` : ''}
                
                ${exam.sosyal_dogru !== undefined ? `
                <div class="exam-subject-title">🌍 SOSYAL BİLİMLER</div>
                <div class="exam-perf-grid">
                  <div class="perf-box correct"><div class="perflabel">✓ Doğru</div><div class="perfvalue">${exam.sosyal_dogru || 0}</div></div>
                  <div class="perf-box wrong"><div class="perflabel">✗ Yanlış</div><div class="perfvalue">${exam.sosyal_yanlis || 0}</div></div>
                  <div class="perf-box empty"><div class="perflabel">○ Boş</div><div class="perfvalue">${exam.sosyal_bos || 0}</div></div>
                  <div class="perf-box net"><div class="perflabel">★ Net</div><div class="perfvalue">${((exam.sosyal_dogru || 0) - (exam.sosyal_yanlis || 0) * 0.25).toFixed(2)}</div></div>
                </div>
                ${getWrongTopics('Sosyal Bilimler') ? `<div class="wrong-topics"><h4>❌ Yanlış Yapılan Konular:</h4><ul>${getWrongTopics('Sosyal Bilimler').split(',').map((t: string) => `<li>${t.trim()}</li>`).join('')}</ul></div>` : '<div class="no-wrong-topics">✅ Bu derste yanlış konu kaydı yok</div>'}
                ` : ''}
                
                ${exam.mat_dogru !== undefined ? `
                <div class="exam-subject-title">🔢 MATEMATİK</div>
                <div class="exam-perf-grid">
                  <div class="perf-box correct"><div class="perflabel">✓ Doğru</div><div class="perfvalue">${exam.mat_dogru || 0}</div></div>
                  <div class="perf-box wrong"><div class="perflabel">✗ Yanlış</div><div class="perfvalue">${exam.mat_yanlis || 0}</div></div>
                  <div class="perf-box empty"><div class="perflabel">○ Boş</div><div class="perfvalue">${exam.mat_bos || 0}</div></div>
                  <div class="perf-box net"><div class="perflabel">★ Net</div><div class="perfvalue">${((exam.mat_dogru || 0) - (exam.mat_yanlis || 0) * 0.25).toFixed(2)}</div></div>
                </div>
                ${getWrongTopics('Matematik') ? `<div class="wrong-topics"><h4>❌ Yanlış Yapılan Konular:</h4><ul>${getWrongTopics('Matematik').split(',').map((t: string) => `<li>${t.trim()}</li>`).join('')}</ul></div>` : '<div class="no-wrong-topics">✅ Bu derste yanlış konu kaydı yok</div>'}
                ` : ''}
                
                ${exam.fen_dogru !== undefined ? `
                <div class="exam-subject-title">🔬 FEN BİLİMLERİ</div>
                <div class="exam-perf-grid">
                  <div class="perf-box correct"><div class="perflabel">✓ Doğru</div><div class="perfvalue">${exam.fen_dogru || 0}</div></div>
                  <div class="perf-box wrong"><div class="perflabel">✗ Yanlış</div><div class="perfvalue">${exam.fen_yanlis || 0}</div></div>
                  <div class="perf-box empty"><div class="perflabel">○ Boş</div><div class="perfvalue">${exam.fen_bos || 0}</div></div>
                  <div class="perf-box net"><div class="perflabel">★ Net</div><div class="perfvalue">${((exam.fen_dogru || 0) - (exam.fen_yanlis || 0) * 0.25).toFixed(2)}</div></div>
                </div>
                ${getWrongTopics('Fen Bilimleri') ? `<div class="wrong-topics"><h4>❌ Yanlış Yapılan Konular:</h4><ul>${getWrongTopics('Fen Bilimleri').split(',').map((t: string) => `<li>${t.trim()}</li>`).join('')}</ul></div>` : '<div class="no-wrong-topics">✅ Bu derste yanlış konu kaydı yok</div>'}
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}
        
        <!-- BRANŞ DENEME DETAYLARI -->
        ${branchExams.length > 0 ? `
        <div class="section">
          <div class="section-title">📋 DENEME DETAYLARI - Branş Denemeler</div>
          ${branchExams.map((exam: any) => {
            const subject = exam.subject || exam.exam_type;
            const net = (exam.correct_count || 0) - (exam.wrong_count || 0) * 0.25;
            
            const examNets = examSubjectNets.filter((n: any) => n.exam_id === exam.id);
            const wrongTopicsArr: string[] = [];
            examNets.forEach((n: any) => {
              if (n.wrong_topics_json) {
                try {
                  const topics = JSON.parse(n.wrong_topics_json);
                  topics.forEach((t: any) => wrongTopicsArr.push(t.topic));
                } catch(e) {}
              }
            });
            const wrongTopics = wrongTopicsArr.join(', ');
            
            return `
              <div class="exam-card">
                <div class="exam-title">${exam.exam_name}</div>
                <div class="exam-date">📅 ${new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 📚 ${subject}</div>
                <div class="exam-net-badge">${subject} Net: ${net.toFixed(2)}</div>
                <div class="exam-perf-grid">
                  <div class="perf-box correct"><div class="perflabel">✓ Doğru</div><div class="perfvalue">${exam.correct_count || 0}</div></div>
                  <div class="perf-box wrong"><div class="perflabel">✗ Yanlış</div><div class="perfvalue">${exam.wrong_count || 0}</div></div>
                  <div class="perf-box empty"><div class="perflabel">○ Boş</div><div class="perfvalue">${exam.empty_count || 0}</div></div>
                  <div class="perf-box net"><div class="perflabel">★ Net</div><div class="perfvalue">${net.toFixed(2)}</div></div>
                </div>
                ${wrongTopics ? `<div class="wrong-topics"><h4>❌ Yanlış Yapılan Konular:</h4><ul>${wrongTopics.split(',').map((t: string) => `<li>${t.trim()}</li>`).join('')}</ul></div>` : '<div class="no-wrong-topics">✅ Bu derste yanlış konu kaydı yok</div>'}
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}
        
        <!-- FOOTER -->
        <div class="footer-note">
          <div class="date-line">🚀 Bu rapor ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde otomatik olarak oluşturulmuştur.</div>
          <div class="system-line">🇹🇷 Berat Cankır Kişisel Analiz Sistemi 🇹🇷</div>
        </div>
        
        <div class="final-footer">
          Bu rapor YKS Çalışma Takip Sistemi tarafından otomatik olarak oluşturulmuştur.<br/>
          Başarılar dileriz! 🎓 BERAT CANKIR
        </div>
      </div>
    </body>
    </html>
  `;
}
