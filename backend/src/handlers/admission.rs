use crate::errors::ApiError;
use crate::models::AdmissionRequirement;
use axum::{extract::Path, Extension, Json};
use sqlx::PgPool;

pub async fn get_admission_requirements(
    Path(category): Path<String>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<AdmissionRequirement>, ApiError> {
    let requirement = sqlx::query_as::<_, AdmissionRequirement>(
        "SELECT * FROM admission_requirements WHERE category = $1",
    )
    .bind(&category)
    .fetch_one(&pool)
    .await?;

    Ok(Json(requirement))
}
