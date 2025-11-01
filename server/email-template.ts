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
    <body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      
      <!-- Ana Konteyner - Gradient dış border ile -->
      <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 90px rgba(0,0,0,0.4); border: 12px solid; border-image: linear-gradient(135deg, #e91e63 0%, #9c27b0 25%, #673ab7 50%, #4caf50 75%, #2196f3 100%) 1;">
        
        <!-- ATATÜRK SECTION - Tam çerçeve içinde -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="background: linear-gradient(135deg, #dc143c 0%, #ff1493 100%); padding: 12px;">
              <div style="background: white; border-radius: 16px; padding: 40px 30px; text-align: center;">
                <img src="cid:turkbayragi" alt="Türk Bayrağı" style="width: 140px; height: auto; margin-bottom: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: block; margin-left: auto; margin-right: auto;" />
                <div style="font-style: italic; font-size: 16px; line-height: 1.8; color: #2c3e50; margin: 20px auto; max-width: 650px; font-weight: 500;">"Biz her şeyi gençliğe bırakacağız... Geleceğin ümidi, ışıklı çiçekleri onlardır. Bütün ümidim gençliktedir."</div>
                <div style="color: #c62828; font-weight: 900; font-size: 14px; margin: 20px 0; letter-spacing: 1px;">- Mustafa Kemal Atatürk -</div>
                <img src="cid:ataturkimza" alt="Atatürk İmza" style="width: 160px; height: auto; margin: 20px auto; display: block;" />
                <img src="cid:ataturk" alt="Mustafa Kemal Atatürk" style="width: 180px; height: auto; margin: 20px auto 0; display: block; border-radius: 12px; border: 3px solid #e91e63; box-shadow: 0 6px 25px rgba(0,0,0,0.3);" />
              </div>
            </td>
          </tr>
          
          <!-- BAŞLIK -->
          <tr>
            <td style="background: white; padding: 35px 30px 20px; text-align: center;">
              <h1 style="font-size: 32px; margin: 0 0 10px 0; font-weight: 900; letter-spacing: 0.5px; color: #8e24aa;">🎓 BERAT CANKIR</h1>
              <div style="font-size: 20px; font-weight: 700; margin: 0 0 15px 0; letter-spacing: 0.3px; color: #424242;">KİŞİSEL ÇALIŞMA ANALİZ RAPORU</div>
              <div style="font-size: 16px; font-weight: 600; color: #666; margin: 0;">📅 ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 🎯 Üniversite Kazanılacak !</div>
            </td>
          </tr>
          
          <!-- ÇÖZÜLEN SORU VE DENEME - EN ÜSTTE -->
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="49%" style="vertical-align: top;">
                    <div style="border-radius: 20px; padding: 35px 25px; text-align: center; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2); background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);">
                      <div style="font-size: 14px; font-weight: 700; margin-bottom: 18px; opacity: 0.95; letter-spacing: 0.5px;">📚 ÇÖZÜLEN SORU</div>
                      <div style="font-size: 52px; font-weight: 900; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">${totalQuestions}</div>
                    </div>
                  </td>
                  <td width="2%"></td>
                  <td width="49%" style="vertical-align: top;">
                    <div style="border-radius: 20px; padding: 35px 25px; text-align: center; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2); background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);">
                      <div style="font-size: 14px; font-weight: 700; margin-bottom: 18px; opacity: 0.95; letter-spacing: 0.5px;">🎯 ÇÖZÜLEN DENEME</div>
                      <div style="font-size: 52px; font-weight: 900; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">${recentExams.length}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- TOPLAM AKTİVİTE VE GÖREVLER - ALTTA -->
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="49%" style="vertical-align: top;">
                    <div style="border-radius: 20px; padding: 35px 25px; text-align: center; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2); background: linear-gradient(135deg, #26a69a 0%, #00897b 100%);">
                      <div style="font-size: 14px; font-weight: 700; margin-bottom: 18px; opacity: 0.95; letter-spacing: 0.5px;">📈 TOPLAM AKTİVİTE</div>
                      <div style="font-size: 52px; font-weight: 900; margin-bottom: 12px; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">${totalActivities}</div>
                      <div style="font-size: 14px; opacity: 0.9; font-weight: 600;">kayıtlı aktivite</div>
                    </div>
                  </td>
                  <td width="2%"></td>
                  <td width="49%" style="vertical-align: top;">
                    <div style="border-radius: 20px; padding: 35px 25px; text-align: center; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2); background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%);">
                      <div style="font-size: 14px; font-weight: 700; margin-bottom: 18px; opacity: 0.95; letter-spacing: 0.5px;">✅ TAMAMLANAN GÖREVLER</div>
                      <div style="font-size: 52px; font-weight: 900; margin-bottom: 12px; text-shadow: 0 4px 10px rgba(0,0,0,0.3);">${completedTasks}/${tasks.length}</div>
                      <div style="font-size: 14px; opacity: 0.9; font-weight: 600;">görev tamamlandı</div>
                    </div>
                  </td>
                </tr>
              </table>
              <div style="border-radius: 16px; padding: 22px; text-align: center; color: white; font-weight: 700; font-size: 15px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); margin-top: 25px; background: ${activityColor}; line-height: 1.6;">
                ${activityMotivation}
              </div>
            </td>
          </tr>
          
          <!-- ÇÖZÜLEN TÜM SORULAR - Gerçek Veriler -->
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: 800; margin-bottom: 25px; color: #424242; text-align: center;">📊 Çözülen Tüm Sorular</div>
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td width="32%" style="vertical-align: top;">
                      <div style="border: 4px solid #66bb6a; border-radius: 16px; padding: 25px 18px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                        <div style="font-size: 13px; color: #2e7d32; margin-bottom: 12px; font-weight: 700;">✓ Doğru</div>
                        <div style="font-size: 40px; font-weight: 900; color: #43a047;">${totalCorrect}</div>
                      </div>
                    </td>
                    <td width="2%"></td>
                    <td width="32%" style="vertical-align: top;">
                      <div style="border: 4px solid #ef5350; border-radius: 16px; padding: 25px 18px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);">
                        <div style="font-size: 13px; color: #c62828; margin-bottom: 12px; font-weight: 700;">✗ Yanlış</div>
                        <div style="font-size: 40px; font-weight: 900; color: #e53935;">${totalWrong}</div>
                      </div>
                    </td>
                    <td width="2%"></td>
                    <td width="32%" style="vertical-align: top;">
                      <div style="border: 4px solid #ffa726; border-radius: 16px; padding: 25px 18px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);">
                        <div style="font-size: 13px; color: #e65100; margin-bottom: 12px; font-weight: 700;">○ Boş</div>
                        <div style="font-size: 40px; font-weight: 900; color: #fb8c00;">${totalEmpty}</div>
                      </div>
                    </td>
                  </tr>
                </table>
                <div style="border: 4px solid #7c4dff; border-radius: 18px; padding: 28px; text-align: center; background: linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%); margin-top: 25px;">
                  <div style="font-size: 48px; font-weight: 900; color: #6a1b9a; margin-bottom: 10px;">${successRate}%</div>
                  <div style="font-size: 15px; color: #424242; font-weight: 700;">Başarı Oranım</div>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- ÖZEL İSTATİSTİKLER - Gerçek Veriler -->
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: 800; margin-bottom: 25px; color: #424242; text-align: center;">📊 ÖZEL İSTATİSTİKLER</div>
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td width="24%" style="vertical-align: top;">
                      <div style="border: 4px solid #ab47bc; border-radius: 16px; padding: 25px 15px; text-align: center; background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);">
                        <div style="font-size: 11px; color: #6a1b9a; margin-bottom: 12px; font-weight: 700; text-transform: uppercase; line-height: 1.3;">🔥 En Uzun Çalışma Serisi</div>
                        <div style="font-size: 42px; font-weight: 900; margin: 12px 0; color: #8e24aa;">${longestStreak}</div>
                        <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">ardışık gün</div>
                      </div>
                    </td>
                    <td width="1%"></td>
                    <td width="24%" style="vertical-align: top;">
                      <div style="border: 4px solid #ef5350; border-radius: 16px; padding: 25px 15px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);">
                        <div style="font-size: 11px; color: #c62828; margin-bottom: 12px; font-weight: 700; text-transform: uppercase; line-height: 1.3;">❌ Bu Ay Hatalı Konular</div>
                        <div style="font-size: 42px; font-weight: 900; margin: 12px 0; color: #e53935;">${wrongTopicsCount}</div>
                        <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">konu</div>
                      </div>
                    </td>
                    <td width="1%"></td>
                    <td width="24%" style="vertical-align: top;">
                      <div style="border: 4px solid #66bb6a; border-radius: 16px; padding: 25px 15px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                        <div style="font-size: 11px; color: #2e7d32; margin-bottom: 12px; font-weight: 700; text-transform: uppercase; line-height: 1.3;">✅ Düzeltilen Konular</div>
                        <div style="font-size: 42px; font-weight: 900; margin: 12px 0; color: #43a047;">${completedTopics}</div>
                        <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">konu</div>
                      </div>
                    </td>
                    <td width="1%"></td>
                    <td width="24%" style="vertical-align: top;">
                      <div style="border: 4px solid #42a5f5; border-radius: 16px; padding: 25px 15px; text-align: center; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);">
                        <div style="font-size: 11px; color: #1565c0; margin-bottom: 12px; font-weight: 700; text-transform: uppercase; line-height: 1.3;">✅ Tamamlanan Sorular</div>
                        <div style="font-size: 42px; font-weight: 900; margin: 12px 0; color: #1976d2;">${totalCorrect}</div>
                        <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">soru</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- BU AYIN REKOR NETLERİ - Gerçek Veriler -->
          ${(generalExams.length > 0 || Object.keys(branchRecords).length > 0) ? `
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 20px; padding: 30px; border: 4px solid #2196f3; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: 800; color: #1565c0; margin-bottom: 25px; text-align: center;">🏆 BU AYIN REKOR DENEME NETLERİ</div>
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    ${generalExams.length > 0 ? `
                    <td width="49%" style="vertical-align: top;">
                      <div style="border: 4px solid #ab47bc; border-radius: 16px; padding: 25px; text-align: center; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <div style="font-size: 14px; color: #6a1b9a; margin-bottom: 12px; font-weight: 700;">🏆 TYT Rekor Net</div>
                        <div style="font-size: 44px; font-weight: 900; color: #8e24aa;">${maxTytNet}</div>
                      </div>
                    </td>
                    ` : ''}
                    ${Object.keys(branchRecords).length > 0 && generalExams.length > 0 ? '<td width="2%"></td>' : ''}
                    ${Object.keys(branchRecords).length > 0 ? Object.entries(branchRecords).slice(0, 1).map(([subject, record]: any) => `
                    <td width="${generalExams.length > 0 ? '49%' : '100%'}" style="vertical-align: top;">
                      <div style="border: 4px solid #ef5350; border-radius: 16px; padding: 25px; text-align: center; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <div style="font-size: 14px; color: #c62828; margin-bottom: 12px; font-weight: 700;">🏆 ${subject} Rekor Net</div>
                        <div style="font-size: 44px; font-weight: 900; color: #e53935;">${record.net}</div>
                      </div>
                    </td>
                    `).join('') : ''}
                  </tr>
                </table>
                ${mostQuestionsDate ? `
                <div style="background: white; border: 4px solid #ffa726; border-radius: 16px; padding: 25px; text-align: center; margin-top: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                  <div style="font-size: 14px; color: #e65100; margin-bottom: 12px; font-weight: 700;">🗓️ EN ÇOK SORU ÇÖZÜLEN TARİH</div>
                  <div style="font-size: 16px; color: #424242; font-weight: 600; margin-bottom: 10px;">${mostQuestionsDate}</div>
                  <div style="font-size: 40px; color: #f57c00; font-weight: 900; margin-bottom: 5px;">${mostQuestionsCount}</div>
                  <div style="font-size: 13px; color: #666; font-weight: 500;">soru çözdüm</div>
                </div>
                ` : ''}
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- DERS İSTATİSTİKLERİ - Gerçek Veriler -->
          ${(mostWrongSubjects.length > 0 || mostSolvedSubjects.length > 0 || mostCorrectSubjects.length > 0) ? `
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              ${mostWrongSubjects.length > 0 ? `
              <div style="border-radius: 20px; padding: 28px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 4px solid #42a5f5; margin-bottom: 25px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #1565c0; text-align: center;">📉 EN ÇOK HATA YAPILAN DERSLER</div>
                <div style="background: white; border-radius: 14px; padding: 20px 25px;">
                  ${mostWrongSubjects.map(([subject, stats]: any, index) => `
                  <div style="font-size: 15px; color: #424242; font-weight: 600; padding: 12px 0; ${index < mostWrongSubjects.length - 1 ? 'border-bottom: 2px solid #e0e0e0;' : ''}">${index + 1}. ${subject}<span style="font-weight: 900; font-size: 16px; color: #1976d2; float: right;"> ${stats.wrong} hata</span></div>
                  `).join('')}
                </div>
              </div>
              ` : ''}
              ${mostSolvedSubjects.length > 0 ? `
              <div style="border-radius: 20px; padding: 28px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 4px solid #66bb6a; margin-bottom: 25px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #2e7d32; text-align: center;">📚 EN ÇOK SORU ÇÖZÜLEN DERSLER</div>
                <div style="background: white; border-radius: 14px; padding: 20px 25px;">
                  ${mostSolvedSubjects.map(([subject, stats]: any, index) => `
                  <div style="font-size: 15px; color: #424242; font-weight: 600; padding: 12px 0; ${index < mostSolvedSubjects.length - 1 ? 'border-bottom: 2px solid #e0e0e0;' : ''}">${index + 1}. ${subject}<span style="font-weight: 900; font-size: 16px; color: #43a047; float: right;"> ${stats.total} soru</span></div>
                  `).join('')}
                </div>
              </div>
              ` : ''}
              ${mostCorrectSubjects.length > 0 ? `
              <div style="border-radius: 20px; padding: 28px; background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border: 4px solid #ab47bc; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #6a1b9a; text-align: center;">🏆 EN ÇOK DOĞRU YAPILAN DERSLER</div>
                <div style="background: white; border-radius: 14px; padding: 20px 25px;">
                  ${mostCorrectSubjects.map(([subject, stats]: any, index) => `
                  <div style="font-size: 15px; color: #424242; font-weight: 600; padding: 12px 0; ${index < mostCorrectSubjects.length - 1 ? 'border-bottom: 2px solid #e0e0e0;' : ''}">${index + 1}. ${subject}<span style="font-weight: 900; font-size: 16px; color: #8e24aa; float: right;"> ${stats.correct} doğru</span></div>
                  `).join('')}
                </div>
              </div>
              ` : ''}
            </td>
          </tr>
          ` : ''}
          
          <!-- GENEL DENEME DETAYLARI - Gerçek Veriler -->
          ${generalExams.length > 0 ? `
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: 800; margin-bottom: 25px; color: #424242; text-align: center;">📋 DENEME DETAYLARI - Genel Denemeler</div>
                ${generalExams.slice(0, 5).map((exam: any) => {
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
                  
                  const subjects = [
                    { name: 'Türkçe', emoji: '📖', dogru: exam.turkce_dogru, yanlis: exam.turkce_yanlis, bos: exam.turkce_bos },
                    { name: 'Sosyal Bilimler', emoji: '🌍', dogru: exam.sosyal_dogru, yanlis: exam.sosyal_yanlis, bos: exam.sosyal_bos },
                    { name: 'Matematik', emoji: '🔢', dogru: exam.mat_dogru, yanlis: exam.mat_yanlis, bos: exam.mat_bos },
                    { name: 'Fen Bilimleri', emoji: '🔬', dogru: exam.fen_dogru, yanlis: exam.fen_yanlis, bos: exam.fen_bos }
                  ];
                  
                  return `
                    <div style="background: white; border: 4px solid #e0e0e0; border-radius: 18px; padding: 28px; margin-bottom: 25px; border-top: 6px solid #2196f3; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                      <div style="color: #1565c0; font-size: 20px; font-weight: 900; margin-bottom: 10px;">${exam.exam_name}</div>
                      <div style="color: #666; font-size: 14px; margin-bottom: 20px; font-weight: 600;">📅 ${new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 📚 ${exam.exam_type}</div>
                      <div style="background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%); color: white; padding: 20px 30px; border-radius: 16px; font-size: 26px; font-weight: 900; text-align: center; margin: 20px 0; box-shadow: 0 8px 20px rgba(124,77,255,0.4);">TYT Net: ${net.toFixed(2)}</div>
                      
                      ${subjects.map(sub => {
                        if (sub.dogru === undefined) return '';
                        const wrongTopics = getWrongTopics(sub.name);
                        const subNet = ((sub.dogru || 0) - (sub.yanlis || 0) * 0.25).toFixed(2);
                        
                        return `
                        <div style="margin: 20px 0;">
                          <div style="font-size: 14px; font-weight: 700; margin: 20px 0 15px 0; color: #5e35b1;">${sub.emoji} ${sub.name.toUpperCase()}</div>
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td width="23%" style="vertical-align: top;">
                                <div style="border: 3px solid #66bb6a; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);">
                                  <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; color: #2e7d32;">✓ Doğru</div>
                                  <div style="font-size: 24px; font-weight: 900; color: #43a047;">${sub.dogru || 0}</div>
                                </div>
                              </td>
                              <td width="2%"></td>
                              <td width="23%" style="vertical-align: top;">
                                <div style="border: 3px solid #ef5350; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);">
                                  <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; color: #c62828;">✗ Yanlış</div>
                                  <div style="font-size: 24px; font-weight: 900; color: #e53935;">${sub.yanlis || 0}</div>
                                </div>
                              </td>
                              <td width="2%"></td>
                              <td width="23%" style="vertical-align: top;">
                                <div style="border: 3px solid #ffa726; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);">
                                  <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; color: #e65100;">○ Boş</div>
                                  <div style="font-size: 24px; font-weight: 900; color: #fb8c00;">${sub.bos || 0}</div>
                                </div>
                              </td>
                              <td width="2%"></td>
                              <td width="23%" style="vertical-align: top;">
                                <div style="border: 3px solid #ab47bc; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); color: white;">
                                  <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; opacity: 0.95;">★ Net</div>
                                  <div style="font-size: 24px; font-weight: 900;">${subNet}</div>
                                </div>
                              </td>
                            </tr>
                          </table>
                          ${wrongTopics.length > 0 ? `
                          <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 3px solid #e53935; border-left: 6px solid #c62828; border-radius: 14px; padding: 20px 24px; margin-top: 18px;">
                            <h4 style="font-size: 15px; color: #b71c1c; margin: 0 0 15px 0; font-weight: 900;">❌ Yanlış Yapılan Konular:</h4>
                            ${wrongTopics.map((topic: string) => `
                            <div style="color: #424242; font-size: 14px; margin: 10px 0; font-weight: 600; padding: 10px 16px; background: rgba(255,255,255,0.7); border-radius: 10px; border-left: 4px solid #f44336;">✗ ${topic}</div>
                            `).join('')}
                          </div>
                          ` : '<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #66bb6a; border-radius: 14px; padding: 18px; margin-top: 18px; text-align: center; color: #2e7d32; font-weight: 700; font-size: 14px;">✅ Bu derste yanlış konu kaydı yok</div>'}
                        </div>
                        `;
                      }).join('')}
                    </div>
                  `;
                }).join('')}
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- BRANŞ DENEME DETAYLARI - Gerçek Veriler -->
          ${branchExams.length > 0 ? `
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: 800; margin-bottom: 25px; color: #424242; text-align: center;">📋 DENEME DETAYLARI - Branş Denemeler</div>
                ${branchExams.slice(0, 5).map((exam: any) => {
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
                    <div style="background: white; border: 4px solid #e0e0e0; border-radius: 18px; padding: 28px; margin-bottom: 25px; border-top: 6px solid #2196f3; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                      <div style="color: #1565c0; font-size: 20px; font-weight: 900; margin-bottom: 10px;">${exam.exam_name}</div>
                      <div style="color: #666; font-size: 14px; margin-bottom: 20px; font-weight: 600;">📅 ${new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 📚 ${subject}</div>
                      <div style="background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%); color: white; padding: 20px 30px; border-radius: 16px; font-size: 26px; font-weight: 900; text-align: center; margin: 20px 0; box-shadow: 0 8px 20px rgba(124,77,255,0.4);">${subject} Net: ${net.toFixed(2)}</div>
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td width="23%" style="vertical-align: top;">
                            <div style="border: 3px solid #66bb6a; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);">
                              <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; color: #2e7d32;">✓ Doğru</div>
                              <div style="font-size: 24px; font-weight: 900; color: #43a047;">${exam.correct_count || 0}</div>
                            </div>
                          </td>
                          <td width="2%"></td>
                          <td width="23%" style="vertical-align: top;">
                            <div style="border: 3px solid #ef5350; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);">
                              <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; color: #c62828;">✗ Yanlış</div>
                              <div style="font-size: 24px; font-weight: 900; color: #e53935;">${exam.wrong_count || 0}</div>
                            </div>
                          </td>
                          <td width="2%"></td>
                          <td width="23%" style="vertical-align: top;">
                            <div style="border: 3px solid #ffa726; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);">
                              <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; color: #e65100;">○ Boş</div>
                              <div style="font-size: 24px; font-weight: 900; color: #fb8c00;">${exam.empty_count || 0}</div>
                            </div>
                          </td>
                          <td width="2%"></td>
                          <td width="23%" style="vertical-align: top;">
                            <div style="border: 3px solid #ab47bc; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); color: white;">
                              <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; opacity: 0.95;">★ Net</div>
                              <div style="font-size: 24px; font-weight: 900;">${net.toFixed(2)}</div>
                            </div>
                          </td>
                        </tr>
                      </table>
                      ${wrongTopicsArr.length > 0 ? `
                      <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 3px solid #e53935; border-left: 6px solid #c62828; border-radius: 14px; padding: 20px 24px; margin-top: 18px;">
                        <h4 style="font-size: 15px; color: #b71c1c; margin: 0 0 15px 0; font-weight: 900;">❌ Yanlış Yapılan Konular:</h4>
                        ${wrongTopicsArr.map((topic: string) => `
                        <div style="color: #424242; font-size: 14px; margin: 10px 0; font-weight: 600; padding: 10px 16px; background: rgba(255,255,255,0.7); border-radius: 10px; border-left: 4px solid #f44336;">✗ ${topic}</div>
                        `).join('')}
                      </div>
                      ` : '<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #66bb6a; border-radius: 14px; padding: 18px; margin-top: 18px; text-align: center; color: #2e7d32; font-weight: 700; font-size: 14px;">✅ Bu derste yanlış konu kaydı yok</div>'}
                    </div>
                  `;
                }).join('')}
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- FOOTER - KUTU İÇİNDE -->
          <tr>
            <td style="background: #fafafa; padding: 30px;">
              <div style="background: white; border: 3px solid #e0e0e0; border-radius: 16px; padding: 25px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                <div style="color: #c62828; font-size: 13px; font-weight: 600; margin-bottom: 8px;">🚀 ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} - Otomatik Oluşturuldu</div>
                <div style="color: #757575; font-size: 12px; font-weight: 500;">🇹🇷 Berat Cankır Kişisel Analiz Sistemi 🇹🇷</div>
              </div>
            </td>
          </tr>
          
        </table>
      </div>
    </body>
    </html>
  `;
}
