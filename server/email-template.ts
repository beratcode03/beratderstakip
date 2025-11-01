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
      <title>Aylık Çalışma Raporum</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 800px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        
        <!-- ATATÜRK SECTION -->
        <tr>
          <td style="background: white; padding: 40px 30px; text-align: center; border-bottom: 6px solid #d32f2f;">
            <img src="cid:turkbayragi" alt="Türk Bayrağı" style="width: 180px; height: auto; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: block; margin-left: auto; margin-right: auto;" />
            <div style="font-style: italic; font-size: 17px; line-height: 1.7; color: #1a1a1a; margin: 20px auto; max-width: 600px; font-weight: 600;">"Biz her şeyi gençliğe bırakacağız... Geleceğin ümidi, ışıklı çiçekleri onlardır. Bütün ümidim gençliktedir."</div>
            <div style="color: #c62828; font-weight: 900; font-size: 16px; margin: 20px 0; letter-spacing: 2px; text-transform: uppercase; font-family: 'Arial Black', Arial, sans-serif;">— MUSTAFA KEMAL ATATÜRK —</div>
            <img src="cid:ataturkimza" alt="Atatürk İmza" style="width: 180px; height: auto; margin: 20px auto; display: block;" />
            <img src="cid:ataturk" alt="Mustafa Kemal Atatürk" style="width: 200px; height: auto; margin: 20px auto 0; display: block; border-radius: 15px; border: 4px solid #e0e0e0; box-shadow: 0 6px 20px rgba(0,0,0,0.25);" />
          </td>
        </tr>
        
        <!-- TITLE SECTION -->
        <tr>
          <td style="background: white; color: #1a1a1a; padding: 30px 25px; text-align: center;">
            <h1 style="font-size: 28px; margin-bottom: 8px; font-weight: 900; letter-spacing: 1px; color: #8e24aa; margin: 0;">🎓 BERAT CANKIR</h1>
            <div style="font-size: 18px; font-weight: 800; margin: 12px 0; letter-spacing: 0.5px; color: #424242;">KİŞİSEL ÇALIŞMA ANALİZ RAPORU</div>
            <div style="font-size: 15px; font-weight: 600; color: #666; margin: 0;">📅 ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 🎯 Üniversite Kazanılacak !</div>
          </td>
        </tr>
        
        <!-- ÇÖZÜLEN SORU VE DENEME - YAN YANA -->
        <tr>
          <td style="padding: 25px; background: #f8f9fa;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="48%" style="border-radius: 18px; padding: 30px 25px; text-align: center; color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.15); background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);">
                  <div style="font-size: 14px; font-weight: 700; margin-bottom: 15px; opacity: 0.95; letter-spacing: 0.5px;">📚 ÇÖZÜLEN SORU</div>
                  <div style="font-size: 48px; font-weight: 900; text-shadow: 0 3px 8px rgba(0,0,0,0.2);">${totalQuestions}</div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="border-radius: 18px; padding: 30px 25px; text-align: center; color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.15); background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);">
                  <div style="font-size: 14px; font-weight: 700; margin-bottom: 15px; opacity: 0.95; letter-spacing: 0.5px;">🎯 ÇÖZÜLEN DENEME</div>
                  <div style="font-size: 48px; font-weight: 900; text-shadow: 0 3px 8px rgba(0,0,0,0.2);">${recentExams.length}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- ÇÖZÜLEN TÜM SORULAR -->
        <tr>
          <td style="padding: 25px; margin: 20px 25px; background: #f8f9fa; border-radius: 16px;">
            <div style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #424242;">📊 Çözülen Tüm Sorular</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="32%" style="border: 3px solid #66bb6a; border-radius: 14px; padding: 20px 15px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                  <div style="font-size: 12px; color: #666; margin-bottom: 10px; font-weight: 700;">✓ Doğru</div>
                  <div style="font-size: 36px; font-weight: 900; color: #43a047;">${totalCorrect}</div>
                </td>
                <td width="2%"></td>
                <td width="32%" style="border: 3px solid #ef5350; border-radius: 14px; padding: 20px 15px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);">
                  <div style="font-size: 12px; color: #666; margin-bottom: 10px; font-weight: 700;">✗ Yanlış</div>
                  <div style="font-size: 36px; font-weight: 900; color: #e53935;">${totalWrong}</div>
                </td>
                <td width="2%"></td>
                <td width="32%" style="border: 3px solid #ffa726; border-radius: 14px; padding: 20px 15px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);">
                  <div style="font-size: 12px; color: #666; margin-bottom: 10px; font-weight: 700;">○ Boş</div>
                  <div style="font-size: 36px; font-weight: 900; color: #fb8c00;">${totalEmpty}</div>
                </td>
              </tr>
            </table>
            <div style="border: 3px solid #7c4dff; border-radius: 16px; padding: 25px; text-align: center; background: linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%); margin-top: 20px;">
              <div style="font-size: 42px; font-weight: 900; color: #6a1b9a; margin-bottom: 8px;">${successRate}%</div>
              <div style="font-size: 14px; color: #424242; font-weight: 600;">Başarı Oranım</div>
            </div>
          </td>
        </tr>
        
        <!-- TOPLAM AKTİVİTE VE GÖREVLER -->
        <tr>
          <td style="padding: 25px; background: #f8f9fa;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="48%" style="border-radius: 18px; padding: 28px 22px; text-align: center; color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.15); background: linear-gradient(135deg, #26a69a 0%, #00897b 100%);">
                  <div style="font-size: 13px; font-weight: 700; margin-bottom: 15px; opacity: 0.95; letter-spacing: 0.5px;">📈 TOPLAM AKTİVİTE</div>
                  <div style="font-size: 46px; font-weight: 900; margin-bottom: 10px; text-shadow: 0 3px 8px rgba(0,0,0,0.2);">${totalActivities}</div>
                  <div style="font-size: 13px; opacity: 0.9; font-weight: 600;">kayıtlı aktivite</div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="border-radius: 18px; padding: 28px 22px; text-align: center; color: white; box-shadow: 0 8px 20px rgba(0,0,0,0.15); background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%);">
                  <div style="font-size: 13px; font-weight: 700; margin-bottom: 15px; opacity: 0.95; letter-spacing: 0.5px;">✅ TAMAMLANAN GÖREVLER</div>
                  <div style="font-size: 46px; font-weight: 900; margin-bottom: 10px; text-shadow: 0 3px 8px rgba(0,0,0,0.2);">${completedTasks}/${tasks.length}</div>
                  <div style="font-size: 13px; opacity: 0.9; font-weight: 600;">görev tamamlandı</div>
                </td>
              </tr>
            </table>
            <div style="border-radius: 16px; padding: 20px; text-align: center; color: white; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 20px; background: ${activityColor};">
              ${activityMotivation}
            </div>
          </td>
        </tr>
        
        <!-- ÖZEL İSTATİSTİKLER -->
        <tr>
          <td style="padding: 25px; margin: 20px 25px; background: #f8f9fa; border-radius: 16px;">
            <div style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #424242;">📊 ÖZEL İSTATİSTİKLER</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="32%" style="border: 3px solid #ab47bc; border-radius: 14px; padding: 22px 18px; text-align: center; background: linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%);">
                  <div style="font-size: 11px; color: #757575; margin-bottom: 12px; font-weight: 700; text-transform: uppercase;">🔥 En Uzun Çalışma Serisi</div>
                  <div style="font-size: 38px; font-weight: 900; margin: 10px 0; color: #8e24aa;">${longestStreak}</div>
                  <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">ardışık gün</div>
                </td>
                <td width="2%"></td>
                <td width="32%" style="border: 3px solid #ef5350; border-radius: 14px; padding: 22px 18px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);">
                  <div style="font-size: 11px; color: #757575; margin-bottom: 12px; font-weight: 700; text-transform: uppercase;">❌ Bu Ay Hatalı Sorular</div>
                  <div style="font-size: 38px; font-weight: 900; margin: 10px 0; color: #e53935;">${wrongTopicsCount}</div>
                  <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">yanlış soru</div>
                </td>
                <td width="2%"></td>
                <td width="32%" style="border: 3px solid #66bb6a; border-radius: 14px; padding: 22px 18px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);">
                  <div style="font-size: 11px; color: #757575; margin-bottom: 12px; font-weight: 700; text-transform: uppercase;">✅ Düzeltilen Konular</div>
                  <div style="font-size: 38px; font-weight: 900; margin: 10px 0; color: #43a047;">${completedTopics}</div>
                  <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">konu düzeltildi</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- BU AYIN REKOR NETLERİ -->
        ${(generalExams.length > 0 || Object.keys(branchRecords).length > 0) ? `
        <tr>
          <td style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 16px; padding: 25px; margin: 20px 25px;">
            <div style="font-size: 17px; font-weight: 800; color: #1565c0; margin-bottom: 20px; text-align: center;">🏆 BU AYIN REKOR DENEME NETLERİ</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${generalExams.length > 0 ? `
                <td width="48%" style="border: 3px solid #ab47bc; border-radius: 14px; padding: 20px; text-align: center; background: white;">
                  <div style="font-size: 13px; color: #666; margin-bottom: 10px; font-weight: 700;">🏆 TYT Rekor Net</div>
                  <div style="font-size: 40px; font-weight: 900; color: #8e24aa;">${maxTytNet}</div>
                </td>
                ` : ''}
                ${Object.keys(branchRecords).length > 0 ? Object.entries(branchRecords).slice(0, 1).map(([subject, record]: any) => `
                <td width="4%"></td>
                <td width="48%" style="border: 3px solid #ef5350; border-radius: 14px; padding: 20px; text-align: center; background: white;">
                  <div style="font-size: 13px; color: #666; margin-bottom: 10px; font-weight: 700;">🏆 ${subject} Rekor Net</div>
                  <div style="font-size: 40px; font-weight: 900; color: #e53935;">${record.net}</div>
                </td>
                `).join('') : ''}
              </tr>
            </table>
            ${mostQuestionsDate ? `
            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border: 3px solid #ffa726; border-radius: 14px; padding: 20px; text-align: center; margin-top: 18px;">
              <div style="font-size: 13px; color: #e65100; margin-bottom: 12px; font-weight: 700;">🗓️ EN ÇOK SORU ÇÖZÜLEN TARİH</div>
              <div style="font-size: 15px; color: #424242; font-weight: 600; margin-bottom: 8px;">${mostQuestionsDate}</div>
              <div style="font-size: 36px; color: #f57c00; font-weight: 900; margin-bottom: 5px;">${mostQuestionsCount}</div>
              <div style="font-size: 12px; color: #666; font-weight: 500;">soru çözdüm</div>
            </div>
            ` : ''}
          </td>
        </tr>
        ` : ''}
        
        <!-- DERS İSTATİSTİKLERİ -->
        ${(mostWrongSubjects.length > 0 || mostSolvedSubjects.length > 0 || mostCorrectSubjects.length > 0) ? `
        <tr>
          <td style="padding: 25px;">
            ${mostWrongSubjects.length > 0 ? `
            <div style="border-radius: 16px; padding: 22px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 3px solid #42a5f5; margin-bottom: 20px;">
              <div style="font-size: 16px; font-weight: 800; margin-bottom: 15px; color: #1565c0;">📉 EN ÇOK HATA YAPILAN DERSLER</div>
              <div style="background: white; border-radius: 10px; padding: 15px 20px;">
                ${mostWrongSubjects.map(([subject, stats]: any, index) => `
                <div style="font-size: 14px; color: #424242; font-weight: 600; padding: 8px 0; ${index < mostWrongSubjects.length - 1 ? 'border-bottom: 1px solid #e0e0e0;' : ''}">${index + 1}. ${subject}<span style="font-weight: 900; font-size: 15px; color: #1976d2;"> ${stats.wrong} hata</span></div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            ${mostSolvedSubjects.length > 0 ? `
            <div style="border-radius: 16px; padding: 22px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #66bb6a; margin-bottom: 20px;">
              <div style="font-size: 16px; font-weight: 800; margin-bottom: 15px; color: #2e7d32;">📚 EN ÇOK SORU ÇÖZÜLEN DERSLER</div>
              <div style="background: white; border-radius: 10px; padding: 15px 20px;">
                ${mostSolvedSubjects.map(([subject, stats]: any, index) => `
                <div style="font-size: 14px; color: #424242; font-weight: 600; padding: 8px 0; ${index < mostSolvedSubjects.length - 1 ? 'border-bottom: 1px solid #e0e0e0;' : ''}">${index + 1}. ${subject}<span style="font-weight: 900; font-size: 15px; color: #43a047;"> ${stats.total} soru</span></div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            ${mostCorrectSubjects.length > 0 ? `
            <div style="border-radius: 16px; padding: 22px; background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border: 3px solid #ab47bc;">
              <div style="font-size: 16px; font-weight: 800; margin-bottom: 15px; color: #6a1b9a;">🏆 EN ÇOK DOĞRU YAPILAN DERSLER</div>
              <div style="background: white; border-radius: 10px; padding: 15px 20px;">
                ${mostCorrectSubjects.map(([subject, stats]: any, index) => `
                <div style="font-size: 14px; color: #424242; font-weight: 600; padding: 8px 0; ${index < mostCorrectSubjects.length - 1 ? 'border-bottom: 1px solid #e0e0e0;' : ''}">${index + 1}. ${subject}<span style="font-weight: 900; font-size: 15px; color: #8e24aa;"> ${stats.correct} doğru</span></div>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </td>
        </tr>
        ` : ''}
        
        <!-- GENEL DENEME DETAYLARI -->
        ${generalExams.length > 0 ? `
        <tr>
          <td style="padding: 25px; margin: 20px 25px; background: #f8f9fa; border-radius: 16px;">
            <div style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #424242;">📋 DENEME DETAYLARI - Genel Denemeler</div>
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
                    return topics.map((t: any) => t.topic);
                  } catch(e) {
                    return [];
                  }
                }
                return [];
              };
              
              return `
                <div style="background: white; border: 3px solid #e0e0e0; border-radius: 16px; padding: 25px; margin-bottom: 20px; border-top: 5px solid #2196f3;">
                  <div style="color: #1565c0; font-size: 19px; font-weight: 900; margin-bottom: 8px;">${exam.exam_name}</div>
                  <div style="color: #666; font-size: 13px; margin-bottom: 18px; font-weight: 600;">📅 ${new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 📚 ${exam.exam_type}</div>
                  <div style="background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%); color: white; padding: 18px 28px; border-radius: 14px; font-size: 24px; font-weight: 900; text-align: center; margin: 15px 0; box-shadow: 0 6px 18px rgba(124,77,255,0.3);">TYT Net: ${net.toFixed(2)}</div>
                  
                  ${exam.turkce_dogru !== undefined ? `
                  <div style="font-size: 13px; font-weight: 700; margin: 20px 0 12px 0; color: #5e35b1;">📖 TÜRKÇE</div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="23%" style="border: 3px solid #66bb6a; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✓ Doğru</div>
                        <div style="font-size: 22px; font-weight: 900; color: #43a047;">${exam.turkce_dogru || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ef5350; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✗ Yanlış</div>
                        <div style="font-size: 22px; font-weight: 900; color: #e53935;">${exam.turkce_yanlis || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ffa726; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">○ Boş</div>
                        <div style="font-size: 22px; font-weight: 900; color: #fb8c00;">${exam.turkce_bos || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ab47bc; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); color: white;">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; opacity: 0.95;">★ Net</div>
                        <div style="font-size: 22px; font-weight: 900;">${((exam.turkce_dogru || 0) - (exam.turkce_yanlis || 0) * 0.25).toFixed(2)}</div>
                      </td>
                    </tr>
                  </table>
                  ${getWrongTopics('Türkçe').length > 0 ? `
                  <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 3px solid #e53935; border-left: 8px solid #c62828; border-radius: 12px; padding: 18px 22px; margin-top: 15px;">
                    <h4 style="font-size: 14px; color: #b71c1c; margin-bottom: 12px; font-weight: 900;">❌ Yanlış Yapılan Konular:</h4>
                    ${getWrongTopics('Türkçe').map((topic: string) => `
                    <div style="color: #424242; font-size: 13px; margin: 8px 0; font-weight: 600; padding: 8px 14px; background: rgba(255,255,255,0.6); border-radius: 8px; border-left: 4px solid #f44336;">✗ ${topic}</div>
                    `).join('')}
                  </div>
                  ` : '<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #66bb6a; border-radius: 12px; padding: 15px; margin-top: 15px; text-align: center; color: #2e7d32; font-weight: 700; font-size: 13px;">✅ Bu derste yanlış konu kaydı yok</div>'}
                  ` : ''}
                  
                  ${exam.sosyal_dogru !== undefined ? `
                  <div style="font-size: 13px; font-weight: 700; margin: 20px 0 12px 0; color: #5e35b1;">🌍 SOSYAL BİLİMLER</div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="23%" style="border: 3px solid #66bb6a; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✓ Doğru</div>
                        <div style="font-size: 22px; font-weight: 900; color: #43a047;">${exam.sosyal_dogru || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ef5350; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✗ Yanlış</div>
                        <div style="font-size: 22px; font-weight: 900; color: #e53935;">${exam.sosyal_yanlis || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ffa726; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">○ Boş</div>
                        <div style="font-size: 22px; font-weight: 900; color: #fb8c00;">${exam.sosyal_bos || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ab47bc; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); color: white;">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; opacity: 0.95;">★ Net</div>
                        <div style="font-size: 22px; font-weight: 900;">${((exam.sosyal_dogru || 0) - (exam.sosyal_yanlis || 0) * 0.25).toFixed(2)}</div>
                      </td>
                    </tr>
                  </table>
                  ${getWrongTopics('Sosyal Bilimler').length > 0 ? `
                  <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 3px solid #e53935; border-left: 8px solid #c62828; border-radius: 12px; padding: 18px 22px; margin-top: 15px;">
                    <h4 style="font-size: 14px; color: #b71c1c; margin-bottom: 12px; font-weight: 900;">❌ Yanlış Yapılan Konular:</h4>
                    ${getWrongTopics('Sosyal Bilimler').map((topic: string) => `
                    <div style="color: #424242; font-size: 13px; margin: 8px 0; font-weight: 600; padding: 8px 14px; background: rgba(255,255,255,0.6); border-radius: 8px; border-left: 4px solid #f44336;">✗ ${topic}</div>
                    `).join('')}
                  </div>
                  ` : '<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #66bb6a; border-radius: 12px; padding: 15px; margin-top: 15px; text-align: center; color: #2e7d32; font-weight: 700; font-size: 13px;">✅ Bu derste yanlış konu kaydı yok</div>'}
                  ` : ''}
                  
                  ${exam.mat_dogru !== undefined ? `
                  <div style="font-size: 13px; font-weight: 700; margin: 20px 0 12px 0; color: #5e35b1;">🔢 MATEMATİK</div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="23%" style="border: 3px solid #66bb6a; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✓ Doğru</div>
                        <div style="font-size: 22px; font-weight: 900; color: #43a047;">${exam.mat_dogru || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ef5350; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✗ Yanlış</div>
                        <div style="font-size: 22px; font-weight: 900; color: #e53935;">${exam.mat_yanlis || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ffa726; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">○ Boş</div>
                        <div style="font-size: 22px; font-weight: 900; color: #fb8c00;">${exam.mat_bos || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ab47bc; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); color: white;">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; opacity: 0.95;">★ Net</div>
                        <div style="font-size: 22px; font-weight: 900;">${((exam.mat_dogru || 0) - (exam.mat_yanlis || 0) * 0.25).toFixed(2)}</div>
                      </td>
                    </tr>
                  </table>
                  ${getWrongTopics('Matematik').length > 0 ? `
                  <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 3px solid #e53935; border-left: 8px solid #c62828; border-radius: 12px; padding: 18px 22px; margin-top: 15px;">
                    <h4 style="font-size: 14px; color: #b71c1c; margin-bottom: 12px; font-weight: 900;">❌ Yanlış Yapılan Konular:</h4>
                    ${getWrongTopics('Matematik').map((topic: string) => `
                    <div style="color: #424242; font-size: 13px; margin: 8px 0; font-weight: 600; padding: 8px 14px; background: rgba(255,255,255,0.6); border-radius: 8px; border-left: 4px solid #f44336;">✗ ${topic}</div>
                    `).join('')}
                  </div>
                  ` : '<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #66bb6a; border-radius: 12px; padding: 15px; margin-top: 15px; text-align: center; color: #2e7d32; font-weight: 700; font-size: 13px;">✅ Bu derste yanlış konu kaydı yok</div>'}
                  ` : ''}
                  
                  ${exam.fen_dogru !== undefined ? `
                  <div style="font-size: 13px; font-weight: 700; margin: 20px 0 12px 0; color: #5e35b1;">🔬 FEN BİLİMLERİ</div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="23%" style="border: 3px solid #66bb6a; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✓ Doğru</div>
                        <div style="font-size: 22px; font-weight: 900; color: #43a047;">${exam.fen_dogru || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ef5350; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✗ Yanlış</div>
                        <div style="font-size: 22px; font-weight: 900; color: #e53935;">${exam.fen_yanlis || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ffa726; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">○ Boş</div>
                        <div style="font-size: 22px; font-weight: 900; color: #fb8c00;">${exam.fen_bos || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ab47bc; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); color: white;">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; opacity: 0.95;">★ Net</div>
                        <div style="font-size: 22px; font-weight: 900;">${((exam.fen_dogru || 0) - (exam.fen_yanlis || 0) * 0.25).toFixed(2)}</div>
                      </td>
                    </tr>
                  </table>
                  ${getWrongTopics('Fen Bilimleri').length > 0 ? `
                  <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 3px solid #e53935; border-left: 8px solid #c62828; border-radius: 12px; padding: 18px 22px; margin-top: 15px;">
                    <h4 style="font-size: 14px; color: #b71c1c; margin-bottom: 12px; font-weight: 900;">❌ Yanlış Yapılan Konular:</h4>
                    ${getWrongTopics('Fen Bilimleri').map((topic: string) => `
                    <div style="color: #424242; font-size: 13px; margin: 8px 0; font-weight: 600; padding: 8px 14px; background: rgba(255,255,255,0.6); border-radius: 8px; border-left: 4px solid #f44336;">✗ ${topic}</div>
                    `).join('')}
                  </div>
                  ` : '<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #66bb6a; border-radius: 12px; padding: 15px; margin-top: 15px; text-align: center; color: #2e7d32; font-weight: 700; font-size: 13px;">✅ Bu derste yanlış konu kaydı yok</div>'}
                  ` : ''}
                </div>
              `;
            }).join('')}
          </td>
        </tr>
        ` : ''}
        
        <!-- BRANŞ DENEME DETAYLARI -->
        ${branchExams.length > 0 ? `
        <tr>
          <td style="padding: 25px; margin: 20px 25px; background: #f8f9fa; border-radius: 16px;">
            <div style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #424242;">📋 DENEME DETAYLARI - Branş Denemeler</div>
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
              
              return `
                <div style="background: white; border: 3px solid #e0e0e0; border-radius: 16px; padding: 25px; margin-bottom: 20px; border-top: 5px solid #2196f3;">
                  <div style="color: #1565c0; font-size: 19px; font-weight: 900; margin-bottom: 8px;">${exam.exam_name}</div>
                  <div style="color: #666; font-size: 13px; margin-bottom: 18px; font-weight: 600;">📅 ${new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 📚 ${subject}</div>
                  <div style="background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%); color: white; padding: 18px 28px; border-radius: 14px; font-size: 24px; font-weight: 900; text-align: center; margin: 15px 0; box-shadow: 0 6px 18px rgba(124,77,255,0.3);">${subject} Net: ${net.toFixed(2)}</div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="23%" style="border: 3px solid #66bb6a; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✓ Doğru</div>
                        <div style="font-size: 22px; font-weight: 900; color: #43a047;">${exam.correct_count || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ef5350; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">✗ Yanlış</div>
                        <div style="font-size: 22px; font-weight: 900; color: #e53935;">${exam.wrong_count || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ffa726; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; color: #666;">○ Boş</div>
                        <div style="font-size: 22px; font-weight: 900; color: #fb8c00;">${exam.empty_count || 0}</div>
                      </td>
                      <td width="2%"></td>
                      <td width="23%" style="border: 3px solid #ab47bc; border-radius: 12px; padding: 16px 10px; text-align: center; background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); color: white;">
                        <div style="font-size: 10px; margin-bottom: 8px; font-weight: 700; opacity: 0.95;">★ Net</div>
                        <div style="font-size: 22px; font-weight: 900;">${net.toFixed(2)}</div>
                      </td>
                    </tr>
                  </table>
                  ${wrongTopicsArr.length > 0 ? `
                  <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 3px solid #e53935; border-left: 8px solid #c62828; border-radius: 12px; padding: 18px 22px; margin-top: 15px;">
                    <h4 style="font-size: 14px; color: #b71c1c; margin-bottom: 12px; font-weight: 900;">❌ Yanlış Yapılan Konular:</h4>
                    ${wrongTopicsArr.map((topic: string) => `
                    <div style="color: #424242; font-size: 13px; margin: 8px 0; font-weight: 600; padding: 8px 14px; background: rgba(255,255,255,0.6); border-radius: 8px; border-left: 4px solid #f44336;">✗ ${topic}</div>
                    `).join('')}
                  </div>
                  ` : '<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #66bb6a; border-radius: 12px; padding: 15px; margin-top: 15px; text-align: center; color: #2e7d32; font-weight: 700; font-size: 13px;">✅ Bu derste yanlış konu kaydı yok</div>'}
                </div>
              `;
            }).join('')}
          </td>
        </tr>
        ` : ''}
        
        <!-- FOOTER -->
        <tr>
          <td style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 3px solid #ef5350; border-radius: 16px; padding: 20px; margin: 25px; text-align: center;">
            <div style="color: #c62828; font-size: 13px; font-weight: 700; margin-bottom: 8px;">🚀 Bu rapor ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde otomatik olarak oluşturulmuştur.</div>
            <div style="color: #d32f2f; font-size: 15px; font-weight: 900;">🇹🇷 Berat Cankır Kişisel Analiz Sistemi 🇹🇷</div>
          </td>
        </tr>
        
        <tr>
          <td style="text-align: center; padding: 25px; background: #f5f5f5; color: #757575; font-size: 12px; font-weight: 600;">
            Başarılar dileriz! 🎓 BERAT CANKIR
          </td>
        </tr>
        
      </table>
    </body>
    </html>
  `;
}
