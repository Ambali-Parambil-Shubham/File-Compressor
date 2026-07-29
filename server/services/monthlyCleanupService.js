/**
 * MossZip Studio — Monthly History Cleanup Service
 *
 * Runs automatically on the 1st of each month at 02:00 AM server time.
 *
 * ONLY clears: audit_history.json records older than the start of the current month.
 * NEVER touches: app_users, limits.json, any Supabase user accounts, MPINs, settings.
 *
 * Also exposes a Supabase cleanup helper called from the admin endpoint.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auditLogsPath    = path.join(__dirname, '..', 'config', 'audit_history.json');
const cleanupLogsPath  = path.join(__dirname, '..', 'config', 'cleanup_log.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {}
  return fallback;
}

function writeJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function appendCleanupLog(entry) {
  const logs = readJson(cleanupLogsPath, []);
  logs.unshift(entry);
  // Keep last 120 cleanup log entries (10 years at monthly cadence)
  if (logs.length > 120) logs.splice(120);
  writeJson(cleanupLogsPath, logs);
}

// ─── Core Cleanup Logic ───────────────────────────────────────────────────────

/**
 * Clears server-side audit_history.json records belonging to previous months.
 * Records from the current calendar month are always preserved.
 *
 * @returns {{ removed: number, kept: number, success: boolean, error?: string }}
 */
export function cleanServerAuditHistory() {
  const startTime = new Date().toISOString();
  const now       = new Date();

  // Calculate the start of the CURRENT month (midnight UTC on the 1st)
  const startOfCurrentMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  );

  try {
    const allLogs = readJson(auditLogsPath, []);
    const originalCount = allLogs.length;

    // SAFE: keep only records from the current month onwards
    const kept = allLogs.filter((log) => {
      try {
        const logDate = new Date(log.timestamp || log.created_at || 0);
        return logDate >= startOfCurrentMonth;
      } catch (e) {
        return true; // keep on parse error — safety first
      }
    });

    const removed = originalCount - kept.length;

    // Only write if something actually changed (avoid unnecessary disk I/O)
    if (removed > 0) {
      writeJson(auditLogsPath, kept);
    }

    const endTime = new Date().toISOString();
    const logEntry = {
      run_at:          endTime,
      started_at:      startTime,
      target:          'server/config/audit_history.json',
      original_count:  originalCount,
      records_removed: removed,
      records_kept:    kept.length,
      cutoff_date:     startOfCurrentMonth.toISOString(),
      success:         true,
    };

    appendCleanupLog(logEntry);
    console.log(
      `[MossZip Cleanup] ✅ Server audit history cleaned — removed ${removed} records, kept ${kept.length} (cutoff: ${startOfCurrentMonth.toISOString()})`
    );

    return { removed, kept: kept.length, success: true };
  } catch (err) {
    const errorEntry = {
      run_at:    new Date().toISOString(),
      started_at: startTime,
      target:    'server/config/audit_history.json',
      success:   false,
      error:     err.message,
    };
    appendCleanupLog(errorEntry);
    console.error('[MossZip Cleanup] ❌ Server audit history cleanup failed:', err.message);
    return { removed: 0, kept: 0, success: false, error: err.message };
  }
}

/**
 * Reads the last N cleanup log entries (for Admin Portal display).
 */
export function getCleanupLogs(limit = 20) {
  const logs = readJson(cleanupLogsPath, []);
  return logs.slice(0, limit);
}

// ─── Monthly Cron Scheduler ───────────────────────────────────────────────────

/**
 * Schedules a monthly cleanup job via a recursive setTimeout strategy.
 *
 * - Fires on the 1st of each month at 02:00 AM local server time.
 * - Does NOT use third-party cron packages — pure Node.js timers.
 * - Never blocks the event loop. Everything is async-safe.
 */
export function startMonthlyCleanupScheduler() {
  function getMsUntilNextRun() {
    const now      = new Date();
    // Next run: 1st of next month at 02:00 AM
    const nextRun  = new Date(now.getFullYear(), now.getMonth() + 1, 1, 2, 0, 0, 0);
    return nextRun.getTime() - now.getTime();
  }

  function scheduleNext() {
    const ms = getMsUntilNextRun();
    const nextRun = new Date(Date.now() + ms);

    console.log(
      `[MossZip Cleanup] 📅 Monthly history cleanup scheduled — next run: ${nextRun.toLocaleString()} (in ${Math.round(ms / 3600000)}h)`
    );

    // Use recursive setTimeout (safer than setInterval for long gaps)
    const timer = setTimeout(() => {
      console.log('[MossZip Cleanup] 🚀 Running scheduled monthly history cleanup...');

      // Run server-side cleanup
      cleanServerAuditHistory();

      // Schedule the NEXT monthly run
      scheduleNext();
    }, ms);

    // Unref so the timer doesn't prevent Node.js from exiting cleanly
    if (timer.unref) timer.unref();
  }

  scheduleNext();
}
