use crate::errors::ApiError;
use axum::{
    extract::Extension, // Remove Multipart import
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::collections::HashMap;

#[derive(Serialize)]
pub struct UploadResponse {
    message: String,
    inserted: usize,
    updated: usize,
    errors: Vec<String>,
}

#[derive(Deserialize)]
pub struct BulkCollegeData {
    colleges: Vec<CollegeImport>,
}

#[derive(Deserialize)]
pub struct CollegeImport {
    name: String,
    category: String,
    district: String,
    city: String,
    r#type: String,
    autonomous: Option<bool>,
    minority: Option<bool>,
    hostel_available: Option<bool>,
    established_year: Option<i32>,
    phone: Option<String>,
    email: Option<String>,
    website: Option<String>,
    address: Option<String>,
    pincode: Option<String>,
}

// JSON Upload Handler
pub async fn upload_colleges_json(
    Extension(pool): Extension<PgPool>,
    Json(data): Json<BulkCollegeData>,
) -> Result<Json<UploadResponse>, ApiError> {
    println!("📊 Processing {} colleges", data.colleges.len());

    let mut inserted = 0;
    let mut errors = Vec::new();

    for (index, college) in data.colleges.into_iter().enumerate() {
        match insert_college(&pool, college).await {
            Ok(_) => {
                inserted += 1;
                println!("✅ Processed college #{}", index + 1);
            }
            Err(e) => {
                let error_msg = format!("College #{}: {}", index + 1, e);
                errors.push(error_msg);
                println!("❌ Error processing college #{}: {}", index + 1, e);
            }
        }
    }

    Ok(Json(UploadResponse {
        message: "Upload completed".to_string(),
        inserted,
        updated: 0,
        errors,
    }))
}

// Simplified CSV Upload Handler
pub async fn upload_colleges_csv(
    Extension(_pool): Extension<PgPool>,
) -> Result<Json<UploadResponse>, ApiError> {
    Ok(Json(UploadResponse {
        message: "CSV upload not implemented yet".to_string(),
        inserted: 0,
        updated: 0,
        errors: vec!["CSV upload feature coming soon".to_string()],
    }))
}

// Database Insert Function
async fn insert_college(pool: &PgPool, college: CollegeImport) -> Result<i32, sqlx::Error> {
    let result = sqlx::query!(
        "INSERT INTO colleges (name, category, district, city, type, autonomous, minority, hostel_available, established_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
        college.name,
        college.category,
        college.district,
        college.city,
        college.r#type,
        college.autonomous,
        college.minority,
        college.hostel_available,
        college.established_year
    )
    .fetch_one(pool)
    .await?;

    let college_id = result.id;

    // Insert contact info if provided
    if college.phone.is_some()
        || college.email.is_some()
        || college.website.is_some()
        || college.address.is_some()
        || college.pincode.is_some()
    {
        sqlx::query!(
            "INSERT INTO contact_info (college_id, phone, email, website, address, pincode) VALUES ($1, $2, $3, $4, $5, $6)",
            college_id,
            college.phone,
            college.email,
            college.website,
            college.address,
            college.pincode
        )
        .execute(pool)
        .await?;
    }

    Ok(college_id)
}

// Stats Handler
pub async fn get_stats(
    Extension(pool): Extension<PgPool>,
) -> Result<Json<HashMap<String, i64>>, ApiError> {
    let mut stats = HashMap::new();

    // Total colleges
    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM colleges")
        .fetch_one(&pool)
        .await?;
    stats.insert("total_colleges".to_string(), total.0);

    // By district (top 5)
    let by_district: Vec<(String, i64)> = sqlx::query_as(
        "SELECT district, COUNT(*) FROM colleges GROUP BY district ORDER BY COUNT(*) DESC LIMIT 5",
    )
    .fetch_all(&pool)
    .await?;

    for (district, count) in by_district {
        stats.insert(
            format!("district_{}", district.replace(" ", "_").replace("-", "_")),
            count,
        );
    }

    Ok(Json(stats))
}

// Test endpoint
pub async fn test_admin() -> Json<UploadResponse> {
    Json(UploadResponse {
        message: "Admin routes working!".to_string(),
        inserted: 0,
        updated: 0,
        errors: vec![],
    })
}

// Router
pub fn admin_routes() -> Router {
    Router::new()
        .route("/api/admin/test", get(test_admin))
        .route("/api/admin/upload/csv", post(upload_colleges_csv))
        .route("/api/admin/upload/json", post(upload_colleges_json))
        .route("/api/admin/stats", get(get_stats))
}
