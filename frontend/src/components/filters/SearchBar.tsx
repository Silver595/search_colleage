import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search colleges by name, location, or category...",
  initialValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search
          className={`h-5 w-5 transition-colors ${
            isFocused ? "text-blue-500" : "text-gray-400"
          }`}
        />
      </div>

      <input
        type="text"
        className={`block w-full pl-10 pr-10 py-3 border rounded-lg leading-5 bg-white placeholder-gray-500 transition-all duration-200 ${
          isFocused
            ? "border-blue-500 ring-2 ring-blue-200 outline-none"
            : "border-gray-300 hover:border-gray-400"
        }`}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {query && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {query && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 px-3">
          Searching for "{query}"...
        </div>
      )}
    </div>
  );
}
