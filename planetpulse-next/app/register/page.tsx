"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  type Role = "Member" | "Admin" | "Partner" | "Validator";
  
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Member" as Role,
    nationality: "",
    gdprConsent: false,
    dataProcessingConsent: false,
    marketingConsent: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate GDPR consent
    if (!form.gdprConsent) {
      setError("You must agree to the GDPR consent to create an account.");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Failed to register.");
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-md shadow-md w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Account created successfully! Redirecting to login...
          </div>
        )}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min. 8 characters)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="nationality"
          value={form.nationality}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="border-t pt-4 mb-4">
          <h3 className="font-semibold mb-3 text-gray-700">Data Processing Consent</h3>
          
          <div className="mb-3">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="gdprConsent"
                checked={form.gdprConsent}
                onChange={handleChange}
                required
                className="mt-1 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                <strong>Required:</strong> I agree to the processing of my personal data 
                for account creation and platform functionality. I understand my rights 
                under GDPR including access, rectification, and erasure. 
                <Link href="/privacy-policy" className="text-blue-600 hover:underline ml-1">
                  Read Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <div className="mb-3">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="dataProcessingConsent"
                checked={form.dataProcessingConsent}
                onChange={handleChange}
                className="mt-1 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                <strong>Optional:</strong> I consent to the processing of my data for 
                platform improvements and analytics (you can withdraw this consent at any time)
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="marketingConsent"
                checked={form.marketingConsent}
                onChange={handleChange}
                className="mt-1 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                <strong>Optional:</strong> I consent to receiving marketing communications 
                and newsletters about environmental initiatives
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !form.gdprConsent}
          className={`w-full py-3 rounded font-medium transition-colors ${
            isLoading || !form.gdprConsent
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isLoading ? "Creating Account..." : "Register"}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          By creating an account, you agree to our data processing practices 
          in accordance with GDPR regulations.
        </p>

        <p className="text-center mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">
            Already have an account? Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
