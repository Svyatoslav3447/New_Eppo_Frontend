import React, { useState } from "react";
import { register } from "../api/auth";
import InputField from "../components/InputField";
import { useNavigate } from "react-router-dom";
import { formatPhone } from "../utils/formatPhone";
import { motion } from "framer-motion"; // бібліотека для анімацій

export default function Register() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedPhone = formatPhone(phone);
      const res = await register(formattedPhone, password, firstName, lastName);
      localStorage.setItem("token", res.data.access_token);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/"); 
    } catch (err: any) {
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-purple-100 via-white to-blue-100 p-4">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-700 animate-pulse">Реєстрація</h2>

        <InputField label="Ім'я" value={firstName} onChange={setFirstName} placeholder="Ім'я" />
        <InputField label="Прізвище" value={lastName} onChange={setLastName} placeholder="Прізвище" />
        <InputField label="Телефон" value={phone} onChange={setPhone} placeholder="+380XXXXXXXXX" />
        <InputField label="Пароль" type="password" value={password} onChange={setPassword} placeholder="******" />

        <motion.button
          type="submit"
          className="w-full bg-purple-500 text-white py-2 rounded-lg mt-4 shadow-lg hover:bg-purple-600 hover:scale-105 transition transform"
          whileTap={{ scale: 0.95 }}
        >
          Зареєструватися
        </motion.button>

        <p className="text-sm mt-4 text-center">
          Вже маєте акаунт? <span className="text-purple-600 cursor-pointer hover:underline" onClick={() => navigate("/login")}>Увійти</span>
        </p>
      </motion.form>
    </div>
  );
}