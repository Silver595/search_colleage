use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, FromRow)]
pub struct College {
    pub id: i32,
    pub name: String,
    pub category: String,
    pub district: String,
    pub city: String,
    pub r#type: String,
    pub autonomous: bool,
    pub minority: bool,
    pub hostel_available: bool,
    pub established_year: Option<i32>,
}
