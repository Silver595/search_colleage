use crate::db::queries;
use crate::errors::ApiError;
use axum::{Extension, Json};
use sqlx::PgPool;

pub async fn list_districts(
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<String>>, ApiError> {
    let districts = queries::fetch_all_districts(&pool).await?;
    Ok(Json(districts))
}

pub async fn list_categories(
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<String>>, ApiError> {
    let categories = queries::fetch_all_categories(&pool).await?;
    Ok(Json(categories))
}

pub async fn list_college_types(
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<String>>, ApiError> {
    let types = queries::fetch_all_college_types(&pool).await?;
    Ok(Json(types))
}
