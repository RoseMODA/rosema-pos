// src/pages/Compras.jsx
import React, { useEffect, useState, useRef } from 'react';
import { getCompras, getPedidos, getTalles, addCompra } from '../services/purchasesService';
import Modal from '../components/common/Modal';

export default function Compras() {
    const [tab, setTab] = useState('faltantes'); // 'faltantes' | 'pedidos' | 'proveedores' | 'talles'
    const [compras, setCompras] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [talles, setTalles] = useState([]);
    const [loading, setLoading] = useState(true);
    const printRef = useRef();

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [c, p, t] = await Promise.all([getCompras(), getPedidos(), getTalles().catch(() => [])]);
            setCompras(c);
            setPedidos(p);
            setTalles(t);
            setLoading(false);
        })();
    }, []);

    const handlePrint = () => {
        window.print(); // imprimir vista actual. mejorar con react-to-print si se requiere.
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-3">Compras</h1>

            <div className="flex gap-2 mb-4">
                <button onClick={() => setTab('faltantes')} className={`px-3 py-1 rounded ${tab === 'faltantes' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>Faltantes</button>
                <button onClick={() => setTab('pedidos')} className={`px-3 py-1 rounded ${tab === 'pedidos' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>Pedidos</button>
                <button onClick={() => setTab('proveedores')} className={`px-3 py-1 rounded ${tab === 'proveedores' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>Proveedores</button>
                <button onClick={() => setTab('talles')} className={`px-3 py-1 rounded ${tab === 'talles' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>Talles</button>
                <div className="ml-auto">
                    <button onClick={handlePrint} className="px-3 py-1 bg-blue-600 text-white rounded">Imprimir</button>
                </div>
            </div>

            <div ref={printRef}>
                {loading && <div>Cargando...</div>}

                {tab === 'faltantes' && !loading && (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th>Producto</th><th>Talles</th><th>Proveedor</th><th>Cant. necesaria</th><th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compras.map(c => (
                                <tr key={c.id}>
                                    <td>{c.productoNombre}</td>
                                    <td>{c.talles}</td>
                                    <td>{c.proveedorId || c.proveedor}</td>
                                    <td>{c.cantidad_necesaria}</td>
                                    <td>{c.precio_unitario}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {tab === 'pedidos' && !loading && (
                    <div>
                        {pedidos.map(p => (
                            <div key={p.id} className="border rounded p-2 mb-2">
                                <div><strong>{p.clienta}</strong> — {p.fecha}</div>
                                <div>{p.prendas} / {p.talles} / {p.color}</div>
                                <div className="text-sm text-gray-600">{p.nota}</div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'talles' && (
                    <pre>{JSON.stringify(talles.slice(0, 100), null, 2)}</pre>
                )}

                {tab === 'proveedores' && (
                    <div>Reusar proveedores y catálogo. Implementar tabla similar a 'faltantes'.</div>
                )}
            </div>
        </div>
    );
}
