import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { post } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GananciaPorProducto = () => {
    const [fechaIni, setFechaIni] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleBuscar = async () => {
        if (!fechaIni || !fechaFin) {
            setError("Seleccione ambas fechas.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await post("GetProductProfitByRange", {
                DateIni: format(fechaIni, "yyyy-MM-dd"),
                DateEnd: format(fechaFin, "yyyy-MM-dd"),
            });

            if (res.Message && res.Message.trim() !== "") {
                setResultado(null);
                alert(res.Message);
            } else {
                setResultado(res);
            }
        } catch (err) {
            console.error(err);
            setError("Error al consultar el API.");
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        if (!resultado || !resultado.Items || resultado.Items.length === 0) return;

        const fechaInicioStr = format(fechaIni, "yyyy-MM-dd");
        const fechaFinStr = format(fechaFin, "yyyy-MM-dd");
        const nombreArchivo = `GananciaProducto_${fechaInicioStr}_a_${fechaFinStr}`;


        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(
            `Reporte de Ganancia por Producto del ${format(fechaIni, "yyyy-MM-dd")} al ${format(fechaFin, "yyyy-MM-dd")}`,
            14,
            15
        );


        // Resumen de totales
        doc.setFontSize(11);
        doc.text(`Ventas Totales: $${resultado.TotalSales.toFixed(2)}`, 14, 25);
        doc.text(`Costo Total: $${resultado.TotalCost.toFixed(2)}`, 14, 32);
        doc.text(`Ganancia Total: $${resultado.TotalProfit.toFixed(2)}`, 14, 39);

        const tableData = resultado.Items.map((item) => [
            item.Product,
            item.Quantity,
            `$${item.Sales.toFixed(2)}`,
            `$${item.Cost.toFixed(2)}`,
            `$${item.Profit.toFixed(2)}`,
        ]);

        autoTable(doc, {
            head: [["Producto", "Cantidad", "Venta", "Costo", "Ganancia"]],
            body: tableData,
            startY: 45,
        });

        doc.save(`${nombreArchivo}.pdf`);
    };


    const handleExportCSV = () => {
        if (!resultado || !resultado.Items || resultado.Items.length === 0) return;

        const fechaInicioStr = format(fechaIni, "yyyy-MM-dd");
        const fechaFinStr = format(fechaFin, "yyyy-MM-dd");
        const nombreArchivo = `Ganancia_${fechaInicioStr}_a_${fechaFinStr}`;
        const header = ["Producto", "Cantidad", "Venta", "Costo", "Ganancia"];
        const rows = resultado.Items.map((item) => [
            item.Product,
            item.Quantity,
            item.Sales.toFixed(2),
            item.Cost.toFixed(2),
            item.Profit.toFixed(2),
        ]);

        const resumen = [
            [`Reporte de Ganancia Por Producto del ${format(fechaIni, "yyyy-MM-dd")} al ${format(fechaFin, "yyyy-MM-dd")}`],
            [],
            ["Resumen de Totales"],
            ["Ventas Totales", resultado.TotalSales.toFixed(2)],
            ["Costo Total", resultado.TotalCost.toFixed(2)],
            ["Ganancia Total", resultado.TotalProfit.toFixed(2)],
            [], // Línea en blanco
            header,
            ...rows,
        ];

        const csvContent =
            resumen
                .map((row) => row.map((cell) => `"${cell}"`).join(","))
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${nombreArchivo}.csv`;
        link.click();
    };


    return (
        <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow space-y-4">
            <h2 className="text-2xl font-bold text-blue-600">Ganancia por Producto</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm mb-1">Fecha Inicial</label>
                    <DatePicker
                        selected={fechaIni}
                        onChange={(date) => setFechaIni(date)}
                        dateFormat="yyyy-MM-dd"
                        className="w-full border px-3 py-2 rounded"
                        placeholderText="Seleccione fecha inicial"
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Fecha Final</label>
                    <DatePicker
                        selected={fechaFin}
                        onChange={(date) => setFechaFin(date)}
                        dateFormat="yyyy-MM-dd"
                        className="w-full border px-3 py-2 rounded"
                        placeholderText="Seleccione fecha final"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleBuscar}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : "Mostrar"}
                    </button>
                </div>

            </div>

            {error && <p className="text-red-600">{error}</p>}

            {resultado && (
                <>

                    <div className="flex gap-3 justify-end mt-4">
                        <button
                            onClick={handleExportCSV}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                        >
                            Exportar a CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                        >
                            Exportar a PDF
                        </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 p-4 rounded text-center shadow">
                            <p className="font-semibold text-gray-600">Ventas Totales</p>
                            <p className="text-lg font-bold text-blue-700">
                                $ {resultado.TotalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded text-center shadow">
                            <p className="font-semibold text-gray-600">Costo Total</p>
                            <p className="text-lg font-bold text-yellow-700">
                                $ {resultado.TotalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded text-center shadow">
                            <p className="font-semibold text-gray-600">Ganancia Total</p>
                            <p className="text-lg font-bold text-green-700">
                                $ {resultado.TotalProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full text-sm border">
                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="border px-3 py-2">Producto</th>
                                    <th className="border px-3 py-2 text-center">Cantidad</th>
                                    <th className="border px-3 py-2 text-center">Venta</th>
                                    <th className="border px-3 py-2 text-center">Costo</th>
                                    <th className="border px-3 py-2 text-center">Ganancia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultado.Items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="border px-3 py-2">{item.Product}</td>
                                        <td className="border px-3 py-2 text-center">{item.Quantity}</td>
                                        <td className="border px-3 py-2 text-right">
                                            $ {item.Sales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

                                        </td>
                                        <td className="border px-3 py-2 text-right">
                                            $ {item.Cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="border px-3 py-2 font-semibold text-green-600 text-right">
                                            $ {item.Profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )
            }
        </div >
    );
};

export default GananciaPorProducto;
