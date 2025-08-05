use crate::errors::ApiError;
use axum::{
    extract::{Extension, Multipart},
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
    let mut updated = 0;
    let mut errors = Vec::new();

    for (index, college) in data.colleges.into_iter().enumerate() {
        match insert_or_update_college(&pool, college).await {
            Ok(was_update) => {
                if was_update {
                    updated += 1;
                } else {
                    inserted += 1;
                }
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
        updated,
        errors,
    }))
}

// CSV Upload Handler
pub async fn upload_colleges_csv(
    mut multipart: Multipart,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<UploadResponse>, ApiError> {
    let mut inserted = 0;
    let mut updated = 0;
    let mut errors = Vec::new();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| ApiError::BadRequest(format!("Invalid file upload: {}", e)))?
    {
        if field.name() == Some("file") {
            let data = field
                .bytes()
                .await
                .map_err(|e| ApiError::BadRequest(format!("Failed to read file: {}", e)))?;

            let content = String::from_utf8(data.to_vec())
                .map_err(|e| ApiError::BadRequest(format!("Invalid UTF-8 content: {}", e)))?;

            let mut reader = csv::Reader::from_reader(content.as_bytes());

            for (line_num, result) in reader.deserialize().enumerate() {
                match result {
                    Ok(record) => {
                        let college: CollegeImport = record;
                        match insert_or_update_college(&pool, college).await {
                            Ok(was_update) => {
                                if was_update {
                                    updated += 1;
                                } else {
                                    inserted += 1;
                                }
                            }
                            Err(e) => {
                                errors.push(format!("Line {}: {}", line_num + 2, e));
                            }
                        }
                    }
                    Err(e) => {
                        errors.push(format!("Line {}: CSV parsing error: {}", line_num + 2, e));
                    }
                }
            }
        }
    }

    Ok(Json(UploadResponse {
        message: "CSV upload completed".to_string(),
        inserted,
        updated,
        errors,
    }))
}

// Database Insert/Update Function
async fn insert_or_update_college(
    pool: &PgPool,
    college: CollegeImport,
) -> Result<bool, sqlx::Error> {
    // Insert or update college
    let college_result = sqlx::query!(
        r#"
        INSERT INTO colleges (name, category, district, city, type, autonomous, minority, hostel_available, established_year)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (name, district, city)
        DO UPDATE SET
            category = EXCLUDED.category,
            type = EXCLUDED.type,
            autonomous = EXCLUDED.autonomous,
            minority = EXCLUDED.minority,
            hostel_available = EXCLUDED.hostel_available,
            established_year = EXCLUDED.established_year,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id, (xmax = 0) AS was_insert
        "#,
        college.name,
        college.category,
        college.district,
        college.city,
        college.r#type,
        college.autonomous.unwrap_or(false),
        college.minority.unwrap_or(false),
        college.hostel_available.unwrap_or(false),
        college.established_year
    )
    .fetch_one(pool)
    .await?;

    let college_id = college_result.id;
    let was_insert = college_result.was_insert.unwrap_or(true);

    // Insert/update contact info if provided
    if college.phone.is_some()
        || college.email.is_some()
        || college.website.is_some()
        || college.address.is_some()
        || college.pincode.is_some()
    {
        sqlx::query!(
            r#"
            INSERT INTO contact_info (college_id, phone, email, website, address, pincode)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (college_id)
            DO UPDATE SET
                phone = COALESCE(EXCLUDED.phone, contact_info.phone),
                email = COALESCE(EXCLUDED.email, contact_info.email),
                website = COALESCE(EXCLUDED.website, contact_info.website),
                address = COALESCE(EXCLUDED.address, contact_info.address),
                pincode = COALESCE(EXCLUDED.pincode, contact_info.pincode)
            "#,
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

    Ok(!was_insert) // Return true if it was an update
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

    // By district
    let by_district: Vec<(String, i64)> = sqlx::query_as(
        "SELECT district, COUNT(*) FROM colleges GROUP BY district ORDER BY COUNT(*) DESC LIMIT 10",
    )
    .fetch_all(&pool)
    .await?;

    for (district, count) in by_district {
        stats.insert(
            format!("district_{}", district.replace(" ", "_").replace("-", "_")),
            count,
        );
    }

    // By category
    let by_category: Vec<(String, i64)> = sqlx::query_as(
        "SELECT category, COUNT(*) FROM colleges GROUP BY category ORDER BY COUNT(*) DESC",
    )
    .fetch_all(&pool)
    .await?;

    for (category, count) in by_category {
        stats.insert(format!("category_{}", category.replace(" ", "_")), count);
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
