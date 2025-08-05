"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Building,
  Users,
  Home,
  Star,
  ExternalLink,
  Share2,
} from "lucide-react";

interface CollegeDetail {
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
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  pincode?: string;
}

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        console.log("Fetching college with ID:", params.id);
        const response = await fetch(
          `http://localhost:3001/api/colleges/${params.id}`,
        );

        if (!response.ok) {
          throw new Error(`College not found (${response.status})`);
        }

        const data = await response.json();
        console.log("College data received:", data);
        setCollege(data);
      } catch (err) {
        console.error("Error fetching college:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch college",
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCollege();
    }
  }, [params.id]);

  const handleShare = async () => {
    if (navigator.share && college) {
      try {
        await navigator.share({
          title: college.name,
          text: `Check out ${college.name} - ${college.category} college in ${college.city}, ${college.district}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">😞</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            College Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            {error || "The requested college could not be found."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const calculateAge = (establishedYear: number) => {
    return new Date().getFullYear() - establishedYear;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Colleges
          </button>

          <div className="relative">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            {showShareTooltip && (
              <div className="absolute top-12 right-0 bg-gray-900 text-white text-sm px-3 py-1 rounded">
                Link copied!
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{college.name}</h1>
                <p className="text-blue-100 text-lg mb-4">
                  {college.city}, {college.district}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-500 bg-opacity-50 rounded-full text-sm">
                    {college.category}
                  </span>
                  <span className="px-3 py-1 bg-blue-500 bg-opacity-50 rounded-full text-sm">
                    {college.type}
                  </span>
                </div>
              </div>
              {college.established_year && (
                <div className="mt-4 md:mt-0 text-center">
                  <div className="text-3xl font-bold">
                    {calculateAge(college.established_year)}
                  </div>
                  <div className="text-blue-100 text-sm">
                    Years of Excellence
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Basic Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Building className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="font-semibold text-gray-900">Category</span>
                </div>
                <p className="text-gray-900 text-lg">{college.category}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Users className="h-6 w-6 text-green-600 mr-3" />
                  <span className="font-semibold text-gray-900">Type</span>
                </div>
                <p className="text-gray-900 text-lg">{college.type}</p>
              </div>

              {college.established_year && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <Calendar className="h-6 w-6 text-purple-600 mr-3" />
                    <span className="font-semibold text-gray-900">
                      Established
                    </span>
                  </div>
                  <p className="text-gray-900 text-lg">
                    {college.established_year}
                  </p>
                </div>
              )}
            </div>

            {/* Features Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Features & Facilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-lg border-2 ${
                    college.autonomous === true
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Autonomous Status</span>
                    {college.autonomous === true ? (
                      <span className="text-blue-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 ${
                    college.hostel_available === true
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Hostel Facility</span>
                    {college.hostel_available === true ? (
                      <span className="text-green-600 font-semibold">
                        Available
                      </span>
                    ) : (
                      <span className="text-gray-500">Not Available</span>
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 ${
                    college.minority === true
                      ? "border-purple-200 bg-purple-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Minority Institution</span>
                    {college.minority === true ? (
                      <span className="text-purple-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Contact Information
              </h2>

              {college.phone ||
              college.email ||
              college.website ||
              college.address ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {college.phone && (
                    <div className="flex items-start p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Phone className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Phone Number
                        </p>
                        <a
                          href={`tel:${college.phone}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          {college.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {college.email && (
                    <div className="flex items-start p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Mail className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Email Address
                        </p>
                        <a
                          href={`mailto:${college.email}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          {college.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {college.website && (
                    <div className="flex items-start p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Globe className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Official Website
                        </p>
                        <a
                          href={
                            college.website.startsWith("http")
                              ? college.website
                              : `https://${college.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          Visit Website
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}

                  {college.address && (
                    <div className="flex items-start p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors lg:col-span-2">
                      <MapPin className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Campus Address
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {college.address}
                          {college.pincode && ` - ${college.pincode}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 italic">
                    No contact information available
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                {college.website && (
                  <a
                    href={
                      college.website.startsWith("http")
                        ? college.website
                        : `https://${college.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
                {college.email && (
                  <a
                    href={`mailto:${college.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Send Email
                  </a>
                )}
                {college.phone && (
                  <a
                    href={`tel:${college.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </a>
                )}
                <button
                  onClick={() =>
                    router.push(
                      `/?district=${encodeURIComponent(college.district)}`,
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  More in {college.district}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
