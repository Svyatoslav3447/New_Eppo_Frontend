export default function Contacts() {
  return (
    <div className="max-w-4xl mx-auto p-8 sm:p-12 space-y-10">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-purple-700 tracking-tight drop-shadow-md">
        Контакти
      </h1>

      <div className="space-y-6 text-gray-700 text-lg sm:text-xl leading-relaxed">
        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-3">
          <p><span className="font-semibold text-purple-600">Інтернет-магазин:</span> Eppo</p>
          <p><span className="font-semibold text-purple-600">Місто:</span> Івано-Франківськ</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-3">
          <h2 className="text-2xl font-semibold text-purple-700">Телефони:</h2>
          <ul className="list-disc list-inside text-gray-700 text-lg space-y-1">
            <li>Vodafone: <a href="tel:+380996247225" className="text-blue-600 hover:underline">+380996247225</a></li>
            <li>Київстар: <a href="tel:+380682128618" className="text-blue-600 hover:underline">+380682128618</a></li>
            <li>Київстар: <a href="tel:+380682516511" className="text-blue-600 hover:underline">+380682516511</a></li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-3">
          <h2 className="text-2xl font-semibold text-purple-700">E-mail:</h2>
          <p><a href="mailto:eppo.market@gmail.com" className="text-blue-600 hover:underline">eppo.market@gmail.com</a></p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-3">
          <h2 className="text-2xl font-semibold text-purple-700">Графік роботи:</h2>
          <ul className="list-disc list-inside text-gray-700 text-lg space-y-1">
            <li>Пн-Пт: 9:00 - 16:00</li>
            <li>Субота: вихідний</li>
            <li>Неділя: вихідний</li>
          </ul>
        </div>

        <p className="text-center text-xl font-semibold text-purple-700 mt-6">
          Ми завжди раді відповісти на ваші запитання!
        </p>
      </div>
    </div>
  );
}