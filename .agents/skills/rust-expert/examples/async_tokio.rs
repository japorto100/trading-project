// SOTA 2026: Async Tokio + Rayon Patterns
// Rule: Tokio for I/O-bound async · Rayon for CPU-bound parallel
// NEVER block a Tokio thread with CPU work — use spawn_blocking

use std::time::Duration;
use tokio::time::timeout;
use tokio_util::sync::CancellationToken;
use rayon::prelude::*;
use tracing::{info, instrument};

// ─────────────────────────────────────────────
// 1. TOKIO RUNTIME SETUP
// ─────────────────────────────────────────────

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Multi-thread runtime is the default for #[tokio::main]
    // Use #[tokio::main(flavor = "current_thread")] for single-threaded (rare)
    run().await
}

async fn run() -> anyhow::Result<()> {
    Ok(())
}

// ─────────────────────────────────────────────
// 2. TIMEOUT ON EVERY EXTERNAL CALL
// ─────────────────────────────────────────────

async fn fetch_price(symbol: &str) -> anyhow::Result<f64> {
    use anyhow::Context as _;
    timeout(Duration::from_secs(5), do_fetch(symbol))
        .await
        .context("fetch timed out")?
        .context("fetch failed")
}

async fn do_fetch(_symbol: &str) -> anyhow::Result<f64> {
    // HTTP call, gRPC call, etc.
    Ok(100.0)
}

// ─────────────────────────────────────────────
// 3. SPAWN BLOCKING — CPU work inside async context
//    Never call rayon or heavy compute directly in .await path
// ─────────────────────────────────────────────

async fn compute_indicators_async(closes: Vec<f64>) -> anyhow::Result<Vec<f64>> {
    // Move CPU work off the Tokio thread pool
    tokio::task::spawn_blocking(move || {
        compute_ema_cpu(&closes, 14)
    })
    .await
    .map_err(|e| anyhow::anyhow!("join error: {e}"))?
}

fn compute_ema_cpu(values: &[f64], period: usize) -> Vec<f64> {
    // Pure CPU — runs in blocking thread pool, safe to be slow
    let alpha = 2.0 / (period as f64 + 1.0);
    let mut out = Vec::with_capacity(values.len());
    if let Some(&first) = values.first() {
        out.push(first);
        for &v in &values[1..] {
            let prev = *out.last().expect("non-empty");
            out.push(alpha * v + (1.0 - alpha) * prev);
        }
    }
    out
}

// ─────────────────────────────────────────────
// 4. RAYON — CPU-parallel batch compute
//    Best for: indicator batches, Monte Carlo rollouts, pattern scans
// ─────────────────────────────────────────────

pub struct OhlcvBatch {
    pub symbol: String,
    pub closes: Vec<f64>,
}

pub fn compute_batch_parallel(batches: &[OhlcvBatch], period: usize) -> Vec<Vec<f64>> {
    batches
        .par_iter()  // rayon parallel iterator
        .map(|b| compute_ema_cpu(&b.closes, period))
        .collect()
}

// Combine rayon + spawn_blocking:
pub async fn compute_batch_async(
    batches: Vec<OhlcvBatch>,
    period: usize,
) -> anyhow::Result<Vec<Vec<f64>>> {
    tokio::task::spawn_blocking(move || {
        compute_batch_parallel(&batches, period)
    })
    .await
    .map_err(|e| anyhow::anyhow!("join: {e}"))
}

// ─────────────────────────────────────────────
// 5. CANCELLATION TOKEN — graceful shutdown
// ─────────────────────────────────────────────

pub async fn worker_loop(token: CancellationToken) {
    loop {
        tokio::select! {
            _ = token.cancelled() => {
                info!("worker cancelled, shutting down");
                break;
            }
            _ = tokio::time::sleep(Duration::from_millis(100)) => {
                // do periodic work
            }
        }
    }
}

pub async fn run_with_shutdown() -> anyhow::Result<()> {
    let token = CancellationToken::new();
    let mut set = tokio::task::JoinSet::new();

    // Spawn workers
    for _ in 0..4 {
        let t = token.clone();
        set.spawn(worker_loop(t));
    }

    // Wait for Ctrl+C
    tokio::signal::ctrl_c().await?;
    info!("shutdown initiated");
    token.cancel();

    // Wait for all workers to finish
    while let Some(res) = set.join_next().await {
        res?;
    }
    info!("all workers stopped");
    Ok(())
}

// ─────────────────────────────────────────────
// 6. FAN-OUT WITH BOUNDED CONCURRENCY
// ─────────────────────────────────────────────

pub async fn fetch_all_prices(symbols: &[&str]) -> Vec<anyhow::Result<f64>> {
    use futures::future::join_all;

    // Bounded via semaphore if needed:
    let sem = std::sync::Arc::new(tokio::sync::Semaphore::new(10));

    let futures = symbols.iter().map(|s| {
        let sem = sem.clone();
        let s = s.to_string();
        async move {
            let _permit = sem.acquire_owned().await.map_err(|e| anyhow::anyhow!(e))?;
            fetch_price(&s).await
        }
    });

    join_all(futures).await
}

// ─────────────────────────────────────────────
// 7. TESTS
// ─────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn compute_indicators_async_works() {
        let closes: Vec<f64> = (0..50).map(|i| 100.0 + i as f64).collect();
        let result = compute_indicators_async(closes).await.unwrap();
        assert_eq!(result.len(), 50);
    }

    #[test]
    fn rayon_batch_correct_length() {
        let batches: Vec<OhlcvBatch> = (0..5)
            .map(|i| OhlcvBatch {
                symbol: format!("SYM{i}"),
                closes: vec![100.0; 30],
            })
            .collect();
        let results = compute_batch_parallel(&batches, 14);
        assert_eq!(results.len(), 5);
        assert!(results.iter().all(|r| r.len() == 30));
    }
}
