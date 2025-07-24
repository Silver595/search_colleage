CREATE TABLE colleges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Engineering, Medical, Arts, etc.
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Government, Private, Semi-Government
    autonomous BOOLEAN DEFAULT FALSE,
    minority BOOLEAN DEFAULT FALSE,
    hostel_available BOOLEAN DEFAULT FALSE,
    established_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
