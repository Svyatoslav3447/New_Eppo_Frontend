import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Slider } from "../components/Slider";
import { CategoryCard } from "../components/CategoryCard";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../api/products";
import { motion, type Variants } from "framer-motion";

interface Category {
  id: number;
  name: string;
  image: string;
}

export default function Home() {
  const { addToCart } = useCart();
  const [slider, setSlider] = useState([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const changeQuantity = (id: number, delta: number) =>
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }));
  const setQuantity = (id: number, value: number) =>
    setQuantities(prev => ({ ...prev, [id]: value }));

  useEffect(() => {
    axios.get("http://localhost:3000/slider").then(res => setSlider(res.data)).catch(console.error);
    axios.get("http://localhost:3000/categories").then(res => setCategories(res.data)).catch(console.error);
    axios.get("http://localhost:3000/products").then(res => setNewProducts(res.data.slice(-4).reverse())).catch(console.error);
    axios.get("http://localhost:3000/products/popular").then(res => setPopularProducts(res.data.slice(0,4))).catch(console.error);
  }, []);

  const categoryContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const categoryItemVariants: Variants = {
    hidden: {
      scale: 0.96,
    },
    visible: {
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="space-y-16">

      {/* Hero Section */}
      <div className="pt-[24px]">
        {slider.length > 0 && <Slider slides={slider} />}
      </div>
      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          Категорії
        </h2>

        <motion.div
          variants={categoryContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-5"
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {categories.map(cat => (
            <motion.div
              key={cat.id}
              variants={categoryItemVariants}
              className="flex-shrink-0"
              style={{ width: "min(280px, 100%)" }}
            >
              <CategoryCard
                category={cat}
                onClick={() => navigate(`/products?categoryId=${cat.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* New Products */}
      <section className="max-w-7xl mx-auto px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          Нові товари
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newProducts
            .filter(p => !p.is_hidden)
            .map(p => (
              <ProductCard
                key={p.id}
                product={p}
                quantity={quantities[p.id] ?? 1}
                changeQuantity={changeQuantity}
                setQuantity={setQuantity}
                addToCart={addToCart}
              />
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="max-w-7xl mx-auto px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          Популярні товари
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {popularProducts
            .filter(p => !p.is_hidden)
            .map(p => (
              <ProductCard
                key={p.id}
                product={p}
                quantity={quantities[p.id] ?? 1}
                changeQuantity={changeQuantity}
                setQuantity={setQuantity}
                addToCart={addToCart}
              />
          ))}
        </div>
      </section>
    </div>
  );
}