'use client';

import { useState } from 'react';
import { API_BASE, apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import ChatWidgetWrapper from '@/components/ai/ChatWidgetWrapper';
import Turnstile from '@/components/Turnstile';

const RADIUS_OPTIONS = [10, 25, 50, 75, 100];
const LEAD_TYPES = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'investor', label: 'Investor' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'commercial', label: 'Commercial' },
];
const LANGUAGES = ['English', 'Spanish', 'Mandarin', 'French', 'Vietnamese', 'Tagalog', 'Korean', 'Arabic', 'Russian', 'Portuguese'];

export default function RealtorJoinPage() {
  const { success, notifyError } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    brokerage: '',
    license_number: '',
    state: '',
    city: '',
    zip: '',
    years_experience: '',
    current_production: '',
    specialization: '',
    referral_areas: '',
    message: '',
    resume_url: '',
    agreement_accepted: false,
  });
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [applicationReference, setApplicationReference] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  // Service area
  const [zipInput, setZipInput] = useState('');
  const [zipCodes, setZipCodes] = useState<string[]>([]);
  const [radiusMiles, setRadiusMiles] = useState<number>(25);
  const [leadTypes, setLeadTypes] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['English']);

  // Email verification (OTP)
  const [otpStage, setOtpStage] = useState<'idle' | 'sent' | 'verified'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Changing the verified email invalidates the previous verification.
    if (name === 'email' && otpStage !== 'idle') {
      setOtpStage('idle');
      setOtpCode('');
    }
  };

  const addZip = () => {
    const cleaned = zipInput.trim();
    if (!cleaned) return;
    if (!/^\d{5}$/.test(cleaned)) {
      notifyError(null, 'ZIP codes must be 5 digits.');
      return;
    }
    if (zipCodes.includes(cleaned)) {
      setZipInput('');
      return;
    }
    if (zipCodes.length >= 25) {
      notifyError(null, 'You can add up to 25 ZIP codes.');
      return;
    }
    setZipCodes(prev => [...prev, cleaned]);
    setZipInput('');
  };

  const removeZip = (zip: string) => setZipCodes(prev => prev.filter(z => z !== zip));

  const toggleLeadType = (value: string) =>
    setLeadTypes(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));

  const toggleLanguage = (value: string) =>
    setLanguages(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));

  const sendOtp = async () => {
    if (!formData.email) {
      notifyError(null, 'Enter your email address first.');
      return;
    }
    setOtpSending(true);
    try {
      await apiPost('/forms/email-otp/send', { email: formData.email });
      setOtpStage('sent');
      success('Verification code sent — check your inbox.');
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : 'Failed to send verification code.');
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode) return;
    setOtpVerifying(true);
    try {
      await apiPost('/forms/email-otp/verify', { email: formData.email, code: otpCode });
      setOtpStage('verified');
      success('Email verified!');
    } catch (err) {
      notifyError(err, err instanceof ApiError ? err.message : 'Invalid or expired code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreement_accepted) {
      notifyError(null, 'Please accept the agreement to continue.');
      return;
    }
    if (otpStage !== 'verified') {
      notifyError(null, 'Please verify your email address before submitting.');
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => body.append(key, String(value)));
      zipCodes.forEach(z => body.append('zip_codes[]', z));
      body.append('radius_miles', String(radiusMiles));
      leadTypes.forEach(t => body.append('lead_type_preferences[]', t));
      languages.forEach(l => body.append('languages_spoken[]', l));
      if (turnstileToken) body.append('turnstile_token', turnstileToken);
      if (idDocument) body.append('id_document', idDocument);
      if (licenseDocument) body.append('license_document', licenseDocument);
      if (profilePhoto) body.append('profile_photo', profilePhoto);

      const res = await fetch(`${API_BASE}/forms/realtor-application`, { method: 'POST', body });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || 'Failed to submit application.');
      }
      const data: { application_reference?: string } = await res.json();
      setApplicationReference(data.application_reference ?? null);
      setSubmitted(true);
      success('Your application has been submitted successfully! Our team will review and contact you within 24-48 hours.');
    } catch (err) {
      notifyError(err, 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('realtor_application_draft', JSON.stringify(formData));
    success('Draft saved! You can continue later.');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-card p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl font-bold text-navy mb-4">Application Submitted!</h1>
            <p className="text-slate-600 text-lg mb-6">
              Thank you for applying to join our realtor network. Our team will review your application and contact you within 24-48 hours.
            </p>
            <div className="bg-gold-50 rounded-xl p-6 mb-6">
              <h3 className="font-heading font-bold text-navy mb-2">What's Next?</h3>
              <ul className="text-left text-slate-700 space-y-2">
                <li>✓ Our team reviews your application</li>
                <li>✓ We verify your license and credentials</li>
                <li>✓ A specialist contacts you for next steps</li>
                <li>✓ Once approved, you'll get access to our platform</li>
              </ul>
            </div>
            {applicationReference && (
              <p className="text-sm text-slate-500 mb-6">
                Your application reference is <strong className="text-navy">{applicationReference}</strong> — save it to{' '}
                <a href={`/realtors/application-status?ref=${applicationReference}`} className="text-gold hover:underline">
                  check your status
                </a>{' '}
                anytime.
              </p>
            )}
            <a href="/" className="inline-block bg-navy text-white font-semibold px-8 py-3 rounded-xl hover:bg-navy-600 transition-colors">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200 shadow-sm px-5 py-2.5 rounded-full mb-6 text-xs font-semibold text-slate-700">
            <span>Already registered?</span>
            <a href="/login" className="text-[#0A2647] font-bold hover:underline">
              Sign In to Your Portal →
            </a>
            <span className="text-slate-300">|</span>
            <a href="/register?role=agent" className="text-[#C9A227] font-bold hover:underline">
              Purchase Membership Plan →
            </a>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-navy mb-4">
            Join Our <span className="text-gold">Realtor Network</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Partner with Domestic Real Estate and grow your business with AI-powered tools, qualified leads, and premium support. Create your free profile or choose a membership plan.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <a
              href="/register?role=agent"
              className="bg-[#C9A227] hover:bg-[#b8911f] text-[#0A2647] font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition"
            >
              Sign Up & Purchase Plan
            </a>
            <a
              href="/login"
              className="bg-[#0A2647] hover:bg-[#0d3366] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition"
            >
              Log In to My Account
            </a>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">First Name *</label>
                  <input
                    type="text"
                    name="first_name" autoComplete="given-name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="last_name" autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="realtor-join-email" className="block text-sm font-semibold text-navy mb-2">Email *</label>
                  <div className="flex gap-2">
                    <input
                      id="realtor-join-email"
                      type="email"
                      name="email" autoComplete="email" inputMode="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={otpStage === 'verified'}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent disabled:bg-slate-50"
                    />
                    {otpStage !== 'verified' && (
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={otpSending || !formData.email}
                        className="shrink-0 px-4 py-3 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-600 transition-colors disabled:opacity-50"
                      >
                        {otpSending ? 'Sending...' : otpStage === 'sent' ? 'Resend Code' : 'Verify Email'}
                      </button>
                    )}
                  </div>
                  {otpStage === 'verified' && (
                    <p className="mt-2 text-xs font-semibold text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Email verified
                    </p>
                  )}
                  {otpStage === 'sent' && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otpVerifying || otpCode.length !== 6}
                        className="shrink-0 px-4 py-2.5 bg-gold text-navy-900 text-sm font-bold rounded-xl hover:bg-gold-400 transition-colors disabled:opacity-50"
                      >
                        {otpVerifying ? 'Checking...' : 'Confirm'}
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone" autoComplete="tel" inputMode="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Professional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Brokerage *</label>
                  <input
                    type="text"
                    name="brokerage" autoComplete="organization"
                    value={formData.brokerage}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">License Number *</label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">State *</label>
                  <input
                    type="text"
                    name="state" autoComplete="address-level1"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">City *</label>
                  <input
                    type="text"
                    name="city" autoComplete="address-level2"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zip" autoComplete="postal-code" inputMode="numeric"
                    value={formData.zip}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="years_experience"
                    value={formData.years_experience}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Service Area & Preferences */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-2">Service Area &amp; Lead Preferences</h2>
              <p className="text-sm text-slate-500 mb-6">Tell us where you work and what kinds of leads you want — this drives how leads get matched to you.</p>

              <div className="space-y-6">
                <div>
                  <label htmlFor="realtor-join-zip-input" className="block text-sm font-semibold text-navy mb-2">
                    Service Area ZIP Codes
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="realtor-join-zip-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="e.g. 90210"
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addZip(); } }}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addZip}
                      className="shrink-0 px-5 py-3 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {zipCodes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {zipCodes.map((z) => (
                        <span key={z} className="inline-flex items-center gap-1.5 bg-gold-50 text-navy text-sm font-semibold px-3 py-1.5 rounded-full">
                          {z}
                          <button type="button" onClick={() => removeZip(z)} aria-label={`Remove ${z}`} className="text-navy/60 hover:text-navy">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="realtor-join-radius" className="block text-sm font-semibold text-navy mb-2">
                    Service Radius
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RADIUS_OPTIONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRadiusMiles(r)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                          radiusMiles === r ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-slate-200 hover:border-navy'
                        }`}
                      >
                        {r} mi
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-semibold text-navy mb-2">Lead Types You Want</span>
                  <div className="flex flex-wrap gap-2">
                    {LEAD_TYPES.map((lt) => (
                      <button
                        key={lt.value}
                        type="button"
                        onClick={() => toggleLeadType(lt.value)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                          leadTypes.includes(lt.value) ? 'bg-gold text-navy-900 border-gold' : 'bg-white text-navy border-slate-200 hover:border-gold'
                        }`}
                      >
                        {lt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-semibold text-navy mb-2">Languages Spoken</span>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                          languages.includes(lang) ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-slate-200 hover:border-navy'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Business Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Current Production (Annual Volume)</label>
                  <input
                    type="text"
                    name="current_production"
                    value={formData.current_production}
                    onChange={handleChange}
                    placeholder="e.g., $5M in sales, 20 transactions"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Luxury homes, First-time buyers, Commercial"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Referral Areas</label>
                  <input
                    type="text"
                    name="referral_areas"
                    value={formData.referral_areas}
                    onChange={handleChange}
                    placeholder="e.g., Los Angeles County, Orange County"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Message (Optional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself and why you'd like to join our network..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Verification Documents</h2>
              <p className="text-sm text-slate-500 mb-4">
                Speeds up review, but not required to submit — our team can request these later if needed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Government ID</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setIdDocument(e.target.files?.[0] ?? null)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Real Estate License</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setLicenseDocument(e.target.files?.[0] ?? null)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Resume URL</label>
                  <input
                    type="url"
                    name="resume_url"
                    value={formData.resume_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePhoto(e.target.files?.[0] ?? null)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Agreement */}
            <div className="bg-gold-50 rounded-xl p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreement_accepted"
                  checked={formData.agreement_accepted}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-gold border-slate-300 rounded focus:ring-gold"
                />
                <span className="text-sm text-slate-700">
                  I agree to the <a href="/terms" className="text-gold hover:underline">Terms of Service</a> and{' '}
                  <a href="/privacy" className="text-gold hover:underline">Privacy Policy</a>. I understand that my application will be reviewed and I may be contacted regarding my submission.
                </span>
              </label>
            </div>

            <Turnstile onVerify={setTurnstileToken} className="flex justify-center" />

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading || otpStage !== 'verified'}
                title={otpStage !== 'verified' ? 'Verify your email above first' : undefined}
                className="flex-1 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-bold py-4 rounded-xl hover:shadow-gold transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : otpStage !== 'verified' ? 'Verify Email to Continue' : 'Join Now'}
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 bg-slate-200 text-navy font-semibold py-4 rounded-xl hover:bg-slate-300 transition-colors"
              >
                Save Draft
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="flex-1 text-center bg-navy text-white font-semibold py-4 rounded-xl hover:bg-navy-600 transition-colors"
              >
                Schedule Call
              </a>
              <button
                type="button"
                onClick={() => {
                  const event = new CustomEvent('open-ai-chat', { detail: { type: 'realtor' } });
                  window.dispatchEvent(event);
                }}
                className="flex-1 bg-white border-2 border-gold text-gold font-semibold py-4 rounded-xl hover:bg-gold-50 transition-colors"
              >
                Talk with AI
              </button>
            </div>
          </form>
        </div>
      </div>

      <ChatWidgetWrapper context="realtor" leadType="realtor" />
    </div>
  );
}
