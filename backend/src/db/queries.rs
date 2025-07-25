use crate::models::college::{College, CollegeWithContact};
use sqlx::PgPool;

// Fetch a single college with joined contact info by ID
pub async fn fetch_college_with_contact_by_id(
    pool: &PgPool,
    id: i32,
) -> Result<CollegeWithContact, sqlx::Error> {
    sqlx::query_as::<_, CollegeWithContact>(
        r#"
        SELECT
            c.id, c.name, c.category, c.district, c.city, c.type,
            c.autonomous, c.minority, c.hostel_available, c.established_year,
            ci.phone, ci.email, ci.website, ci.address, ci.pincode
        FROM colleges c
        LEFT JOIN contact_info ci ON c.id = ci.college_id
        WHERE c.id = $1
        "#,
    )
    .bind(id)
    .fetch_one(pool)
    .await
}

// Fetch all colleges ordered by name
pub async fn fetch_all_colleges(pool: &PgPool) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges ORDER BY name")
        .fetch_all(pool)
        .await
}

// Fetch college by id without contact info (optional/legacy use)
pub async fn fetch_college_by_id(pool: &PgPool, id: i32) -> Result<College, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges WHERE id = $1")
        .bind(id)
        .fetch_one(pool)
        .await
}

// Fetch colleges filtered by district
pub async fn fetch_colleges_by_district(
    pool: &PgPool,
    district: &str,
) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges WHERE district = $1 ORDER BY name")
        .bind(district)
        .fetch_all(pool)
        .await
}

// Fetch colleges filtered by category
pub async fn fetch_colleges_by_category(
    pool: &PgPool,
    category: &str,
) -> Result<Vec<College>, sqlx::Error> {
    sqlx::query_as::<_, College>("SELECT * FROM colleges WHERE category = $1 ORDER BY name")
        .bind(category)
        .fetch_all(pool)
        .await
}

// Search colleges by name (case-insensitive, partial match)
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

// Fetch colleges with dynamic filters using QueryBuilder
pub async fn fetch_colleges_with_filters(
    pool: &PgPool,
    district: Option<&str>,
    category: Option<&str>,
    college_type: Option<&str>,
    autonomous: Option<bool>,
    hostel_available: Option<bool>,
) -> Result<Vec<College>, sqlx::Error> {
    use sqlx::QueryBuilder;

    let mut query_builder = QueryBuilder::new("SELECT * FROM colleges WHERE 1=1");

    if let Some(d) = district {
        if !d.trim().is_empty() {
            query_builder.push(" AND district = ");
            query_builder.push_bind(d);
        }
    }

    if let Some(c) = category {
        if !c.trim().is_empty() {
            query_builder.push(" AND category = ");
            query_builder.push_bind(c);
        }
    }

    if let Some(t) = college_type {
        if !t.trim().is_empty() {
            query_builder.push(" AND type = ");
            query_builder.push_bind(t);
        }
    }

    if autonomous == Some(true) {
        query_builder.push(" AND autonomous = ");
        query_builder.push_bind(true);
    }

    if hostel_available == Some(true) {
        query_builder.push(" AND hostel_available = ");
        query_builder.push_bind(true);
    }

    query_builder.push(" ORDER BY name");

    let query = query_builder.build_query_as::<College>();
    query.fetch_all(pool).await
}

// Fetch distinct districts for filter dropdowns
pub async fn fetch_all_districts(pool: &PgPool) -> Result<Vec<String>, sqlx::Error> {
    sqlx::query_scalar::<_, String>("SELECT DISTINCT district FROM colleges ORDER BY district")
        .fetch_all(pool)
        .await
}

// Fetch distinct categories for filter dropdowns
pub async fn fetch_all_categories(pool: &PgPool) -> Result<Vec<String>, sqlx::Error> {
    sqlx::query_scalar::<_, String>("SELECT DISTINCT category FROM colleges ORDER BY category")
        .fetch_all(pool)
        .await
}

// Fetch distinct college types for filter dropdowns
pub async fn fetch_all_college_types(pool: &PgPool) -> Result<Vec<String>, sqlx::Error> {
    sqlx::query_scalar::<_, String>("SELECT DISTINCT type FROM colleges ORDER BY type")
        .fetch_all(pool)
        .await
}
