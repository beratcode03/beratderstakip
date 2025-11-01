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
  completedTopicsHistory: any[];
  completedQuestionsHistory: any[];
  isManualRequest: boolean;
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
    examSubjectNets,
    completedTopicsHistory,
    completedQuestionsHistory,
    isManualRequest
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aylık Çalışma Raporum</title>
    </head>
    <body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: white;">
      
      <!-- Ana Konteyner - Kalın gradient border -->
      <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 90px rgba(0,0,0,0.4); padding: 24px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 12%, #9333ea 25%, #7c3aed 37%, #2563eb 50%, #10b981 62%, #ec4899 75%, #c084fc 87%, #a855f7 100%);">
        <div style="background: white; border-radius: 12px; overflow: hidden;">
        
        <!-- ATATÜRK SECTION - Dış kenarlıkla bitişik çerçeve (email-safe) -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding: 0; background: white;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background: white;">
                    <img src="cid:turkbayragi" alt="Türk Bayrağı" style="width: 140px; height: auto; margin-bottom: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: block; margin-left: auto; margin-right: auto;" />
                    <div style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 26px; line-height: 1.8; color: #2c2c2c; margin: 25px auto; max-width: 680px; font-weight: 600; letter-spacing: 0.3px;">"Öğrenmek, en değerli yatırımdır."</div>
                    <div style="color: #b71c1c; font-weight: 800; font-size: 18px; margin: 20px 0; letter-spacing: 1.2px; font-family: 'Trebuchet MS', Arial, sans-serif;">— Mustafa Kemal Atatürk —</div>
                    <img src="cid:ataturkimza" alt="Atatürk İmza" style="width: 160px; height: auto; margin: 20px auto; display: block;" />
                    <img src="cid:ataturk" alt="Mustafa Kemal Atatürk" style="width: 180px; height: auto; margin: 20px auto 0; display: block; border-radius: 12px; border: 5px solid #e91e63; box-shadow: 0 6px 25px rgba(0,0,0,0.3);" />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0; height: 8px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                      <tr>
                        <td style="width: 11.11%; height: 8px; padding: 0; background-color: #dc2626;"></td>
                        <td style="width: 11.11%; height: 8px; padding: 0; background-color: #b91c1c;"></td>
                        <td style="width: 11.11%; height: 8px; padding: 0; background-color: #9333ea;"></td>
                        <td style="width: 11.11%; height: 8px; padding: 0; background-color: #7c3aed;"></td>
                        <td style="width: 11.11%; height: 8px; padding: 0; background-color: #2563eb;"></td>
                        <td style="width: 11.11%; height: 8px; padding: 0; background-color: #10b981;"></td>
                        <td style="width: 11.11%; height: 8px; padding: 0; background-color: #ec4899;"></td>
                        <td style="width: 11.11%; height: 8px; padding: 0; background-color: #c084fc;"></td>
                        <td style="width: 11.12%; height: 8px; padding: 0; background-color: #a855f7;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
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
                        <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">toplam hata</div>
                      </div>
                    </td>
                    <td width="1%"></td>
                    <td width="24%" style="vertical-align: top;">
                      <div style="border: 4px solid #66bb6a; border-radius: 16px; padding: 25px 15px; text-align: center; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
                        <div style="font-size: 11px; color: #2e7d32; margin-bottom: 12px; font-weight: 700; text-transform: uppercase; line-height: 1.3;">✅ Düzeltilen Konular</div>
                        <div style="font-size: 42px; font-weight: 900; margin: 12px 0; color: #43a047;">${completedTopicsHistory.length}</div>
                        <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">konu tamamlandı</div>
                      </div>
                    </td>
                    <td width="1%"></td>
                    <td width="24%" style="vertical-align: top;">
                      <div style="border: 4px solid #42a5f5; border-radius: 16px; padding: 25px 15px; text-align: center; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);">
                        <div style="font-size: 11px; color: #1565c0; margin-bottom: 12px; font-weight: 700; text-transform: uppercase; line-height: 1.3;">✅ Tamamlanan Hatalı Sorular</div>
                        <div style="font-size: 42px; font-weight: 900; margin: 12px 0; color: #1976d2;">${completedQuestionsHistory.length}</div>
                        <div style="font-size: 11px; color: #9e9e9e; font-weight: 500;">soru</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- BU AYIN REKOR GENEL DENEME NETLERİ -->
          ${generalExams.length > 0 ? `
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 20px; padding: 35px; border: 5px solid #2196f3; box-shadow: 0 10px 30px rgba(33, 150, 243, 0.3);">
                <div style="font-size: 22px; font-weight: 900; color: #1565c0; margin-bottom: 30px; text-align: center; letter-spacing: 0.5px;">🏆 BU AYIN REKOR GENEL DENEME NETLERİ</div>
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td width="49%" style="vertical-align: top;">
                      <div style="border: 5px solid #ab47bc; border-radius: 18px; padding: 30px 25px; text-align: center; background: white; box-shadow: 0 6px 20px rgba(171, 71, 188, 0.3);">
                        <div style="font-size: 15px; color: #6a1b9a; margin-bottom: 15px; font-weight: 800;">🏆 TYT Rekor Net</div>
                        <div style="font-size: 56px; font-weight: 900; color: #8e24aa;">${maxTytNet}</div>
                      </div>
                    </td>
                    <td width="2%"></td>
                    <td width="49%" style="vertical-align: top;">
                      <div style="border: 5px solid #ef5350; border-radius: 18px; padding: 30px 25px; text-align: center; background: white; box-shadow: 0 6px 20px rgba(239, 83, 80, 0.3);">
                        <div style="font-size: 15px; color: #c62828; margin-bottom: 15px; font-weight: 800;">🏆 AYT Rekor Net</div>
                        <div style="font-size: 56px; font-weight: 900; color: #e53935;">${Object.keys(branchRecords).length > 0 ? (Object.values(branchRecords)[0] as any).net : '0.00'}</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- BU AYIN REKOR BRANŞ DENEME NETLERİ -->
          ${Object.keys(branchRecords).length > 0 ? `
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 20px; padding: 35px; border: 5px solid #ff9800; box-shadow: 0 10px 30px rgba(255, 152, 0, 0.3);">
                <div style="font-size: 22px; font-weight: 900; color: #e65100; margin-bottom: 30px; text-align: center; letter-spacing: 0.5px;">🏆 BU AYIN REKOR BRANŞ DENEME NETLERİ</div>
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    ${Object.entries(branchRecords).map(([subject, record]: any, index: number) => `
                      ${index > 0 ? '<td width="2%"></td>' : ''}
                      <td width="${Math.floor(98 / Object.keys(branchRecords).length)}%" style="vertical-align: top;">
                        <div style="border: 5px solid ${index % 3 === 0 ? '#7c4dff' : index % 3 === 1 ? '#26a69a' : '#ec407a'}; border-radius: 18px; padding: 30px 20px; text-align: center; background: white; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
                          <div style="font-size: 14px; color: #424242; margin-bottom: 12px; font-weight: 800;">🏆 ${subject}</div>
                          <div style="font-size: 48px; font-weight: 900; color: ${index % 3 === 0 ? '#6a1b9a' : index % 3 === 1 ? '#00897b' : '#d81b60'};">${record.net}</div>
                          <div style="font-size: 11px; color: #9e9e9e; margin-top: 8px; font-weight: 600;">${new Date(record.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</div>
                        </div>
                      </td>
                    `).join('')}
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- EN ÇOK SORU ÇÖZÜLEN TARİH -->
          ${mostQuestionsDate ? `
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); border: 5px solid #ffc107; border-radius: 20px; padding: 35px; text-align: center; box-shadow: 0 10px 30px rgba(255, 193, 7, 0.3);">
                <div style="font-size: 16px; color: #e65100; margin-bottom: 15px; font-weight: 800; letter-spacing: 0.5px;">🗓️ EN ÇOK SORU ÇÖZÜLEN TARİH</div>
                <div style="font-size: 18px; color: #424242; font-weight: 700; margin-bottom: 15px;">${mostQuestionsDate}</div>
                <div style="font-size: 64px; color: #f57c00; font-weight: 900; margin: 15px 0;">${mostQuestionsCount}</div>
                <div style="font-size: 15px; color: #666; font-weight: 600;">soru çözdüm</div>
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
                  const examNets = examSubjectNets.filter((n: any) => n.exam_id === exam.id);
                  
                  // Calculate total net from examSubjectNets or fallback to tyt_net
                  let totalNet = 0;
                  if (examNets.length > 0) {
                    totalNet = examNets.reduce((sum: number, n: any) => sum + parseFloat(n.net_score || 0), 0);
                  } else {
                    totalNet = parseFloat(exam.tyt_net || 0);
                  }
                  
                  const getSubjectData = (subjectName: string) => {
                    const subjectNet = examNets.find((n: any) => n.subject === subjectName);
                    if (subjectNet) {
                      return {
                        dogru: parseInt(subjectNet.correct_count || 0),
                        yanlis: parseInt(subjectNet.wrong_count || 0),
                        bos: parseInt(subjectNet.blank_count || 0),
                        net: parseFloat(subjectNet.net_score || 0)
                      };
                    }
                    return null;
                  };
                  
                  const getWrongTopics = (subject: string) => {
                    const subjectNet = examNets.find((n: any) => n.subject === subject);
                    if (subjectNet && subjectNet.wrong_topics_json) {
                      try {
                        const topics = JSON.parse(subjectNet.wrong_topics_json);
                        return topics.map((t: any) => typeof t === 'string' ? t : (t.topic || t));
                      } catch(e) {
                        return [];
                      }
                    }
                    return [];
                  };
                  
                  const subjectNames = ['Türkçe', 'Sosyal Bilimler', 'Matematik', 'Fen Bilimleri'];
                  const subjectEmojis: any = {
                    'Türkçe': '📖',
                    'Sosyal Bilimler': '🌍', 
                    'Matematik': '🔢',
                    'Fen Bilimleri': '🔬'
                  };
                  
                  const subjects = subjectNames.map(name => {
                    const data = getSubjectData(name);
                    return {
                      name,
                      emoji: subjectEmojis[name] || '📚',
                      dogru: data?.dogru,
                      yanlis: data?.yanlis,
                      bos: data?.bos,
                      net: data?.net
                    };
                  }).filter(s => s.dogru !== undefined);
                  
                  return `
                    <div style="background: white; border: 4px solid #e0e0e0; border-radius: 18px; padding: 28px; margin-bottom: 25px; border-top: 6px solid #2196f3; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                      <div style="color: #1565c0; font-size: 20px; font-weight: 900; margin-bottom: 10px;">${exam.exam_name}</div>
                      <div style="color: #666; font-size: 14px; margin-bottom: 20px; font-weight: 600;">📅 ${new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} | 📚 ${exam.exam_type || 'TYT'}</div>
                      <div style="background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%); color: white; padding: 20px 30px; border-radius: 16px; font-size: 26px; font-weight: 900; text-align: center; margin: 20px 0; box-shadow: 0 8px 20px rgba(124,77,255,0.4);">Toplam Net: ${totalNet.toFixed(2)}</div>
                      
                      ${subjects.map(sub => {
                        if (sub.dogru === undefined) return '';
                        const wrongTopics = getWrongTopics(sub.name);
                        const subNet = (sub.net !== undefined ? sub.net : ((sub.dogru || 0) - (sub.yanlis || 0) * 0.25)).toFixed(2);
                        
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
                  const examNets = examSubjectNets.filter((n: any) => n.exam_id === exam.id);
                  
                  // Get data from examSubjectNets if available
                  let subject, dogru, yanlis, bos, net;
                  if (examNets.length > 0) {
                    const subjectNet = examNets[0];
                    subject = subjectNet.subject || exam.selected_subject || exam.exam_type;
                    dogru = parseInt(subjectNet.correct_count || 0);
                    yanlis = parseInt(subjectNet.wrong_count || 0);
                    bos = parseInt(subjectNet.blank_count || 0);
                    net = parseFloat(subjectNet.net_score || 0);
                  } else {
                    // Fallback if no examSubjectNets data
                    subject = exam.selected_subject || exam.subject || exam.exam_type;
                    dogru = 0;
                    yanlis = 0;
                    bos = 0;
                    net = 0;
                  }
                  
                  const wrongTopicsArr: string[] = [];
                  examNets.forEach((n: any) => {
                    if (n.wrong_topics_json) {
                      try {
                        const topics = JSON.parse(n.wrong_topics_json);
                        topics.forEach((t: any) => {
                          const topicStr = typeof t === 'string' ? t : (t.topic || String(t));
                          if (topicStr) wrongTopicsArr.push(topicStr);
                        });
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
                              <div style="font-size: 24px; font-weight: 900; color: #43a047;">${dogru}</div>
                            </div>
                          </td>
                          <td width="2%"></td>
                          <td width="23%" style="vertical-align: top;">
                            <div style="border: 3px solid #ef5350; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);">
                              <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; color: #c62828;">✗ Yanlış</div>
                              <div style="font-size: 24px; font-weight: 900; color: #e53935;">${yanlis}</div>
                            </div>
                          </td>
                          <td width="2%"></td>
                          <td width="23%" style="vertical-align: top;">
                            <div style="border: 3px solid #ffa726; border-radius: 14px; padding: 18px 12px; text-align: center; background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);">
                              <div style="font-size: 11px; margin-bottom: 10px; font-weight: 700; color: #e65100;">○ Boş</div>
                              <div style="font-size: 24px; font-weight: 900; color: #fb8c00;">${bos}</div>
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
          
          <!-- TAMAMLANAN HATALI KONULAR GEÇMİŞİ -->
          ${completedTopicsHistory.length > 0 ? `
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: 800; margin-bottom: 25px; color: #424242; text-align: center;">✅ Tamamlanan Hatalı Konular Geçmişi</div>
                <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 4px solid #66bb6a; border-radius: 16px; padding: 20px;">
                  ${completedTopicsHistory.map((topic: any, index: number) => `
                    <div style="background: white; border-left: 5px solid #43a047; border-radius: 12px; padding: 18px 20px; margin-bottom: ${index < completedTopicsHistory.length - 1 ? '15px' : '0'}; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                      <div style="color: #2e7d32; font-size: 16px; font-weight: 800; margin-bottom: 8px;">✓ ${topic.title}</div>
                      <div style="color: #666; font-size: 13px; font-weight: 600; margin-bottom: 5px;">📚 ${topic.subject} ${topic.source ? `| 📋 ${topic.source}` : ''}</div>
                      <div style="color: #9e9e9e; font-size: 12px; font-weight: 500;">📅 Tamamlandı: ${new Date(topic.completedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- TAMAMLANAN HATALI SORULAR GEÇMİŞİ -->
          ${completedQuestionsHistory.length > 0 ? `
          <tr>
            <td style="padding: 30px; background: #fafafa;">
              <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: 800; margin-bottom: 25px; color: #424242; text-align: center;">✅ Tamamlanan Hatalı Sorular Geçmişi</div>
                <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 4px solid #2196f3; border-radius: 16px; padding: 20px;">
                  ${completedQuestionsHistory.map((question: any, index: number) => `
                    <div style="background: white; border-left: 5px solid #1976d2; border-radius: 12px; padding: 18px 20px; margin-bottom: ${index < completedQuestionsHistory.length - 1 ? '15px' : '0'}; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                      <div style="color: #1565c0; font-size: 16px; font-weight: 800; margin-bottom: 10px;">📖 ${question.subject}</div>
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td width="32%" style="text-align: center; padding: 8px;">
                            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%); border: 2px solid #66bb6a; border-radius: 10px; padding: 12px;">
                              <div style="font-size: 11px; color: #2e7d32; font-weight: 700;">✓ Doğru</div>
                              <div style="font-size: 20px; color: #43a047; font-weight: 900;">${question.correctCount || 0}</div>
                            </div>
                          </td>
                          <td width="2%"></td>
                          <td width="32%" style="text-align: center; padding: 8px;">
                            <div style="background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%); border: 2px solid #ef5350; border-radius: 10px; padding: 12px;">
                              <div style="font-size: 11px; color: #c62828; font-weight: 700;">✗ Yanlış</div>
                              <div style="font-size: 20px; color: #e53935; font-weight: 900;">${question.wrongCount || 0}</div>
                            </div>
                          </td>
                          <td width="2%"></td>
                          <td width="32%" style="text-align: center; padding: 8px;">
                            <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%); border: 2px solid #ffa726; border-radius: 10px; padding: 12px;">
                              <div style="font-size: 11px; color: #e65100; font-weight: 700;">○ Boş</div>
                              <div style="font-size: 20px; color: #fb8c00; font-weight: 900;">${question.emptyCount || 0}</div>
                            </div>
                          </td>
                        </tr>
                      </table>
                      ${question.wrongTopics && question.wrongTopics.length > 0 ? `
                        <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 2px solid #e53935; border-radius: 10px; padding: 12px; margin-top: 12px;">
                          <div style="font-size: 12px; color: #b71c1c; font-weight: 700; margin-bottom: 8px;">❌ Yanlış Konular:</div>
                          ${question.wrongTopics.map((topic: string) => `
                            <div style="color: #424242; font-size: 13px; margin: 6px 0; font-weight: 600;">• ${topic}</div>
                          `).join('')}
                        </div>
                      ` : ''}
                      <div style="color: #9e9e9e; font-size: 12px; font-weight: 500; margin-top: 10px;">📅 ${new Date(question.logDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- FOOTER - KUTU İÇİNDE -->
          <tr>
            <td style="background: white; padding: 30px;">
              <div style="background: linear-gradient(135deg, #8e24aa 0%, #ab47bc 100%); border-radius: 18px; padding: 28px; text-align: center; box-shadow: 0 10px 30px rgba(142, 36, 170, 0.4);">
                <div style="color: white; font-size: 15px; font-weight: 800; margin-bottom: 10px; letter-spacing: 0.5px;">🚀 ${isManualRequest ? 'Kullanıcı Tarafından İstendi' : 'Otomatik Olarak Oluşturuldu'}</div>
                <div style="color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600;">🇹🇷 Berat Cankır Kişisel Analiz Sistemi 🇹🇷</div>
              </div>
            </td>
          </tr>
          
        </table>
        </div>
      </div>
    </body>
    </html>
  `;
}
