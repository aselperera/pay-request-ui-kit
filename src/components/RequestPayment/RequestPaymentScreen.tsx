
import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const RequestPaymentScreen: React.FC = () => {
  // State to track digits in pence (stored as array of digits)
  const [digits, setDigits] = useState<number[]>([]);
  // Track if we're in manual decimal mode
  const [manualDecimalMode, setManualDecimalMode] = useState(false);
  // Track position of decimal in manual mode
  const [decimalPosition, setDecimalPosition] = useState<number | null>(null);

  // Calculate the formatted amount for display
  const formattedAmount = useMemo(() => {
    if (digits.length === 0) {
      return '£0.00';
    }

    let amountString = '';
    
    if (manualDecimalMode && decimalPosition !== null) {
      // In manual decimal mode, format based on decimal position
      digits.forEach((digit, index) => {
        amountString += digit;
        if (index === decimalPosition) {
          amountString += '.';
        }
      });
      
      // Ensure we have at least one digit before decimal
      if (decimalPosition === 0) {
        amountString = '0' + amountString;
      }
      
      // In manual mode, we don't pad with zeros at the end
      amountString = '£' + amountString;
    } else {
      // Standard mode: treat last two digits as pence
      let poundsDigits = digits.slice(0, Math.max(0, digits.length - 2));
      const penceDigits = digits.slice(Math.max(0, digits.length - 2));
      
      // Trim leading zeros in pounds portion
      while (poundsDigits.length > 0 && poundsDigits[0] === 0) {
        poundsDigits.shift();
      }
      
      // Format pounds
      if (poundsDigits.length > 0) {
        amountString = poundsDigits.join('');
      } else {
        amountString = '0';
      }
      
      // Add pence with proper padding
      if (penceDigits.length === 0) {
        amountString += '.00';
      } else if (penceDigits.length === 1) {
        amountString += '.' + penceDigits[0] + '0';
      } else {
        amountString += '.' + penceDigits.join('');
      }
      
      amountString = '£' + amountString;
    }
    
    return amountString;
  }, [digits, manualDecimalMode, decimalPosition]);

  // Array of slots for display
  const displaySlots = useMemo(() => {
    const slots = [];
    const amount = formattedAmount.substring(1); // Remove £ prefix
    
    // Add pound symbol as first slot
    slots.push({
      value: '£',
      filled: true
    });
    
    // Add each character as a slot
    for (let i = 0; i < amount.length; i++) {
      slots.push({
        value: amount[i],
        filled: true
      });
    }
    
    return slots;
  }, [formattedAmount]);

  // Handle digit press
  const handleDigitPress = useCallback((digit: number) => {
    if (manualDecimalMode) {
      // In manual decimal mode, only allow 2 digits after decimal
      if (decimalPosition !== null) {
        const digitsAfterDecimal = digits.length - decimalPosition - 1;
        if (digitsAfterDecimal >= 2) return; // Already have 2 decimal places
      }
    }
    
    setDigits(prev => [...prev, digit]);
  }, [digits, manualDecimalMode, decimalPosition]);

  // Handle decimal press
  const handleDecimalPress = useCallback(() => {
    if (manualDecimalMode) return; // Already in manual decimal mode
    
    setManualDecimalMode(true);
    setDecimalPosition(digits.length);
  }, [digits.length, manualDecimalMode]);

  // Handle backspace press
  const handleBackspacePress = useCallback(() => {
    if (digits.length === 0) return;
    
    if (manualDecimalMode) {
      // If we're deleting the decimal position
      if (digits.length === decimalPosition) {
        setManualDecimalMode(false);
        setDecimalPosition(null);
      }
      
      setDigits(prev => prev.slice(0, -1));
    } else {
      setDigits(prev => prev.slice(0, -1));
    }
  }, [digits.length, manualDecimalMode, decimalPosition]);

  // Check if we have a valid amount to enable the button
  const isAmountValid = useMemo(() => {
    if (digits.length === 0) return false;
    
    // For manual decimal mode
    if (manualDecimalMode) {
      const amountStr = formattedAmount.substring(1); // Remove £
      const amount = parseFloat(amountStr);
      return amount > 0;
    }
    
    // For standard mode
    return digits.some(d => d > 0); // At least one non-zero digit
  }, [digits, manualDecimalMode, formattedAmount]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!isAmountValid) return;
    
    const amount = parseFloat(formattedAmount.substring(1));
    console.log('Requesting payment for:', amount);
    // Here you would usually call a callback prop like onSubmit(amount)
  }, [isAmountValid, formattedAmount]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start p-6">
      {/* Amount Display */}
      <div className="mt-12 mb-16 text-center">
        <div className="flex justify-center items-center text-[48px] font-semibold tracking-wide min-h-[60px]">
          {displaySlots.map((slot, index) => (
            <span 
              key={index} 
              className={cn(
                "transition-colors", 
                slot.value === '.' ? "mx-1" : "",
                slot.filled ? "text-[#333333]" : "text-[#AAAAAA]"
              )}
            >
              {slot.value}
            </span>
          ))}
        </div>
      </div>
      
      {/* Keypad */}
      <div className="w-full max-w-[320px] grid grid-cols-3 gap-2">
        {/* Row 1 */}
        {[1, 2, 3].map((digit) => (
          <KeypadButton key={digit} onClick={() => handleDigitPress(digit)}>
            {digit}
          </KeypadButton>
        ))}
        
        {/* Row 2 */}
        {[4, 5, 6].map((digit) => (
          <KeypadButton key={digit} onClick={() => handleDigitPress(digit)}>
            {digit}
          </KeypadButton>
        ))}
        
        {/* Row 3 */}
        {[7, 8, 9].map((digit) => (
          <KeypadButton key={digit} onClick={() => handleDigitPress(digit)}>
            {digit}
          </KeypadButton>
        ))}
        
        {/* Row 4 */}
        <KeypadButton onClick={handleDecimalPress}>.</KeypadButton>
        <KeypadButton onClick={() => handleDigitPress(0)}>0</KeypadButton>
        <KeypadButton onClick={handleBackspacePress}>
          <ArrowLeft size={24} className="text-[#333333]" />
        </KeypadButton>
      </div>
      
      {/* Submit Button */}
      <button 
        className={cn(
          "w-full max-w-[320px] h-14 rounded-md mt-4 font-medium text-white transition-all",
          isAmountValid 
            ? "bg-[#4CAF50] hover:bg-[#3d9c41] active:bg-[#357a36]" 
            : "bg-[#95CCA0] cursor-not-allowed"
        )}
        onClick={handleSubmit}
        disabled={!isAmountValid}
      >
        Request Amount
      </button>
    </div>
  );
};

// Keypad Button Component
interface KeypadButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const KeypadButton: React.FC<KeypadButtonProps> = ({ children, onClick }) => {
  return (
    <button 
      className="aspect-square bg-[#F1F1F1] rounded-md flex items-center justify-center 
                text-[18px] font-medium text-[#333333] shadow-sm
                active:bg-[#E0E0E0] transition-colors duration-100"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default RequestPaymentScreen;
