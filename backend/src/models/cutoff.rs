use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, FromRow)]
pub struct Cutoff {
    pub id: i32,
    pub college_id: i32,
    pub year: i32,
    pub branch: Option<String>,
    pub category: Option<String>,
    pub cutoff_marks: Option<f64>,
    pub pdf_url: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}
