"use client";

import { useState } from "react";
import { toast } from 'sonner';
import { Heart, DollarSign, CheckCircle, Info, CreditCard, Lock } from "lucide-react";

interface DonationFormProps {
  campaigns?: string[];
  tenantId?: string;
  onSuccess?: (donationId: string) => void;
}

const suggestedAmounts = [25, 75, 150, 300, 500];

export function DonationForm({ campaigns = [], tenantId, onSuccess }: DonationFormProps) {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState<"ONE_TIME" | "RECURRING">("ONE_TIME");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"amount" | "details" | "payment" | "success">("amount");

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

  const handleNextStep = async () => {
    if (step === "amount") {
      if (!amount || amount < 100) {
        setError("Please select or enter a valid donation amount");
        return;
      }
      setStep("details");
    } else if (step === "details") {
      if (!isAnonymous) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!donorEmail || !emailRegex.test(donorEmail)) {
          setError("Please enter a valid email address to receive your receipt");
          return;
        }
      }
      setError(null);
      setStep("payment");
    }
  };

  const handleDemoPayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep("success");
    toast.success('Thank you for your donation!', {
      description: 'You will receive a receipt via email shortly.',
      duration: 5000,
    });
    if (onSuccess) {
      onSuccess("donation-" + Date.now());
    }
  };

  if (step === "success") {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-display-thin text-2xl mb-2">Thank You!</h2>
        <p className="text-body-relaxed text-ink-soft mb-6">
          Your donation of ${(amount! / 100).toFixed(2)} has been processed successfully.
        </p>
        <p className="text-sm text-ink-soft/70 mb-8">
          You will receive a tax receipt via email shortly.
        </p>
        <button
          onClick={() => {
            setStep("amount");
            setAmount(null);
            setCustomAmount("");
            setDonorName("");
            setDonorEmail("");
            setMessage("");
          }}
          className="cta-secondary text-sm"
        >
          Make Another Donation
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <Heart className="h-5 w-5 text-gold mr-2" />
        <h3 className="text-display-thin text-xl">Make a Donation</h3>
      </div>
      <div className="flex space-x-2 mb-6">
        {["amount", "details", "payment"].map((s, index) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              step === s
                ? "bg-gold"
                : index < ["amount", "details", "payment"].indexOf(step)
                ? "bg-gold/30"
                : "bg-tan-300"
            }`}
          />
        ))}
      </div>

      {step === "amount" && (
        <div className="space-y-6">
          <div>
            <label className="form-label">Donation Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDonationType("ONE_TIME")}
                className={`p-3 border rounded-xl text-center transition-all ${
                  donationType === "ONE_TIME"
                    ? "border-gold bg-gold/5 text-ink ring-1 ring-gold"
                    : "border-tan-400 hover:border-tan-600"
                }`}
              >
                <div className="font-medium text-sm">One-Time</div>
                <div className="text-xs text-ink-soft/70">Single donation</div>
              </button>
              <button
                onClick={() => setDonationType("RECURRING")}
                className={`p-3 border rounded-xl text-center transition-all ${
                  donationType === "RECURRING"
                    ? "border-gold bg-gold/5 text-ink ring-1 ring-gold"
                    : "border-tan-400 hover:border-tan-600"
                }`}
              >
                <div className="font-medium text-sm">Monthly</div>
                <div className="text-xs text-ink-soft/70">Recurring support</div>
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Select Amount</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
              {suggestedAmounts.map((suggestedAmount) => (
                <button
                  key={suggestedAmount}
                  onClick={() => handleAmountSelection(suggestedAmount * 100)}
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

            <div className="relative input-glow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-ink-soft">$</span>
              </div>
              <input
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="form-input pl-7"
              />
            </div>
          </div>

          {campaigns.length > 0 && (
            <div>
              <label className="form-label">Designate to Campaign (Optional)</label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="form-input"
              >
                <option value="">General Fund</option>
                {campaigns.map((campaign) => (
                  <option key={campaign} value={campaign}>{campaign}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleNextStep}
            disabled={!amount}
            className="cta-primary cta-shimmer w-full justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Details
          </button>
        </div>
      )}

      {step === "details" && (
        <div className="space-y-6">
          <div className="bg-tan-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-ink-soft text-sm">Amount:</span>
              <span className="font-semibold text-lg font-display">
                ${(amount! / 100).toFixed(2)}
                {donationType === "RECURRING" && "/month"}
              </span>
            </div>
            {selectedCampaign && (
              <div className="flex justify-between items-center">
                <span className="text-ink-soft text-sm">Campaign:</span>
                <span className="font-medium text-sm">{selectedCampaign}</span>
              </div>
            )}
          </div>

          {!isAnonymous && (
            <div className="space-y-4">
              <div>
                <label htmlFor="donorName" className="form-label">Your Name</label>
                <div className="input-glow">
                  <input
                    type="text"
                    id="donorName"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className="form-input"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="donorEmail" className="form-label">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="input-glow">
                  <input
                    type="email"
                    id="donorEmail"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="form-input"
                  />
                </div>
                <p className="text-xs text-ink-soft/60 mt-1">
                  We&apos;ll send your donation receipt to this email
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="form-label">Add a Message (Optional)</label>
            <div className="input-glow">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share why you're supporting our cause..."
                rows={3}
                className="form-input resize-none"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-tan-400 text-gold focus:ring-gold"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-ink-soft">
              Make this donation anonymous
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-900 font-medium">Tax Deductible</p>
                <p className="text-sm text-blue-700 mt-1">
                  Your donation is tax-deductible. You&apos;ll receive a receipt via email.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep("amount")} className="cta-secondary flex-1 justify-center text-sm">
              Back
            </button>
            <button onClick={handleNextStep} className="cta-primary cta-shimmer flex-1 justify-center text-sm">
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="space-y-6">
          <div className="bg-tan-50 rounded-xl p-4">
            <h4 className="font-medium text-ink mb-3 text-sm">Donation Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Amount:</span>
                <span className="font-medium">
                  ${(amount! / 100).toFixed(2)}
                  {donationType === "RECURRING" && "/month"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Type:</span>
                <span className="font-medium">
                  {donationType === "ONE_TIME" ? "One-Time" : "Monthly Recurring"}
                </span>
              </div>
            </div>
          </div>

          <div className="luxury-card text-center py-8">
            <CreditCard className="h-10 w-10 text-gold mx-auto mb-3" />
            <p className="text-body-relaxed text-sm text-ink-soft mb-4">
              Payment processing will be available soon. Click below to simulate a donation.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-ink-soft/60 mb-4">
              <Lock className="h-3 w-3" />
              <span>Secure &amp; encrypted</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep("details")} className="cta-secondary flex-1 justify-center text-sm">
              Back
            </button>
            <button
              onClick={handleDemoPayment}
              disabled={isProcessing}
              className="cta-primary cta-shimmer flex-1 justify-center text-sm disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : `Donate $${(amount! / 100).toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
