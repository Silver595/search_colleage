pub mod admission_requirement;
pub mod college;
pub mod college_image;
pub mod contact_info;
pub mod cutoff;
pub mod filters;

pub use admission_requirement::AdmissionRequirement;
pub use college::{College, CollegeWithContact}; // Add CollegeWithContact
pub use cutoff::Cutoff;
pub use filters::CollegeFilters;
