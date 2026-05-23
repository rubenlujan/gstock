import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../services/api";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ UserId: "", Password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        sessionStorage.clear();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async () => {
        if (!form.UserId || !form.Password) {
            setErrorMessage("Por favor, complete todos los campos.");
            return;
        }

        try {
            const response = await post("Login", {
                UserId: form.UserId,
                Password: form.Password,
            });

            if (response.ErrorMessage) {
                setErrorMessage(response.ErrorMessage);
                return;
            }

            const { CompanyId, UserRol } = response.UserData;
            sessionStorage.setItem("CompanyId", CompanyId);
            sessionStorage.setItem("UserRol", UserRol);

            navigate("/", {
                state: {
                    selectedPage: "articulos"
                }
            });

        } catch (err) {
            console.error(err);
            setErrorMessage("Error en el inicio de sesión.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-100 px-4">
            <motion.div
                className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex items-center mb-6">
                    <img
                        src="http://hrg-it.com/img/esfera_small.png"
                        alt="Logo"
                        className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <h2 className="text-2xl font-bold text-blue-600">Bienvenido a G-Stock</h2>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        name="UserId"
                        placeholder="Usuario"
                        value={form.UserId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="Password"
                            placeholder="Contraseña"
                            value={form.Password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {errorMessage && (
                        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                    >
                        Iniciar sesión
                    </button>

                    <div className="flex items-center justify-center mb-6">
                        <img
                            src="http://hrg-it.com/img/Idol_Logo_Small.jpg"
                            alt="Logo"
                            className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <h2 className="text-2xl font-bold text-blue-600">Idol Café</h2>
                    </div>

                    {false && (
                        <p className="mt-4 text-sm text-center">
                            ¿No tienes cuenta?{" "}
                            <span
                                onClick={() => navigate("/registro")}
                                className="text-blue-600 cursor-pointer hover:underline"
                            >
                                Regístrate aquí
                            </span>
                        </p>
                    )}
                </div>

            </motion.div>
        </div>
    );
};
