import { useNavigate } from "react-router-dom";
import { Diamond } from "../components/Diamond";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    bg-gradient-to-b from-purple-50 to-purple-100">

      <Diamond />

      <h1 className="text-6xl font-extrabold mt-8 text-purple-700">404</h1>

      <p className="mt-3 text-gray-600">
        Сторінку не знайдено
      </p>

      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 rounded-xl
                   bg-purple-600 text-white font-semibold
                   hover:bg-purple-500 transition"
      >
        На головну
      </button>
    </div>
  );
}