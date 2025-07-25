use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use sqlx::postgres::PgPoolOptions;
use std::env;
use tower::ServiceExt;

#[tokio::test]
async fn test_health_endpoint() {
    // Setup test database connection
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await
        .expect("Failed to connect to test database");

    // Create app with test pool
    let app = create_app_with_pool(pool).await;

    // Test health endpoint
    let response = app
        .oneshot(
            Request::builder()
                .uri("/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_colleges_endpoint() {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await
        .expect("Failed to connect to test database");

    let app = create_app_with_pool(pool).await;

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/colleges")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}
