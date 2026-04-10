"use client";

import { useState, useEffect } from "react";
import { Heart, ExternalLink, Shield, Award } from "lucide-react";

interface DonationFormProps {
  campaigns?: string[];
  tenantId?: string;
  initialAmount?: number | null;
  prefillKey?: number;
  givebutterCampaignId?: string;
  onSuccess?: (donationId: string) => void;
}

const suggestedAmounts = [25, 75, 150, 300, 500];

/**
 * DonationForm
 *
 * Camp Alborz processes donations through Givebutter (the registered 501(c)(3)
 * payment processor). This component lets a donor pick an amount and campaign,
 * then redirects to the Givebutter campaign page where the actual secure
 * checkout (card, bank, Apple/Google Pay) is handled.
 *
 * This component is intentionally NOT wired to any internal payment API
 * because Camp Alborz does not run its own Stripe account — all tax-deductible
 * receipts are issued by Givebutter.
 */
export function DonationForm({
  campaigns = [],
  initialAmount = null,
  prefillKey = 0,
  givebutterCampaignId = "Alborz2025Fundraiser",
}: DonationFormProps) {
  const [amount, setAmount] = useState<number | null>(initialAmount);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefillKey > 0) {
      setAmount(initialAmount);
      setCustomAmount("");
      setError(null);
    }
  }, [prefillKey, initialAmount]);

  const handleAmountSelection = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount("");
    setError(null);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(Math.round(numValue * 100));
      setError(null);
    } else {
      setAmount(null);
    }
  };

  const buildGivebutterUrl = () => {
    const base = `https://givebutter.com/${givebutterCampaignId}`;
    const params = new URLSearchParams();
    if (amount && amount >= 100) {
      // Givebutter accepts amounts in whole dollars via query param
      params.set("amount", String(Math.round(amount / 100)));
    }
    if (selectedCampaign) {
      params.set("designation", selectedCampaign);
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const handleContinue = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!amount || amount < 100) {
      e.preventDefault();
      setError("Please select or enter a donation amount of at least $1");
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <Heart className="h-5 w-5 text-gold mr-2" aria-hidden="true" />
        <h3 className="text-display-thin text-xl">Make a Donation</h3>
      </div>

      <p className="text-sm text-ink-soft mb-6">
        Camp Alborz donations are processed securely by{" "}
        <strong>Givebutter</strong>, our 501(c)(3) payment partner. Choose an
        amount below and you will be taken to Givebutter to complete your
        tax-deductible gift.
      </p>

      <div className="space-y-6">
        <fieldset>
          <legend className="form-label">Select Amount</legend>
          <div
            className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4"
            role="radiogroup"
            aria-label="Suggested donation amounts"
          >
            {suggestedAmounts.map((suggestedAmount) => (
              <button
                type="button"
                key={suggestedAmount}
                onClick={() => handleAmountSelection(suggestedAmount * 100)}
                role="radio"
                aria-checked={amount === suggestedAmount * 100}
                className={`p-3 border rounded-xl text-center transition-all ${
                  amount === suggestedAmount * 100
                    ? "border-gold bg-gold/5 text-ink font-semibold ring-1 ring-gold"
                    : "border-tan-400 hover:border-tan-600"
                }`}
              >
                ${suggestedAmount}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-ink-soft" aria-hidden="true">
                $
              </span>
            </div>
            <label htmlFor="custom-amount" className="sr-only">
              Custom donation amount in dollars
            </label>
            <input
              type="number"
              id="custom-amount"
              placeholder="Enter custom amount"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="form-input pl-7"
              min="1"
            />
          </div>
        </fieldset>

        {campaigns.length > 0 && (
          <div>
            <label htmlFor="donation-campaign" className="form-label">
              Designate to Campaign (Optional)
            </label>
            <select
              id="donation-campaign"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="form-input"
            >
              <option value="">General Fund</option>
              {campaigns.map((campaign) => (
                <option key={campaign} value={campaign}>
                  {campaign}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div
            className="bg-tan-50 border border-tan-400 text-ink px-4 py-3 rounded-xl text-sm"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <a
          href={buildGivebutterUrl()}
          target="_blank"
          rel="noreferrer"
          onClick={handleContinue}
          aria-disabled={!amount}
          className={`cta-primary cta-shimmer w-full justify-center text-sm ${
            !amount ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span>
            {amount
              ? `Donate $${(amount / 100).toFixed(2)} via Givebutter`
              : "Continue to Givebutter"}
          </span>
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ink-soft/70">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" aria-hidden="true" />
            <span>501(c)(3) tax-deductible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
