"use client";

import { Suspense, useState } from "react";
import { Navigation } from "../../components/navigation";
import SearchResults from "@/components/search/SearchResults";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, Users, FileText, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-gold via-persian-purple to-midnight">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-saffron bg-clip-text text-transparent"
          >
            Search Camp Alborz
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Find events, members, content, and everything about our Persian community
          </motion.p>
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-neutral-400" />
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 text-lg rounded-2xl border-0 bg-white/95 backdrop-blur-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-midnight mb-4">Search Categories</h2>
              <p className="text-lg text-neutral-600">Browse content by category</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {searchCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      searchType === category.id 
                        ? 'border-persian-purple bg-persian-purple/5' 
                        : 'border-transparent hover:border-persian-purple/20'
                    }`}
                    onClick={() => setSearchType(category.id)}
                  >
                    <CardContent className="text-center p-6">
                      <div className="flex flex-col items-center">
                        <div className={`p-3 rounded-xl mb-3 ${
                          searchType === category.id 
                            ? 'bg-persian-purple text-white' 
                            : 'bg-persian-purple/10 text-persian-purple'
                        }`}>
                          <category.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-midnight mb-1">{category.label}</h3>
                        <p className="text-sm text-neutral-500">{category.count} items</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Search Results */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Suspense fallback={
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-persian-purple mx-auto mb-4"></div>
                  <p className="text-neutral-600">Loading search results...</p>
                </CardContent>
              </Card>
            }>
              <SearchResults />
            </Suspense>
          </motion.div>

          {/* Popular Searches */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Popular Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['burning man 2024', 'persian poetry', 'art installations', 'cultural events', 'tea ceremony', 'membership application'].map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-persian-purple/30 text-persian-purple hover:bg-persian-purple hover:text-white"
                      onClick={() => setSearchQuery(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}