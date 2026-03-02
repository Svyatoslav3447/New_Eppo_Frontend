export default function About() {
  return (
    <div className="max-w-6xl mx-auto p-8 sm:p-12 space-y-10">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-purple-700 tracking-tight drop-shadow-md">
        Про нас
      </h1>

      <div className="space-y-6 text-gray-700 text-lg sm:text-xl leading-relaxed">
        <p>
          Наш оновлений інтернет-магазин <span className="font-semibold text-purple-600">ЕРРО</span> пропонує стильну та модну біжутерію, яка підкреслить вашу особистість. Сережки, каблучки, браслети, підвіски, ланцюжки – усе для вашого унікального стилю. Завдяки багаторічному досвіду та налагодженим зв'язкам з виробниками ми пропонуємо якісний товар за найкращими цінами в Україні.
        </p>

        <p>
          У нас Ви знайдете товари на будь-який гаманець — від бюджетних до ексклюзивних, жіночу та чоловічу біжутерію, як оптовим, так і роздрібним покупцям. Різноманітність стилів, форм та кольорів допоможе обрати прикрасу кожному.
        </p>

        <p>
          Замовляйте продукцію у будь-який зручний час. Оберіть вироби у каталозі, вкажіть розмір та кількість, додайте в кошик і оформіть замовлення, обравши спосіб оплати та відділення <span className="font-semibold text-purple-600">Нової Пошти</span>.
        </p>

        <p className="bg-purple-50 p-4 rounded-lg shadow-inner">
          <span className="font-semibold text-red-500">Звертаємо Вашу увагу:</span> мінімальна сума замовлення складає <span className="font-bold text-red-600">800 грн</span>.
        </p>

        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-3">
          <h2 className="text-2xl font-semibold text-purple-700">Системи знижок:</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-lg">
            <li>2000 грн – 3%</li>
            <li>5000 грн – 7%</li>
            <li>від 10000 грн – 12%</li>
          </ul>
          <p className="text-gray-600 mt-2">Чим більше Ви замовляєте, тим вигіднішою буде покупка!</p>
        </div>

        <p>
          Ми пропонуємо зручні способи оплати: передоплата або післяплата. Доставка по Україні здійснюється <span className="font-semibold text-purple-600">Новою Поштою</span> протягом 1-3 днів за тарифами перевізника.
        </p>

        <p className="text-center mt-6 text-xl font-semibold text-purple-700">
          Будемо раді Вас бачити на нашому сайті. Приємних покупок!
        </p>
      </div>
    </div>
  );
}
