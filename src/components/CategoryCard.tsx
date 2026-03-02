import { motion } from "framer-motion";

interface Category {
  id: number;
  name: string;
  image: string;
}

export function CategoryCard({
  category,
  onClick,
}: {
  category: Category;
  onClick: () => void;
}) {
  return (
    <motion.article
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.25 }}
      className="
        w-full
        cursor-pointer
        rounded-2xl
        overflow-hidden
        bg-white
        shadow-sm
        hover:shadow-xl
      "
    >
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={`http://localhost:3000/images/categories/${category.name}.webp`}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>

      <div className="py-4 text-center font-semibold text-gray-900 text-base">
        {category.name}
      </div>
    </motion.article>
  );
}