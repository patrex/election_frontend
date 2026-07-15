import { useEffect, useState, useMemo, useCallback } from "react";
import { Mail, Phone, Vote, CheckCircle2, XCircle, X, UserPlus } from "lucide-react";
import axios_api from "@/utils/axios";

import { useOTP } from "@/contexts/OTPContext";
import { useAuth } from "@/contexts/AuthContext";
import { useElection } from "@/contexts/ElectionContext";
import Toast from "@/utils/ToastMsg";
import { useNavigate } from "react-router-dom";

import PhoneInputModal from "@/components/CollectPhoneNumber";
import CollectEmailModal from "@/components/CollectEmailModal";

const PHONE_REGEX = /^(0|234)\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VoterCheckOverlay = ({ isOpen, onClose, userAuthType, voters }) => {
  const { election } = useElection();
  const { startVerification } = useOTP();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(null); // null | "success" | "error"

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const isEmail = userAuthType === "email";
  const voterSet = useMemo(() => new Set(voters), [voters]);
  const isValid = (isEmail ? EMAIL_REGEX : PHONE_REGEX).test(query.trim());

  const normalize = (v) =>
    !isEmail && v.startsWith("234") ? "0" + v.slice(3) : v;

  const addToDb = useCallback(async () => {
    try {
      await startVerification(normalize(query.trim()));
      await axios_api.post(`election/${election._id}/addvoter/participant`, {
        participant: query.trim(),
        electionId: election._id,
      });
      return Toast.success("You have been added")
    } catch (error) {
      Toast.error("We could not add you")
    }
  }, [voters]);

  useEffect(() => {
    if (!isValid) {
      setStatus(null);
      return;
    }
    setStatus(voterSet.has(normalize(query.trim())) ? "success" : "error");
  }, [isValid, query, voterSet]);

  const handleClose = () => {
    setQuery("");
    setStatus(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl px-5 pt-4 pb-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Check registration
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Enter the {isEmail ? "email address" : "phone number"} you registered
          with to confirm you can vote.
        </p>

        {/* Input */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 h-11 mb-3">
          {isEmail ? (
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
          ) : (
            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
          )}
          <input
            type={isEmail ? "email" : "tel"}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setStatus(null);
            }}
            placeholder={isEmail ? "you@example.com" : "+234 800 000 0000"}
            className="flex-1 min-w-0 text-sm bg-transparent !border-none !outline-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        {/* Status feedback */}
        {status === "success" && (
          <div className="flex items-center gap-2 px-3 py-2.5 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Your {isEmail ? "email" : "phone number"} is registered
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 px-3 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium">
            <XCircle className="h-4 w-4 shrink-0" />
            Your {isEmail ? "email" : "phone number"} is not registered
          </div>
        )}

        {/* CTA */}
        {status === "success" && (
          <button
            onClick={() => onProceed?.(normalize(query.trim()))}
            className="w-full flex items-center justify-center gap-2 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition active:scale-95"
          >
            <Vote className="h-4 w-4" />
            Proceed
          </button>
        )}
        {status === "error" && (
          <button
            onClick={ () => isEmail ? setShowEmailModal(true) : setShowPhoneModal(true) }
            className="w-full flex items-center justify-center gap-2 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Register
          </button>
        )}
      </div>

      <PhoneInputModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSubmit={addToDb}
      />

      <CollectEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={addToDb}
      />
    </div>
  );
};

export default VoterCheckOverlay;
