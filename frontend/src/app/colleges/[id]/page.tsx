"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { collegesApi, CollegeWithContact } from "@/lib/api";
import {
  MapPin,
  Calendar,
  Home,
  GraduationCap,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building,
  Users,
  MapIcon,
} from "lucide-react";
import Link from "next/link";

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [college, setCollege] = useState<CollegeWithContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCollege = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);
        const collegeData = await collegesApi.getCollege(Number(params.id));
        setCollege(collegeData);
      } catch (err) {
        setError("Failed to load college details");
        console.error("Error loading college:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCollege();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "College not found"}
          </h2>
          <p className="text-gray-600 mb-6">
            The college you're looking for might have been moved or doesn't
            exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Colleges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">
              College Details
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* College Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {college.name}
                </h1>

                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    {college.category}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Building className="h-4 w-4 mr-1" />
                    {college.type}
                  </span>
                  {college.autonomous && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Autonomous
                    </span>
                  )}
                  {college.minority && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <Users className="h-4 w-4 mr-1" />
                      Minority Institution
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <span className="text-lg">
                      {college.address
                        ? college.address
                        : `${college.city}, ${college.district}, Maharashtra`}
                      {college.pincode && ` - ${college.pincode}`}
                    </span>
                  </div>

                  {college.established_year && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 flex-shrink-0" />
                      <span>Established in {college.established_year}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 flex-shrink-0" />
                    <span>
                      Hostel Facilities:{" "}
                      {college.hostel_available ? (
                        <span className="text-green-600 font-medium">
                          Available
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Not Available
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>

                  {college.phone ? (
                    <a
                      href={`tel:${college.phone}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Call: {college.phone}
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                    >
                      <Phone className="h-4 w-4" />
                      Phone Not Available
                    </button>
                  )}

                  {college.website ? (
                    <a
                      href={
                        college.website.startsWith("http")
                          ? college.website
                          : `https://${college.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-400 rounded-md cursor-not-allowed"
                    >
                      <Globe className="h-4 w-4" />
                      Website Not Available
                    </button>
                  )}

                  {college.email ? (
                    <a
                      href={`mailto:${college.email}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Send Email
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-400 rounded-md cursor-not-allowed"
                    >
                      <Mail className="h-4 w-4" />
                      Email Not Available
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About the College
              </h2>
              <div className="prose text-gray-600">
                <p>
                  {college.name} is a {college.type.toLowerCase()}{" "}
                  {college.category.toLowerCase()} institution located in{" "}
                  {college.city}, {college.district}.
                  {college.established_year &&
                    ` Established in ${college.established_year}, `}
                  {college.autonomous && "As an autonomous institution, "}
                  the college offers quality education and has been serving
                  students in Maharashtra.
                </p>

                {college.hostel_available && (
                  <p className="mt-4">
                    The college provides hostel facilities for students, making
                    it convenient for outstation students to pursue their
                    education.
                  </p>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Features & Facilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {college.autonomous ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={
                      college.autonomous ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    Autonomous Status
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {college.hostel_available ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={
                      college.hostel_available
                        ? "text-gray-900"
                        : "text-gray-500"
                    }
                  >
                    Hostel Facilities
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {college.minority ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={
                      college.minority ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    Minority Institution
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-900">
                    {college.category} Programs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* College Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                College Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Category
                  </label>
                  <p className="mt-1 text-gray-900">{college.category}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Type
                  </label>
                  <p className="mt-1 text-gray-900">{college.type}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Location
                  </label>
                  <p className="mt-1 text-gray-900">
                    {college.city}, {college.district}
                  </p>
                  {college.pincode && (
                    <p className="text-sm text-gray-600">
                      PIN: {college.pincode}
                    </p>
                  )}
                </div>

                {college.established_year && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Established
                    </label>
                    <p className="mt-1 text-gray-900">
                      {college.established_year}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                {college.phone ? (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <a
                        href={`tel:${college.phone}`}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        {college.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Phone not available</span>
                  </div>
                )}

                {college.email ? (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <a
                        href={`mailto:${college.email}`}
                        className="text-sm text-blue-600 hover:text-blue-500 break-all"
                      >
                        {college.email}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email not available</span>
                  </div>
                )}

                {college.website ? (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Website
                      </p>
                      <a
                        href={
                          college.website.startsWith("http")
                            ? college.website
                            : `https://${college.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-500 break-all"
                      >
                        {college.website}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Website not available</span>
                  </div>
                )}

                {college.address && (
                  <div className="flex items-start gap-3">
                    <MapIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Full Address
                      </p>
                      <p className="text-sm text-gray-600">{college.address}</p>
                      {college.pincode && (
                        <p className="text-sm text-gray-600">
                          PIN: {college.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admission Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Admission Information
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Admission process varies by category and program.</p>
                <p>Contact the college directly for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Application procedures</li>
                  <li>Eligibility criteria</li>
                  <li>Cut-off marks</li>
                  <li>Document requirements</li>
                </ul>

                {(college.phone || college.email) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-blue-800 font-medium">Get in Touch:</p>
                    {college.phone && (
                      <p className="text-blue-700 text-sm">
                        📞 {college.phone}
                      </p>
                    )}
                    {college.email && (
                      <p className="text-blue-700 text-sm">
                        ✉️ {college.email}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back to List */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Colleges
          </Link>
        </div>
      </div>
    </div>
  );
}
