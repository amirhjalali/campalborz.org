'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

interface Season {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
}

interface AdminSeasonContextType {
  seasons: Season[];
  selectedSeasonId: string | null;
  selectedSeason: Season | null;
  setSelectedSeasonId: (id: string) => void;
  isLoading: boolean;
}

const AdminSeasonContext = createContext<AdminSeasonContextType | undefined>(undefined);

export function AdminSeasonProvider({ children }: { children: ReactNode }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSeasons = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/trpc/seasons.list`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const json = await res.json();
      const list: Season[] = json.result?.data || [];
      setSeasons(list);

      // Default to active season, or first in list
      if (!selectedSeasonId && list.length > 0) {
        const active = list.find((s) => s.isActive);
        setSelectedSeasonId(active?.id || list[0].id);
      }
    } catch {
      // API unavailable
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId) || null;

  return (
    <AdminSeasonContext.Provider
      value={{ seasons, selectedSeasonId, selectedSeason, setSelectedSeasonId, isLoading }}
    >
      {children}
    </AdminSeasonContext.Provider>
  );
}

export function useAdminSeason() {
  const context = useContext(AdminSeasonContext);
  if (context === undefined) {
    throw new Error('useAdminSeason must be used within an AdminSeasonProvider');
  }
  return context;
}
