// BERAT CANKIR
// BERAT BİLAL CANKIR
// CANKIR




///BERATCANKIR OZEL ANALİZ TAKIP SISTEMI

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/sema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://placeholder",
  },
});


// BERAT CANKIR
// BERAT BİLAL CANKIR
// CANKIR
