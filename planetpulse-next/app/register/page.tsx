"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  type Role = "Member" | "Admin" | "Partner" | "Validator";
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member" as Role,
    nationality: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        router.push("/login"); // Redirecionar após registo bem-sucedido
      } else {
        const data = await res.json();
        setError(data.message || "Failed to register.");
      }
    } catch (err: any) {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-md shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm mb-4">Account created successfully!</p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded"
        />


        <select
          name="nationality"
          value={form.nationality}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 border rounded"
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

        <p className="text-xs text-gray-500 mt-4 text-center">
          After submitting, your account will be created in the system.
        </p>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
