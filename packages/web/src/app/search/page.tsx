import { Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import SearchResults from "@/components/search/SearchResults";

export default function SearchPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <Suspense fallback={
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading search...</p>
              </div>
            </div>
          }>
            <SearchResults />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
}