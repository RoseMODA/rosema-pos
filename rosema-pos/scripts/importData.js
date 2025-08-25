// scripts/importData.js
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../src/services/firebase.js";

// Para rutas absolutas correctas
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer archivos JSON manualmente
const articulos = JSON.parse(
  readFileSync(join(__dirname, "../data/articulos.json"), "utf8")
);
const proveedores = JSON.parse(
  readFileSync(join(__dirname, "../data/proveedores.json"), "utf8")
);

async function importar() {
  console.log("=== Importación iniciada ===");

  // Importar artículos
  let countArt = 0;
  for (const [id, articulo] of Object.entries(articulos)) {
    await setDoc(doc(db, "articulos", id), articulo);
    countArt++;
  }
  console.log(`✔ ${countArt} artículos importados`);

  // Importar proveedores
  let countProv = 0;
  for (const proveedor of proveedores) {
    await setDoc(doc(db, "proveedores", proveedor.id.toString()), proveedor);
    countProv++;
  }
  console.log(`✔ ${countProv} proveedores importados`);

  console.log("=== Importación completada ===");
}

importar().catch((error) => {
  console.error("❌ Error en importación:", error);
});
