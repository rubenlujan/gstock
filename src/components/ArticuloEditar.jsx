import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { post, postWithCompany } from "../services/api";
import { Modal } from "./Modal";

export const ArticuloEditar = () => {
    const { id } = useParams();
    const [form, setForm] = useState({
        Id: "",
        Name: "",
        Description: "",
        Description_English: "",
        CategoryId: "",
        Price: 0,
        Cost: 0,
        Discount: 0,
        Status: "Activo",
        PromoActive: 0,
        IsComplement: 0,
        Image: "",
        UMed: "",
        UMedId: 0
    });

    const [showKardex, setShowKardex] = useState(false);
    const [kardexData, setKardexData] = useState([]);
    const [kardexLoading, setKardexLoading] = useState(false);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const itemId = parseInt(id, 10);
    const fetchData = async () => {
        try {
            const res = await postWithCompany(`GetItemById`, {
                ItemId: itemId
            });
            if (res.Product) {
                setForm(res.Product);
            } else {
                console.warn("No se encontró el producto");
            }
        } catch (error) {
            console.error("Error al cargar artículo:", error);
        }
        setLoading(false);
    };


    const fetchCategories = async () => {
        try {
            const res = await postWithCompany("GetAllCategories");
            setCategories(res.CatalogList);
        } catch (error) {
            console.error("Error al cargar categorias:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newValue = value;

        if (type === "number") {
            // Elimina cualquier letra o símbolo no numérico excepto el punto
            newValue = newValue.replace(/[eE\+\-]/g, "");
        }

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : newValue
        }));
    };


    const handleUpdate = async () => {
        // Validación básica opcional aquí si la deseas

        let imageBase64 = form.Image.replace("data:image/jpeg;base64,", "");
        imageBase64 = imageBase64.replace("data:image/png;base64,", "");
        imageBase64 = imageBase64.replace("data:image/jpg;base64,", "");

        const updatedItem = {
            Item: {
                CompanyId: parseInt(sessionStorage.getItem("CompanyId")),
                Id: form.Id,
                Name: form.Name,
                Description: form.Description,
                Description_English: form.Description_English,
                CategoryId: form.CategoryId,
                Category: form.Category, // Esto puede venir del texto del Select si se desea
                Price: Number(form.Price),
                Cost: Number(form.Cost),
                Discount: Number(form.Discount),
                Status: form.Status,
                PromoActive: Number(form.PromoActive),
                Image: imageBase64,
                IsComplement: Number(form.IsComplement),
                UMed: form.UMed,
                UMedId: form.UMedId
            }
        };

        try {
            const response = await post("UpdateItem", updatedItem);

            // Mostrar confirmación, regresar a la lista o actualizar UI
            console.log("Artículo actualizado correctamente:", response);
            alert("Artículo actualizado correctamente.");
        } catch (error) {
            console.error("Error al actualizar el artículo:", error);
            alert("Hubo un error al actualizar el artículo.");
        }
    };

    const handleShowMovtos = async () => {
        setKardexLoading(true);
        try {
            const result = await postWithCompany("GetItemKardex", { ItemId: form.Id });
            if (result && Array.isArray(result.Kardex)) {
                setKardexData(result.Kardex);
            } else {
                setKardexData([]);
            }
            setShowKardex(true);
        } catch (error) {
            console.error("Error al obtener el Kardex:", error);
            setKardexData([]);
            setShowKardex(true);
        } finally {
            setKardexLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">
                Edición Artículo
            </h2>

            {form.Image && (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    {(() => {
                        const imageSrc = form.Image?.startsWith("data:image")
                            ? form.Image
                            : `data:image/jpeg;base64,${form.Image}`;
                        return (
                            <img
                                src={imageSrc}
                                alt="Producto"
                                className="col-span-2 block w-full mx-auto max-w-xs h-auto border px-3 py-2 rounded"
                            />
                        );
                    })()}

                </div>
            )}
            <br />
            <div className="relative">
                <input
                    type="file"
                    accept="image/png, image/jpeg"
                    id="fileInput"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setForm((prev) => ({ ...prev, Image: reader.result }));
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                    className="hidden"
                />

                {/* Botón personalizado */}
                <div className="w-full flex justify-center">
                    <label
                        htmlFor="fileInput"
                        className="text-sm text-gray-600 border border-gray-300 py-2 px-4 rounded-lg text-center cursor-pointer bg-green-300 hover:bg-green-400"
                    >
                        Cambiar imagen
                    </label>
                </div>
            </div>

            <br />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input name="Name" value={form.Name} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Categoría:</label>
                    <select name="CategoryId" value={form.CategoryId} onChange={handleChange} className="border px-3 py-2 w-full rounded">
                        <option value="">Seleccione una categoría</option>
                        {categories.map((cat) => (
                            <option key={cat.Id} value={cat.Id}>
                                {cat.Description}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select name="Status" value={form.Status} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Promoción 2 x 1 Activa</label>
                    <select name="PromoActive" value={form.PromoActive} onChange={handleChange}
                        className="w-full border px-3 py-2 rounded">
                        <option value={1}>Sí</option>
                        <option value={0}>No</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full py-2">
                <div>
                    <label className="block text-sm font-medium mb-1">Precio</label>
                    <input
                        type="number"
                        name="Price"
                        value={form.Price}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Costo</label>
                    <input
                        type="number"
                        name="Cost"
                        value={form.Cost}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Descuento (%)</label>
                    <input
                        type="number"
                        name="Discount"
                        value={form.Discount}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">¿Es Complemento?</label>
                    <select name="IsComplement" value={form.IsComplement} onChange={handleChange}
                        className="w-full border px-3 py-2 rounded">
                        <option value={1}>Sí</option>
                        <option value={0}>No</option>
                    </select>

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                        name="Description"
                        value={form.Description}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                        rows="3"
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Descripción Inglés</label>
                    <textarea
                        name="Description_English"
                        value={form.Description_English}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                        rows="3"
                    ></textarea>
                </div>
            </div>
            <br />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate("/", { replace: true, state: { selectedPage: "articulos" } })}
                    className="bg-orange-400 hover:bg-orange-500 text-white px-2 py-2 rounded"
                >
                    Regresar al Listado
                </button>
                <button
                    type="button"
                    onClick={handleShowMovtos}
                    className="bg-green-600 text-white px-2 py-0.5 rounded"
                >
                    Ver Movimientos
                </button>

                <button
                    onClick={handleUpdate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded"
                >
                    Guardar Cambios
                </button>
            </div>

            <Modal isOpen={showKardex} onClose={() => setShowKardex(false)}>
                {kardexLoading ? (
                    <p>Cargando movimientos...</p>
                ) : kardexData.length === 0 ? (
                    <p>No hay movimientos para este artículo.</p>
                ) : (
                    <table className="min-w-full border text-sm">
                        <thead>
                            <tr className="bg-gray-300 text-left">
                                <th className="px-4 py-2 border">Almacén</th>
                                <th className="px-4 py-2 border">Concepto</th>
                                <th className="px-4 py-2 border"># Documento</th>
                                <th className="px-4 py-2 border">Fecha</th>
                                <th className="px-4 py-2 border">Cantidad</th>
                                <th className="px-4 py-2 border">Precio</th>
                                <th className="px-4 py-2 border">Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kardexData.map((mov, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border">{mov.Warehouse}</td>
                                    <td className="px-4 py-2 border">{mov.Concept}</td>
                                    <td className="px-4 py-2 border">{mov.DocNum}</td>
                                    <td className="px-4 py-2 border">{mov.DocDate}</td>
                                    <td className="px-4 py-2 border text-right">{mov.Qty}</td>
                                    <td className="px-4 py-2 border text-right">${mov.Price}</td>
                                    <td className="px-4 py-2 border text-right">${mov.Cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Modal>


        </div >
    );
}


