"use client";

import { useState } from "react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string | null>(null);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const { data } = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="mb-4">
        <label className="block mb-2">
          <b>Enter search query:</b>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full mt-1 p-2 border rounded"
            placeholder="Search AustLII..."
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? "Searching..." : "Search AustLII"}
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {results && <div className="mt-4 border rounded p-4">{results}</div>}
    </div>
  );
}
