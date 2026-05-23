import React, { useEffect } from "react";

export const Modal = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.1)] backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
                <div className="flex justify-start">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-xl font-bold"
                    >
                        Regresar al artículo
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};
