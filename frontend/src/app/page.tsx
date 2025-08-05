"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import Pagination from "@/components/Pagination";
import Link from "next/link";

interface College {
  id: number;
  name: string;
  category: string;
  district: string;
  city: string;
  type: string;
  autonomous: boolean | null;
  minority: boolean | null;
  hostel_available: boolean | null;
  established_year?: number;
}

interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface ApiResponse {
  data: College[];
  pagination: PaginationInfo;
}

export default function HomePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchColleges = async (page: number = 1) => {
    setLoading(true);
    try {
      // Simple parameter building - back to what was working
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      // Only add parameters if they have values
      if (searchTerm && searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }
      if (selectedDistrict) {
        params.append("district", selectedDistrict);
      }
      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      const response = await fetch(
        `http://localhost:3001/api/colleges?${params}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      setColleges(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [districtsRes, categoriesRes] = await Promise.all([
        fetch("http://localhost:3001/api/districts"),
        fetch("http://localhost:3001/api/categories"),
      ]);

      if (districtsRes.ok) {
        const districtsData = await districtsRes.json();
        setDistricts(Array.isArray(districtsData) ? districtsData : []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (error) {
      console.error("Failed to fetch filters:", error);
    }
  };

  useEffect(() => {
    fetchColleges(currentPage);
  }, [currentPage, searchTerm, selectedDistrict, selectedCategory]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDistrict("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎓 Maharashtra Colleges Directory
          </h1>

          {/* Search and Filters - Simple Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <form onSubmit={handleSearch} className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search colleges, districts, or cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedDistrict || selectedCategory) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-gray-600">
                {pagination && `Showing ${pagination.total} results`}
                {searchTerm && ` for "${searchTerm}"`}
                {selectedDistrict && ` in ${selectedDistrict}`}
                {selectedCategory && ` for ${selectedCategory}`}
              </p>
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* College Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {colleges.map((college) => (
                <Link href={`/college/${college.id}`} key={college.id}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {college.name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Category:</span>{" "}
                        {college.category}
                      </p>
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {college.city}, {college.district}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {college.type}
                      </p>
                      {college.established_year && (
                        <p>
                          <span className="font-medium">Established:</span>{" "}
                          {college.established_year}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {college.autonomous === true && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Autonomous
                        </span>
                      )}
                      {college.hostel_available === true && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Hostel
                        </span>
                      )}
                      {college.minority === true && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          Minority
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {colleges.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No colleges found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                hasNext={pagination.has_next}
                hasPrev={pagination.has_prev}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
