"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  HeartIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CreditCardIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline";

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
      setAmount(Math.round(numValue * 100)); // Convert to cents
      setError(null);
    } else {
      setAmount(null);
    }
  };

  const handleNextStep = () => {
    if (step === "amount") {
      if (!amount || amount < 100) { // Minimum $1
        setError("Please select or enter a valid donation amount");
        return;
      }
      setStep("details");
    } else if (step === "details") {
      setStep("payment");
    }
  };

  const handleSubmit = async () => {
    if (!amount) return;

    setIsProcessing(true);
    setError(null);

    try {
      // In a real app, this would call the payment API
      // const result = await trpc.payments.createDonation.mutate({
      //   amount,
      //   type: donationType,
      //   campaign: selectedCampaign || undefined,
      //   message: message || undefined,
      //   isAnonymous,
      // });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      setStep("success");
      if (onSuccess) {
        onSuccess("mock-donation-id");
      }
    } catch (err) {
      setError("Failed to process donation. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === "success") {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your donation of ${(amount! / 100).toFixed(2)} has been processed successfully.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            You will receive a tax receipt via email shortly.
          </p>
          <Button onClick={() => {
            setStep("amount");
            setAmount(null);
            setCustomAmount("");
            setMessage("");
          }}>
            Make Another Donation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center">
            <HeartIcon className="h-6 w-6 text-primary-600 mr-2" />
            Make a Donation
          </div>
        </CardTitle>
        <div className="flex space-x-2 mt-2">
          {["amount", "details", "payment"].map((s, index) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                step === s 
                  ? "bg-primary-600" 
                  : index < ["amount", "details", "payment"].indexOf(step)
                  ? "bg-primary-200"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {step === "amount" && (
          <div className="space-y-6">
            {/* Donation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDonationType("ONE_TIME")}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    donationType === "ONE_TIME"
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">One-Time</div>
                  <div className="text-sm text-gray-500">Single donation</div>
                </button>
                <button
                  onClick={() => setDonationType("RECURRING")}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    donationType === "RECURRING"
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">Monthly</div>
                  <div className="text-sm text-gray-500">Recurring support</div>
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Amount
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                {suggestedAmounts.map((suggestedAmount) => (
                  <button
                    key={suggestedAmount}
                    onClick={() => handleAmountSelection(suggestedAmount * 100)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      amount === suggestedAmount * 100
                        ? "border-primary-600 bg-primary-50 text-primary-700 font-semibold"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    ${suggestedAmount}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="pl-7 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Campaign Selection */}
            {campaigns.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designate to Campaign (Optional)
                </label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleNextStep}
              disabled={!amount}
              className="w-full"
              size="lg"
            >
              Continue to Details
            </Button>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-6">
            {/* Donation Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-lg">
                  ${(amount! / 100).toFixed(2)}
                  {donationType === "RECURRING" && "/month"}
                </span>
              </div>
              {selectedCampaign && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Campaign:</span>
                  <span className="font-medium">{selectedCampaign}</span>
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share why you're supporting our cause..."
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                Make this donation anonymous
              </label>
            </div>

            {/* Tax Deduction Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-900 font-medium">Tax Deductible</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your donation is tax-deductible. You'll receive a receipt via email.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("amount")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleNextStep}
                className="flex-1"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-6">
            {/* Donation Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Donation Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    ${(amount! / 100).toFixed(2)}
                    {donationType === "RECURRING" && "/month"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {donationType === "ONE_TIME" ? "One-Time" : "Monthly Recurring"}
                  </span>
                </div>
                {selectedCampaign && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Campaign:</span>
                    <span className="font-medium">{selectedCampaign}</span>
                  </div>
                )}
                {isAnonymous && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Privacy:</span>
                    <span className="font-medium">Anonymous</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Form Placeholder */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="text-center">
                <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Secure Payment Processing
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  In production, this would integrate with Stripe for secure payment processing.
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <LockClosedIcon className="h-4 w-4 mr-1" />
                  SSL Encrypted & PCI Compliant
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("details")}
                disabled={isProcessing}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Donate $${(amount! / 100).toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}