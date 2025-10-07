// src/services/purchasesService.js
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const comprasRef = collection(db, 'compras');
const pedidosRef = collection(db, 'pedidos_clientas');
const tallesRef = collection(db, 'talles'); // opcional

export const getCompras = async () => {
  const q = query(comprasRef, orderBy('fecha_creacion', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addCompra = async (payload) => {
  payload.fecha_creacion = payload.fecha_creacion || new Date().toISOString();
  return await addDoc(comprasRef, payload);
};

export const updateCompra = async (id, patch) => {
  const ref = doc(db, 'compras', id);
  await updateDoc(ref, patch);
};

export const deleteCompra = async (id) => {
  const ref = doc(db, 'compras', id);
  await deleteDoc(ref);
};

/* Pedidos de clientas */
export const getPedidos = async () => {
  const q = query(pedidosRef, orderBy('fecha','desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addPedido = async (payload) => {
  return await addDoc(pedidosRef, payload);
};

/* Talles (si lo guardás en Firestore) */
export const getTalles = async () => {
  const snap = await getDocs(tallesRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
