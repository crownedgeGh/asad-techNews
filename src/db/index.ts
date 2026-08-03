import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const dbUrl = import.meta.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost/placeholder';
const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
