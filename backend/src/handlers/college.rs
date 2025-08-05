use crate::errors::ApiError;
use crate::models::{College, CollegeWithContact};
use axum::extract::{Extension, Path, Query};
use axum::response::Json;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub search: Option<String>,
    pub district: Option<String>,
    pub category: Option<String>,
    pub r#type: Option<String>,
}

#[derive(Serialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub pagination: PaginationInfo,
}

#[derive(Serialize)]
pub struct PaginationInfo {
    pub current_page: u32,
    pub per_page: u32,
    pub total: i64,
    pub total_pages: u32,
    pub has_next: bool,
    pub has_prev: bool,
}

// SIMPLE, WORKING APPROACH - No dynamic query building
pub async fn list_colleges(
    Query(params): Query<PaginationParams>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<PaginatedResponse<College>>, ApiError> {
    println!("🔍 Received params: {:?}", params);

    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(12).min(50);
    let offset = (page - 1) * limit;

    // Simple approach: Use separate queries for each filter combination
    let (colleges, total) = if params.search.is_some()
        || params.district.is_some()
        || params.category.is_some()
        || params.r#type.is_some()
    {
        // Filtered query
        let search_pattern = params.search.as_ref().map(|s| format!("%{}%", s));

        let colleges = sqlx::query_as!(
            College,
            r#"
            SELECT id, name, category, district, city, type, autonomous, minority, hostel_available, established_year
            FROM colleges
            WHERE
                ($1::text IS NULL OR name ILIKE $1 OR district ILIKE $1 OR city ILIKE $1)
                AND ($2::text IS NULL OR district = $2)
                AND ($3::text IS NULL OR category = $3)
                AND ($4::text IS NULL OR type = $4)
            ORDER BY name
            LIMIT $5 OFFSET $6
            "#,
            search_pattern,
            params.district,
            params.category,
            params.r#type,
            limit as i64,
            offset as i64
        ).fetch_all(&pool).await?;

        let total: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*)
            FROM colleges
            WHERE
                ($1::text IS NULL OR name ILIKE $1 OR district ILIKE $1 OR city ILIKE $1)
                AND ($2::text IS NULL OR district = $2)
                AND ($3::text IS NULL OR category = $3)
                AND ($4::text IS NULL OR type = $4)
            "#,
        )
        .bind(search_pattern)
        .bind(params.district)
        .bind(params.category)
        .bind(params.r#type)
        .fetch_one(&pool)
        .await?;

        (colleges, total.0)
    } else {
        // No filters - simple query
        let colleges = sqlx::query_as!(
            College,
            "SELECT id, name, category, district, city, type, autonomous, minority, hostel_available, established_year FROM colleges ORDER BY name LIMIT $1 OFFSET $2",
            limit as i64,
            offset as i64
        ).fetch_all(&pool).await?;

        let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM colleges")
            .fetch_one(&pool)
            .await?;

        (colleges, total.0)
    };

    println!("📊 Found {} colleges, total: {}", colleges.len(), total);

    let total_pages = if total == 0 {
        1
    } else {
        ((total as f64) / (limit as f64)).ceil() as u32
    };

    Ok(Json(PaginatedResponse {
        data: colleges,
        pagination: PaginationInfo {
            current_page: page,
            per_page: limit,
            total,
            total_pages,
            has_next: page < total_pages,
            has_prev: page > 1,
        },
    }))
}

// Individual college lookup - UNCHANGED
pub async fn get_college(
    Path(id): Path<i32>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<CollegeWithContact>, ApiError> {
    let college = sqlx::query_as!(
        CollegeWithContact,
        r#"
        SELECT
            c.id, c.name, c.category, c.district, c.city, c.type,
            c.autonomous, c.minority, c.hostel_available, c.established_year,
            ci.phone, ci.email, ci.website, ci.address, ci.pincode
        FROM colleges c
        LEFT JOIN contact_info ci ON ci.college_id = c.id
        WHERE c.id = $1
        "#,
        id
    )
    .fetch_optional(&pool)
    .await?;

    match college {
        Some(c) => Ok(Json(c)),
        None => Err(ApiError::NotFound(format!(
            "College not found with id: {}",
            id
        ))),
    }
}

// District filter - UNCHANGED
pub async fn list_colleges_by_district(
    Path(district): Path<String>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<College>>, ApiError> {
    let colleges = sqlx::query_as!(
        College,
        "SELECT id, name, category, district, city, type, autonomous, minority, hostel_available, established_year FROM colleges WHERE district = $1 ORDER BY name",
        district
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(colleges))
}

// Category filter - UNCHANGED
pub async fn list_colleges_by_category(
    Path(category): Path<String>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<College>>, ApiError> {
    let colleges = sqlx::query_as!(
        College,
        "SELECT id, name, category, district, city, type, autonomous, minority, hostel_available, established_year FROM colleges WHERE category = $1 ORDER BY name",
        category
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(colleges))
}
