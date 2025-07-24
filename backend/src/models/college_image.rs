use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, FromRow)]
pub struct CollegeImage {
    pub id: i32,
    pub college_id: i32,
    pub image_url: String,
    pub alt_text: Option<String>,
    pub is_primary: bool,
    pub uploaded_at: Option<DateTime<Utc>>,
}
