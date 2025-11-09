'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'one-time' | 'recurring';
  method: 'card' | 'bank' | 'paypal' | 'crypto';
  campaign?: string;
  receiptUrl?: string;
  taxDeductible: boolean;
}

interface DonationHistoryProps {
  donations: Donation[];
  onDownloadReceipt?: (donation: Donation) => void;
  showSummary?: boolean;
}

/**
 * Donation History Component
 *
 * Displays list of past donations with receipts
 */
export function DonationHistory({
  donations,
  onDownloadReceipt,
  showSummary = true,
}: DonationHistoryProps) {
  const totalDonated = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  const donationCount = donations.filter(d => d.status === 'completed').length;

  const statusIcons = {
    completed: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    pending: <ClockIcon className="h-5 w-5 text-yellow-500" />,
    failed: <XCircleIcon className="h-5 w-5 text-red-500" />,
    refunded: <XCircleIcon className="h-5 w-5 text-gray-500" />,
  };

  const statusColors = {
    completed: 'text-green-700 bg-green-50',
    pending: 'text-yellow-700 bg-yellow-50',
    failed: 'text-red-700 bg-red-50',
    refunded: 'text-gray-700 bg-gray-50',
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      {showSummary && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Donated</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${(totalDonated / 100).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Number of Donations</p>
                <p className="text-3xl font-bold text-gray-900">{donationCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tax Deductible</p>
                <p className="text-3xl font-bold text-green-600">
                  ${(donations
                    .filter(d => d.status === 'completed' && d.taxDeductible)
                    .reduce((sum, d) => sum + d.amount, 0) / 100
                  ).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donations List */}
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No donations yet</p>
              <Button variant="primary" className="mt-4">
                Make Your First Donation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((donation) => (
                <DonationListItem
                  key={donation.id}
                  donation={donation}
                  onDownloadReceipt={onDownloadReceipt}
                  statusIcon={statusIcons[donation.status]}
                  statusColor={statusColors[donation.status]}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Donation List Item
 */
interface DonationListItemProps {
  donation: Donation;
  onDownloadReceipt?: (donation: Donation) => void;
  statusIcon: React.ReactNode;
  statusColor: string;
}

function DonationListItem({
  donation,
  onDownloadReceipt,
  statusIcon,
  statusColor,
}: DonationListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Left: Icon and Details */}
      <div className="flex items-center gap-4 flex-1">
        {statusIcon}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-gray-900">
              ${(donation.amount / 100).toFixed(2)}
            </p>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
            </span>
            {donation.type === 'recurring' && (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                Recurring
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {new Date(donation.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            {donation.campaign && (
              <span className="text-gray-400">•</span>
            )}
            {donation.campaign && <span>{donation.campaign}</span>}
            {donation.taxDeductible && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-green-600">Tax Deductible</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      {donation.status === 'completed' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownloadReceipt?.(donation)}
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Receipt
        </Button>
      )}
    </div>
  );
}

/**
 * Sample donation data
 */
export const sampleDonations: Donation[] = [
  {
    id: '1',
    amount: 10000,
    currency: 'USD',
    date: '2024-01-15T10:30:00Z',
    status: 'completed',
    type: 'one-time',
    method: 'card',
    campaign: 'Burning Man 2024',
    taxDeductible: true,
  },
  {
    id: '2',
    amount: 2500,
    currency: 'USD',
    date: '2024-02-01T14:20:00Z',
    status: 'completed',
    type: 'recurring',
    method: 'card',
    campaign: 'Monthly Support',
    taxDeductible: true,
  },
  {
    id: '3',
    amount: 5000,
    currency: 'USD',
    date: '2024-03-10T09:15:00Z',
    status: 'completed',
    type: 'one-time',
    method: 'paypal',
    taxDeductible: true,
  },
  {
    id: '4',
    amount: 2500,
    currency: 'USD',
    date: '2024-03-01T14:20:00Z',
    status: 'completed',
    type: 'recurring',
    method: 'card',
    campaign: 'Monthly Support',
    taxDeductible: true,
  },
  {
    id: '5',
    amount: 15000,
    currency: 'USD',
    date: '2023-12-25T18:45:00Z',
    status: 'completed',
    type: 'one-time',
    method: 'card',
    campaign: 'Year-End Fundraiser',
    taxDeductible: true,
  },
];
