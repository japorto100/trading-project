// indicators/ — Category-based indicator modules.
//
// Migration plan: functions move here from lib.rs one category at a time.
// lib.rs keeps PyO3 exports + batch dispatch only.
//
// After migration, each module exposes free functions (no traits).
// Multi-output indicators (MACD, BB, ADX, Ichimoku, Keltner) return tuples.
// Naming convention follows kand: batch fn + *_inc() for incremental.

pub mod trend;
pub mod oscillators;
pub mod volatility;
pub mod volume;
pub mod ichimoku;
pub mod composite;
