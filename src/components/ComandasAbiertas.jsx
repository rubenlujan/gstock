import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../services/api";

function ComandasAbiertas() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const fetchComandas = async () => {
        setLoading(true);
        try {
            const apiEndpoint = `GetAllOpenComandas`;
            const result = await post(apiEndpoint);
            if (result && result.ItemList) {
                setData(result.ItemList);  // Actualizamos con los datos
            } else {
                console.error("No se encontró 'ItemList' en la respuesta");
            }
        } catch (error) {
            console.error("Error al obtener los movimientos:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchComandas();
    }, []);

    const handleRefresh = () => {
        fetchComandas();
    };


    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Comandas Abiertas</h2>

            {loading ? (
                <p>Cargando movimientos...</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <div className="mt-2 py-3">
                            <button
                                onClick={() => handleRefresh()}
                                className="bg-orange-300 px-4 py-2 rounded hover:bg-orange-400 transition">
                                Actualizar Datos
                            </button>
                        </div>
                        <table className="min-w-full border text-sm">
                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="border px-3 py-2">Fecha</th>
                                    <th className="border px-3 py-2">Atiende</th>
                                    <th className="border px-3 py-2">Dispositivo</th>
                                    <th className="border px-3 py-2">Cliente</th>
                                    <th className="border px-3 py-2 text-right">Importe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.Id + item.Waiter + item.Device} className="hover:bg-gray-50">
                                        <td className="border px-3 py-2">{item.OrderDate}</td>
                                        <td className="border px-3 py-2">{item.Waiter}</td>
                                        <td className="border px-3 py-2">{item.Device}</td>
                                        <td className="border px-3 py-2">{item.Name}</td>
                                        <td className="border px-3 py-2 text-right">
                                            ${Number(item.TotalAmount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default ComandasAbiertas;
