"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
  type Role = "Member" | "Admin" | "Partner" | "Validator";
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member" as Role,
    nationality: "",
  });

  const [consent, setConsent] = useState({
    data_processing: false,
    marketing: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsent({ ...consent, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required consents
      if (!consent.data_processing) {
        setError("Data processing consent is required for registration.");
        setLoading(false);
        return;
      }

      const response = await axios.post("/api/register", {
        ...form,
        consent
      });

      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-md shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Create an Account</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm font-medium">
              Account created successfully! Redirecting to login...
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password (min. 8 characters)"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality
            </label>
            <select
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-900"
            >
              <option value="">Select your nationality</option>
              <option value="Angolan">Angolan</option>
              <option value="Brazilian">Brazilian</option>
              <option value="British">British</option>
              <option value="Canadian">Canadian</option>
              <option value="Cape Verdean">Cape Verdean</option>
              <option value="Chinese">Chinese</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Guinean">Guinean</option>
              <option value="Indian">Indian</option>
              <option value="Italian">Italian</option>
              <option value="Mozambican">Mozambican</option>
              <option value="Portuguese">Portuguese</option>
              <option value="São Toméan">São Toméan</option>
              <option value="Spanish">Spanish</option>
              <option value="Swiss">Swiss</option>
              <option value="Timorese">Timorese</option>
              <option value="Turkish">Turkish</option>
              <option value="Ukrainian">Ukrainian</option>
              <option value="UK">UK</option>
              <option value="US">US</option>
            </select>
          </div>
        </div>

        {/* GDPR Consent Section */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-bold mb-3 text-gray-800 text-base">
            Data Protection & Privacy (GDPR)
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-start text-gray-700">
              <input
                type="checkbox"
                name="data_processing"
                checked={consent.data_processing}
                onChange={handleConsentChange}
                required
                className="mr-2 mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm leading-relaxed">
                <strong className="text-gray-900">Required:</strong> I consent to the processing of my personal data for account management and platform functionality in accordance with GDPR regulations.
              </span>
            </label>

            <label className="flex items-start text-gray-700">
              <input
                type="checkbox"
                name="marketing"
                checked={consent.marketing}
                onChange={handleConsentChange}
                className="mr-2 mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm leading-relaxed">
                <em className="text-gray-900">Optional:</em> I consent to receive marketing communications and platform updates. You can withdraw this consent at any time.
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            Your data will be stored securely and used only for the purposes you've consented to. 
            You have the right to access, rectify, or delete your data at any time.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !consent.data_processing}
          className={`w-full py-3 rounded-lg font-semibold text-base transition-all duration-200 mt-6 ${
            loading || !consent.data_processing
              ? "bg-gray-400 cursor-not-allowed text-gray-600" 
              : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          }`}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
