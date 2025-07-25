import { useState, useEffect } from "react";
import { CollegeFilters } from "@/lib/api";
import { X, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  filters: CollegeFilters;
  onFiltersChange: (filters: CollegeFilters) => void;
  districts: string[];
  categories: string[];
  collegeTypes: string[];
  isOpen: boolean;
  onClose: () => void;
  totalResults: number;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  districts,
  categories,
  collegeTypes,
  isOpen,
  onClose,
  totalResults,
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<CollegeFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof CollegeFilters, value: any) => {
    let newValue = value;

    // Handle empty strings and convert to undefined
    if (typeof value === "string" && value.trim() === "") {
      newValue = undefined;
    }

    // Handle false checkboxes
    if (typeof value === "boolean" && !value) {
      newValue = undefined;
    }

    const newFilters = { ...localFilters, [key]: newValue };

    // Remove undefined values
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key as keyof CollegeFilters] === undefined) {
        delete newFilters[key as keyof CollegeFilters];
      }
    });

    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: CollegeFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters =
    Object.keys(localFilters).length > 0 &&
    Object.values(localFilters).some((val) => val !== undefined && val !== "");

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white shadow-lg lg:shadow-none
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        transition-transform duration-300 ease-in-out lg:block
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <p className="text-xs text-gray-500">{totalResults} results</p>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-500 font-medium px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                title="Clear all filters"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className="p-4 space-y-6 overflow-y-auto"
          style={{ height: "calc(100vh - 140px)" }}
        >
          {/* District Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District{" "}
              {localFilters.district && (
                <span className="text-blue-600">✓</span>
              )}
            </label>
            <select
              value={localFilters.district || ""}
              onChange={(e) => handleFilterChange("district", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Districts ({districts.length})</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category{" "}
              {localFilters.category && (
                <span className="text-blue-600">✓</span>
              )}
            </label>
            <select
              value={localFilters.category || ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* College Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College Type{" "}
              {localFilters.college_type && (
                <span className="text-blue-600">✓</span>
              )}
            </label>
            <select
              value={localFilters.college_type || ""}
              onChange={(e) =>
                handleFilterChange("college_type", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Types ({collegeTypes.length})</option>
              {collegeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Feature Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Features
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-2 rounded border hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.autonomous || false}
                  onChange={(e) =>
                    handleFilterChange("autonomous", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 font-medium">
                    Autonomous Colleges
                  </span>
                  <p className="text-xs text-gray-500">
                    Self-governing institutions
                  </p>
                </div>
              </label>

              <label className="flex items-center p-2 rounded border hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.hostel_available || false}
                  onChange={(e) =>
                    handleFilterChange("hostel_available", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 font-medium">
                    Hostel Facilities
                  </span>
                  <p className="text-xs text-gray-500">
                    On-campus accommodation
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Active Filters:
              </h4>
              <div className="flex flex-wrap gap-2">
                {localFilters.district && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    District: {localFilters.district}
                    <button
                      onClick={() => handleFilterChange("district", "")}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {localFilters.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Category: {localFilters.category}
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className="ml-1 hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {localFilters.college_type && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    Type: {localFilters.college_type}
                    <button
                      onClick={() => handleFilterChange("college_type", "")}
                      className="ml-1 hover:text-purple-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {localFilters.autonomous && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    Autonomous
                    <button
                      onClick={() => handleFilterChange("autonomous", false)}
                      className="ml-1 hover:text-yellow-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {localFilters.hostel_available && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                    Hostel Available
                    <button
                      onClick={() =>
                        handleFilterChange("hostel_available", false)
                      }
                      className="ml-1 hover:text-indigo-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
