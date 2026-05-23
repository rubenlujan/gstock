import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { postWithCompany } from "../services/api";

function Articulos() {
    const [filterId, setFilterId] = useState('');
    const [filterName, setFilterName] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;


    const fetchArticulos = async () => {
        setLoading(true);
        try {
            const apiEndpoint = `GetAllItems`;
            const result = await postWithCompany(apiEndpoint);
            if (result && result.ItemList) {
                setData(result.ItemList);  // Actualizamos con los datos
            } else {
                console.error("No se encontró 'ItemList' en la respuesta");
            }
        } catch (error) {
            console.error("Error al obtener artículos:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const filtrosGuardados = sessionStorage.getItem("filtrosArticulos");
        if (filtrosGuardados) {
            console.log("Hay filtros");
            const { id, name, category, page } = JSON.parse(filtrosGuardados);
            setFilterId(id || "");
            setFilterName(name || "");
            setFilterCategory(category || "");
            setCurrentPage(page || 1);
        }
        fetchArticulos();
    }, []);



    const navigate = useNavigate();
    const handleEdit = (id) => {
        sessionStorage.setItem("filtrosArticulos", JSON.stringify({
            id: filterId,
            name: filterName,
            category: filterCategory,
            page: currentPage,
        }));

        navigate(`/articulos/editar/${id}`);
    };

    const handleNew = () => {
        sessionStorage.setItem("filtrosArticulos", JSON.stringify({
            id: filterId,
            name: filterName,
            category: filterCategory,
            page: currentPage,
        }));


        navigate(`/articulos/nuevo`);
    };

    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Add a check to ensure item is not null or undefined
            if (!item) {
                return false;
            }
            // Safely access properties using optional chaining and nullish coalescing
            // Use correct casing (Id, Name, Category) to match data structure
            const itemId = item.Id?.toString() || '';
            const itemName = item.Name?.toLowerCase() || '';
            const itemCategory = item.Category?.toLowerCase() || '';

            return itemId.includes(filterId.toLowerCase()) &&
                itemName.includes(filterName.toLowerCase()) &&
                itemCategory.includes(filterCategory.toLowerCase());
        });
    }, [data, filterId, filterName, filterCategory]);



    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Artículos Idol Café</h2>

            {loading ? (
                <p>Cargando artículos...</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Buscar por ID"
                                value={filterId}
                                onChange={(e) => {
                                    setFilterId(e.target.value);
                                    setCurrentPage(1); // Reiniciar a la primera página
                                }}
                                className="border px-3 py-2 rounded w-full"
                            />
                            <input
                                type="text"
                                placeholder="Buscar por Nombre"
                                value={filterName}
                                onChange={(e) => {
                                    setFilterName(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border px-3 py-2 rounded w-full"
                            />
                            <input
                                type="text"
                                placeholder="Buscar por Categoría"
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border px-3 py-2 rounded w-full"
                            />
                            <div className="mt-2">
                                <button
                                    onClick={() => {
                                        setFilterId('');
                                        setFilterName('');
                                        setFilterCategory('');
                                        setCurrentPage(1);
                                        sessionStorage.removeItem("filtrosArticulos");
                                    }}
                                    className="bg-blue-300 px-4 py-2 rounded hover:bg-blue-400 transition mr-2"
                                >
                                    Limpiar filtros
                                </button>
                                <button
                                    onClick={() => handleNew()}
                                    className="bg-orange-300 px-4 py-2 rounded hover:bg-orange-400 transition">
                                    Nuevo Producto
                                </button>
                            </div>
                        </div>

                        <table className="min-w-full border text-sm">
                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="border px-3 py-2">ID</th>
                                    <th className="border px-3 py-2">Nombre</th>
                                    <th className="border px-3 py-2">Categoría</th>
                                    <th className="border px-3 py-2 text-center">Estado</th>
                                    <th className="border px-3 py-2 text-center">Precio</th>
                                    <th className="border px-3 py-2 text-center">Costo</th>
                                    <th className="border px-3 py-2 text-center">Ganancia</th>
                                    <th className="border px-3 py-2 text-center">Ventas</th>
                                    <th className="border px-3 py-2 text-center">Descuento</th>
                                    <th className="border px-3 py-2 text-center">Promo</th>
                                    <th className="border px-3 py-2 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((item) => (
                                    <tr key={item.Id} className="hover:bg-gray-50">
                                        <td className="border px-3 py-2">{item.Id}</td>
                                        <td className="border px-3 py-2">{item.Name}</td>
                                        <td className="border px-3 py-2">{item.Category}</td>
                                        <td className="border px-3 py-2 text-center">
                                            <span
                                                className={`px-2 py-1 rounded text-white text-xs ${item.Status === "Activo"
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                                    }`}
                                            >
                                                {item.Status}
                                            </span>
                                        </td>
                                        <td className="border px-3 py-2 text-right">
                                            ${Number(item.Price).toFixed(2)}
                                        </td>
                                        <td className="border px-3 py-2 text-right">
                                            ${Number(item.Cost).toFixed(2)}
                                        </td>
                                        <td className={`border px-3 py-2 text-right 
                                            ${(item.Price - item.Cost) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${Number(item.Price - item.Cost).toFixed(2)}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {Number(item.Sales).toFixed(0)}
                                        </td>

                                        <td className="border px-3 py-2 text-right">
                                            {Number(item.Discount).toFixed(1)}%
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {item.PromoActive === 1 ? "✅" : "❌"}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            <button
                                                onClick={() => handleEdit(item.Id)}
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

export default Articulos;
