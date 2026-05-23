import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../services/api";

const Registro = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState({
        CompanyId: 0,
        CompanyName: "",
        CompanyLogo: "", // se llenará con imagen base64 por defecto
        CompanyEMailContact: "",
        CompanyPhoneContact: "",
        AllowPaymentWithTerminal: 0,
        AllowSaleAlcohol: 0,
        PrinterName: "",
    });

    // cargar imagen base64 al iniciar
    useState(() => {
        fetch("./logo_default.png")
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(",")[1];
                    setConfig(prev => ({ ...prev, CompanyLogo: base64 }));
                };
                reader.readAsDataURL(blob);
            })
            .catch(err => console.error("Error al cargar imagen por defecto:", err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= 100 * 1024) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(",")[1];
                setConfig(prev => ({ ...prev, CompanyLogo: base64 }));
            };
            reader.readAsDataURL(file);
        } else {
            alert("La imagen no debe superar los 100 KB.");
        }
    };

    const handleSave = async () => {
        try {
            await post("UpdateSystemConfig", { Config: config });
            alert("Registro completado correctamente.");
            navigate("/login");
        } catch (error) {
            alert("Error al guardar.");
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-blue-600">Registro de empresa</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm mb-1">Nombre de la empresa</label>
                    <input
                        type="text"
                        name="CompanyName"
                        value={config.CompanyName}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Correo de contacto</label>
                    <input
                        type="email"
                        name="CompanyEMailContact"
                        value={config.CompanyEMailContact}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Teléfono</label>
                    <input
                        type="text"
                        name="CompanyPhoneContact"
                        value={config.CompanyPhoneContact}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Nombre de impresora</label>
                    <input
                        type="text"
                        name="PrinterName"
                        value={config.PrinterName}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">¿Permitir pago con terminal?</label>
                    <select
                        name="AllowPaymentWithTerminal"
                        value={config.AllowPaymentWithTerminal}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value={0}>No</option>
                        <option value={1}>Sí</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">¿Permitir venta de alcohol sin alimentos?</label>
                    <select
                        name="AllowSaleAlcohol"
                        value={config.AllowSaleAlcohol}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value={0}>No</option>
                        <option value={1}>Sí</option>
                    </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm mb-1">Logo actual:</label>
                    {config.CompanyLogo ? (
                        <img
                            src={`data:image/jpeg;base64,${config.CompanyLogo}`}
                            alt="Logo"
                            className="h-32 mb-2 border rounded"
                        />
                    ) : (
                        <p className="text-sm text-gray-500 mb-2">Cargando imagen predeterminada...</p>
                    )}
                    <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleLogoChange}
                        className="text-sm"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <button
                    onClick={() => navigate("/login")}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Guardar
                </button>
            </div>
        </div>
    );
};

export default Registro;
