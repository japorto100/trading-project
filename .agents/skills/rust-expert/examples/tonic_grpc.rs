// SOTA 2026: Tonic gRPC Service — Production Pattern
//
// Cargo.toml dependencies:
//   tonic       = "0.12"
//   prost       = "0.13"
//   tokio       = { version = "1", features = ["full"] }
//   tower       = "0.5"
//   tonic-health= "0.12"
//   tracing     = "0.1"
//
// Cargo.toml build-dependencies:
//   tonic-build = "0.12"
//
// build.rs:
//   fn main() -> Result<(), Box<dyn std::error::Error>> {
//       tonic_build::configure()
//           .build_server(true)
//           .build_client(false)
//           .compile_protos(&["proto/signals.proto"], &["proto"])?;
//       Ok(())
//   }

use std::net::SocketAddr;
use tokio::signal;
use tokio_util::sync::CancellationToken;
use tonic::{transport::Server, Request, Response, Status};
use tracing::{info, instrument};

// Generated from proto — include in real code:
// tonic::include_proto!("signals");

// ─────────────────────────────────────────────
// DOMAIN TYPES (example — replace with proto-generated)
// ─────────────────────────────────────────────

#[derive(Debug)]
pub struct ComputeRequest {
    pub asset: String,
    pub closes: Vec<f64>,
    pub indicator: String,
    pub period: u32,
}

#[derive(Debug)]
pub struct ComputeResponse {
    pub values: Vec<f64>,
}

// ─────────────────────────────────────────────
// ERROR → tonic::Status mapping
// ─────────────────────────────────────────────

#[derive(Debug, thiserror::Error)]
pub enum SignalError {
    #[error("invalid period {0}: must be >= 1")]
    InvalidPeriod(u32),
    #[error("insufficient data: need {need}, got {got}")]
    InsufficientData { need: usize, got: usize },
    #[error("unknown indicator: {0}")]
    UnknownIndicator(String),
}

impl From<SignalError> for Status {
    fn from(e: SignalError) -> Self {
        match e {
            SignalError::InvalidPeriod(_) | SignalError::UnknownIndicator(_) => {
                Status::invalid_argument(e.to_string())
            }
            SignalError::InsufficientData { .. } => {
                Status::failed_precondition(e.to_string())
            }
        }
    }
}

// ─────────────────────────────────────────────
// SERVICE IMPLEMENTATION
// ─────────────────────────────────────────────

#[derive(Debug, Default)]
pub struct SignalService;

impl SignalService {
    fn compute_inner(&self, req: &ComputeRequest) -> Result<Vec<f64>, SignalError> {
        if req.period == 0 {
            return Err(SignalError::InvalidPeriod(req.period));
        }
        let period = req.period as usize;
        if req.closes.len() < period {
            return Err(SignalError::InsufficientData {
                need: period,
                got: req.closes.len(),
            });
        }
        match req.indicator.as_str() {
            "sma" => Ok(sma(&req.closes, period)),
            "ema" => Ok(ema(&req.closes, period)),
            other => Err(SignalError::UnknownIndicator(other.to_string())),
        }
    }
}

// gRPC method (use #[tonic::async_trait] with generated trait in real code)
impl SignalService {
    #[instrument(skip(self, request), fields(asset = %request.asset, indicator = %request.indicator))]
    pub async fn compute(
        &self,
        request: ComputeRequest,
    ) -> Result<ComputeResponse, Status> {
        info!("compute request received");
        let values = self.compute_inner(&request).map_err(Status::from)?;
        Ok(ComputeResponse { values })
    }
}

// ─────────────────────────────────────────────
// SERVER SETUP — graceful shutdown + health check
// ─────────────────────────────────────────────

pub async fn run_server(addr: SocketAddr) -> anyhow::Result<()> {
    let token = CancellationToken::new();
    let token_clone = token.clone();

    // Health service (tonic-health)
    // let (health_reporter, health_service) = tonic_health::server::health_reporter();
    // health_reporter.set_serving::<SignalsServer<SignalService>>().await;

    tokio::spawn(async move {
        if let Ok(()) = signal::ctrl_c().await {
            info!("shutdown signal received");
            token_clone.cancel();
        }
    });

    info!(%addr, "gRPC server listening");

    Server::builder()
        // .add_service(health_service)
        // .add_service(SignalsServer::new(SignalService::default()))
        .serve_with_shutdown(addr, token.cancelled())
        .await?;

    info!("server shut down cleanly");
    Ok(())
}

// ─────────────────────────────────────────────
// TOWER MIDDLEWARE — auth interceptor example
// ─────────────────────────────────────────────

pub fn auth_interceptor(req: Request<()>) -> Result<Request<()>, Status> {
    let token = req
        .metadata()
        .get("authorization")
        .and_then(|v| v.to_str().ok());
    match token {
        Some(t) if t.starts_with("Bearer ") => Ok(req),
        _ => Err(Status::unauthenticated("missing or invalid Bearer token")),
    }
}

// Apply: SignalsServer::with_interceptor(SignalService::default(), auth_interceptor)

// ─────────────────────────────────────────────
// PURE COMPUTE HELPERS
// ─────────────────────────────────────────────

fn sma(values: &[f64], period: usize) -> Vec<f64> {
    let mut out = Vec::with_capacity(values.len());
    let mut sum = 0.0_f64;
    for (i, &v) in values.iter().enumerate() {
        sum += v;
        if i >= period {
            sum -= values[i - period];
        }
        out.push(sum / period.min(i + 1) as f64);
    }
    out
}

fn ema(values: &[f64], period: usize) -> Vec<f64> {
    let alpha = 2.0 / (period as f64 + 1.0);
    let mut out = Vec::with_capacity(values.len());
    out.push(values[0]);
    for &v in &values[1..] {
        let prev = *out.last().expect("non-empty");
        out.push(alpha * v + (1.0 - alpha) * prev);
    }
    out
}
