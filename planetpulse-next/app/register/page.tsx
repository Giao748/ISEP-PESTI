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
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm mb-4">Account created successfully! Redirecting to login...</p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded focus:border-blue-500 focus:outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded focus:border-blue-500 focus:outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min. 8 characters)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full p-3 mb-4 border rounded focus:border-blue-500 focus:outline-none"
        />

        <select
          name="nationality"
          value={form.nationality}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select Nationality</option>
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

        {/* GDPR Consent Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-3 text-gray-800">Data Protection & Privacy (GDPR)</h3>
          
          <label className="flex items-start mb-3 text-sm">
            <input
              type="checkbox"
              name="data_processing"
              checked={consent.data_processing}
              onChange={handleConsentChange}
              required
              className="mr-2 mt-1"
            />
            <span>
              <strong>Required:</strong> I consent to the processing of my personal data for account management and platform functionality in accordance with GDPR regulations.
            </span>
          </label>

          <label className="flex items-start text-sm">
            <input
              type="checkbox"
              name="marketing"
              checked={consent.marketing}
              onChange={handleConsentChange}
              className="mr-2 mt-1"
            />
            <span>
              <em>Optional:</em> I consent to receive marketing communications and platform updates. You can withdraw this consent at any time.
            </span>
          </label>
        </div>

        <p className="text-xs text-gray-500 mb-4 text-center">
          Your data will be stored securely and used only for the purposes you've consented to. 
          You have the right to access, rectify, or delete your data at any time.
        </p>

        <button
          type="submit"
          disabled={loading || !consent.data_processing}
          className={`w-full py-2 rounded font-medium ${
            loading || !consent.data_processing
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          } text-white transition-colors`}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>
    </div>
  );
}
