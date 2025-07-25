import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Basic college type for listings
export interface College {
  id: number;
  name: string;
  category: string;
  district: string;
  city: string;
  type: string;
  autonomous: boolean;
  minority: boolean;
  hostel_available: boolean;
  established_year?: number;
}

// Detailed college type with contact info
export interface CollegeWithContact extends College {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  pincode?: string;
}

export interface CollegeFilters {
  district?: string;
  category?: string;
  college_type?: string;
  autonomous?: boolean;
  hostel_available?: boolean;
  search?: string;
}

export const collegesApi = {
  // Get all colleges with optional filters and pagination (returns basic College type)
  getColleges: async (
    filters: CollegeFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<College[]> => {
    const params = new URLSearchParams();

    // Append filters if they exist and are non-empty
    if (filters.district && filters.district.trim() !== "") {
      params.append("district", filters.district.trim());
    }
    if (filters.category && filters.category.trim() !== "") {
      params.append("category", filters.category.trim());
    }
    if (filters.college_type && filters.college_type.trim() !== "") {
      params.append("college_type", filters.college_type.trim());
    }
    if (filters.autonomous === true) {
      params.append("autonomous", "true");
    }
    if (filters.hostel_available === true) {
      params.append("hostel_available", "true");
    }
    if (filters.search && filters.search.trim() !== "") {
      params.append("search", filters.search.trim());
    }

    // Append pagination params
    params.append("page", String(page));
    params.append("limit", String(limit));

    const queryString = params.toString();
    const url = `/api/colleges?${queryString}`;

    const response = await apiClient.get(url);
    return response.data;
  },

  // Get single college with contact details (returns CollegeWithContact type)
  getCollege: async (id: number): Promise<CollegeWithContact> => {
    const response = await apiClient.get(`/api/colleges/${id}`);
    return response.data;
  },

  // Other functions remain the same
  getDistricts: async (): Promise<string[]> => {
    const response = await apiClient.get("/api/districts");
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get("/api/categories");
    return response.data;
  },

  getCollegeTypes: async (): Promise<string[]> => {
    const response = await apiClient.get("/api/college-types");
    return response.data;
  },
};
