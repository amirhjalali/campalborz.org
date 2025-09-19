"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  CurrencyDollarIcon,
  HeartIcon,
  TrendingUpIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// Mock data - in real app this would come from tRPC
const mockDonations = [
  {
    id: "1",
    amount: 15000, // $150
    currency: "USD",
    type: "ONE_TIME",
    status: "COMPLETED",
    campaign: "Art Installation Fund",
    donor: { name: "Sarah Johnson", email: "sarah@example.com" },
    isAnonymous: false,
    message: "Happy to support the amazing art projects!",
    createdAt: new Date("2024-01-15T10:30:00"),
    taxReceiptSent: true
  },
  {
    id: "2",
    amount: 7500, // $75
    currency: "USD",
    type: "RECURRING",
    status: "COMPLETED",
    campaign: null,
    donor: { name: "Anonymous", email: null },
    isAnonymous: true,
    message: null,
    createdAt: new Date("2024-01-14T15:45:00"),
    taxReceiptSent: false
  },
  {
    id: "3",
    amount: 30000, // $300
    currency: "USD",
    type: "ONE_TIME",
    status: "COMPLETED",
    campaign: "Burning Man 2024",
    donor: { name: "Mike Chen", email: "mike@example.com" },
    isAnonymous: false,
    message: "Looking forward to another amazing year!",
    createdAt: new Date("2024-01-13T09:15:00"),
    taxReceiptSent: true
  },
  {
    id: "4",
    amount: 5000, // $50
    currency: "USD",
    type: "ONE_TIME",
    status: "FAILED",
    campaign: null,
    donor: { name: "Alex Rodriguez", email: "alex@example.com" },
    isAnonymous: false,
    message: null,
    createdAt: new Date("2024-01-12T14:20:00"),
    taxReceiptSent: false
  }
];

const mockStats = {
  totalRaised: 4500000, // $45,000
  totalDonations: 125,
  averageDonation: 36000, // $360
  monthlyRecurring: 180000, // $1,800/month
  topCampaigns: [
    { name: "Burning Man 2024", total: 1500000, count: 35 },
    { name: "Art Installation Fund", total: 850000, count: 28 },
    { name: "Community Events", total: 650000, count: 22 },
    { name: "General Fund", total: 1500000, count: 40 }
  ],
  monthlyTrend: [
    { month: "Oct", amount: 350000 },
    { month: "Nov", amount: 420000 },
    { month: "Dec", amount: 580000 },
    { month: "Jan", amount: 450000 }
  ]
};

interface DonationManagementProps {
  tenantId: string;
}

export function DonationManagement({ tenantId }: DonationManagementProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [showDonationDetails, setShowDonationDetails] = useState(false);

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800"
  };

  const typeColors = {
    ONE_TIME: "bg-blue-100 text-blue-800",
    RECURRING: "bg-purple-100 text-purple-800",
    CAMPAIGN: "bg-orange-100 text-orange-800"
  };

  const filteredDonations = mockDonations.filter(donation => {
    const matchesType = selectedType === "all" || donation.type === selectedType;
    const matchesStatus = selectedStatus === "all" || donation.status === selectedStatus;
    const matchesCampaign = selectedCampaign === "all" || 
                           (selectedCampaign === "none" && !donation.campaign) ||
                           donation.campaign === selectedCampaign;
    const matchesSearch = donation.donor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.campaign?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesCampaign && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const handleViewDetails = (donation: any) => {
    setSelectedDonation(donation);
    setShowDonationDetails(true);
  };

  const handleSendReceipt = (donationId: string) => {
    console.log("Sending tax receipt for donation:", donationId);
    // TODO: Implement send receipt
  };

  const handleRefund = (donationId: string) => {
    console.log("Processing refund for donation:", donationId);
    // TODO: Implement refund
  };

  const handleExport = () => {
    console.log("Exporting donation data");
    // TODO: Implement export functionality
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Raised</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(mockStats.totalRaised)}</div>
            <p className="text-xs text-gray-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Donations</CardTitle>
              <HeartIcon className="h-4 w-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalDonations}</div>
            <p className="text-xs text-gray-600">125 donors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Average Donation</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.averageDonation)}</div>
            <p className="text-xs text-green-600">+15% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Recurring</CardTitle>
              <ArrowPathIcon className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(mockStats.monthlyRecurring)}</div>
            <p className="text-xs text-gray-600">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStats.topCampaigns.map((campaign) => (
              <div key={campaign.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">{campaign.count} donations</span>
                    <span className="font-semibold">{formatCurrency(campaign.total)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${(campaign.total / mockStats.totalRaised) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Donation Management</CardTitle>
            <Button onClick={handleExport}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search donations..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="ONE_TIME">One-Time</option>
              <option value="RECURRING">Recurring</option>
              <option value="CAMPAIGN">Campaign</option>
            </select>

            {/* Status Filter */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Campaign Filter */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
            >
              <option value="all">All Campaigns</option>
              <option value="none">General Fund</option>
              {mockStats.topCampaigns.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Donations Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Donor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {donation.isAnonymous ? "Anonymous" : donation.donor.name}
                        </div>
                        {!donation.isAnonymous && donation.donor.email && (
                          <div className="text-sm text-gray-500">{donation.donor.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{formatCurrency(donation.amount)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeColors[donation.type as keyof typeof typeColors]}`}>
                        {donation.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {donation.campaign || "General Fund"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[donation.status as keyof typeof statusColors]}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {donation.createdAt.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(donation)}
                        >
                          View
                        </Button>
                        {donation.status === "COMPLETED" && !donation.taxReceiptSent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendReceipt(donation.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Send Receipt
                          </Button>
                        )}
                        {donation.status === "COMPLETED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefund(donation.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDonations.length === 0 && (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No donations found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donation Details Modal */}
      {showDonationDetails && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Donation Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDonationDetails(false)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Donor Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 font-medium">
                        {selectedDonation.isAnonymous ? "Anonymous" : selectedDonation.donor.name}
                      </span>
                    </div>
                    {!selectedDonation.isAnonymous && selectedDonation.donor.email && (
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2">{selectedDonation.donor.email}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Privacy:</span>
                      <span className="ml-2">
                        {selectedDonation.isAnonymous ? "Anonymous" : "Public"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Donation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <span className="ml-2 font-semibold text-lg">
                        {formatCurrency(selectedDonation.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeColors[selectedDonation.type as keyof typeof typeColors]}`}>
                        {selectedDonation.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedDonation.status as keyof typeof statusColors]}`}>
                        {selectedDonation.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Campaign:</span>
                      <span className="ml-2">{selectedDonation.campaign || "General Fund"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDonation.message && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Donor Message</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {selectedDonation.message}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Transaction Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2">{selectedDonation.createdAt.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="ml-2 font-mono">{selectedDonation.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tax Receipt:</span>
                    <span className="ml-2">
                      {selectedDonation.taxReceiptSent ? (
                        <span className="text-green-600">Sent</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {selectedDonation.status === "COMPLETED" && (
                <div className="flex gap-3 pt-4 border-t">
                  {!selectedDonation.taxReceiptSent && (
                    <Button onClick={() => handleSendReceipt(selectedDonation.id)} className="flex-1">
                      Send Tax Receipt
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleRefund(selectedDonation.id)}
                    className="flex-1"
                  >
                    Process Refund
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