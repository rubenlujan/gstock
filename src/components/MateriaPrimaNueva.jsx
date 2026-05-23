import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postWithCompany, post } from "../services/api";

export const MateriaPrimaNueva = () => {
    const [form, setForm] = useState({
        Id: 0,
        Name: "",
        Description: "",
        Description_English: "",
        CategoryId: 0,
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

    const [umed, setUMed] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const fetchUMed = async () => {
        try {
            const res = await postWithCompany("GetAllUMed");
            const list = res.CatalogList || [];
            setUMed(list);
            if (list.length > 0) {
                setForm(prev => ({ ...prev, UMedId: list[0].Id }));
            }
        } catch (error) {
            console.error("Error al cargar unidades de medida:", error);
        }
    };

    useEffect(() => {
        fetchUMed();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = value;
        if (type === "number") {
            newValue = newValue.replace(/[eE\+\-]/g, "");
        }
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : newValue
        }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleSave = async () => {
        // Validaciones
        const tempErrors = {};
        if (!form.Name.trim()) {
            tempErrors.Name = "El nombre del artículo no puede estar vacío.";
        }
        if (!form.UMedId) {
            tempErrors.UMedId = "Debe seleccionar una unidad de medida.";
        }
        if (Object.keys(tempErrors).length) {
            setErrors(tempErrors);
            return;
        }
        setErrors({});

        // Procesar imagen base64
        let imageBase64 = form.Image
            .replace("data:image/jpeg;base64,", "")
            .replace("data:image/png;base64,", "")
            .replace("data:image/jpg;base64,", "");

        const newItem = {
            Item: {
                CompanyId: parseInt(sessionStorage.getItem("CompanyId")),
                ...form,
                Image: imageBase64
            }
        };

        try {
            await post("CreateItemRawMaterial", newItem);
            navigate("/", { replace: true, state: { selectedPage: "materiaprima" } });
        } catch (error) {
            console.error("Error al guardar el artículo:", error);
            setErrors({ submit: "Hubo un error al guardar. Intenta de nuevo." });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">
                Nuevo Artículo
            </h2>

            <div className="grid grid-cols-1 gap-4 py-2">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Nombre *
                    </label>
                    <input
                        name="Name"
                        value={form.Name}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                    {errors.Name && <p className="text-red-600 text-sm mt-1">{errors.Name}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Unidad de Medida *
                    </label>
                    <select
                        name="UMedId"
                        value={form.UMedId}
                        onChange={handleChange}
                        className="border px-3 py-2 w-full rounded"
                    >
                        {umed.map(cat => (
                            <option key={cat.Id} value={cat.Id}>
                                {cat.Description}
                            </option>
                        ))}
                    </select>
                    {errors.UMedId && <p className="text-red-600 text-sm mt-1">{errors.UMedId}</p>}
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
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select
                        name="Status"
                        value={form.Status}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
            </div>

            {errors.submit && <p className="text-red-600 text-center mt-4">{errors.submit}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <button
                    onClick={() => navigate("/", { replace: true, state: { selectedPage: "materiaprima" } })}
                    className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-2 rounded"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                >
                    Guardar Artículo
                </button>
            </div>
        </div>
    );
};
