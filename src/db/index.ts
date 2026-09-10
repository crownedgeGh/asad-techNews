import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import dns from 'node:dns';
import net from 'node:net';

// Some local networks black-hole outbound IPv6, which makes Node/Bun's
// Happy Eyeballs dual-stack racing hang instead of falling back to IPv4.
// Force IPv4-first, single-attempt connections so the Neon fetch client
// doesn't stall against those networks.
dns.setDefaultResultOrder('ipv4first');
net.setDefaultAutoSelectFamily?.(false);

const dbUrl = import.meta.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost/placeholder';
const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
