import { useEffect, useState } from "react";
import { postWithCompany } from "../services/api";
import { Modal } from "./Modal";

const CatalogoBase = ({ titulo, apiEndpoint, editableFields = [] }) => {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const result = await postWithCompany(apiEndpoint);
            if (result && Array.isArray(result.CatalogList)) {
                setItems(result.CatalogList);
            } else {
                console.error("Formato de respuesta inválido");
            }
        } catch (error) {
            console.error("Error al obtener datos del catálogo:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNuevo = () => {
        setFormData({});
        setEditMode(false);
        setShowModal(true);
    };

    const handleEditar = (item) => {
        setFormData(item);
        setEditMode(true);
        setShowModal(true);
    };

    const handleGuardar = async () => {
        if (!formData.Description?.trim()) {
            alert("La descripción es obligatoria");
            return;
        }

        try {
            const endpoint = editMode ? "UpdateCatalogItem" : "CreateCatalogItem";
            const payload = { ...formData, Type: titulo }; // puedes enviar 'Tipo' para que el backend sepa qué catálogo es
            await postWithCompany(endpoint, payload);
            setShowModal(false);
            fetchItems(); // refrescar tabla
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{titulo}</h2>
                <button
                    onClick={handleNuevo}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Nuevo Registro
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-300">
                        <tr>
                            <th className="border p-2">ID</th>
                            <th className="border p-2">Descripción</th>
                            {items.some(i => i.DocType != null) && (
                                <th className="border p-2">Tipo</th>
                            )}
                            <th className="border p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.Id} className="border-t">
                                <td className="p-2 text-center">{item.Id}</td>
                                <td className="p-2">{item.Description}</td>
                                {item.DocType != null && (
                                    <td className="p-2">{item.DocType}</td>
                                )}
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => handleEditar(item)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                    No hay registros
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                    <h3 className="text-xl font-semibold mb-4">
                        {editMode ? "Editar" : "Nuevo"} {titulo.slice(0, -1)}
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="Description"
                            value={formData.Description || ""}
                            onChange={handleInputChange}
                            placeholder="Descripción"
                            className="w-full border p-2 rounded"
                        />
                        {titulo === "Tipos de Documento" && (
                            <select
                                name="DocType"
                                value={formData.DocType || ""}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded"
                            >
                                <option value="">Seleccione tipo</option>
                                <option value="Entrada">Entrada</option>
                                <option value="Salida">Salida</option>
                            </select>
                        )}
                    </div>
                    <div className="flex justify-end mt-6 space-x-2">
                        <button
                            onClick={() => setShowModal(false)}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardar}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Guardar
                        </button>
                    </div>

                </Modal>
            )}
        </div>
    );
};

export default CatalogoBase;
