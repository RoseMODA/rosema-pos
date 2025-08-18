import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { decreaseProductsStock } from "./productsService";

/**
 * Servicio para gestión de ventas en Firestore
 * Maneja CRUD de ventas para el sistema POS Rosema
 */

const SALES_COLLECTION = "sales";
const PENDING_SALES_COLLECTION = "pendingSales";

/**
 * Crear una nueva venta
 * @param {Object} saleData - Datos de la venta
 * @returns {Promise<string>} ID de la venta creada
 */
export const createSale = async (saleData) => {
  try {
    const saleToSave = {
      ...saleData,
      createdAt: Timestamp.now(),
      status: "completed",
      saleNumber: await generateSaleNumber(),
    };

    // Guardar la venta
    const docRef = await addDoc(collection(db, SALES_COLLECTION), saleToSave);

    // Descontar stock de productos
    if (saleData.items && saleData.items.length > 0) {
      const stockItems = saleData.items
        .filter((item) => item.productId) // Solo productos registrados
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

      if (stockItems.length > 0) {
        await decreaseProductsStock(stockItems);
      }
    }

    return docRef.id;
  } catch (error) {
    console.error("Error al crear venta:", error);
    throw new Error("No se pudo completar la venta");
  }
};

/**
 * Generar número de venta único
 * @returns {Promise<string>} Número de venta
 */
const generateSaleNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  // Obtener ventas del día para generar número secuencial
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const q = query(
    collection(db, SALES_COLLECTION),
    where("createdAt", ">=", Timestamp.fromDate(todayStart)),
    where("createdAt", "<", Timestamp.fromDate(todayEnd))
  );

  const querySnapshot = await getDocs(q);
  const dailyCount = querySnapshot.size + 1;

  return `${dateStr}-${dailyCount.toString().padStart(3, "0")}`;
};

/**
 * Obtener todas las ventas
 * @returns {Promise<Array>} Lista de ventas
 */
export const getAllSales = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, SALES_COLLECTION), orderBy("createdAt", "desc"))
    );

    const sales = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sales.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return sales;
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    throw new Error("No se pudieron cargar las ventas");
  }
};

/**
 * Obtener ventas por rango de fechas
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Promise<Array>} Ventas en el rango
 */
export const getSalesByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      collection(db, SALES_COLLECTION),
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate)),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const sales = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sales.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return sales;
  } catch (error) {
    console.error("Error al obtener ventas por fecha:", error);
    throw new Error("No se pudieron cargar las ventas");
  }
};

/**
 * Crear venta en espera
 * @param {Object} saleData - Datos de la venta
 * @param {string} customerLabel - Etiqueta del cliente (Cliente 1, Cliente 2, etc.)
 * @returns {Promise<string>} ID de la venta en espera
 */
export const createPendingSale = async (saleData, customerLabel) => {
  try {
    const pendingSale = {
      ...saleData,
      customerLabel,
      createdAt: Timestamp.now(),
      status: "pending",
    };

    const docRef = await addDoc(
      collection(db, PENDING_SALES_COLLECTION),
      pendingSale
    );
    return docRef.id;
  } catch (error) {
    console.error("Error al crear venta en espera:", error);
    throw new Error("No se pudo crear la venta en espera");
  }
};

/**
 * Obtener todas las ventas en espera
 * @returns {Promise<Array>} Lista de ventas en espera
 */
export const getPendingSales = async () => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, PENDING_SALES_COLLECTION),
        orderBy("createdAt", "asc")
      )
    );

    const pendingSales = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pendingSales.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return pendingSales;
  } catch (error) {
    console.error("Error al obtener ventas en espera:", error);
    throw new Error("No se pudieron cargar las ventas en espera");
  }
};

/**
 * Finalizar venta en espera (convertir a venta completada)
 * @param {string} pendingSaleId - ID de la venta en espera
 * @returns {Promise<string>} ID de la venta completada
 */
export const completePendingSale = async (pendingSaleId) => {
  try {
    // Obtener la venta en espera
    const pendingSaleRef = doc(db, PENDING_SALES_COLLECTION, pendingSaleId);
    const pendingSaleSnap = await getDoc(pendingSaleRef);

    if (!pendingSaleSnap.exists()) {
      throw new Error("Venta en espera no encontrada");
    }

    const pendingSaleData = pendingSaleSnap.data();

    // Crear venta completada
    const completedSaleId = await createSale({
      ...pendingSaleData,
      completedAt: Timestamp.now(),
    });

    // Eliminar venta en espera
    await deleteDoc(pendingSaleRef);

    return completedSaleId;
  } catch (error) {
    console.error("Error al completar venta en espera:", error);
    throw new Error("No se pudo completar la venta");
  }
};

/**
 * Cancelar venta en espera
 * @param {string} pendingSaleId - ID de la venta en espera
 * @returns {Promise<void>}
 */
export const cancelPendingSale = async (pendingSaleId) => {
  try {
    const pendingSaleRef = doc(db, PENDING_SALES_COLLECTION, pendingSaleId);
    await deleteDoc(pendingSaleRef);
  } catch (error) {
    console.error("Error al cancelar venta en espera:", error);
    throw new Error("No se pudo cancelar la venta");
  }
};

/**
 * Procesar devolución de venta
 * @param {string} saleId - ID de la venta
 * @param {Array} returnItems - Items a devolver
 * @returns {Promise<void>}
 */
export const processReturn = async (saleId, returnItems) => {
  try {
    // Actualizar la venta original
    const saleRef = doc(db, SALES_COLLECTION, saleId);
    const saleSnap = await getDoc(saleRef);

    if (!saleSnap.exists()) {
      throw new Error("Venta no encontrada");
    }

    const saleData = saleSnap.data();

    // Crear registro de devolución
    const returnData = {
      originalSaleId: saleId,
      originalSaleNumber: saleData.saleNumber,
      returnItems,
      returnTotal: returnItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      createdAt: Timestamp.now(),
      type: "return",
    };

    await addDoc(collection(db, SALES_COLLECTION), returnData);

    // Restaurar stock de productos devueltos
    const stockItems = returnItems
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId,
        quantity: -item.quantity, // Cantidad negativa para aumentar stock
      }));

    if (stockItems.length > 0) {
      // Invertir la operación de descuento de stock
      await Promise.all(
        stockItems.map(async (item) => {
          const { getProductById, updateProductStock } = await import(
            "./productsService"
          );
          const product = await getProductById(item.productId);
          const newStock = product.stock + Math.abs(item.quantity);
          return updateProductStock(item.productId, newStock);
        })
      );
    }
  } catch (error) {
    console.error("Error al procesar devolución:", error);
    throw new Error("No se pudo procesar la devolución");
  }
};

/**
 * Obtener estadísticas de ventas
 * @returns {Promise<Object>} Estadísticas de ventas
 */
export const getSalesStats = async () => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Ventas del día
    const dailySales = await getSalesByDateRange(startOfDay, today);
    const dailyTotal = dailySales
      .filter((sale) => sale.type !== "return")
      .reduce((sum, sale) => sum + (sale.total || 0), 0);

    // Ventas del mes
    const monthlySales = await getSalesByDateRange(startOfMonth, today);
    const monthlyTotal = monthlySales
      .filter((sale) => sale.type !== "return")
      .reduce((sum, sale) => sum + (sale.total || 0), 0);

    return {
      dailyTotal,
      dailyCount: dailySales.filter((sale) => sale.type !== "return").length,
      monthlyTotal,
      monthlyCount: monthlySales.filter((sale) => sale.type !== "return")
        .length,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return {
      dailyTotal: 0,
      dailyCount: 0,
      monthlyTotal: 0,
      monthlyCount: 0,
    };
  }
};
