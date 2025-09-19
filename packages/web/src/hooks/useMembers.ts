import { useState, useEffect } from "react";
// import { trpc } from "@/lib/trpc";

// Types for member management
export interface Member {
  id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected" | "inactive";
  role: "member" | "admin" | "moderator" | "lead";
  profile?: {
    bio?: string;
    skills?: string[];
    interests?: string;
    yearsWithCamp?: number;
    phone?: string;
    emergencyContact?: string;
    dietary?: string;
    experience?: string;
    contribution?: string;
    appliedAt?: Date;
    socialLinks?: {
      website?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberApplication {
  name: string;
  email: string;
  phone: string;
  experience?: string;
  interests: string;
  contribution: string;
  dietary?: string;
  emergencyContact: string;
  additionalInfo?: string;
}

export interface MemberFilters {
  status?: "pending" | "approved" | "rejected" | "inactive";
  role?: "member" | "admin" | "moderator" | "lead";
  search?: string;
  limit?: number;
  offset?: number;
}

export interface MemberStats {
  totalMembers: number;
  pendingApplications: number;
  activeMembers: number;
  membersByRole: Array<{
    role: string;
    count: number;
  }>;
  recentApplications: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }>;
}

// Mock data for development
const mockMembers: Member[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    status: "pending",
    role: "member",
    profile: {
      phone: "+1-555-0123",
      experience: "first-time",
      interests: "Art and community building",
      contribution: "Photography and social media management",
      emergencyContact: "John Johnson +1-555-0124",
      appliedAt: new Date("2024-01-15"),
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    status: "approved",
    role: "member",
    profile: {
      phone: "+1-555-0125",
      experience: "4-7-years",
      interests: "Music and sound engineering",
      contribution: "Sound system setup and DJ services",
      emergencyContact: "Lisa Chen +1-555-0126",
      yearsWithCamp: 3,
      skills: ["Audio Engineering", "DJ", "Event Planning"],
    },
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    name: "Alex Rodriguez",
    email: "alex@example.com",
    status: "approved",
    role: "moderator",
    profile: {
      phone: "+1-555-0127",
      experience: "8-plus-years",
      interests: "Art installations and leadership",
      contribution: "Project management and mentoring",
      emergencyContact: "Maria Rodriguez +1-555-0128",
      yearsWithCamp: 5,
      skills: ["Project Management", "Leadership", "Art Installation"],
      bio: "Experienced burner with a passion for large-scale art projects and community building.",
    },
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2024-01-05"),
  },
];

const mockStats: MemberStats = {
  totalMembers: 45,
  pendingApplications: 8,
  activeMembers: 37,
  membersByRole: [
    { role: "member", count: 32 },
    { role: "moderator", count: 8 },
    { role: "lead", count: 4 },
    { role: "admin", count: 1 },
  ],
  recentApplications: [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "4",
      name: "David Kim",
      email: "david@example.com",
      createdAt: new Date("2024-01-14"),
    },
  ],
};

export function useMembers(filters?: MemberFilters) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // In a real app, this would use tRPC:
  // const { data, isLoading, error } = trpc.members.list.useQuery(filters || {});

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      let filteredMembers = [...mockMembers];

      if (filters?.status) {
        filteredMembers = filteredMembers.filter(m => m.status === filters.status);
      }
      if (filters?.role) {
        filteredMembers = filteredMembers.filter(m => m.role === filters.role);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMembers = filteredMembers.filter(m => 
          m.name.toLowerCase().includes(searchLower) ||
          m.email.toLowerCase().includes(searchLower)
        );
      }

      const offset = filters?.offset || 0;
      const limit = filters?.limit || 20;
      const paginatedMembers = filteredMembers.slice(offset, offset + limit);

      setMembers(paginatedMembers);
      setTotal(filteredMembers.length);
      setLoading(false);
    }, 500);
  }, [filters]);

  return {
    members,
    loading,
    error,
    total,
    hasMore: total > (filters?.offset || 0) + (filters?.limit || 20),
  };
}

export function useMemberStats() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a real app, this would use tRPC:
  // const { data, isLoading, error } = trpc.members.stats.useQuery();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 300);
  }, []);

  return { stats, loading, error };
}

export function useMemberActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitApplication = async (application: MemberApplication) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would use tRPC:
      // await trpc.members.apply.mutate(application);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: "Application submitted successfully! We'll be in touch soon.",
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit application";
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  const approveMember = async (memberId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would use tRPC:
      // await trpc.members.update.mutate({ id: memberId, status: "approved" });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve member";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const rejectMember = async (memberId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would use tRPC:
      // await trpc.members.update.mutate({ id: memberId, status: "rejected" });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject member";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateMemberProfile = async (memberId: string, profileData: Partial<Member["profile"]>) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would use tRPC:
      // await trpc.members.update.mutate({ id: memberId, profile: profileData });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (memberId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would use tRPC:
      // await trpc.members.delete.mutate({ id: memberId });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete member";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitApplication,
    approveMember,
    rejectMember,
    updateMemberProfile,
    deleteMember,
  };
}