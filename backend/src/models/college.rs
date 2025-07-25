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

#[derive(Serialize, Deserialize, FromRow)]
pub struct CollegeWithContact {
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
    // Contact info fields
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub address: Option<String>,
    pub pincode: Option<String>,
}
