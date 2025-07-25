import { College } from "@/lib/api";
import { MapPin, Calendar, Home, GraduationCap } from "lucide-react";
import Link from "next/link";

interface CollegeCardProps {
  college: College;
  viewMode?: "grid" | "list";
}

export default function CollegeCard({
  college,
  viewMode = "grid",
}: CollegeCardProps) {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left Content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <Link
                  href={`/colleges/${college.id}`}
                  className="hover:text-blue-600"
                >
                  {college.name}
                </Link>
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {college.category}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {college.type}
                </span>
                {college.autonomous && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Autonomous
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {college.city}, {college.district}
                  </span>
                </div>

                {college.established_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Est. {college.established_year}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600">{college.category}</span>
                </div>

                {college.hostel_available && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Hostel Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex-shrink-0">
              <Link
                href={`/colleges/${college.id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <Link
              href={`/colleges/${college.id}`}
              className="hover:text-blue-600"
            >
              {college.name}
            </Link>
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {college.category}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {college.type}
            </span>
            {college.autonomous && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Autonomous
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {college.city}, {college.district}
            </span>
          </div>

          {college.established_year && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Established {college.established_year}</span>
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            {college.hostel_available && (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Hostel</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600">{college.category}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href={`/colleges/${college.id}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
