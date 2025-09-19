"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  UserIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

// Mock data - in real app this would come from tRPC
const mockMembers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    status: "pending",
    role: "member",
    appliedAt: "2024-01-15",
    profile: {
      experience: "first-time",
      interests: "Art and community building",
      contribution: "Photography and social media management"
    }
  },
  {
    id: "2", 
    name: "Mike Chen",
    email: "mike@example.com",
    status: "approved",
    role: "member",
    appliedAt: "2024-01-10",
    profile: {
      experience: "4-7-years",
      interests: "Music and sound engineering",
      contribution: "Sound system setup and DJ services"
    }
  },
  {
    id: "3",
    name: "Alex Rodriguez", 
    email: "alex@example.com",
    status: "approved",
    role: "moderator",
    appliedAt: "2023-12-20",
    profile: {
      experience: "8-plus-years",
      interests: "Art installations and leadership",
      contribution: "Project management and mentoring"
    }
  }
];

const mockStats = {
  totalMembers: 45,
  pendingApplications: 8,
  activeMembers: 37,
  membersByRole: [
    { role: "member", count: 32 },
    { role: "moderator", count: 8 },
    { role: "lead", count: 4 },
    { role: "admin", count: 1 }
  ]
};

interface MemberManagementProps {
  tenantId: string;
}

export function MemberManagement({ tenantId }: MemberManagementProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showMemberDetails, setShowMemberDetails] = useState(false);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800", 
    rejected: "bg-red-100 text-red-800",
    inactive: "bg-gray-100 text-gray-800"
  };

  const roleColors = {
    member: "bg-blue-100 text-blue-800",
    moderator: "bg-purple-100 text-purple-800",
    lead: "bg-orange-100 text-orange-800",
    admin: "bg-red-100 text-red-800"
  };

  const filteredMembers = mockMembers.filter(member => {
    const matchesStatus = selectedStatus === "all" || member.status === selectedStatus;
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (memberId: string) => {
    console.log("Approving member:", memberId);
    // TODO: Implement approve member
  };

  const handleReject = (memberId: string) => {
    console.log("Rejecting member:", memberId);
    // TODO: Implement reject member
  };

  const handleViewDetails = (member: any) => {
    setSelectedMember(member);
    setShowMemberDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
              <UserIcon className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalMembers}</div>
            <p className="text-xs text-gray-600">All members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <ClockIcon className="h-4 w-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockStats.pendingApplications}</div>
            <p className="text-xs text-gray-600">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.activeMembers}</div>
            <p className="text-xs text-gray-600">Approved members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Roles</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {mockStats.membersByRole.map(item => (
                <div key={item.role} className="flex justify-between text-xs">
                  <span className="capitalize">{item.role}:</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Member Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export CSV
              </Button>
              <Button size="sm">
                Invite Members
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Member</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Applied</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[member.status as keyof typeof statusColors]}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[member.role as keyof typeof roleColors]}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(member.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(member)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        {member.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(member.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(member.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No members found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Details Modal */}
      {showMemberDetails && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Member Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMemberDetails(false)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                  <p className="text-gray-500">{selectedMember.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedMember.status as keyof typeof statusColors]}`}>
                      {selectedMember.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[selectedMember.role as keyof typeof roleColors]}`}>
                      {selectedMember.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Applied:</span>
                      <span className="ml-2">{new Date(selectedMember.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-2">{selectedMember.profile.experience}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Info</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2">{selectedMember.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
                <p className="text-sm text-gray-700">{selectedMember.profile.interests}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">How They Want to Contribute</h4>
                <p className="text-sm text-gray-700">{selectedMember.profile.contribution}</p>
              </div>

              {selectedMember.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(selectedMember.id)}
                    className="flex-1"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedMember.id)}
                    className="flex-1"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}