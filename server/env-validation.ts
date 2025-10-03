//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI


export function validateEnvironmentVariables() {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!process.env.OPENWEATHER_API_KEY) {
    warnings.push('⚠️  OPENWEATHER_API_KEY is not set. Weather feature will not work.');
  }

  if (!process.env.GMAIL_USER && !process.env.EMAIL_USER) {
    warnings.push('⚠️  GMAIL_USER/EMAIL_USER is not set. Email features will not work.');
  }

  if (!process.env.GMAIL_PASS && !process.env.EMAIL_PASS) {
    warnings.push('⚠️  GMAIL_PASS/EMAIL_PASS is not set. Email features will not work.');
  }

  if (warnings.length > 0) {
    console.log('\n🔔 Environment Variable Warnings:');
    warnings.forEach(warning => console.log(warning));
    console.log('📝 Copy .env.example to .env and fill in your values.\n');
  }

  if (errors.length > 0) {
    console.error('\n❌ Critical Environment Variable Errors:');
    errors.forEach(error => console.error(error));
    console.error('Application cannot start without these variables.\n');
    process.exit(1);
  }
}

export function safeGetEnv(key: string, fallback: string = ''): string {
  const value = process.env[key];
  if (!value && !fallback) {
    console.warn(`⚠️  Environment variable ${key} is not set and has no fallback.`);
  }
  return value || fallback;
}
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
//BERATCANKIR OZEL ANALİZ TAKIP SISTEMI
