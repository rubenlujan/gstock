import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { postWithCompany } from "../services/api";

function DocInv() {
    const [filterId, setFilterId] = useState('');
    const [filterName, setFilterName] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const fetchDocInv = async () => {
        setLoading(true);
        try {
            const apiEndpoint = `GetDocInvAll`;
            const result = await postWithCompany(apiEndpoint);
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
        const filtrosGuardados = sessionStorage.getItem("filtrosDocInv");
        if (filtrosGuardados) {
            console.log("Entró filtros");
            const { docType, dateMov, page } = JSON.parse(filtrosGuardados);
            setFilterId(docType || "");
            setFilterName(dateMov || "");
            setCurrentPage(page || 1);
        }
        fetchDocInv();
    }, []);



    const navigate = useNavigate();
    const handleEdit = (almacen, doctype, docnum) => {
        sessionStorage.setItem("filtrosDocInv", JSON.stringify({
            docType: filterId,
            dateMov: filterName,
            page: currentPage,
        }));

        // Enviamos el estado como recordId con los datos requeridos por MovimientosInventario
        navigate("/docinv/editar", {
            state: {
                action: 1,
                recordId: {
                    almacenId: almacen,
                    docType: doctype,
                    docNum: docnum
                }
            }
        });
    };



    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Add a check to ensure item is not null or undefined
            if (!item) {
                return false;
            }
            // Safely access properties using optional chaining and nullish coalescing
            // Use correct casing (Id, Name, Category) to match data structure
            const docType = item.DocType?.toLowerCase() || '';
            const dateMov = item.DateMov?.toLowerCase() || '';

            return docType.includes(filterId.toLowerCase()) &&
                dateMov.includes(filterName.toLowerCase());
        });
    }, [data, filterId, filterName]);



    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Artículos Idol Café</h2>

            {loading ? (
                <p>Cargando movimientos...</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Buscar por Tipo"
                                value={filterId}
                                onChange={(e) => {
                                    setFilterId(e.target.value);
                                    setCurrentPage(1); // Reiniciar a la primera página
                                }}
                                className="border px-3 py-2 rounded w-full"
                            />
                            <input
                                type="text"
                                placeholder="Buscar por Fecha"
                                value={filterName}
                                onChange={(e) => {
                                    setFilterName(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border px-3 py-2 rounded w-full"
                            />
                            <div className="mt-2">
                                <button
                                    onClick={() => {
                                        setFilterId('');
                                        setFilterName('');
                                        setCurrentPage(1);
                                        sessionStorage.removeItem("filtrosDocInv");
                                    }}
                                    className="bg-blue-300 px-4 py-2 rounded hover:bg-blue-400 transition mr-2"
                                >
                                    Limpiar filtros
                                </button>
                                <button
                                    className="bg-orange-300 px-4 py-2 rounded hover:bg-orange-400 transition"
                                    onClick={() => navigate("/docinv/editar", {
                                        state: {
                                            action: 0
                                        }
                                    })}
                                >
                                    Nuevo Movimiento
                                </button>
                            </div>
                        </div>

                        <table className="min-w-full border text-sm">
                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="border px-3 py-2">Almacen</th>
                                    <th className="border px-3 py-2">Tipo</th>
                                    <th className="border px-3 py-2">Número</th>
                                    <th className="border px-3 py-2 text-center">Fecha</th>
                                    <th className="border px-3 py-2 text-center">Status</th>
                                    <th className="border px-3 py-2 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((item) => (
                                    <tr key={item.AlmacenId + item.DocTypeId + item.DocNum} className="hover:bg-gray-50">
                                        <td className="border px-3 py-2">{item.Almacen}</td>
                                        <td className="border px-3 py-2">{item.DocType}</td>
                                        <td className="border px-3 py-2">{item.DocNum}</td>
                                        <td className="border px-3 py-2">{item.DateMov}</td>
                                        <td className="border px-3 py-2">{item.StatusDoc}</td>
                                        <td className="border px-3 py-2 text-center">
                                            <button
                                                onClick={() => handleEdit(item.AlmacenId, item.DocTypeId, item.DocNum)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="flex justify-center mt-4 space-x-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded ${currentPage === i + 1
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default DocInv;
