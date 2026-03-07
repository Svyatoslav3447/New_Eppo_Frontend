import { motion } from "framer-motion";
import { FiShoppingCart } from "react-icons/fi";
import type { Product } from "../api/products";
import { useState } from "react";
const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/api$/, ""); 

interface ProductCardProps {
  product: Product;
  quantity: number;
  changeQuantity: (id: number, delta: number) => void;
  setQuantity: (id: number, value: number) => void;
  addToCart: (item: { id: number; sku: string; price_grn: number; quantity: number; selectedParams?: Record<number, string> }) => void;
}

export function ProductCard({ product, quantity, changeQuantity, setQuantity, addToCart }: ProductCardProps) {
  const [selectedParams, setSelectedParams] = useState<{ [paramId: number]: string }>(
    () => {
      const initial: { [paramId: number]: string } = {};
      product.parameters?.forEach(p => {
        if (p.values && p.values.length > 0) {
          initial[p.parameter.id] = p.values[0];
        }
      });
      return initial;
    }
  );
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col group p-4"
    >
      {/* IMAGE */}
      <motion.div
        className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={`${BASE_URL}/images/products/${product.sku}.webp`}
          alt={product.sku}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </motion.div>

      {/* INFO */}
      <div className="mt-3 flex flex-col items-center text-center">
        <h3 className="text-gray-900 font-bold text-sm sm:text-lg truncate">{product.sku}</h3>
        <span className="text-purple-700 font-extrabold text-xl sm:text-2xl mt-1">{product.price_grn} ₴</span>

        {/* ПАРАМЕТРИ */}
        {product.parameters && product.parameters.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm text-gray-600">
            {product.parameters.map(p => (
              <div key={p.parameter.id} className="flex flex-col items-center">
                <label className="text-gray-500 text-xs">{p.parameter.name}</label>
                <select
                  value={selectedParams[p.parameter.id]}
                  onChange={(e) =>
                    setSelectedParams(prev => ({ ...prev, [p.parameter.id]: e.target.value }))
                  }
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  {p.values.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUANTITY */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          onClick={() => changeQuantity(product.id, -1)}
          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-purple-50 transition"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(product.id, Math.max(1, Number(e.target.value)))}
          className="w-16 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300"
        />
        <button
          onClick={() => changeQuantity(product.id, 1)}
          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-purple-50 transition"
        >
          +
        </button>
      </div>

      {/* ADD TO CART BUTTON — сучасний градієнт */}
      <motion.button
        onClick={() => addToCart({
                        id: product.id,
                        sku: product.sku,
                        price_grn: product.price_grn,
                        quantity,
                        selectedParams
                      })}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 w-full p-3 rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden"
        aria-label={`Додати ${product.sku} до кошика`}
      >
        {/* Градієнт фону */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl blur-sm opacity-60"></div>
        
        {/* Іконка поверх */}
        <FiShoppingCart size={26} className="relative text-white drop-shadow-lg" />
      </motion.button>
    </motion.div>
  );

}
