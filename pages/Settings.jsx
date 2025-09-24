
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  ChevronRight,
  Shield,
  HelpCircle,
  Moon,
  Sun,
  ArrowLeft,
  Award,
  DollarSign,
  Zap,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Power,
  PowerOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import SquarePaymentForm from "../components/settings/SquarePaymentForm";
import { createPaymentMethod } from "@/api/functions";
import { chargePenalty } from "@/api/functions";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("main");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
      setUser({
        card_verification_status: "none",
        trial_days_remaining: 3,
        credits: 0,
        square_customer_id: null,
        email: "demo@example.com",
        full_name: "Demo User",
        account_locked: false, // Ensure this is false for demo user if locking is disabled
        card_brand: null,
        card_last_four: null,
        payment_agreement_signed: false,
        payment_agreement_signature: null,
        payment_agreement_date: null,
        penalties_paused: false, // Added for demo user
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Added for demo user
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, [loadUser]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
    window.location.reload();
  };

  const TermsOfService = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveView("main")}
          className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Terms of Service</h2>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'} border rounded-2xl p-6 space-y-4`}>
        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1. Acceptance of Terms</h3>
        <p>By using Get Good ("the Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the Service.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2. Service Description</h3>
        <p>Get Good is a habit-building application that uses financial accountability to help users develop and maintain positive habits. Users create habits and to-do tasks with associated penalty amounts that are automatically charged when habits are missed or tasks are not completed by their due dates.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>3. Payment Authorization & Processing</h3>
        <p>By creating habits with penalty amounts, you explicitly authorize Get Good to charge your payment method when you fail to complete habits by their due time or complete to-do tasks by their deadline. You understand and agree that:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Habits due at specific times will be charged 30 minutes after the due time if incomplete, but no later than 11:59 PM on the due date</li>
          <li>Habits due "end of day" will be charged at 11:59 PM if incomplete</li>
          <li>To-do tasks will be charged immediately after their due date/time passes</li>
          <li>Payment processing is handled securely through Square, Inc.</li>
          <li>All charges are final and serve the accountability purpose of the service</li>
        </ul>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>4. Trial Period & Payment Requirements</h3>
        <p>New users receive a 3-day trial period during which no penalties are charged. After the trial period ends, you must provide valid payment information to continue using penalty features. Failure to maintain valid payment information may result in account suspension.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5. Credits System</h3>
        <p>Credits earned through leveling up, achievements, and referrals are automatically applied to offset penalty charges. Credits have no cash value and cannot be transferred or redeemed for money.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>6. Weekly Penalty Cap</h3>
        <p>To protect users, penalty charges are capped at $100 per calendar week (excluding credit usage). This limit resets every Monday.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>7. Data Collection & Usage</h3>
        <p>We collect and process your personal information as described in our Privacy Policy. By using the Service, you consent to such collection and processing.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8. Account Termination</h3>
        <p>You may cancel your account at any time through the app settings. We reserve the right to terminate accounts for violations of these terms, fraudulent activity, or repeated payment failures.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>9. Limitation of Liability</h3>
        <p>Get Good is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for any indirect, incidental, punitive, or consequential damages arising from your use of the service.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>10. Dispute Resolution</h3>
        <p>Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>11. Changes to Terms</h3>
        <p>We reserve the right to modify these terms at any time. Users will be notified of material changes via email or in-app notification.</p>

        <p className="text-sm text-gray-500 pt-4 border-t border-gray-600">Last updated: January 2024</p>
      </div>
    </div>
  );

  const BillingInformation = () => {
    const [signatureName, setSignatureName] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState('');

    const handleAddOrUpdatePayment = () => {
        setSubmissionError('');
        if (!user?.card_verification_status || user?.card_verification_status !== 'verified') {
             if (!isAuthorized || !signatureName.trim()) {
                setSubmissionError("Please provide your digital signature and authorize the agreement.");
                return;
            }
        }
        setShowPaymentForm(true);
    };

    const handleTokenize = async (sourceId, verificationToken) => {
        setIsSubmitting(true);
        setSubmissionError('');
        try {
            const finalCardholderName = signatureName || user?.full_name;

            if (!finalCardholderName) {
                setSubmissionError("Cardholder name is missing.");
                setIsSubmitting(false);
                return;
            }
            
            const { data: result } = await createPaymentMethod({
                sourceId: sourceId,
                verificationToken: verificationToken,
                cardholderName: finalCardholderName,
                customerId: user?.square_customer_id || null,
            });

            await User.updateMyUserData({
                square_customer_id: result.customerId,
                square_card_id: result.cardId,
                card_brand: result.cardBrand,
                card_last_four: result.cardLast4,
                card_verification_status: 'verified',
                account_locked: false,
                payment_agreement_signed: true,
                payment_agreement_signature: signatureName,
                payment_agreement_date: new Date().toISOString(),
            });

            setShowPaymentForm(false);
            loadUser();

        } catch (error) {
            console.error("Payment method creation failed:", error);
            const errorMessage = error.response?.data?.error || error.message || "Could not save payment method. Please try again.";
            setSubmissionError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveView("main")}
                    className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Billing Information</h2>
            </div>

            {submissionError && (
                 <div className={`bg-red-900/30 border-red-700 border rounded-2xl p-6 mb-6`}>
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className={`text-lg font-bold text-red-300`}>An Error Occurred</h3>
                    </div>
                    <p className={`text-red-400 text-sm`}>
                        {submissionError}
                    </p>
                     <p className="text-sm text-yellow-400 mt-2">Please try again, or use a different payment method if the issue persists.</p>
                </div>
            )}

            {user?.account_locked && (
                <div className={`bg-red-900/30 border-red-700 border rounded-2xl p-6 mb-6`}>
                    <h3 className="text-lg font-bold text-red-300">Account Locked</h3>
                    <p className="text-red-400 text-sm mt-2">A payment has failed. Please update your card to reactivate your account.</p>
                </div>
            )}

            {(!user?.card_verification_status || user?.card_verification_status !== 'verified') && user?.trial_days_remaining > 0 && (
              <div className={`bg-gradient-to-r ${isDarkMode ? 'from-blue-500/20 to-purple-500/20 border-blue-500/30' : 'from-blue-100 to-purple-100 border-blue-300'} border rounded-2xl p-6 mb-6`}>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Free Trial Active</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  You have {user.trial_days_remaining || 0} days left. Add a payment method to enable penalties after the trial.
                </p>
              </div>
            )}

            <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Payment Method</h3>

              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                  user?.card_verification_status === 'verified' ?
                    (isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-100 border-green-300') :
                    (isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300')
                }`}>
                  {user?.card_verification_status === 'verified' ? (
                    <>
                      <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <div className="flex-1">
                        <p className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                           {user.card_brand || 'Card'} ending in {user.card_last_four || '****'}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-green-500' : 'text-green-700'}`}>Ready for Accountability</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CreditCard className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Card on File</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Add a payment method to enable penalties.</p>
                      </div>
                    </>
                  )}
                </div>
                
                {showPaymentForm ? (
                    <SquarePaymentForm 
                        onTokenize={handleTokenize}
                        onCancel={() => setShowPaymentForm(false)}
                        cardholderName={signatureName}
                        isDarkMode={isDarkMode}
                        isSubmitting={isSubmitting}
                        submissionError={submissionError}
                    />
                ) : (
                  <>
                    {user?.card_verification_status !== 'verified' && (
                      <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <label htmlFor="signature" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Digital Signature</label>
                          <Input 
                            id="signature"
                            placeholder="Type your full name"
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            className={`${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            disabled={isSubmitting}
                          />
                          <div className="flex items-start space-x-3">
                              <Checkbox id="terms" checked={isAuthorized} onCheckedChange={setIsAuthorized} className="mt-0.5" disabled={isSubmitting} />
                              <label htmlFor="terms" className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  I authorize Get Good to charge my payment method for penalties incurred from missed habits or to-do tasks, according to the Terms of Service.
                              </label>
                          </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleAddOrUpdatePayment}
                      disabled={(user?.card_verification_status !== 'verified' && (!isAuthorized || !signatureName.trim())) || isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Processing..." : (user?.card_verification_status === 'verified' ? 'Update Card' : 'Add Card')}
                    </Button>
                  </>
                )}
              </div>
            </div>
        </div>
    );
  };

  const DangerZone = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const togglePenalties = async () => {
      setIsProcessing(true);
      try {
        await User.updateMyUserData({ penalties_paused: !user.penalties_paused });
        loadUser(); // Refresh user data to reflect the change
      } catch (error) {
        console.error("Failed to toggle penalty status:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveView("main")}
            className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Danger Zone</h2>
        </div>

        <div className={`${isDarkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-100 border-red-200'} border rounded-2xl p-6`}>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-2`}>Pause Accountability</h3>
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'} mb-4`}>
            This will pause habits due, penalty charges and notifications but will not maintain habit streaks.
          </p>
          <Button
            onClick={togglePenalties}
            disabled={isProcessing}
            className={`w-full ${
              user?.penalties_paused 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isProcessing ? 'Processing...' : (user?.penalties_paused ? <><Power className="w-4 h-4 mr-2"/>Resume Accountability</> : <><PowerOff className="w-4 h-4 mr-2"/>Pause Accountability</>)}
          </Button>
        </div>
      </div>
    );
  };

  const PrivacyStatement = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveView("main")}
          className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Privacy Policy</h2>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'} border rounded-2xl p-6 space-y-4`}>
        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1. Information We Collect</h3>
        <p><strong>Personal Information:</strong> Name, email address, profile photo, and timezone information.</p>
        <p><strong>Habit & Task Data:</strong> Habit titles, descriptions, completion status, penalty amounts, and related logs.</p>
        <p><strong>Payment Information:</strong> Payment method details are securely processed and stored by Square, Inc. We only store payment method references and transaction IDs.</p>
        <p><strong>Usage Data:</strong> App usage patterns, feature interactions, and performance metrics to improve our service.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2. How We Use Your Information</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Track your habit progress and calculate accountability metrics</li>
          <li>Process penalty charges for missed habits and incomplete tasks</li>
          <li>Send notifications about habit reminders and penalty charges</li>
          <li>Provide customer support and resolve technical issues</li>
          <li>Analyze usage patterns to improve app features and performance</li>
        </ul>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>3. Information Sharing</h3>
        <p>We do not sell, trade, or rent your personal information to third parties. We only share your information in the following limited circumstances:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Payment Processing:</strong> Transaction data with Square, Inc. for processing penalties</li>
          <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
          <li><strong>Service Providers:</strong> With trusted third-party services that assist in app operation (all bound by confidentiality agreements)</li>
        </ul>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>4. Data Security</h3>
        <p>We implement industry-standard security measures to protect your personal information:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>All data transmission is encrypted using TLS 1.3</li>
          <li>Payment information is processed through PCI DSS-compliant Square systems</li>
          <li>User data is stored in secure, access-controlled databases</li>
          <li>Regular security audits and vulnerability assessments</li>
        </ul>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5. Data Retention</h3>
        <p>We retain your personal information for as long as your account is active or as needed to provide services. Habit completion data is retained for statistical and streak calculation purposes. You may request data deletion by contacting support.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>6. Your Rights</h3>
        <p>You have the right to:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Access and download your personal data</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your account and associated data</li>
          <li>Opt-out of non-essential communications</li>
          <li>Data portability for habit and progress information</li>
        </ul>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>7. Cookies and Tracking</h3>
        <p>We use essential cookies for app functionality and authentication. We do not use advertising cookies or third-party tracking scripts.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8. Children's Privacy</h3>
        <p>Get Good is not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>9. International Users</h3>
        <p>Get Good is operated from the United States. By using our service, you consent to the transfer and processing of your information in the United States.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>10. Changes to This Policy</h3>
        <p>We may update this Privacy Policy periodically. Users will be notified of material changes via email or in-app notification 30 days before changes take effect.</p>

        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>11. Contact Information</h3>
        <p>For privacy-related questions or requests, contact us at migmobileapplications@gmail.com or through the in-app support feature.</p>

        <p className="text-sm text-gray-500 pt-4 border-t border-gray-600">Last updated: January 2024</p>
      </div>
    </div>
  );

  const HowItWorks = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveView("main")}
          className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How It Works</h2>
      </div>

      <div className="space-y-6">
        <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-purple-400" />
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Leveling System</h3>
          </div>
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-3`}>
            <p>You earn experience points (XP) by completing habits consistently:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Daily completion gives 25 base XP (100% completion)</li>
              <li>Partial completion gives proportional XP (50% = 12.5 XP)</li>
              <li>High priority habits: 2x XP multiplier</li>
              <li>Medium priority habits: 1.5x XP multiplier</li>
              <li>Low priority habits: 1x XP multiplier</li>
              <li><strong>NEW:</strong> Streak milestone bonuses (7 days = 50 XP, 30 days = 300 XP, etc.)</li>
            </ul>
            <p>XP is calculated and applied at the end of each day.</p>
            <p>Each level requires 5% more XP than the previous level, starting at 100 XP for level 2.</p>
            <p className="font-bold text-red-400">Note: XP gain is halved if you have fewer than 5 habits, or if more than 50% of your habits are set to "end of day".</p>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-red-400" />
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Penalty System</h3>
          </div>
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-3`}>
            <p>Financial accountability keeps you motivated:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Habit Penalties: Low ($1), Medium ($5), High ($10)</li>
              <li>To-Do Task Penalties: Low ($1), Medium ($5), High ($10)</li>
            </ul>
            <p>Habits and tasks due at specific times are charged 30 minutes after due time if missed. Items due "end of day" are charged at 11:59 PM.</p>
            <p><strong>To-Do Tasks:</strong> Tasks can be due by end of day, end of week, or end of month. Penalties are only charged after the actual due date passes. Incomplete tasks roll over to the next day and may be penalized again.</p>
            <p>To-Do tasks do not contribute to XP or streaks - they are for accountability only.</p>
            <p>Maximum $100 in penalties per week (excluding credit usage).</p>
            <p>Penalties pause automatically after 30 days of inactivity.</p>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-green-400" />
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Credit System</h3>
          </div>
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-3`}>
            <p>Earn credits to offset penalties:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>$1 credit per level gained</li>
              <li>$5 bonus credit every 5 levels (5, 10, 15, etc.)</li>
              <li>$5 credit for each friend invited (max $25/year)</li>
              <li><strong>NEW:</strong> Streak milestone XP bonuses (7 days = 70 XP, 30 days = 300 XP, etc.)</li>
            </ul>
            <p>Credits are automatically deducted when penalties occur.</p>
            <p>Credits cannot be converted to cash - they only offset penalty charges.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const MainSettings = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Settings</h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customize your Get Good experience</p>
      </div>

      {/* Timezone Setting */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Timezone</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
          Your timezone is automatically detected. Confirm or change it here for accurate penalty timing.
        </p>
        <select
          value={user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
          onChange={async (e) => {
            await User.updateMyUserData({ timezone: e.target.value });
            loadUser();
          }}
          className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border`}
        >
          <option value="America/New_York">Eastern Time (EST/EDT)</option>
          <option value="America/Chicago">Central Time (CST/CDT)</option>
          <option value="America/Denver">Mountain Time (MST/MDT)</option>
          <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
          <option value="America/Phoenix">Arizona Time (MST)</option>
          <option value="America/Anchorage">Alaska Time (AKST/AKDT)</option>
          <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
          <option value="Europe/London">London (GMT/BST)</option>
          <option value="Europe/Paris">Paris (CET/CEST)</option>
          <option value="Europe/Berlin">Berlin (CET/CEST)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
          <option value="Asia/Shanghai">Shanghai (CST)</option>
          <option value="Asia/Kolkata">India (IST)</option>
          <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
        </select>
      </div>

      {/* Theme Setting */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-6 h-6 text-gray-400" />
            ) : (
              <Sun className="w-6 h-6 text-yellow-500" />
            )}
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Theme</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isDarkMode ? "Dark mode" : "Light mode"}
              </p>
            </div>
          </div>
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            {isDarkMode ? "Switch to Light" : "Switch to Dark"}
          </Button>
        </div>
      </div>

      <button
        onClick={() => { setActiveView("billing"); }}
        className={`w-full ${isDarkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-2xl p-6 transition-colors text-left`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-green-400" />
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Billing & Payment</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.card_verification_status === 'verified' ? "Manage payment method" :
                 user?.card_verification_status === 'pending' ? "Card verification in progress" :
                 "Add payment method"}
              </p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </button>

      <button
        onClick={() => setActiveView("terms")}
        className={`w-full ${isDarkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-2xl p-6 transition-colors text-left`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Terms of Service</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Read our terms and conditions</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </button>

      <button
        onClick={() => setActiveView("privacy")}
        className={`w-full ${isDarkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-2xl p-6 transition-colors text-left`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Privacy Statement</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>How we handle your data</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </button>

      <button
        onClick={() => setActiveView("howItWorks")}
        className={`w-full ${isDarkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-2xl p-6 transition-colors text-left`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-green-400" />
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How It Works</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Learn about leveling, penalties & credits</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </button>
      
      <button
        onClick={() => setActiveView("dangerZone")}
        className={`w-full ${isDarkMode ? 'bg-red-900/20 border-red-500/30 hover:bg-red-900/40' : 'bg-red-100 border-red-200 hover:bg-red-200'} border rounded-2xl p-6 transition-colors text-left`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-red-300' : 'text-gray-800'}`}>Danger Zone</h3>
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Pause or manage your account</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-gray-700 rounded-xl w-1/3 mb-6 animate-pulse"></div>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 animate-pulse border`}>
            <div className="h-6 bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {activeView === "main" && <MainSettings />}
        {activeView === "terms" && <TermsOfService />}
        {activeView === "billing" && <BillingInformation />}
        {activeView === "privacy" && <PrivacyStatement />}
        {activeView === "howItWorks" && <HowItWorks />}
        {activeView === "dangerZone" && <DangerZone />}
      </motion.div>
    </div>
  );
}
