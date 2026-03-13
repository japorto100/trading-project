// SOTA 2026: redb Embedded Cache — Reusable Template
// Pattern: OnceLock<Mutex<HashMap<String, Arc<Database>>>> as global DB pool
// One Arc<Database> per file path — created once, shared across threads.
//
// [dependencies]
// redb = "2"

use std::collections::HashMap;
use std::sync::{Arc, Mutex, OnceLock};
use std::time::{SystemTime, UNIX_EPOCH};
use redb::{Database, TableDefinition};

// ─────────────────────────────────────────────
// TABLE DEFINITION — change name when creating a new cache namespace
// ─────────────────────────────────────────────

const CACHE_TABLE: TableDefinition<&str, &[u8]> = TableDefinition::new("cache_v1");

// ─────────────────────────────────────────────
// ERROR TYPE
// ─────────────────────────────────────────────

#[derive(Debug, thiserror::Error)]
pub enum CacheError {
    #[error("redb error: {0}")]
    Db(#[from] redb::Error),
    #[error("ttl must be > 0")]
    InvalidTtl,
    #[error("record corrupted")]
    Corrupted,
    #[error("mutex poisoned")]
    Poisoned,
}

// ─────────────────────────────────────────────
// GLOBAL DB POOL — one Arc<Database> per file path
// ─────────────────────────────────────────────

static DB_POOL: OnceLock<Mutex<HashMap<String, Arc<Database>>>> = OnceLock::new();

fn pool() -> &'static Mutex<HashMap<String, Arc<Database>>> {
    DB_POOL.get_or_init(|| Mutex::new(HashMap::new()))
}

fn open_db(path: &str) -> Result<Arc<Database>, CacheError> {
    // Fast path — already open
    {
        let guard = pool().lock().map_err(|_| CacheError::Poisoned)?;
        if let Some(db) = guard.get(path) {
            return Ok(Arc::clone(db));
        }
    }
    // Slow path — create/open and insert
    let db = Arc::new(Database::create(path)?);
    let mut guard = pool().lock().map_err(|_| CacheError::Poisoned)?;
    let entry = guard.entry(path.to_string()).or_insert_with(|| Arc::clone(&db));
    Ok(Arc::clone(entry))
}

// ─────────────────────────────────────────────
// RECORD ENCODING — [expires_at_ms (10 bytes + \n) | payload bytes]
// ─────────────────────────────────────────────

fn encode(expires_at_ms: u64, payload: &str) -> Vec<u8> {
    let mut out = expires_at_ms.to_string().into_bytes();
    out.push(b'\n');
    out.extend_from_slice(payload.as_bytes());
    out
}

fn decode(bytes: &[u8]) -> Option<(u64, String)> {
    let sep = bytes.iter().position(|&b| b == b'\n')?;
    let expires = std::str::from_utf8(&bytes[..sep]).ok()?.parse().ok()?;
    let payload = String::from_utf8(bytes[sep + 1..].to_vec()).ok()?;
    Some((expires, payload))
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

pub fn cache_set(path: &str, key: &str, payload: &str, ttl_ms: u64) -> Result<(), CacheError> {
    if ttl_ms == 0 {
        return Err(CacheError::InvalidTtl);
    }
    let db = open_db(path)?;
    let expires = now_ms().saturating_add(ttl_ms);
    let record = encode(expires, payload);
    let tx = db.begin_write()?;
    {
        let mut table = tx.open_table(CACHE_TABLE)?;
        table.insert(key, record.as_slice())?;
    }
    tx.commit()?;
    Ok(())
}

pub fn cache_get(path: &str, key: &str, now_override: Option<u64>) -> Result<Option<String>, CacheError> {
    let db = open_db(path)?;
    let tx = db.begin_read()?;
    let table = tx.open_table(CACHE_TABLE)?;
    let Some(val) = table.get(key)? else {
        return Ok(None);
    };
    let (expires, payload) = decode(val.value()).ok_or(CacheError::Corrupted)?;
    let now = now_override.unwrap_or_else(now_ms);
    if now > expires {
        return Ok(None);  // expired
    }
    Ok(Some(payload))
}

pub fn cache_delete(path: &str, key: &str) -> Result<(), CacheError> {
    let db = open_db(path)?;
    let tx = db.begin_write()?;
    {
        let mut table = tx.open_table(CACHE_TABLE)?;
        table.remove(key)?;
    }
    tx.commit()?;
    Ok(())
}

// ─────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn db_path(dir: &tempfile::TempDir, name: &str) -> String {
        dir.path().join(name).to_string_lossy().to_string()
    }

    #[test]
    fn roundtrip() {
        let dir = tempdir().unwrap();
        let path = db_path(&dir, "cache.redb");
        cache_set(&path, "key1", r#"{"v":1}"#, 60_000).unwrap();
        let got = cache_get(&path, "key1", None).unwrap();
        assert_eq!(got.as_deref(), Some(r#"{"v":1}"#));
    }

    #[test]
    fn miss_returns_none() {
        let dir = tempdir().unwrap();
        let path = db_path(&dir, "cache2.redb");
        let got = cache_get(&path, "missing", None).unwrap();
        assert!(got.is_none());
    }

    #[test]
    fn expired_returns_none() {
        let dir = tempdir().unwrap();
        let path = db_path(&dir, "cache3.redb");
        cache_set(&path, "k", "v", 10).unwrap();
        let future = now_ms() + 60_000;
        let got = cache_get(&path, "k", Some(future)).unwrap();
        assert!(got.is_none());
    }

    #[test]
    fn zero_ttl_errors() {
        let dir = tempdir().unwrap();
        let path = db_path(&dir, "cache4.redb");
        assert!(cache_set(&path, "k", "v", 0).is_err());
    }
}
