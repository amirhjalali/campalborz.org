'use client';

import { useState } from "react";
import { Navigation } from "../../components/navigation";
import { Search as SearchIcon } from "lucide-react";
import { useContentConfig } from "../../hooks/useConfig";
import { getIcon } from "../../lib/icons";

export default function SearchPage() {
  const { search } = useContentConfig();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");

  if (!search) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center bg-cream">
          <p className="text-ink-soft">Search page configuration not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-cream">
        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="section-contained text-center">
            <h1 className="text-display-thin text-4xl md:text-5xl mb-4">
              {search.title}
            </h1>
            <p className="text-body-relaxed text-lg text-ink-soft max-w-3xl mx-auto mb-10">
              {search.subtitle}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <SearchIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink-soft/50 z-10" />
              <input
                type="text"
                placeholder={search.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-4 text-lg rounded-2xl border border-tan/40 bg-white text-ink placeholder-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/50 transition-colors"
                aria-label="Search Camp Alborz"
              />
            </div>
          </div>
        </section>

        {/* Search Categories */}
        <section className="section-base section-contained">
          <div className="text-center mb-10">
            <h2 className="text-display-thin text-2xl md:text-3xl mb-3">
              {search.categories.title}
            </h2>
            <p className="text-body-relaxed text-base text-ink-soft">
              {search.categories.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {search.categories.items.map((category) => {
              const CategoryIcon = getIcon(category.icon);
              const isActive = searchType === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSearchType(category.id)}
                  className={`luxury-card text-center cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-gold border-gold/50"
                      : "hover:border-gold/30"
                  }`}
                  aria-pressed={isActive}
                >
                  <div className={`inline-flex p-3 rounded-xl mb-3 transition-colors ${
                    isActive
                      ? "bg-gold text-white"
                      : "bg-gold/10 text-gold"
                  }`}>
                    <CategoryIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-display-thin text-sm mb-1">
                    {category.label}
                  </h3>
                  <p className="text-xs text-ink-soft">
                    {category.count} items
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Search Results */}
        {searchQuery && (
          <section className="section-base section-contained">
            <h3 className="text-display-thin text-2xl mb-6">
              {search.results.title}
            </h3>
            <div className="space-y-4">
              {search.results.mockResults.map((result, index) => (
                <div
                  key={index}
                  className="luxury-card hover:border-gold/30 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-display-thin text-lg">
                      {result.title}
                    </h4>
                    <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs uppercase tracking-wider">
                      {result.type}
                    </span>
                  </div>
                  <p className="text-body-relaxed text-sm text-ink-soft mb-2">
                    {result.excerpt}
                  </p>
                  <p className="text-xs text-ink-soft/70">
                    {result.date}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State when search query but no results */}
        {searchQuery && search.results.mockResults.length === 0 && (
          <section className="section-base section-contained">
            <div className="frame-panel text-center py-12">
              <SearchIcon className="h-12 w-12 text-ink-soft/30 mx-auto mb-4" />
              <h3 className="text-display-thin text-xl mb-2">No Results Found</h3>
              <p className="text-body-relaxed text-ink-soft">
                Try adjusting your search terms or browse our categories above.
              </p>
            </div>
          </section>
        )}

        {/* Popular Searches */}
        <section className="section-alt">
          <div className="section-contained">
            <div className="frame-panel text-center">
              <h3 className="text-display-thin text-2xl mb-6">
                {search.popularSearches.title}
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {search.popularSearches.terms.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-5 py-2 rounded-full border border-gold/30 text-ink hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 text-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
