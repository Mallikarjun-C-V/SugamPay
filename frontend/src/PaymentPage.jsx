import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { assets } from "./assets/assets.js";


// Custom Toast Component
const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto transform transition-all duration-500 ease-out ${toast.isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            }`}
          style={{
            animation: toast.isExiting ? '' : 'slideInRight 0.5s ease-out, shake 0.5s ease-out 0.5s'
          }}
        >
          <div
            className={`relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-md ${toast.type === 'success'
              ? 'bg-gradient-to-r from-green-500/90 to-emerald-600/90 shadow-green-500/30'
              : toast.type === 'error'
                ? 'bg-gradient-to-r from-red-500/90 to-rose-600/90 shadow-red-500/30'
                : toast.type === 'warning'
                  ? 'bg-gradient-to-r from-yellow-500/90 to-amber-600/90 shadow-yellow-500/30'
                  : 'bg-gradient-to-r from-blue-500/90 to-indigo-600/90 shadow-blue-500/30'
              }`}
          >
            {/* Progress bar */}
            <div
              className="absolute bottom-0 left-0 h-1 bg-white/30"
              style={{
                animation: `shrink ${toast.duration || 4000}ms linear forwards`
              }}
            />

            <div className="p-4 flex items-start gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-white/20' :
                toast.type === 'error' ? 'bg-white/20' :
                  toast.type === 'warning' ? 'bg-white/20' : 'bg-white/20'
                }`}>
                {toast.type === 'success' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {toast.type === 'warning' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {toast.type === 'info' && (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <h4 className="text-white font-bold text-sm">{toast.title}</h4>
                <p className="text-white/90 text-sm mt-0.5">{toast.message}</p>
              </div>

              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Success Celebration Component with Confetti
const SuccessCelebration = ({ isVisible, transactionId, onComplete }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (isVisible) {
      // Play success sound
      playSuccessSound();

      // Generate confetti
      const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
      const newConfetti = [];
      for (let i = 0; i < 150; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 5 + Math.random() * 10,
          rotation: Math.random() * 360
        });
      }
      setConfetti(newConfetti);

      // Auto complete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create a more pleasant success melody
      const playNote = (frequency, startTime, duration, gain = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;

      // Pleasant ascending chord progression
      playNote(523.25, now, 0.15, 0.2);        // C5
      playNote(659.25, now + 0.1, 0.15, 0.2);  // E5
      playNote(783.99, now + 0.2, 0.15, 0.2);  // G5
      playNote(1046.50, now + 0.3, 0.4, 0.3);  // C6 (sustained)

      // Additional sparkle
      playNote(1318.51, now + 0.35, 0.2, 0.15); // E6
      playNote(1567.98, now + 0.4, 0.3, 0.1);   // G6

    } catch (error) {
      console.log('Audio not supported');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute"
            style={{
              left: `${piece.x}%`,
              top: '-20px',
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              transform: `rotate(${piece.rotation}deg)`,
              animation: `confettiFall ${piece.duration}s ease-out ${piece.delay}s forwards`
            }}
          />
        ))}
      </div>

      {/* Success Card */}
      <div
        className="relative z-10 bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
        style={{ animation: 'scaleIn 0.5s ease-out' }}
      >
        {/* Success Icon with ripple effect */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div
            className="absolute inset-0 bg-green-500 rounded-full"
            style={{ animation: 'ripple 1s ease-out infinite' }}
          />
          <div
            className="absolute inset-0 bg-green-500 rounded-full"
            style={{ animation: 'ripple 1s ease-out infinite 0.3s' }}
          />
          <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animation: 'checkDraw 0.5s ease-out 0.3s both' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2
            className="text-2xl font-bold text-gray-800 mb-2"
            style={{ animation: 'slideUp 0.5s ease-out 0.4s both' }}
          >
            Payment Successful! 🎉
          </h2>
          <p
            className="text-gray-600 mb-4"
            style={{ animation: 'slideUp 0.5s ease-out 0.5s both' }}
          >
            Your transaction has been completed successfully.
          </p>

          {/* Transaction ID */}
          <div
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100"
            style={{ animation: 'slideUp 0.5s ease-out 0.6s both' }}
          >
            <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
            <p className="font-mono text-lg font-bold text-green-600">{transactionId}</p>
          </div>

          {/* Stars/Sparkles */}
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-6 h-6 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{
                  animation: `starPop 0.3s ease-out ${0.7 + i * 0.1}s both`
                }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <p
            className="text-sm text-gray-400 mt-4"
            style={{ animation: 'fadeIn 0.5s ease-out 1s both' }}
          >
            Redirecting you shortly...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes checkDraw {
          from {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            opacity: 0;
          }
          to {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes starPop {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.3) rotate(0deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const callbackUrl = searchParams.get('callback_url');

  const [amount, setAmount] = useState(0);
  const [source, setSource] = useState('Loading...');

  // Toast state
  const [toasts, setToasts] = useState([]);

  // Success celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [successTransactionId, setSuccessTransactionId] = useState('');

  // Add toast function
  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, duration }]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.map(t =>
        t.id === id ? { ...t, isExiting: true } : t
      ));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 500);
    }, duration);
  }, []);

  // Remove toast function
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t =>
      t.id === id ? { ...t, isExiting: true } : t
    ));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 500);
  }, []);

  useEffect(() => {
    if (orderId) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      axios
        get(`${backendUrl}/api/get-order/${orderId}`)
        .then((res) => {
          setAmount(res.data.amount);
          setSource(res.data.sourceApp);
        })
        .catch(() => addToast('error', 'Invalid Order', 'Could not find the order. Please try again.'));
    }
  }, [orderId, addToast]);

  const [formData, setFormData] = useState({
    cardNumber: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [selectedCardType, setSelectedCardType] = useState(null);

  // Get current year's last 2 digits
  const getCurrentYearLast2Digits = () => {
    return parseInt(new Date().getFullYear().toString().slice(-2));
  };

  // Get current month
  const getCurrentMonth = () => {
    return new Date().getMonth() + 1; // getMonth() returns 0-11
  };

  // Format card number with spaces after every 4 digits
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Smart format expiry date MM/YY with validation
  const formatExpiry = (value, previousValue) => {
    // Remove all non-numeric characters
    let v = value.replace(/[^0-9]/g, '');

    // If empty, return empty
    if (v.length === 0) return '';

    // Handle first digit (month tens place)
    if (v.length === 1) {
      const firstDigit = parseInt(v[0]);
      // If first digit is > 1, it can't be a valid month start (max is 12)
      // So we prepend 0 to make it 0X format
      if (firstDigit > 1) {
        v = '0' + v;
      }
    }

    // Handle second digit (month ones place)
    if (v.length >= 2) {
      const firstDigit = parseInt(v[0]);
      const secondDigit = parseInt(v[1]);

      // If first digit is 1, second digit can only be 0, 1, or 2 (for months 10, 11, 12)
      if (firstDigit === 1 && secondDigit > 2) {
        v = v[0] + '2' + v.substring(2);
      }

      // If first digit is 0, second digit can't be 0 (no month 00)
      if (firstDigit === 0 && secondDigit === 0) {
        v = '01' + v.substring(2);
      }
    }

    // Limit to 4 digits total (MMYY)
    if (v.length > 4) {
      v = v.substring(0, 4);
    }

    // Format with slash
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2);
    }

    return v;
  };

  // Check if card is expired
  const isCardExpired = (expiry) => {
    if (!expiry || expiry.length < 5) return false;

    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);

    const currentYear = getCurrentYearLast2Digits();
    const currentMonth = getCurrentMonth();

    // If year is less than current year, card is expired
    if (year < currentYear) {
      return true;
    }

    // If year is same as current year, check month
    if (year === currentYear && month < currentMonth) {
      return true;
    }

    return false;
  };

  // Handle Input Change with formatting
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const formatted = formatCardNumber(value);
      if (formatted.replace(/\s/g, '').length <= 16) {
        setFormData({ ...formData, [name]: formatted });
      }
    } else if (name === 'expiry') {
      const formatted = formatExpiry(value, formData.expiry);
      setFormData({ ...formData, [name]: formatted });
    } else if (name === 'cvv') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 3) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else if (name === 'name') {
      const alphabetOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: alphabetOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle expiry input keydown for better UX
  const handleExpiryKeyDown = (e) => {
    // Allow backspace to work normally
    if (e.key === 'Backspace') {
      const { expiry } = formData;
      // If cursor is right after the slash, remove the slash and last digit of month
      if (expiry.length === 3 && expiry.includes('/')) {
        e.preventDefault();
        setFormData({ ...formData, expiry: expiry.substring(0, 2) });
      }
    }
  };

  const handlePayment = async () => {
    // Validation checks
    if (!selectedCardType) {
      addToast('warning', 'Card Type Required', 'Please select a card type to continue.');
      return;
    }

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      addToast('warning', 'Invalid Card Number', 'Please enter a valid 16-digit card number.');
      return;
    }

    if (!formData.name || formData.name.trim().length < 2) {
      addToast('warning', 'Name Required', 'Please enter the cardholder name.');
      return;
    }

    if (!formData.expiry || formData.expiry.length < 5) {
      addToast('warning', 'Invalid Expiry', 'Please enter a valid expiry date (MM/YY).');
      return;
    }

    // Check if card is expired
    if (isCardExpired(formData.expiry)) {
      addToast('error', 'Card Expired', 'Your card has expired. Please use a valid card.');
      return;
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      addToast('warning', 'Invalid CVV', 'Please enter a valid 3-digit CVV.');
      return;
    }

    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.post(`${backendUrl}/api/pay`, {
        orderId: orderId,
        cardHolderName: formData.name,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryDate: formData.expiry,
        cvv: formData.cvv,
        cardType: selectedCardType
      });

      if (response.data.status === 'success') {
        setSuccessTransactionId(response.data.transactionId);
        setShowCelebration(true);
      } else {
        addToast('error', 'Payment Failed', 'Transaction could not be completed. Please try again.');
      }

    } catch (error) {
      if (error.response && error.response.data) {
        addToast('error', 'Transaction Failed', error.response.data.message || 'Something went wrong.');
        if (callbackUrl) {
          setTimeout(() => {
            window.location.href = `${callbackUrl}?status=failed`;
          }, 2000);
        }
      } else {
        console.error(error);
        addToast('error', 'Server Error', 'Unable to connect to server. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle celebration complete
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    if (callbackUrl) {
      window.location.href = `${callbackUrl}?status=success&txnId=${successTransactionId}`;
    }
  };

  // Card type selection handler
  const handleCardTypeSelect = (type) => {
    setSelectedCardType(type);
  };

  // Get display card number with proper formatting
  const getDisplayCardNumber = () => {
    if (formData.cardNumber) {
      return formData.cardNumber;
    }
    return '•••• •••• •••• ••••';
  };

  // Check if expiry shows warning (expired)
  const showExpiryWarning = () => {
    return formData.expiry.length === 5 && isCardExpired(formData.expiry);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 bg-fixed bg-cover bg-center relative overflow-hidden">

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Success Celebration */}
      <SuccessCelebration
        isVisible={showCelebration}
        transactionId={successTransactionId}
        onComplete={handleCelebrationComplete}
      />

      <div className="min-h-screen w-screen px-[2%] py-[2%] relative overflow-hidden">

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>
        </div>

        {/* Main Container */}
        <div className="relative z-10 w-full h-full min-h-[96vh] grid lg:grid-cols-12 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/50">

          {/* Left Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 md:p-8 lg:p-10 xl:p-12 text-white relative overflow-hidden flex flex-col">

            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2"></div>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-6 lg:mb-8">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">SugamPay</h1>
                  <p className="text-sm text-purple-200 font-medium">Secure Payment Gateway</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-5 lg:space-y-6 flex-1">
                <div>
                  <p className="text-purple-200 text-sm font-medium uppercase tracking-wider mb-3">Paying to</p>
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                      🏪
                    </div>
                    <div>
                      <p className="font-bold text-lg lg:text-xl">{source}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-purple-200 text-sm">Verified Merchant</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                <div>
                  <p className="text-purple-200 text-sm font-medium uppercase tracking-wider mb-3">Order Summary</p>
                  <div className="space-y-3 bg-white/5 rounded-2xl p-4 lg:p-5 border border-white/10">
                    <div className="flex justify-between text-sm lg:text-base">
                      <span className="text-purple-200">Subtotal</span>
                      <span className="font-medium">₹{parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm lg:text-base">
                      <span className="text-purple-200">Processing Fee</span>
                      <span className="text-green-300 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-sm lg:text-base">
                      <span className="text-purple-200">GST</span>
                      <span className="font-medium">₹0.00</span>
                    </div>
                    <div className="h-px bg-white/20"></div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-purple-200 font-medium text-base lg:text-lg">Total</span>
                      <div className="text-right">
                        <span className="text-3xl lg:text-4xl xl:text-5xl font-bold">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
                        <p className="text-purple-200 text-sm mt-1">INR</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-3">Security & Compliance</p>
                <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 lg:px-4 lg:py-3">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs lg:text-sm">256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 lg:px-4 lg:py-3">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs lg:text-sm">PCI DSS</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 lg:px-4 lg:py-3">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs lg:text-sm">RBI Approved</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 lg:px-4 lg:py-3">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs lg:text-sm">GDPR Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 lg:p-10 xl:p-12 relative flex flex-col">

            <div className="flex items-center justify-between mb-5 lg:mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">Payment Details</h2>
                <p className="text-gray-500 mt-1 text-sm lg:text-base">Complete your secure payment below</p>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-700 px-3 lg:px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs lg:text-sm font-medium">Secure Session</span>
              </div>
            </div>

            {/* Card Preview - Full Width */}
            <div className="
                max-[500px]:w-[100%] w-[80%] md:w-[70%] lg:w-[525px] max-w-[525px]
                h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px] xl:h-[250px]
                mb-6
                p-4 sm:p-5 md:p-6 lg:p-8
                rounded-2xl
                bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800
                text-white
                relative overflow-hidden shadow-2xl
                transform hover:scale-[1.01] transition-transform duration-300
              ">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h100v100H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M0%200l100%20100M100%200L0%20100%22%20stroke%3D%22%23fff%22%20stroke-opacity%3D%22.03%22%2F%3E%3C%2Fsvg%3E')]"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6 sm:mb-8 lg:mb-10">
                  <div className="flex gap-2">
                    <div className="w-10 h-7 sm:w-12 sm:h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded"></div>
                    <div className="w-6 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded"></div>
                  </div>
                  <div className="text-right">
                    {selectedCardType === 'visa' && (
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold italic text-blue-400">VISA</span>
                    )}
                    {selectedCardType === 'mastercard' && (
                      <div className="flex">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-500 rounded-full opacity-90"></div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-500 rounded-full -ml-4 sm:-ml-5 lg:-ml-6 opacity-90"></div>
                      </div>
                    )}
                    {selectedCardType === 'rupay' && (
                      <img
                        src={assets.rupayLogo}
                        alt="RuPay"
                        className="h-6 sm:h-8 lg:h-10 object-contain"
                      />
                    )}

                    {selectedCardType === 'amex' && (
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-300">AMEX</span>
                    )}
                    {!selectedCardType && (
                      <div className="w-12 h-8 sm:w-16 sm:h-10 bg-gray-600 rounded animate-pulse"></div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                  {/* Card Number - Responsive font size to always fit */}
                  <div className="font-mono text-base sm:text-lg md:text-xl lg:text-2xl xl:text-[28px] tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] lg:tracking-[0.3em] text-gray-300 whitespace-nowrap overflow-hidden">
                    {getDisplayCardNumber()}
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase text-gray-500 mb-1 tracking-wider">Card Holder</p>
                      <p className="font-medium tracking-wider text-sm sm:text-base lg:text-lg uppercase">{formData.name || 'YOUR NAME'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs uppercase text-gray-500 mb-1 tracking-wider">Expires</p>
                      <p className={`font-medium tracking-wider text-sm sm:text-base lg:text-lg ${showExpiryWarning() ? 'text-red-400' : ''}`}>
                        {formData.expiry || 'MM/YY'}
                        {showExpiryWarning() && <span className="text-xs ml-1">⚠️</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods - Selectable */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Card Type <span className="text-red-500">*</span></p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleCardTypeSelect('visa')}
                  className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl border-2 flex items-center gap-2 transition-all duration-200 ${selectedCardType === 'visa'
                    ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-100'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className="text-blue-600 font-bold italic text-sm sm:text-base lg:text-lg">VISA</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCardTypeSelect('mastercard')}
                  className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl border-2 flex items-center gap-2 transition-all duration-200 ${selectedCardType === 'mastercard'
                    ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-100'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full"></div>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 rounded-full -ml-2"></div>
                  </div>
                  <span className="text-gray-600 font-semibold text-xs sm:text-sm">Mastercard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCardTypeSelect('rupay')}
                  className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl border-2 flex items-center gap-2 transition-all duration-200 ${selectedCardType === 'rupay'
                    ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-100'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <img
                    src={assets.rupayLogo}
                    alt="RuPay"
                    className="h-4 sm:h-5 lg:h-6 object-contain"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleCardTypeSelect('amex')}
                  className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl border-2 flex items-center gap-2 transition-all duration-200 ${selectedCardType === 'amex'
                    ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-100'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className="text-blue-800 font-bold text-xs sm:text-sm">AMEX</span>
                </button>
              </div>
            </div>

            {/* Form - 2 Column Layout on larger screens */}
            <form className="flex-1 grid md:grid-cols-2 gap-4 lg:gap-5">
              {/* Card Number - Full Width */}
              <div className="relative md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Number <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-300 ${focused === 'cardNumber' ? 'transform scale-[1.01]' : ''}`}>
                  <div className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="w-full pl-11 lg:pl-14 pr-14 lg:pr-16 py-3 lg:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-100 transition-all duration-300 text-gray-800 font-mono text-base lg:text-lg tracking-widest"
                    onChange={handleChange}
                    onFocus={() => setFocused('cardNumber')}
                    onBlur={() => setFocused('')}
                  />
                  {selectedCardType && (
                    <div className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2">
                      {selectedCardType === 'visa' && <span className="text-blue-600 font-bold italic text-base lg:text-lg">VISA</span>}
                      {selectedCardType === 'mastercard' && (
                        <div className="flex">
                          <div className="w-5 h-5 lg:w-6 lg:h-6 bg-red-500 rounded-full"></div>
                          <div className="w-5 h-5 lg:w-6 lg:h-6 bg-yellow-500 rounded-full -ml-2"></div>
                        </div>
                      )}
                      {selectedCardType === 'rupay' && (
                        <img
                          src={assets.rupayLogo}
                          alt="RuPay"
                          className="h-4 sm:h-5 object-contain"
                        />
                      )}
                      {selectedCardType === 'amex' && <span className="text-blue-800 font-bold text-sm">AMEX</span>}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Enter 16-digit card number</p>
              </div>

              {/* Name on Card - Full Width */}
              <div className="relative md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cardholder Name <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-300 ${focused === 'name' ? 'transform scale-[1.01]' : ''}`}>
                  <div className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="JOHN DOE"
                    autoComplete="cc-name"
                    className="w-full pl-11 lg:pl-14 pr-4 py-3 lg:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-100 transition-all duration-300 text-gray-800 uppercase tracking-wider text-base lg:text-lg"
                    onChange={handleChange}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused('')}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Name as it appears on card</p>
              </div>

              {/* Expiry */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-300 ${focused === 'expiry' ? 'transform scale-[1.01]' : ''}`}>
                  <div className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    className={`w-full pl-11 lg:pl-14 pr-4 py-3 lg:py-4 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white focus:shadow-lg transition-all duration-300 text-gray-800 font-mono text-base lg:text-lg tracking-widest text-center ${showExpiryWarning()
                      ? 'border-red-400 focus:border-red-500 focus:shadow-red-100'
                      : 'border-gray-200 focus:border-indigo-500 focus:shadow-indigo-100'
                      }`}
                    onChange={handleChange}
                    onKeyDown={handleExpiryKeyDown}
                    onFocus={() => setFocused('expiry')}
                    onBlur={() => setFocused('')}
                  />
                </div>
                {showExpiryWarning() ? (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Card has expired
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">Month/Year</p>
                )}
              </div>

              {/* CVV */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CVV <span className="text-red-500">*</span>
                  <span className="ml-1 text-gray-400 cursor-help inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-xs" title="3-digit security code on the back of your card">?</span>
                </label>
                <div className={`relative transition-all duration-300 ${focused === 'cvv' ? 'transform scale-[1.01]' : ''}`}>
                  <div className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    placeholder="•••"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    className="w-full pl-11 lg:pl-14 pr-4 py-3 lg:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-100 transition-all duration-300 text-gray-800 font-mono text-base lg:text-lg tracking-widest text-center"
                    onChange={handleChange}
                    onFocus={() => setFocused('cvv')}
                    onBlur={() => setFocused('')}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">3 digits on back of card</p>
              </div>

              {/* Pay Button - Full Width */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className={`relative md:col-span-2 w-full py-4 lg:py-5 rounded-xl font-bold text-lg lg:text-xl tracking-wide transition-all duration-300 overflow-hidden group mt-2
                ${loading
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white hover:shadow-2xl hover:shadow-purple-500/40 transform hover:-translate-y-1 active:translate-y-0'
                  }`}
              >
                {!loading && (
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                )}

                <span className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 lg:h-6 lg:w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Pay ₹{parseFloat(amount).toLocaleString('en-IN')} Securely
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Security Footer */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex flex-wrap items-center justify-center gap-x-6 lg:gap-x-8 gap-y-2 text-xs lg:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>PCI DSS Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Bank-Grade Security</span>
                </div>
              </div>
              <p className="text-center text-[10px] lg:text-xs text-gray-400 mt-3">
                Your payment is protected with 256-bit encryption. We never store your card details.
              </p>
              <p className="text-center text-[10px] lg:text-xs text-gray-400 mt-1">
                Powered by <span className="font-semibold text-indigo-500">SugamPay</span> • Trusted by 10,000+ businesses across India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;