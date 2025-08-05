use axum::{routing::get, Extension, Router};
use dotenv::dotenv;
use handlers::admin;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tracing_subscriber;
// use Jrs::admin;

mod db;
mod errors;
mod handlers;
mod models;

use handlers::admission::get_admission_requirements;
use handlers::college::{
    get_college, list_colleges, list_colleges_by_category, list_colleges_by_district,
};
use handlers::cutoff::get_cutoffs_by_college;
use handlers::district::{list_categories, list_college_types, list_districts};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let database_url = std::env::var("DATABASE_URL")?;
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    let app = Router::new()
        // Health check routes
        .route(
            "/",
            get(|| async { "Maharashtra Colleges API is running!" }),
        )
        .route("/health", get(|| async { "OK" }))
        // College routes with filtering
        .route("/api/colleges", get(list_colleges))
        .route("/api/colleges/:id", get(get_college))
        .route(
            "/api/colleges/district/:district",
            get(list_colleges_by_district),
        )
        .route(
            "/api/colleges/category/:category",
            get(list_colleges_by_category),
        )
        // Utility routes
        .route("/api/districts", get(list_districts))
        .route("/api/categories", get(list_categories))
        .route("/api/college-types", get(list_college_types))
        // Cutoff routes
        .route("/api/cutoffs/:college_id", get(get_cutoffs_by_college))
        // Admission requirements routes
        .route(
            "/api/admission-requirements/:category",
            get(get_admission_requirements),
        )
        // Merge admin routes - THIS IS THE KEY ADDITION
        .merge(admin::admin_routes())
        .layer(CorsLayer::permissive())
        .layer(Extension(pool));

    let port: u16 = std::env::var("SERVER_PORT")
        .unwrap_or_else(|_| "3001".to_string())
        .parse()?;

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("🚀 Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
