import { useEffect, useState } from "react";
import { post } from "../services/api";
import { useNavigate } from "react-router-dom";
import { postWithCompany } from "../services/api";

const Configuracion = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const result = await postWithCompany("GetSystemConfig");
                if (result.Message && result.Message.trim() !== "") {
                    alert(result.Message);
                } else {
                    setConfig(result.Config);
                }
            } catch (error) {
                alert("Error al obtener configuración.");
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= 100 * 1024) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(",")[1];
                setConfig((prev) => ({ ...prev, CompanyLogo: base64 }));
            };
            reader.readAsDataURL(file);
        } else {
            alert("La imagen no debe superar los 100 KB.");
        }
    };

    const handleSave = async () => {
        try {
            await post("UpdateSystemConfig", { Config: config });
            alert("Configuración actualizada correctamente.");
        } catch (error) {
            alert("Error al guardar configuración.");
        }
    };

    if (loading || !config) return null;

    return (
        <div className="p-4 md:p-6 max-w-screen-lg mx-auto bg-white rounded-xl shadow">
            <h2 className="text-xl md:text-2xl font-bold text-blue-600 mb-6">Configuración del sistema</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm">Nombre de la empresa</label>
                    <input
                        type="text"
                        name="CompanyName"
                        value={config.CompanyName}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm">Correo de contacto</label>
                    <input
                        type="email"
                        name="CompanyEMailContact"
                        value={config.CompanyEMailContact}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm">Teléfono</label>
                    <input
                        type="text"
                        name="CompanyPhoneContact"
                        value={config.CompanyPhoneContact}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm">Nombre de impresora</label>
                    <input
                        type="text"
                        name="PrinterName"
                        value={config.PrinterName}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-sm">¿Permitir pago con terminal?</label>
                    <select
                        name="AllowPaymentWithTerminal"
                        value={config.AllowPaymentWithTerminal}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value={1}>Sí</option>
                        <option value={0}>No</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1 text-sm">¿Permitir venta de alcohol sin alimentos?</label>
                    <select
                        name="AllowSaleAlcohol"
                        value={config.AllowSaleAlcohol}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value={1}>Sí</option>
                        <option value={0}>No</option>
                    </select>
                </div>
                <div className="col-span-1 sm:col-span-2 mt-4">
                    <label className="block mb-2 text-sm">Logo actual:</label>
                    {config.CompanyLogo ? (
                        <img
                            src={`data:image/jpeg;base64,${config.CompanyLogo}`}
                            alt="Logo"
                            className="h-32 mb-2 border rounded object-contain"
                        />
                    ) : (
                        <p className="text-sm text-gray-500 mb-2">No hay logo cargado.</p>
                    )}
                    <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleLogoChange}
                        className="text-sm"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-start gap-2 mt-6">

                <button
                    onClick={handleSave}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};

export default Configuracion;
