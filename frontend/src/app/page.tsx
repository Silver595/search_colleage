"use client";

import { useState, useEffect, useCallback } from "react";
import { collegesApi, College, CollegeFilters } from "@/lib/api";
import CollegeCard from "@/components/college/CollegeCard";
import SearchBar from "@/components/filters/SearchBar";
import FilterSidebar from "@/components/filters/FilterSidebar";
import {
  Filter,
  Menu,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CollegeFilters>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalColleges, setTotalColleges] = useState(0);

  // Filter options
  const [districts, setDistricts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [collegeTypes, setCollegeTypes] = useState<string[]>([]);

  // Load initial data only once
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [districtsData, categoriesData, typesData] = await Promise.all([
          collegesApi.getDistricts(),
          collegesApi.getCategories(),
          collegesApi.getCollegeTypes(),
        ]);

        setDistricts(districtsData);
        setCategories(categoriesData);
        setCollegeTypes(typesData);
      } catch (err) {
        setError("Failed to load initial data");
        console.error("Error loading initial data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load colleges with pagination and filters
  useEffect(() => {
    const loadColleges = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "Loading colleges with filters:",
          filters,
          "page:",
          page,
          "limit:",
          limit,
        );
        const collegeData = await collegesApi.getColleges(filters, page, limit);

        setColleges(collegeData);
        // Note: You'll need to modify your backend to return total count
        // For now, we'll estimate based on returned data
        if (collegeData.length < limit) {
          setTotalColleges((page - 1) * limit + collegeData.length);
        } else {
          // If we got a full page, there might be more
          setTotalColleges(page * limit + 1);
        }
      } catch (err) {
        setError("Failed to load colleges");
        console.error("Error loading colleges:", err);
      } finally {
        setLoading(false);
      }
    };

    loadColleges();
  }, [filters, page, limit]);

  const handleSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    setFilters((prev) => ({
      ...prev,
      search: trimmedQuery || undefined,
    }));
    setPage(1); // Reset to first page when searching
  }, []);

  const handleFiltersChange = useCallback((newFilters: CollegeFilters) => {
    console.log("Filters changed to:", newFilters);
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const clearAllFilters = useCallback(() => {
    console.log("Clearing all filters");
    setFilters({});
    setPage(1); // Reset to first page
    setSidebarOpen(false);
  }, []);

  // Calculate pagination info
  const totalPages = Math.ceil(totalColleges / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Maharashtra Colleges
            </h1>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              districts={districts}
              categories={categories}
              collegeTypes={collegeTypes}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              totalResults={totalColleges}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                onSearch={handleSearch}
                initialValue={filters.search || ""}
              />
            </div>

            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Loading..."
                    : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, totalColleges)} of ${totalColleges} colleges`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Page {page} of {totalPages}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1); // Reset to first page
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {Object.keys(filters).length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    Clear all filters
                  </button>
                )}

                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* College Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : colleges.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {colleges.map((college) => (
                    <CollegeCard key={college.id} college={college} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center space-x-2 my-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!hasPrevPage || loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      hasPrevPage && !loading
                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {/* Show first page */}
                    {page > 3 && (
                      <>
                        <button
                          onClick={() => setPage(1)}
                          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          1
                        </button>
                        {page > 4 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                      </>
                    )}

                    {/* Show pages around current page */}
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const pageNum = Math.max(1, page - 2) + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-md ${
                            pageNum === page
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Show last page */}
                    {page < totalPages - 2 && (
                      <>
                        {page < totalPages - 3 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setPage(totalPages)}
                          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNextPage || loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      hasNextPage && !loading
                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  No colleges found matching your criteria
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Show All Colleges
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
