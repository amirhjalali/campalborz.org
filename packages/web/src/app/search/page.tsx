'use client';

import { useState } from "react";
import { Navigation } from "../../components/navigation";
import { motion } from "framer-motion";
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
        <main className="min-h-screen flex items-center justify-center">
          <p>Search page configuration not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-midnight-dark dark:to-midnight">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-persian-purple/10 via-transparent to-desert-gold/10" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-900 dark:text-white mb-6">
              {search.title}
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-8">
              {search.subtitle}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-neutral-400" />
              <input
                type="text"
                placeholder={search.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 text-lg rounded-2xl border border-neutral-200 bg-white dark:bg-midnight-light dark:border-neutral-700 text-neutral-800 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-persian-purple/20"
              />
            </div>
          </motion.div>
        </section>

        {/* Search Categories */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-4">
                {search.categories.title}
              </h2>
              <p className="text-lg text-center text-neutral-600 dark:text-neutral-400 mb-8">
                {search.categories.subtitle}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {search.categories.items.map((category, index) => {
                  const CategoryIcon = getIcon(category.icon);
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      onClick={() => setSearchType(category.id)}
                      className={`cursor-pointer bg-white dark:bg-midnight-light rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                        searchType === category.id
                          ? 'border-persian-purple bg-persian-purple/5'
                          : 'border-transparent hover:border-persian-purple/20'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`p-3 rounded-xl mb-3 ${
                          searchType === category.id
                            ? 'bg-persian-purple text-white'
                            : 'bg-persian-purple/10 text-persian-purple'
                        }`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                          {category.label}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {category.count} items
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Search Results */}
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">
                  {search.results.title}
                </h3>
                <div className="space-y-4">
                  {search.results.mockResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white dark:bg-midnight-light rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-semibold text-neutral-900 dark:text-white">
                          {result.title}
                        </h4>
                        <span className="px-3 py-1 bg-persian-purple/10 text-persian-purple rounded-full text-sm">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                        {result.excerpt}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500">
                        {result.date}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Popular Searches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-midnight-light rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-center text-neutral-900 dark:text-white mb-6">
                {search.popularSearches.title}
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {search.popularSearches.terms.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-6 py-2 rounded-full border-2 border-persian-purple/30 text-persian-purple hover:bg-persian-purple hover:text-white transition-all duration-300"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
