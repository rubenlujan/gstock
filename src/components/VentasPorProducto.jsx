import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { post } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const VentasPorProducto = () => {
  const [fechaIni, setFechaIni] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuscar = async () => {
    if (!fechaIni || !fechaFin) {
      setError('Seleccione ambas fechas.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await post('GetSalesByProduct', {
        DateIni: format(fechaIni, 'yyyy-MM-dd'),
        DateEnd: format(fechaFin, 'yyyy-MM-dd'),
      });

      if (res.Message && res.Message.trim() !== '') {
        setResultado(null);
        alert(res.Message);
      } else {
        setResultado(res);
      }
    } catch (err) {
      console.error(err);
      setError('Error al consultar el API.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    console.log('Exportando a PDF...');
    if (
      !resultado ||
      !resultado.DetailSales ||
      resultado.DetailSales.length === 0
    )
      return;

    const fechaInicioStr = format(fechaIni, 'yyyy-MM-dd');
    const fechaFinStr = format(fechaFin, 'yyyy-MM-dd');
    const nombreArchivo = `Ventas_Producto_${fechaInicioStr}_a_${fechaFinStr}`;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(
      `Reporte de Ventas por Producto del ${format(fechaIni, 'yyyy-MM-dd')} al ${format(fechaFin, 'yyyy-MM-dd')}`,
      14,
      15
    );

    // Resumen de totales
    doc.setFontSize(11);
    doc.text(
      `Ventas Totales: $ ${resultado.TotalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      14,
      25
    );
    doc.text(
      `Pago Efectivo: $ ${resultado.CashSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      14,
      32
    );
    doc.text(
      `Pago Tarjeta: $ ${resultado.CreditSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      14,
      39
    );
    var totalTarjetaSinComision = resultado.CreditSales * 0.965;
    doc.text(
      `Tarjeta (Sin 3.5%): $ ${totalTarjetaSinComision.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      14,
      46
    );

    const tableData = resultado.DetailSales.map((item) => [
      item.GroupSale,
      item.QuantitySold,
      `$ ${item.TotalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$ ${item.CashSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$ ${item.CreditSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      head: [['Producto', 'Cantidad', 'Total', 'Efectivo', 'Tarjeta']],
      body: tableData,
      startY: 52,
    });

    doc.save(`${nombreArchivo}.pdf`);
  };

  const handleExportCSV = () => {
    console.log('Exportando a CSV...');
    if (
      !resultado ||
      !resultado.DetailSales ||
      resultado.DetailSales.length === 0
    )
      return;

    const fechaInicioStr = format(fechaIni, 'yyyy-MM-dd');
    const fechaFinStr = format(fechaFin, 'yyyy-MM-dd');
    const nombreArchivo = `VentasProducto_${fechaInicioStr}_a_${fechaFinStr}`;
    const header = ['Producto', 'Cantidad', 'Venta', 'Efectivo', 'Tarjeta'];
    const rows = resultado.DetailSales.map((item) => [
      item.GroupSale,
      item.QuantitySold,
      item.TotalSales.toFixed(2),
      item.CashSales.toFixed(2),
      item.CreditSales.toFixed(2),
    ]);

    const resumen = [
      [
        `Reporte de Ventas Por Producto del ${format(fechaIni, 'yyyy-MM-dd')} al ${format(fechaFin, 'yyyy-MM-dd')}`,
      ],
      [],
      ['Resumen de Totales'],
      ['Ventas Totales', resultado.TotalSales.toFixed(2)],
      ['Efectivo', resultado.TotalCost.toFixed(2)],
      ['Tarjeta', resultado.TotalProfit.toFixed(2)],
      [], // Línea en blanco
      header,
      ...rows,
    ];

    const csvContent = resumen
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nombreArchivo}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold text-blue-600">Ventas por Producto</h2>

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
            {loading ? 'Procesando...' : 'Mostrar'}
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
              Exportar PDF
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded text-center shadow">
              <p className="font-semibold text-gray-600">Ventas Totales</p>
              <p className="text-lg font-bold text-blue-700">
                ${' '}
                {resultado.TotalSales.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded text-center shadow">
              <p className="font-semibold text-gray-600">Costo Total</p>
              <p className="text-lg font-bold text-yellow-700">
                ${' '}
                {resultado.CashSales.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded text-center shadow">
              <p className="font-semibold text-gray-600">Ganancia Total</p>
              <p className="text-lg font-bold text-green-700">
                ${' '}
                {resultado.CreditSales.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border px-3 py-2">Producto</th>
                  <th className="border px-3 py-2 text-center">Cantidad</th>
                  <th className="border px-3 py-2 text-center">Total</th>
                  <th className="border px-3 py-2 text-center">Efectivo</th>
                  <th className="border px-3 py-2 text-center">Tarjeta</th>
                </tr>
              </thead>
              <tbody>
                {resultado.DetailSales.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{item.GroupSale}</td>
                    <td className="border px-3 py-2 text-center">
                      {item.QuantitySold}
                    </td>
                    <td className="border px-3 py-2 text-right">
                      ${' '}
                      {item.TotalSales.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border px-3 py-2 text-right">
                      ${' '}
                      {item.CashSales.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border px-3 py-2 font-semibold text-green-600 text-right">
                      ${' '}
                      {item.CreditSales.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default VentasPorProducto;
