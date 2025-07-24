use crate::errors::ApiError;
use crate::models::Cutoff;
use axum::{extract::Path, Extension, Json};
use sqlx::PgPool;

pub async fn get_cutoffs_by_college(
    Path(college_id): Path<i32>,
    Extension(pool): Extension<PgPool>,
) -> Result<Json<Vec<Cutoff>>, ApiError> {
    let cutoffs = sqlx::query_as::<_, Cutoff>(
        "SELECT * FROM cutoffs WHERE college_id = $1 ORDER BY year DESC",
    )
    .bind(college_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(cutoffs))
}
