use crate::db::queries;
use crate::errors::ApiError;
use crate::models::college::CollegeWithContact;
use crate::models::{College, CollegeFilters};
use axum::{
    extract::{Path, Query},
    Extension, Json,
};
use sqlx::PgPool;

pub async fn list_colleges(
    Query(filters): Query<CollegeFilters>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<College>>, ApiError> {
    let colleges = if let Some(search) = &filters.search {
        queries::search_colleges_by_name(&pool, search).await?
    } else if filters.district.is_some()
        || filters.category.is_some()
        || filters.college_type.is_some()
        || filters.autonomous.is_some()
        || filters.hostel_available.is_some()
    {
        queries::fetch_colleges_with_filters(
            &pool,
            filters.district.as_deref(),
            filters.category.as_deref(),
            filters.college_type.as_deref(),
            filters.autonomous,
            filters.hostel_available,
        )
        .await?
    } else {
        queries::fetch_all_colleges(&pool).await?
    };

    Ok(Json(colleges))
}

/// Get detailed college info with contact details by college ID.
pub async fn get_college(
    Path(id): Path<i32>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<CollegeWithContact>, ApiError> {
    let college = queries::fetch_college_with_contact_by_id(&pool, id).await?;
    Ok(Json(college))
}

/// List colleges filtered by district.
pub async fn list_colleges_by_district(
    Path(district): Path<String>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<College>>, ApiError> {
    let colleges = queries::fetch_colleges_by_district(&pool, &district).await?;
    Ok(Json(colleges))
}

/// List colleges filtered by category.
pub async fn list_colleges_by_category(
    Path(category): Path<String>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<College>>, ApiError> {
    let colleges = queries::fetch_colleges_by_category(&pool, &category).await?;
    Ok(Json(colleges))
}
