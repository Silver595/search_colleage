-- Colleges main table


-- Contact information
CREATE TABLE contact_info (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    website VARCHAR(255),
    pincode VARCHAR(10)
);

-- Cutoff data
CREATE TABLE cutoffs (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    branch VARCHAR(100),
    category VARCHAR(20), -- Open, OBC, SC, ST, etc.
    cutoff_marks DECIMAL(5,2),
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admission requirements
CREATE TABLE admission_requirements (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    documents_required TEXT[],
    eligibility_criteria TEXT,
    application_process TEXT
);

-- College images
CREATE TABLE college_images (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_colleges_district ON colleges(district);
CREATE INDEX idx_colleges_category ON colleges(category);
CREATE INDEX idx_colleges_type ON colleges(type);
CREATE INDEX idx_cutoffs_college_year ON cutoffs(college_id, year);
