import React from "react";

export const ModalMensaje = ({ show, onClose, titulo, mensaje, botones }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h2 className="text-lg font-bold mb-2">{titulo}</h2>
                <p className="text-sm text-gray-700 mb-4">{mensaje}</p>
                <div className="flex justify-end space-x-2">
                    {botones ? (
                        botones.map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={btn.onClick}
                                className={`px-4 py-2 rounded text-white ${btn.estilo}`}
                            >
                                {btn.texto}
                            </button>
                        ))
                    ) : (
                        <button
                            onClick={onClose}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                        >
                            Aceptar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
