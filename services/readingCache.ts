import * as SQLite from 'expo-sqlite'
import { Platform } from 'react-native'

import type { ReadingPackageV1 } from '@/types/readings'
import type { CachedWord, SavedWordRow } from '@/types/words'

const MAX_CACHED_READINGS = 5

class ReadingCacheService {
  private db: SQLite.SQLiteDatabase | null = null

  async initialize(): Promise<void> {
    if (Platform.OS === 'web') return
    this.db = await SQLite.openDatabaseAsync('reading_cache.db')
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS reading_structure_cache (
        reading_id      TEXT PRIMARY KEY,
        structure_json  TEXT NOT NULL,
        last_accessed   INTEGER NOT NULL,
        created_at      INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cached_words_cache (
        reading_id      TEXT NOT NULL,
        native_language TEXT NOT NULL,
        words_json      TEXT NOT NULL,
        last_accessed   INTEGER NOT NULL,
        created_at      INTEGER NOT NULL,
        PRIMARY KEY (reading_id, native_language)
      );
      CREATE TABLE IF NOT EXISTS saved_words_cache (
        reading_id      TEXT NOT NULL,
        user_id         TEXT NOT NULL,
        native_language TEXT NOT NULL,
        rows_json       TEXT NOT NULL,
        last_accessed   INTEGER NOT NULL,
        fetched_at      INTEGER NOT NULL,
        PRIMARY KEY (reading_id, user_id, native_language)
      );
    `)
  }

  // ── Structure ─────────────────────────────────────────────────────────────

  async getStructure(readingId: string): Promise<ReadingPackageV1 | null> {
    if (!this.db) return null
    const row = await this.db.getFirstAsync<{ structure_json: string }>(
      'SELECT structure_json FROM reading_structure_cache WHERE reading_id = ?',
      [readingId],
    )
    if (!row) return null
    await this.db.runAsync(
      'UPDATE reading_structure_cache SET last_accessed = ? WHERE reading_id = ?',
      [Date.now(), readingId],
    )
    return JSON.parse(row.structure_json) as ReadingPackageV1
  }

  async setStructure(readingId: string, data: ReadingPackageV1): Promise<void> {
    if (!this.db) return
    const now = Date.now()
    await this.db.runAsync(
      `INSERT OR REPLACE INTO reading_structure_cache (reading_id, structure_json, last_accessed, created_at)
       VALUES (?, ?, ?, ?)`,
      [readingId, JSON.stringify(data), now, now],
    )
    await this.evictIfNeeded()
  }

  // ── Cached words (lookup cache) ───────────────────────────────────────────

  async getCachedWords(
    readingId: string,
    nativeLang: string,
  ): Promise<CachedWord[] | null> {
    if (!this.db) return null
    const row = await this.db.getFirstAsync<{ words_json: string }>(
      'SELECT words_json FROM cached_words_cache WHERE reading_id = ? AND native_language = ?',
      [readingId, nativeLang],
    )
    if (!row) return null
    await this.db.runAsync(
      'UPDATE cached_words_cache SET last_accessed = ? WHERE reading_id = ? AND native_language = ?',
      [Date.now(), readingId, nativeLang],
    )
    return JSON.parse(row.words_json) as CachedWord[]
  }

  async setCachedWords(
    readingId: string,
    nativeLang: string,
    data: CachedWord[],
  ): Promise<void> {
    if (!this.db) return
    const now = Date.now()
    await this.db.runAsync(
      `INSERT OR REPLACE INTO cached_words_cache (reading_id, native_language, words_json, last_accessed, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [readingId, nativeLang, JSON.stringify(data), now, now],
    )
  }

  // ── Saved words (user-editable) ───────────────────────────────────────────

  async getSavedWords(
    readingId: string,
    userId: string,
    nativeLang: string,
  ): Promise<SavedWordRow[] | null> {
    if (!this.db) return null
    const row = await this.db.getFirstAsync<{ rows_json: string }>(
      'SELECT rows_json FROM saved_words_cache WHERE reading_id = ? AND user_id = ? AND native_language = ?',
      [readingId, userId, nativeLang],
    )
    if (!row) return null
    await this.db.runAsync(
      'UPDATE saved_words_cache SET last_accessed = ? WHERE reading_id = ? AND user_id = ? AND native_language = ?',
      [Date.now(), readingId, userId, nativeLang],
    )
    return JSON.parse(row.rows_json) as SavedWordRow[]
  }

  async setSavedWords(
    readingId: string,
    userId: string,
    nativeLang: string,
    data: SavedWordRow[],
  ): Promise<void> {
    if (!this.db) return
    const now = Date.now()
    await this.db.runAsync(
      `INSERT OR REPLACE INTO saved_words_cache (reading_id, user_id, native_language, rows_json, last_accessed, fetched_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [readingId, userId, nativeLang, JSON.stringify(data), now, now],
    )
  }

  async invalidateSavedWords(
    readingId: string,
    userId: string,
    nativeLang: string,
  ): Promise<void> {
    if (!this.db) return
    await this.db.runAsync(
      'DELETE FROM saved_words_cache WHERE reading_id = ? AND user_id = ? AND native_language = ?',
      [readingId, userId, nativeLang],
    )
  }

  // ── Introspection ─────────────────────────────────────────────────────────

  async getCachedReadingIds(): Promise<string[]> {
    if (!this.db) return []
    const rows = await this.db.getAllAsync<{ reading_id: string }>(
      'SELECT reading_id FROM reading_structure_cache ORDER BY last_accessed DESC',
    )
    return rows.map((r) => r.reading_id)
  }

  // ── LRU eviction ──────────────────────────────────────────────────────────

  private async evictIfNeeded(): Promise<void> {
    if (!this.db) return
    const countRow = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM reading_structure_cache',
    )
    if (!countRow || countRow.count <= MAX_CACHED_READINGS) return

    const oldest = await this.db.getFirstAsync<{ reading_id: string }>(
      'SELECT reading_id FROM reading_structure_cache ORDER BY last_accessed ASC LIMIT 1',
    )
    if (!oldest) return

    await this.db.withTransactionAsync(async () => {
      await this.db!.runAsync(
        'DELETE FROM reading_structure_cache WHERE reading_id = ?',
        [oldest.reading_id],
      )
      await this.db!.runAsync('DELETE FROM cached_words_cache WHERE reading_id = ?', [
        oldest.reading_id,
      ])
      await this.db!.runAsync('DELETE FROM saved_words_cache WHERE reading_id = ?', [
        oldest.reading_id,
      ])
    })
  }
}

export const readingCacheService = new ReadingCacheService()
