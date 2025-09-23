'use client';

import { useState } from "react";
import { Navigation } from "../../components/navigation";
import { motion } from "framer-motion";
import { Search, Calendar, Users, FileText, Palette } from "lucide-react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");

  const searchCategories = [
    { id: "all", label: "All Content", icon: Search, count: "240+" },
    { id: "events", label: "Events", icon: Calendar, count: "12" },
    { id: "members", label: "Members", icon: Users, count: "45" },
    { id: "posts", label: "Posts", icon: FileText, count: "89" },
    { id: "art", label: "Art & Culture", icon: Palette, count: "94" }
  ];

  const popularSearches = [
    'burning man 2024',
    'persian poetry',
    'art installations',
    'cultural events',
    'tea ceremony',
    'membership application'
  ];

  const mockSearchResults = [
    {
      title: "Burning Man 2024 Camp Setup",
      type: "Event",
      excerpt: "Join us for the annual camp setup at Black Rock City. We'll be arriving early to establish our Persian oasis in the desert.",
      date: "August 2024"
    },
    {
      title: "Persian Poetry Night",
      type: "Culture",
      excerpt: "An evening of Rumi and Hafez poetry readings under the stars, accompanied by traditional Persian tea.",
      date: "Monthly"
    },
    {
      title: "HOMA Fire Sculpture",
      type: "Art",
      excerpt: "Our signature art installation representing the eternal flame of Persian culture and community.",
      date: "Ongoing Project"
    }
  ];

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
              Search Camp Alborz
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-8">
              Find events, members, content, and everything about our Persian community
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for anything..."
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
                Search Categories
              </h2>
              <p className="text-lg text-center text-neutral-600 dark:text-neutral-400 mb-8">
                Browse content by category
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {searchCategories.map((category, index) => (
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
                        <category.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                        {category.label}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {category.count} items
                      </p>
                    </div>
                  </motion.div>
                ))}
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
                  Search Results
                </h3>
                <div className="space-y-4">
                  {mockSearchResults.map((result, index) => (
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
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {popularSearches.map((term) => (
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