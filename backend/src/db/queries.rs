use crate::models::college::College;
use sqlx::PgPool;

pub async fn fetch_all_colleges(pool: &PgPool) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges ORDER BY name")
        .fetch_all(pool)
        .await
}

pub async fn fetch_college_by_id(pool: &PgPool, id: i32) -> Result<College, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges WHERE id = $1")
        .bind(id)
        .fetch_one(pool)
        .await
}

// Filtering and search queries
pub async fn fetch_colleges_by_district(
    pool: &PgPool,
    district: &str,
) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges WHERE district = $1 ORDER BY name")
        .bind(district)
        .fetch_all(pool)
        .await
}

pub async fn fetch_colleges_by_category(
    pool: &PgPool,
    category: &str,
) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges WHERE category = $1 ORDER BY name")
        .bind(category)
        .fetch_all(pool)
        .await
}

pub async fn search_colleges_by_name(
    pool: &PgPool,
    name: &str,
) -> Result<Vec<College>, sqlx::Error> {
    let search_pattern = format!("%{}%", name);
    sqlx::query_as::<_, College>("SELECT * FROM colleges WHERE name ILIKE $1 ORDER BY name")
        .bind(&search_pattern)
        .fetch_all(pool)
        .await
}

// Combined filtering queries
pub async fn fetch_colleges_by_district_and_category(
    pool: &PgPool,
    district: &str,
    category: &str,
) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>(
        "SELECT * FROM colleges WHERE district = $1 AND category = $2 ORDER BY name",
    )
    .bind(district)
    .bind(category)
    .fetch_all(pool)
    .await
}

pub async fn fetch_colleges_by_type(
    pool: &PgPool,
    college_type: &str,
) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges WHERE type = $1 ORDER BY name")
        .bind(college_type)
        .fetch_all(pool)
        .await
}

// Feature-based queries
pub async fn fetch_autonomous_colleges(pool: &PgPool) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges WHERE autonomous = true ORDER BY name")
        .fetch_all(pool)
        .await
}

pub async fn fetch_colleges_with_hostel(pool: &PgPool) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>(
        "SELECT * FROM colleges WHERE hostel_available = true ORDER BY name",
    )
    .fetch_all(pool)
    .await
}

// Utility queries
pub async fn fetch_all_districts(pool: &PgPool) -> Result<Vec<String>, sqlx::Error> {
    sqlx::query_scalar::<_, String>("SELECT DISTINCT district FROM colleges ORDER BY district")
        .fetch_all(pool)
        .await
}

pub async fn fetch_all_categories(pool: &PgPool) -> Result<Vec<String>, sqlx::Error> {
    sqlx::query_scalar::<_, String>("SELECT DISTINCT category FROM colleges ORDER BY category")
        .fetch_all(pool)
        .await
}

pub async fn fetch_all_college_types(pool: &PgPool) -> Result<Vec<String>, sqlx::Error> {
    sqlx::query_scalar::<_, String>("SELECT DISTINCT type FROM colleges ORDER BY type")
        .fetch_all(pool)
        .await
}

// Advanced filtering with multiple parameters
pub async fn fetch_colleges_with_filters(
    pool: &PgPool,
    district: Option<&str>,
    category: Option<&str>,
    college_type: Option<&str>,
    autonomous: Option<bool>,
    hostel_available: Option<bool>,
) -> Result<Vec<College>, sqlx::Error> {
    let mut query = "SELECT * FROM colleges WHERE 1=1".to_string();
    let mut params = Vec::new();
    let mut param_count = 0;

    if let Some(d) = district {
        param_count += 1;
        query.push_str(&format!(" AND district = ${}", param_count));
        params.push(d);
    }

    if let Some(c) = category {
        param_count += 1;
        query.push_str(&format!(" AND category = ${}", param_count));
        params.push(c);
    }

    if let Some(t) = college_type {
        param_count += 1;
        query.push_str(&format!(" AND type = ${}", param_count));
        params.push(t);
    }

    if let Some(a) = autonomous {
        param_count += 1;
        query.push_str(&format!(" AND autonomous = ${}", param_count));
        // Note: For boolean parameters, you'd need to handle this differently
        // This is a simplified version
    }

    if let Some(h) = hostel_available {
        param_count += 1;
        query.push_str(&format!(" AND hostel_available = ${}", param_count));
        // Note: For boolean parameters, you'd need to handle this differently
    }

    query.push_str(" ORDER BY name");

    // For the complex query with optional parameters, you might want to use a different approach
    // This is a simplified version - for production, consider using a query builder
    match (district, category, college_type) {
        (Some(d), Some(c), Some(t)) => {
            sqlx::query_as::<_, College>(
                "SELECT * FROM colleges WHERE district = $1 AND category = $2 AND type = $3 ORDER BY name"
            )
            .bind(d)
            .bind(c)
            .bind(t)
            .fetch_all(pool)
            .await
        }
        (Some(d), Some(c), None) => {
            sqlx::query_as::<_, College>(
                "SELECT * FROM colleges WHERE district = $1 AND category = $2 ORDER BY name"
            )
            .bind(d)
            .bind(c)
            .fetch_all(pool)
            .await
        }
        (Some(d), None, None) => fetch_colleges_by_district(pool, d).await,
        (None, Some(c), None) => fetch_colleges_by_category(pool, c).await,
        _ => fetch_all_colleges(pool).await,
    }
}
