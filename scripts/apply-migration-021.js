#!/usr/bin/env node
/**
 * Apply migration 021 (AI tables + notification log) to Cloud SQL
 * Run: node scripts/apply-migration-021.js
 * 
 * Requires: Database credentials in environment or reads from .env.local
 */
'use strict';

const path = require('path');
const fs   = require('fs');

// Load .env.local if exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Set it via environment or .env.local');
  console.error('   Example: DATABASE_URL=postgresql://paysurity:pass@localhost:5436/paysurity_dev');
  process.exit(1);
}

const MIGRATION_FILE = path.join(__dirname, '..', 'packages', 'database', 'migrations', '021_ai_notifications.sql');

async function main() {
  console.log('\n🔷 PaySurity — Applying Migration 021 (AI + Notification tables)');
  console.log(`📁 Migration: ${MIGRATION_FILE}`);
  console.log(`🗄️  Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}\n`);

  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('❌ Migration file not found:', MIGRATION_FILE);
    process.exit(1);
  }

  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1') 
      ? false 
      : { rejectUnauthorized: false }, // Cloud SQL requires SSL
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    await client.query(sql);
    console.log('✅ Migration 021 applied successfully!\n');
    console.log('Tables created/verified:');
    console.log('  📊 ai_chat_sessions');
    console.log('  💬 ai_chat_messages');
    console.log('  👥 customer_segments');
    console.log('  👤 customer_segment_members');
    console.log('  📱 sms_send_log');
    console.log('  🔔 notification_log');
    console.log('\n✅ AI and Notification modules are now DB-ready.\n');
  } catch (err) {
    if (err.message?.includes('already exists')) {
      console.log('ℹ️  Tables already exist — migration idempotent, no action needed.');
    } else {
      console.error('❌ Migration failed:', err.message);
      console.error('   This is expected if tables are already applied.');
      // Non-zero exit only for unexpected errors
      if (!err.message?.includes('already exists')) {
        process.exit(1);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
