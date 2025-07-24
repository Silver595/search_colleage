use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, FromRow)]
pub struct AdmissionRequirement {
    pub id: i32,
    pub category: String,
    pub documents_required: Option<Vec<String>>,
    pub eligibility_criteria: Option<String>,
    pub application_process: Option<String>,
}
