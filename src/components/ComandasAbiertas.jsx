import React, { useState, useEffect } from 'react';
import { postGeneral } from '../services/api';

function ComandasAbiertas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComandas = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await postGeneral('POS/GetOpenComandasSummary');
      if (Array.isArray(result)) {
        setData(result);
      } else {
        console.error('La respuesta no es un arreglo:', result);
        setError('Error al procesar la respuesta del API');
      }
    } catch (error) {
      console.error('Error al obtener las comandas:', error);
      setError('Error al cargar las comandas abiertas');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComandas();
  }, []);

  const handleRefresh = () => {
    fetchComandas();
  };

  // Calcular suma total de Amount
  const totalAmount = data.reduce((sum, item) => sum + (item.Amount || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">
        Comandas Abiertas
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Cargando datos...</p>
      ) : (
        <>
          {/* Sección de suma total */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-700 font-semibold">
              Total de Comandas Abiertas:
            </p>
            <p className="text-3xl font-bold text-blue-600">
              ${totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Botón de actualizar */}
          <div className="mb-4">
            <button
              onClick={handleRefresh}
              className="bg-orange-300 px-4 py-2 rounded hover:bg-orange-400 transition"
            >
              Actualizar Datos
            </button>
          </div>

          {/* Grid/Tabla de items */}
          {data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay comandas abiertas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="border px-4 py-3 font-semibold">Cliente</th>
                    <th className="border px-4 py-3 font-semibold text-right">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border px-4 py-3">{item.ClientName}</td>
                      <td className="border px-4 py-3 text-right font-medium">
                        ${Number(item.Amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ComandasAbiertas;
