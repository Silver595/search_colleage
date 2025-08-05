use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct College {
    pub id: i32,
    pub name: String,
    pub category: String,
    pub district: String,
    pub city: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub autonomous: Option<bool>, // Changed from bool to Option<bool>
    pub minority: Option<bool>,   // Changed from bool to Option<bool>
    pub hostel_available: Option<bool>, // Changed from bool to Option<bool>
    pub established_year: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct CollegeWithContact {
    pub id: i32,
    pub name: String,
    pub category: String,
    pub district: String,
    pub city: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub autonomous: Option<bool>, // Changed from bool to Option<bool>
    pub minority: Option<bool>,   // Changed from bool to Option<bool>
    pub hostel_available: Option<bool>, // Changed from bool to Option<bool>
    pub established_year: Option<i32>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub address: Option<String>,
    pub pincode: Option<String>,
}
