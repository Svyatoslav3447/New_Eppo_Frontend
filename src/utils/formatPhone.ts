export function formatPhone(phone: string): string {
  // Прибираємо всі нецифрові символи
  let digits = phone.replace(/\D/g, "");

  // Якщо починається з 0 і 10 цифр
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = "38" + digits; // додаємо код країни
  }

  // Якщо починається з 380 або інші 12 цифр – залишаємо як є
  return digits;
}