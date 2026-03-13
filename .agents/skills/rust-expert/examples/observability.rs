// SOTA 2026: Tracing + OpenTelemetry Setup
// Connects to the project's unified OTel pipeline (same as Go/Python)
//
// [dependencies]
// tracing                      = "0.1"
// tracing-subscriber           = { version = "0.3", features = ["env-filter", "json"] }
// tracing-opentelemetry        = "0.28"
// opentelemetry                = "0.27"
// opentelemetry_sdk            = "0.27"
// opentelemetry-otlp           = { version = "0.27", features = ["grpc-tonic"] }
// opentelemetry-semantic-conventions = "0.27"

use std::time::Duration;
use tracing::{info, warn, instrument, Span};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

// ─────────────────────────────────────────────
// 1. INIT — local dev (JSON stdout) + optional OTel
// ─────────────────────────────────────────────

pub fn init_tracing(service_name: &str, otlp_endpoint: Option<&str>) -> anyhow::Result<()> {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    // JSON format for structured logs in production
    let fmt_layer = tracing_subscriber::fmt::layer()
        .json()
        .with_target(true)
        .with_thread_ids(false);

    let registry = tracing_subscriber::registry()
        .with(env_filter)
        .with(fmt_layer);

    if let Some(endpoint) = otlp_endpoint {
        // OTel OTLP exporter — connects to same collector as Go/Python
        let tracer = init_otlp_tracer(service_name, endpoint)?;
        let otel_layer = tracing_opentelemetry::layer().with_tracer(tracer);
        registry.with(otel_layer).init();
    } else {
        registry.init();
    }

    Ok(())
}

fn init_otlp_tracer(
    service_name: &str,
    endpoint: &str,
) -> anyhow::Result<impl opentelemetry::trace::Tracer> {
    use opentelemetry::KeyValue;
    use opentelemetry_otlp::WithExportConfig;
    use opentelemetry_sdk::{runtime, Resource};

    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(endpoint)
                .with_timeout(Duration::from_secs(3)),
        )
        .with_trace_config(
            opentelemetry_sdk::trace::config()
                .with_resource(Resource::new(vec![
                    KeyValue::new("service.name", service_name.to_string()),
                    KeyValue::new("service.version", env!("CARGO_PKG_VERSION")),
                ])),
        )
        .install_batch(runtime::Tokio)?;

    Ok(tracer)
}

// ─────────────────────────────────────────────
// 2. INSTRUMENTATION PATTERNS
// ─────────────────────────────────────────────

// #[instrument] auto-creates a span named after the function
// skip() prevents sensitive/large fields from being logged
// fields() adds custom structured attributes
#[instrument(
    skip(payload),
    fields(
        signal.id = %id,
        signal.len = payload.len(),
        otel.kind = "internal"
    )
)]
pub async fn process_signal(id: &str, payload: &[f64]) -> anyhow::Result<f64> {
    info!("processing signal");

    // Record events inside span (not attributes — avoids size limits)
    Span::current().record("signal.len", payload.len());

    let result = compute(payload)?;

    info!(result = result, "signal computed");
    Ok(result)
}

// Sync function with instrument
#[instrument(skip(data), fields(batch.size = data.len()))]
pub fn process_batch(data: &[Vec<f64>]) -> Vec<f64> {
    data.iter()
        .filter_map(|v| compute(v).ok())
        .collect()
}

fn compute(values: &[f64]) -> anyhow::Result<f64> {
    if values.is_empty() {
        anyhow::bail!("empty input");
    }
    Ok(values.iter().sum::<f64>() / values.len() as f64)
}

// ─────────────────────────────────────────────
// 3. MANUAL SPAN CONTROL (when #[instrument] not sufficient)
// ─────────────────────────────────────────────

pub async fn manual_span_example(symbol: &str, period: u32) -> anyhow::Result<()> {
    let span = tracing::info_span!(
        "indicator.compute",
        symbol = symbol,
        period = period,
        "otel.kind" = "internal"
    );
    let _guard = span.enter();

    // Conditional recording
    if period < 2 {
        warn!(period, "very short period — results may be noisy");
        Span::current().record("warning", "short_period");
    }

    info!("computation complete");
    Ok(())
}

// ─────────────────────────────────────────────
// 4. SHUTDOWN — flush OTel spans before exit
// ─────────────────────────────────────────────

pub fn shutdown_tracing() {
    opentelemetry::global::shutdown_tracer_provider();
}

// ─────────────────────────────────────────────
// 5. MAIN — wiring it all together
// ─────────────────────────────────────────────

// In main.rs:
//
// #[tokio::main]
// async fn main() -> anyhow::Result<()> {
//     let otlp = std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT").ok();
//     init_tracing("rust-signal-processor", otlp.as_deref())?;
//
//     // ... run server ...
//
//     shutdown_tracing();
//     Ok(())
// }
//
// Env vars:
//   RUST_LOG=info,my_crate=debug
//   OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317  (OTel Collector)
//   or http://localhost:5081                            (OpenObserve direct)
