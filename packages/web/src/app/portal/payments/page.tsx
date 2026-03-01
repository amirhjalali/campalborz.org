'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Loader2, AlertCircle, DollarSign, Receipt } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

interface Payment {
  id: string;
  amount: number;
  type: string;
  method: string;
  paidAt: string;
  note?: string | null;
}

interface SeasonStatus {
  id: string;
  status: string;
  payments: Payment[];
  season: {
    id: string;
    year: number;
    name: string;
    duesAmount: number;
  };
}

const typeLabels: Record<string, string> = {
  CAMP_DUES: 'Camp Dues',
  EARLY_ARRIVAL: 'Early Arrival',
  RV_FEE: 'RV Fee',
  OTHER: 'Other',
};

const methodLabels: Record<string, string> = {
  CASH: 'Cash',
  ZELLE: 'Zelle',
  VENMO: 'Venmo',
  CHECK: 'Check',
  PAYPAL: 'PayPal',
  CREDIT_CARD: 'Credit Card',
  OTHER: 'Other',
};

export default function PortalPaymentsPage() {
  const { user } = useAuth();
  const [seasonStatus, setSeasonStatus] = useState<SeasonStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/trpc/seasonMembers.getMySeasonStatus`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load payment data');
      const json = await res.json();
      setSeasonStatus(json.result?.data ?? null);
    } catch {
      setError('Unable to load payment data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  if (!user) return null;

  const payments = seasonStatus?.payments ?? [];
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const duesAmount = seasonStatus?.season?.duesAmount ?? 0;
  const remaining = Math.max(0, duesAmount - totalPaid);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-display-thin text-3xl text-ink mb-2">My Payments</h1>
        <p className="text-body-relaxed text-ink-soft">
          {seasonStatus?.season ? `Payment history for ${seasonStatus.season.name}` : 'Track your dues and payment history.'}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">{error}</p>
          <button
            onClick={loadPayments}
            className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
          <p className="text-sm text-ink-soft">Loading payment data...</p>
        </div>
      ) : !seasonStatus ? (
        <div className="luxury-card p-6">
          <div className="text-center py-8">
            <CreditCard className="h-10 w-10 text-ink-soft/30 mx-auto mb-3" />
            <p className="text-sm text-ink-soft">
              You are not enrolled in the current season. No payment data available.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Payment summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="luxury-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-ink-soft">Total Paid</p>
              </div>
              <p className="text-2xl font-semibold text-ink tabular-nums">
                {(totalPaid / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
            </div>

            <div className="luxury-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <Receipt className="h-5 w-5 text-gold" />
                <p className="text-sm font-medium text-ink-soft">Season Dues</p>
              </div>
              <p className="text-2xl font-semibold text-ink tabular-nums">
                {(duesAmount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
            </div>

            <div className="luxury-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-5 w-5 text-amber-600" />
                <p className="text-sm font-medium text-ink-soft">Remaining</p>
              </div>
              <p className={`text-2xl font-semibold tabular-nums ${remaining > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {(remaining / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
            </div>
          </div>

          {/* Payment history table */}
          <div className="luxury-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-5 w-5 text-gold" />
              <h2 className="text-display-thin text-xl text-ink">Payment History</h2>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-10 w-10 text-ink-soft/30 mx-auto mb-3" />
                <p className="text-sm text-ink-soft">No payments recorded yet for this season.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sage/10">
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
                        Type
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider hidden sm:table-cell">
                        Method
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-ink-soft uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-sage/5 hover:bg-sage/[0.03] transition-colors"
                      >
                        <td className="py-3 px-2 text-ink-soft">
                          {new Date(payment.paidAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center rounded-md bg-sage/5 px-2 py-0.5 text-xs font-medium text-sage">
                            {typeLabels[payment.type] || payment.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-ink-soft hidden sm:table-cell">
                          {methodLabels[payment.method] || payment.method}
                        </td>
                        <td className="py-3 px-2 text-right text-ink font-medium tabular-nums">
                          {(payment.amount / 100).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-sage/20">
                      <td colSpan={2} className="py-3 px-2 text-sm font-medium text-ink">
                        Total
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell" />
                      <td className="py-3 px-2 text-right text-ink font-semibold tabular-nums">
                        {(totalPaid / 100).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
