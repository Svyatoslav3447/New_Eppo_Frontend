import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

interface Slide {
  id: number;
  title: string;
  image: string;
}

interface Category {
  id: number;
  name: string;
  image: string;
}

export default function EditHome() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [slider, setSlider] = useState<Slide[]>([]);
  const categoryFileRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const sliderFileRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    axios.get(`${API}/slider`)
      .then(res => setSlider(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    axios.get(`${API}/categories`)
      .then(res => setCategories(res.data))
      .catch(console.error);
  }, []);

  const handleTitleChange = (id: number, title: string) => {
    setSlider(prev => prev.map(s => s.id === id ? { ...s, title } : s));

    axios.put(`${API}/slider/${id}`, { title })
      .then(res => setSlider(prev => prev.map(s => s.id === id ? res.data : s)))
      .catch(console.error);
  };

  const handleImageChange = (id: number, file: File) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(blob => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("image", blob, file.name.replace(/\.\w+$/, ".webp"));

        axios.put(`${API}/slider/${id}`, formData)
          .then(res => setSlider(prev => prev.map(s => s.id === id ? res.data : s)))
          .catch(console.error);
      }, "image/webp", 0.9);
    };
  };

  const handleAddSlide = () => {
    const title = prompt("Назва нового слайду");
    if (!title) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      if (!input.files || !input.files[0]) return;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", input.files[0]);

      axios.post(`${API}/slider`, formData)
        .then(res => setSlider(prev => [...prev, res.data]))
        .catch(console.error);
    };

    input.click();
  };

  const handleDeleteSlide = (id: number) => {
    axios.delete(`${API}/slider/${id}`)
      .then(() => setSlider(prev => prev.filter(s => s.id !== id)))
      .catch(console.error);
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Редагувати Категорії</h2>

      <div className="space-y-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border p-4 rounded shadow-sm hover:shadow-md transition"
          >
            <img
              src={`${API}/images/categories/${cat.name}.webp`}
              alt={cat.name}
              className="w-full sm:w-24 h-24 object-cover rounded"
            />

            <span className="font-medium text-lg w-full sm:w-48 text-center sm:text-left">
              {cat.name}
            </span>

            <button
              onClick={() => categoryFileRefs.current[cat.id]?.click()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Змінити фото
            </button>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={el => { categoryFileRefs.current[cat.id] = el; }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  const formData = new FormData();
                  formData.append("image", e.target.files[0]);

                  axios.put(`${API}/categories/${cat.id}/image`, formData)
                    .then(() => alert("Фото оновлено!"))
                    .catch(console.error);
                }
              }}
            />
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Редагувати слайдер</h2>

      <button
        onClick={handleAddSlide}
        className="w-full sm:w-auto mb-4 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
      >
        Додати слайд
      </button>

      <div className="space-y-4">
        {slider.map(s => (
          <div
            key={s.id}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border p-4 rounded shadow-sm hover:shadow-md transition"
          >
            <img
              src={`${API}${s.image}`}
              alt={s.title}
              className="w-full sm:w-32 h-20 object-cover rounded"
            />

            <input
              type="text"
              value={s.title}
              onChange={e => handleTitleChange(s.id, e.target.value)}
              className="border p-2 rounded w-full sm:w-48"
            />

            <button
              onClick={() => sliderFileRefs.current[s.id]?.click()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Змінити фото
            </button>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={el => { sliderFileRefs.current[s.id] = el; }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleImageChange(s.id, e.target.files[0]);
                }
              }}
            />

            <button
              onClick={() => handleDeleteSlide(s.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Видалити
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
