"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/Toast";
import AdminLayout from "@/components/admin/AdminLayout";

const FORM_TYPES = [
  { value: "contact", label: "Contact Form" },
  { value: "service_request", label: "Service Request" },
  { value: "newsletter", label: "Newsletter Signup" },
  { value: "property_inquiry", label: "Property Inquiry" },
  { value: "agent_application", label: "Agent Application" },
  { value: "callback_request", label: "Callback Request" },
  { value: "feedback", label: "Feedback Form" },
];

interface ValidationResult {
  field: string;
  rule: string;
  valid: boolean;
  message: string;
}

interface TestResult {
  success: boolean;
  validation_results: ValidationResult[];
  db_inserted: boolean;
  db_record: Record<string, unknown> | null;
  email_sent: boolean;
  email_to: string | null;
  errors: string[];
}

export default function FormsTestingPage() {
  const { notifyError } = useToast();
  const [selectedForm, setSelectedForm] = useState("");
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const testFormFields: Record<string, { name: string; type: string; sample: string }[]> = {
    contact: [
      { name: "name", type: "text", sample: "John Doe" },
      { name: "email", type: "email", sample: "john@example.com" },
      { name: "phone", type: "tel", sample: "+15551234567" },
      { name: "subject", type: "text", sample: "General Inquiry" },
      { name: "message", type: "textarea", sample: "I would like to know more about your services." },
    ],
    service_request: [
      { name: "name", type: "text", sample: "Jane Smith" },
      { name: "email", type: "email", sample: "jane@example.com" },
      { name: "service_type", type: "select", sample: "buying" },
      { name: "budget", type: "text", sample: "500000" },
      { name: "location", type: "text", sample: "Los Angeles, CA" },
      { name: "description", type: "textarea", sample: "Looking for a 3-bedroom home." },
    ],
    newsletter: [
      { name: "email", type: "email", sample: "subscriber@example.com" },
      { name: "first_name", type: "text", sample: "Subscriber" },
    ],
    property_inquiry: [
      { name: "name", type: "text", sample: "Bob Wilson" },
      { name: "email", type: "email", sample: "bob@example.com" },
      { name: "property_id", type: "text", sample: "1" },
      { name: "message", type: "textarea", sample: "Is this property still available?" },
    ],
    agent_application: [
      { name: "full_name", type: "text", sample: "Sarah Johnson" },
      { name: "email", type: "email", sample: "sarah@example.com" },
      { name: "phone", type: "tel", sample: "+15559876543" },
      { name: "license_number", type: "text", sample: "RE-12345" },
      { name: "experience_years", type: "text", sample: "5" },
    ],
    callback_request: [
      { name: "name", type: "text", sample: "Mike Davis" },
      { name: "phone", type: "tel", sample: "+15551112222" },
      { name: "preferred_time", type: "text", sample: "2:00 PM - 4:00 PM" },
    ],
    feedback: [
      { name: "name", type: "text", sample: "Feedback User" },
      { name: "email", type: "email", sample: "feedback@example.com" },
      { name: "rating", type: "text", sample: "5" },
      { name: "comments", type: "textarea", sample: "Great service!" },
    ],
  };

  function autoFill() {
    const fields = testFormFields[selectedForm] || [];
    const data: Record<string, string> = {};
    fields.forEach((f) => { data[f.name] = f.sample; });
    setTestData(data);
  }

  async function runFullTest() {
    setLoading(true);
    setTestResult(null);
    setValidationResults([]);
    try {
      const data = await apiPost<TestResult>("/admin/testing/forms/test", {
        form_type: selectedForm,
        data: testData,
      });
      setTestResult(data);
      if (data.validation_results) setValidationResults(data.validation_results);
    } catch (e: any) {
      setTestResult({
        success: false,
        validation_results: [],
        db_inserted: false,
        db_record: null,
        email_sent: false,
        email_to: null,
        errors: [e?.message || "Test failed"],
      });
    }
    setLoading(false);
  }

  async function runValidation() {
    setValidating(true);
    setValidationResults([]);
    try {
      const data = await apiPost<{ validation_results: ValidationResult[] }>("/admin/testing/forms/validate", {
        form_type: selectedForm,
        data: testData,
      });
      setValidationResults(data.validation_results || []);
    } catch (e) {
      // Report the failure rather than showing an empty (apparently clean) result set.
      setValidationResults([]);
      notifyError(e, "The form validation test could not be run. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  const fields = testFormFields[selectedForm] || [];

  return (
    <AdminLayout title="Form Testing Center">
      <div className="space-y-6">
        {/* Form Selection + Auto-Fill */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-[#0A2647] mb-4">Test Form Selection</h3>
          <div className="flex items-center gap-3">
            <select
              value={selectedForm}
              onChange={(e) => { setSelectedForm(e.target.value); setTestData({}); setValidationResults([]); setTestResult(null); }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
            >
              <option value="">Select a form to test...</option>
              {FORM_TYPES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <button
              onClick={autoFill}
              disabled={!selectedForm}
              className="px-4 py-2 text-sm font-semibold text-[#0A2647] bg-[#C9A227] rounded-lg hover:bg-[#b8911f] transition-colors disabled:opacity-50"
            >
              Auto-Fill Test Data
            </button>
          </div>
        </div>

        {selectedForm && (
          <>
            {/* Form Data Input */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-[#0A2647] mb-4">Form Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field.name.replace(/_/g, " ")}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={testData[field.name] || ""}
                        onChange={(e) => setTestData({ ...testData, [field.name]: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={testData[field.name] || ""}
                        onChange={(e) => setTestData({ ...testData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={runValidation}
                  disabled={validating}
                  className="px-4 py-2 text-sm font-semibold text-[#0A2647] border border-[#0A2647] rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {validating ? "Validating..." : "Test Validation"}
                </button>
                <button
                  onClick={runFullTest}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#8B1E3F] rounded-lg hover:bg-[#6d1832] transition-colors disabled:opacity-50"
                >
                  {loading ? "Running Test..." : "Run Full Test"}
                </button>
              </div>
            </div>

            {/* Validation Results */}
            {validationResults.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-[#0A2647] mb-4">Validation Results</h3>
                <div className="space-y-2">
                  {validationResults.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className={`w-2 h-2 rounded-full ${v.valid ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-sm font-medium text-[#0A2647] w-32">{v.field}</span>
                      <span className="text-sm text-slate-600 flex-1">{v.rule}</span>
                      <span className={`text-xs font-semibold ${v.valid ? "text-green-600" : "text-red-600"}`}>
                        {v.valid ? "PASS" : "FAIL"}
                      </span>
                      {!v.valid && <span className="text-xs text-red-500">{v.message}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Test Results */}
            {testResult && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-[#0A2647] mb-4">Test Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className={`p-4 rounded-lg text-center ${testResult.db_inserted ? "bg-green-50" : "bg-red-50"}`}>
                    <p className="text-sm font-medium text-slate-600 mb-1">Database Insert</p>
                    <p className={`text-lg font-bold ${testResult.db_inserted ? "text-green-600" : "text-red-600"}`}>
                      {testResult.db_inserted ? "SUCCESS" : "FAILED"}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${testResult.email_sent ? "bg-green-50" : "bg-amber-50"}`}>
                    <p className="text-sm font-medium text-slate-600 mb-1">Email Notification</p>
                    <p className={`text-lg font-bold ${testResult.email_sent ? "text-green-600" : "text-amber-600"}`}>
                      {testResult.email_sent ? "SENT" : "NOT SENT"}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${testResult.success ? "bg-green-50" : "bg-red-50"}`}>
                    <p className="text-sm font-medium text-slate-600 mb-1">Overall</p>
                    <p className={`text-lg font-bold ${testResult.success ? "text-green-600" : "text-red-600"}`}>
                      {testResult.success ? "PASSED" : "FAILED"}
                    </p>
                  </div>
                </div>
                {testResult.db_record && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-600 mb-2">Inserted Record:</p>
                    <pre className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 overflow-x-auto max-h-40">
                      {JSON.stringify(testResult.db_record, null, 2)}
                    </pre>
                  </div>
                )}
                {testResult.email_to && (
                  <p className="mt-3 text-sm text-slate-600">Email sent to: <strong>{testResult.email_to}</strong></p>
                )}
                {testResult.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    {testResult.errors.map((err, i) => (
                      <p key={i} className="text-sm text-red-700">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!selectedForm && (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-slate-400">
            Select a form type above to begin testing.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
