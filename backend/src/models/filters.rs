use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct CollegeFilters {
    pub district: Option<String>,
    pub category: Option<String>,
    pub college_type: Option<String>,
    pub autonomous: Option<bool>,
    pub hostel_available: Option<bool>,
    pub search: Option<String>,
    pub page: Option<u32>,
    pub limit: Option<u32>,
}

impl Default for CollegeFilters {
    fn default() -> Self {
        Self {
            district: None,
            category: None,
            college_type: None,
            autonomous: None,
            hostel_available: None,
            search: None,
            page: Some(1),
            limit: Some(10),
        }
    }
}
