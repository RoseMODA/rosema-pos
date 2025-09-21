// src/utils/dateHelpers.js
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

/**
 * Filtra ventas según rango de fechas
 * @param {Array} sales - Lista de ventas
 * @param {string|Date|null} startDate - Fecha inicio (YYYY-MM-DD o Date)
 * @param {string|Date|null} endDate - Fecha fin (YYYY-MM-DD o Date)
 * @param {string} field - Campo a comparar (default: "createdAt")
 * @returns {Array} - Ventas filtradas
 */
export function filterByDateRange(sales, startDate, endDate, field = "createdAt") {
  return sales.filter((sale) => {
    const saleDate = dayjs(sale[field]);

    if (startDate && !endDate) {
      return saleDate.isAfter(dayjs(startDate).startOf("day")) ||
             saleDate.isSame(dayjs(startDate).startOf("day"));
    }

    if (!startDate && endDate) {
      return saleDate.isBefore(dayjs(endDate).endOf("day")) ||
             saleDate.isSame(dayjs(endDate).endOf("day"));
    }

    if (startDate && endDate) {
      return saleDate.isBetween(
        dayjs(startDate).startOf("day"),
        dayjs(endDate).endOf("day"),
        null,
        "[]"
      );
    }

    return true; // sin filtros, devuelve todas
  });
}
