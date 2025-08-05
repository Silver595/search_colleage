"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  BarChart3,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface UploadResponse {
  message: string;
  inserted: number;
  updated: number;
  errors: string[];
}

interface Stats {
  [key: string]: number;
}

export default function AdminUploadPage() {
  const [uploadMethod, setUploadMethod] = useState<"csv" | "json">("csv");
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:3001/api/admin/upload/csv",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result: UploadResponse = await response.json();
      setResult(result);
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleJsonUpload = async () => {
    if (!jsonData.trim()) {
      setError("Please enter JSON data");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const parsedData = JSON.parse(jsonData);

      const response = await fetch(
        "http://localhost:3001/api/admin/upload/json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsedData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText || response.statusText}`);
      }

      const result: UploadResponse = await response.json();
      setResult(result);
      setJsonData(""); // Clear on success
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/admin/stats");
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const downloadTemplate = () => {
    const csvTemplate = `name,category,district,city,type,autonomous,minority,hostel_available,established_year,phone,email,website,address,pincode
"Example College","Engineering","Mumbai","Mumbai","Government",true,false,true,1990,"+91-22-1234567","info@example.edu","https://example.edu","123 Main St","400001"`;

    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "colleges_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Admin Data Upload Panel
          </h1>
          <p className="text-gray-600">
            Upload college data via CSV or JSON format
          </p>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Current Database Stats</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total_colleges || 0}
                </div>
                <div className="text-sm text-gray-600">Total Colleges</div>
              </div>
              {Object.entries(stats)
                .filter(([key]) => key.startsWith("district_"))
                .slice(0, 3)
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="text-center p-4 bg-green-50 rounded-lg"
                  >
                    <div className="text-xl font-bold text-green-600">
                      {value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {key.replace("district_", "").replace("_", " ")}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Upload Methods */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Choose Upload Method</h2>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setUploadMethod("csv")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                uploadMethod === "csv"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FileText className="h-4 w-4" />
              CSV Upload
            </button>
            <button
              onClick={() => setUploadMethod("json")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                uploadMethod === "json"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Upload className="h-4 w-4" />
              JSON Upload
            </button>
          </div>

          {uploadMethod === "csv" && (
            <div>
              <div className="mb-4">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <button
                onClick={handleFileUpload}
                disabled={!file || uploading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload CSV"}
              </button>
            </div>
          )}

          {uploadMethod === "json" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON Data
                </label>
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder={`{
  "colleges": [
    {
      "name": "Example College",
      "category": "Engineering",
      "district": "Mumbai",
      "city": "Mumbai",
      "type": "Government",
      "autonomous": true,
      "minority": false,
      "hostel_available": true,
      "established_year": 1990,
      "phone": "+91-22-1234567",
      "email": "info@example.edu",
      "website": "https://example.edu",
      "address": "123 Main St",
      "pincode": "400001"
    }
  ]
}`}
                  className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
                />
              </div>

              <button
                onClick={handleJsonUpload}
                disabled={!jsonData.trim() || uploading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload JSON"}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-2 text-green-800 mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Upload Complete</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.inserted}
                </div>
                <div className="text-sm text-gray-600">Inserted</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.updated}
                </div>
                <div className="text-sm text-gray-600">Updated</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.errors.length}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Errors:</h4>
                <div className="bg-white rounded-lg p-4 max-h-32 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 mb-1">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
