    import { defineConfig } from 'drizzle-kit';

    export default defineConfig({
      schema: './src/db/schema.ts',
      out: './drizzle', // Output directory for migrations
      dialect: 'postgresql',
      dbCredentials: {
        url: process.env.DATABASE_URL!, // Supabase database connection string
      },
    });