// utils/sizeMapping.js

// Talle canónico → todas las formas equivalentes
export const sizeEquivalences = {
  // === Adulto Letras ===
  "0": ["XS", "0"],            // 0 es XS
  "1": ["S", "1","1/S"],
  "2": ["M", "2", "2/M"],
  "3": ["L", "3", "3/L"],
  "4": ["XL", "4"],
  "5": ["XXL", "5","2XL","5/XXL"],
  "6": ["3XL", "XXXL", "6","6/XXXL"],
  "7": ["4XL", "7", "4XL"],
  "8": ["5XL", "8"],
  "9": ["6XL", "9"],
  "10": ["7XL", "8","7XL"],
  "11": ["8XL", "11"],
  "12": ["9XL", "12"],  
  "13": ["10XL", "13"],
  "14": ["11XL", "14"],
  "15": ["12XL", "15"],
  "16": ["13XL", "16"],

  // === Único ===
  "ÚNICO": ["ÚNICO", "UNICO", "U", "UNICOS"],

  // === Adulto Europeo ===
  "34": ["34"],
  "36": ["36"],
  "38": ["38"],
  "40": ["40"],
  "42": ["42"],
  "44": ["44"],
  "46": ["46"],
  "48": ["48"],
  "50": ["50"],
  "52": ["52"],
  "54": ["54"],
  "58": ["58"],
  "60": ["60"],

  // === Niños ===
  "4": ["4"],
  "6": ["6"],
  "8": ["8"],
  "10": ["10"],
  "12": ["12"],
  "14": ["14"],
  "16": ["16"],
  "18": ["18"],

  // === Bebés ===
  "0M": ["0M"],
  "3M": ["3M"],
  "6M": ["6M"],
  "9M": ["9M"],
  "12M": ["12M"],
  "18M": ["18M"],
  "24M": ["24M"],
  "36M": ["36M"],
  "1B": ["1"],    // si usás 1,2,3 para bebés
  "2B": ["2"],
  "3B": ["3"],
  "4B": ["4"],
  "5B": ["5"]
};

// 🔎 Función para normalizar
export const normalizeSize = (sizeRaw) => {
  if (!sizeRaw) return "";
  const s = sizeRaw.toUpperCase().trim();

  // buscar el talle canónico
  for (const [canonical, aliases] of Object.entries(sizeEquivalences)) {
    if (aliases.includes(s)) return canonical;
  }

  return s; // si no coincide, lo dejamos igual
};
