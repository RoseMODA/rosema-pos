// utils/sizeOrder.js
export const sizeOrder = [
  // Adulto numeros
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16",

  // Único
  "ÚNICO",

  // Adulto europeo
  "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "58", "60",

  // Niños
  "4", "6", "8", "10", "12", "14", "16", "18",

  // Bebés
  "0M", "3M", "6M", "9M", "12M", "18M", "24M", "36M", "1B", "2B", "3B", "4B", "5B"
];

export const sortSizes = (a, b) => {
  const ia = sizeOrder.indexOf(a);
  const ib = sizeOrder.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b); // ninguno está en el orden → ordenar alfabéticamente
  if (ia === -1) return 1; // a fuera de orden → va al final
  if (ib === -1) return -1; // b fuera de orden → va al final
  return ia - ib;
};
