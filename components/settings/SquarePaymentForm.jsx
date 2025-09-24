
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { getSquareConfig } from "@/api/functions";

export default function SquarePaymentForm({ onTokenize, onCancel, cardholderName, isDarkMode, isSubmitting, submissionError }) {
  const [card, setCard] = useState(null);
  const [payments, setPayments] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadSquare = async () => {
      try {
        const { data: config } = await getSquareConfig();
        if (!config || !config.applicationId || !config.locationId) {
          setErrorMessage("Could not load payment configuration from server.");
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://web.squarecdn.com/v1/square.js';
        script.onload = () => initializeCard(config.applicationId, config.locationId);
        script.onerror = () => setErrorMessage('Failed to load Square payment system');
        document.head.appendChild(script);
        
      } catch (error) {
        console.error("Failed to load Square configuration:", error);
        setErrorMessage("Failed to initialize payment gateway.");
      }
    };

    const initializeCard = async (applicationId, locationId) => {
      try {
        const sqPayments = window.Square.payments(applicationId, locationId);
        setPayments(sqPayments);
        const sqCard = await sqPayments.card();
        await sqCard.attach('#card-container');
        setCard(sqCard);
      } catch (error) {
        console.error('Square initialization error:', error);
        setErrorMessage('Failed to initialize payment form. Please refresh and try again.');
      }
    };

    loadSquare();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!card || !payments || isProcessing || isSubmitting) return;

    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // 1. Tokenize the card to get a one-time nonce
      const tokenResult = await card.tokenize();
      if (tokenResult.status !== 'OK') {
        throw new Error(tokenResult.errors?.[0]?.message || 'Card validation failed. Please check your details.');
      }

      // 2. Create a verification token to authorize future charges
      const verificationDetails = {
          amount: '1.00', // Verification amount must be a string
          billingContact: {
              givenName: cardholderName.split(' ')[0] || cardholderName,
              familyName: cardholderName.split(' ').slice(1).join(' ') || cardholderName
          },
          currencyCode: 'USD',
          intent: 'STORE' // This is critical for saving a card on file
      };
      
      const verificationResult = await payments.verifyBuyer(tokenResult.token, verificationDetails);
      
      if (!verificationResult || !verificationResult.token) {
          throw new Error('This card could not be verified for automatic payments. Please try a different card.');
      }
      
      // 3. Pass both tokens to the backend to be saved securely
      onTokenize(tokenResult.token, verificationResult.token);

    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formStyles = isDarkMode ? {
      backgroundColor: '#1F2937',
      color: '#F9FAFB',
      borderColor: '#4B5563',
      '::placeholder': { color: '#9CA3AF' } // Note: pseudo-elements like ::placeholder generally need to be applied via CSS, not inline styles. Square's iframe handles this internally.
  } : {
      backgroundColor: '#FFFFFF',
      color: '#111827',
      borderColor: '#D1D5DB',
      '::placeholder': { color: '#6B7281' } // Same note as above.
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Enter Your Card Details
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div 
            id="card-container" 
            className="p-3 bg-transparent rounded-md min-h-[60px] flex items-center"
            style={formStyles}
          />
          
          {(errorMessage || submissionError) && (
            <div className={`p-3 ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-300'} border rounded-md`}>
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                {submissionError || errorMessage}
              </p>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={`flex-1 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              disabled={isProcessing || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!card || isProcessing || isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50"
            >
              {isProcessing || isSubmitting ? 'Verifying Card...' : 'Save & Verify Card'}
            </Button>
          </div>
        </form>
      </div>
      
      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} text-center`}>
        <p>🔒 Your card is encrypted and processed securely by Square. A temporary $1.00 verification hold may be placed.</p>
      </div>
    </div>
  );
}
