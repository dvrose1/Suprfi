import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env
const envResult = loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
