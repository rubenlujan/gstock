import React, { useState, useEffect } from "react";
import { post } from "../services/api";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ModalMensaje } from "./ModalMensaje";


const MovimientosInventario = () => {
    const navigate = useNavigate();
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [articulosDisponibles, setArticulosDisponibles] = useState([]);
    const [filtroArticulo, setFiltroArticulo] = useState("");
    const [almacen, setAlmacen] = useState("");
    const [almacenes, setAlmacenes] = useState([]);
    const [conceptos, setConceptos] = useState([]);
    const location = useLocation();
    const action = location.state?.action || 0;
    const recordId = location.state?.recordId || null;
    const [concepto, setConcepto] = useState("");
    const [numero, setNumero] = useState("");
    const [fecha, setFecha] = useState(new Date().toISOString().substr(0, 10));
    const [status, setStatus] = useState("PENDIENTE");
    const [notas, setNotas] = useState("");

    const [cantidad, setCantidad] = useState(1);
    const [precio, setPrecio] = useState(0);
    const [costo, setCosto] = useState(0);
    const [items, setItems] = useState([]);

    const [conceptoHabilitado, setConceptoHabilitado] = useState(false);
    const [camposBloqueados, setCamposBloqueados] = useState(false);

    const [indexAEliminar, setIndexAEliminar] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [mensajeModal, setMensajeModal] = useState("");
    const [rutaRedireccion, setRutaRedireccion] = useState(null);


    const resetFormulario = () => {
        setAlmacen(almacenes.length > 0 ? almacenes[0].Id : "");
        setConcepto(conceptos.length > 0 ? conceptos[0].Id : "");
        setNumero("");
        setFecha(new Date().toISOString().substr(0, 10));
        setStatus("PENDIENTE");
        setNotas("");
        setArticulo("");
        setCantidad(1);
        setPrecio(0);
        setCosto(0);
        setItems([]);
    };

    const cargarArticulos = async () => {
        try {
            const res = await post("GetAllRawMaterial");
            if (res?.ItemList) setArticulosDisponibles(res.ItemList);
        } catch (error) {
            console.error("Error cargando artículos:", error);
        }
    };
    const cargarAlmacenes = async () => {
        try {
            const res = await post("GetAllWarehouse");
            const lista = res.CatalogList || [];
            setAlmacenes(lista);
            if (lista.length > 0 && action === 0) {
                setAlmacen(lista[0].Id);
            }
        } catch (err) {
            console.error("Error cargando almacenes", err);
        }
    };

    const cargarDocTypes = async () => {
        try {
            const res = await post("GetAllDocTypes");
            const lista = res.CatalogList || [];
            setConceptos(lista);
            if (lista.length > 0 && action === 0) {
                setAlmacen(lista[0].Id);
            }
        } catch (err) {
            console.error("Error cargando almacenes", err);
        }
    };
    useEffect(() => {
        cargarAlmacenes();
        cargarDocTypes();
        cargarArticulos();
    }, []);

    useEffect(() => {
        if (action === 1 && recordId) {
            const fetchData = async () => {
                try {
                    const request = {
                        CompanyId: 1,
                        WarehouseId: recordId.almacenId,
                        DocType: recordId.docType,
                        DocNum: recordId.docNum,
                    };

                    const result = await post("GetDocInvByDoc", request);

                    setAlmacen(result.AlmacenId);
                    setConcepto(result.DocTypeId);
                    setNumero(result.DocNum);
                    setFecha(result.DateMov);
                    setStatus(result.StatusDoc);
                    setNotas(result.Notes);

                    const mappedItems = result.Items.map((item) => ({
                        articulo: item.ItemDsc,
                        cantidad: item.Quantity,
                        precio: 0,
                        costo: item.Cost_U,
                    }));
                    setItems(mappedItems);
                } catch (error) {
                    console.error("Error al cargar documento: ", error);
                }
            };
            fetchData();
        }
    }, [action, recordId]);

    useEffect(() => {
        if (almacen) {
            setConceptoHabilitado(true);
        } else {
            setConceptoHabilitado(false);
        }
    }, [almacen]);

    const handleAgregar = () => {
        if (!filtroArticulo.trim()) {
            setMensajeModal("Selecciona un artículo válido de la lista.");
            setMostrarModal(true);
            return;
        }

        const articuloSeleccionado = articulosDisponibles.find(
            (a) => a.Name.toLowerCase() === filtroArticulo.toLowerCase()
        );

        if (!articuloSeleccionado) {
            if (!articuloSeleccionado) {
                setMensajeModal("Selecciona un artículo válido de la lista.");
                setMostrarModal(true);
                return;
            }

            return;
        }

        const nuevoItem = {
            articulo: filtroArticulo,
            articuloId: articuloSeleccionado.Id,
            cantidad,
            precio,
            costo,
        };

        setItems((prev) => [...prev, nuevoItem]);
        setFiltroArticulo("");
        setCantidad(1);
        setPrecio(0);
        setCosto(0);
    };

    const handleConceptoChange = async (e) => {
        const nuevoConcepto = e.target.value;
        setConcepto(nuevoConcepto);

        if (nuevoConcepto && almacen) {
            try {
                const req = {
                    CompanyId: 1,
                    WarehouseId: almacen,
                    DocType: nuevoConcepto,
                };
                const res = await post("GetDocInvNewId", req);
                if (res.Result) {
                    setNumero(res.Result);
                    setCamposBloqueados(true); // Bloqueamos campos después de asignar el número
                }
            } catch (error) {
                console.error("Error al obtener nuevo número de documento", error);
            }
        }
    };



    const handleCancelarEdicion = () => {
        navigate("/", { state: { selectedPage: "movimientos" } });

    };

    const handleGuardar = async () => {
        if (!almacen || !concepto || !numero || items.length === 0) {
            setMensajeModal("Todos los campos deben estar llenos y debe haber al menos un artículo.");
            setMostrarModal(true);
            return;
        }

        const almacenDesc = almacenes.find((a) => a.Id.toString() === almacen)?.Description || "";

        const request = {
            DocInvData: {
                AlmacenId: parseInt(almacen),
                Almacen: almacenDesc,
                DocTypeId: concepto,
                DocNum: numero,
                DateMov: fecha,
                Notes: notas,
                Items: items.map((item, i) => ({
                    PartId: i + 1,
                    Item_Id: item.articuloId,
                    ItemDsc: item.articulo,
                    Quantity: item.cantidad,
                }))
            }
        };

        try {
            await post("AddDocInv", request);
            setMensajeModal("Documento guardado correctamente.");
            setRutaRedireccion("/docinv");
            setMostrarModal(true);
        } catch (error) {
            setMensajeModal("Error al guardar el documento.");
            setMostrarModal(true);
        }
    };

    const confirmarEliminar = (index) => {
        setIndexAEliminar(index);
        setMostrarConfirmacion(true);
    };
    const eliminarArticulo = () => {
        if (indexAEliminar !== null) {
            const nuevaLista = [...items];
            nuevaLista.splice(indexAEliminar, 1);
            setItems(nuevaLista);
            setIndexAEliminar(null);
            setMostrarConfirmacion(false);
        }
    };
    const handleCerrarModal = () => {
        setMostrarModal(false);
        if (rutaRedireccion) {
            navigate(rutaRedireccion);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">
                {action === 0 ? 'Nuevo Movimiento al Inventario' : 'Editar Movimiento al Inventario'}
            </h1>

            <div className="flex space-x-2 mb-6">
                <button
                    onClick={() => {
                        resetFormulario();
                        if (action !== 0) navigate("/docinv/editar", { state: { action: 0 } });
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Nuevo
                </button>


                <button disabled={action === 0} className={`px-4 py-2 rounded  ${action === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>Cancelar Documento</button>
                <button onClick={handleGuardar} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar</button>
                <button onClick={handleCancelarEdicion} className="hidden bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Cancelar Edición</button>
                <button onClick={handleCancelarEdicion} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Salir</button>
            </div>

            <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Almacén</label>
                    <select
                        value={almacen}
                        onChange={e => setAlmacen(e.target.value)}
                        disabled={camposBloqueados}
                        className={`w-full border px-3 py-2 rounded ${action === 1 ? 'bg-gray-300 cursor-not-allowed' : ''}`} >
                        {almacenes.map((alm) => (
                            <option key={alm.Id} value={alm.Id}>{alm.Description}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Concepto</label>
                    <select
                        value={concepto}
                        onChange={handleConceptoChange}
                        disabled={!conceptoHabilitado || camposBloqueados}
                        className={`w-full border px-3 py-2 rounded ${action === 1 ? 'bg-gray-300 cursor-not-allowed' : ''}`} >
                        <option value="">Seleccione...</option>
                        {conceptos.map((alm) => (
                            <option key={alm.Id} value={alm.Id}>{alm.Description}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Número</label>
                    <input
                        type="text"
                        value={numero}
                        onChange={e => setNumero(e.target.value)}
                        readOnly
                        className={`w-full border px-3 py-2 rounded bg-gray-300 cursor-not-allowed`}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha</label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <input
                        type="text"
                        value={status}
                        disabled={true}
                        readOnly
                        className={`w-full border px-3 py-2 rounded bg-gray-300 cursor-not-allowed`}
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1">Notas</label>
                    <textarea
                        value={notas}
                        onChange={e => setNotas(e.target.value)}
                        rows={3}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">Artículos</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4">
                    <div className="md:col-span-2 relative">
                        <label className="block text-sm font-medium mb-1">Artículo</label>
                        <input
                            type="text"
                            value={filtroArticulo}
                            onChange={(e) => {
                                setFiltroArticulo(e.target.value);
                                setMostrarSugerencias(true);
                            }}
                            placeholder="Buscar artículo..."
                            className="w-full border px-3 py-2 rounded"
                            onFocus={() => setMostrarSugerencias(true)}
                        />
                        {mostrarSugerencias && filtroArticulo.length > 0 && (
                            <ul className="absolute z-10 bg-white border rounded w-full max-h-40 overflow-y-auto shadow-md">
                                {articulosDisponibles
                                    .filter((a) =>
                                        a.Name.toLowerCase().includes(filtroArticulo.toLowerCase())
                                    )
                                    .map((a) => (
                                        <li
                                            key={a.Id}
                                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                            onClick={() => {
                                                setFiltroArticulo(a.Name);
                                                setMostrarSugerencias(false);
                                            }}
                                        >
                                            {a.Name}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Cantidad</label>
                        <input
                            type="number"
                            value={cantidad}
                            onChange={e => setCantidad(Number(e.target.value))}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="hidden block text-sm font-medium mb-1">Precio</label>
                        <input
                            type="number"
                            value={precio}
                            onChange={e => setPrecio(Number(e.target.value))}
                            className="hidden w-full border px-3 py-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="hidden block text-sm font-medium mb-1">Costo</label>
                        <input
                            type="number"
                            value={costo}
                            onChange={e => setCosto(Number(e.target.value))}
                            className="hidden w-full border px-3 py-2 rounded"
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleAgregar}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                        >
                            Agregar
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-3 py-2">#</th>
                                <th className="border px-3 py-2">Artículo</th>
                                <th className="border px-3 py-2">Cantidad</th>
                                <th className="hidden border px-3 py-2">Precio</th>
                                <th className="hidden border px-3 py-2">Costo</th>
                                <th className="border px-3 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="border px-3 py-2 text-center">{idx + 1}</td>
                                    <td className="border px-3 py-2">{it.articulo}</td>
                                    <td className="border px-3 py-2 text-center">{it.cantidad}</td>
                                    <td className="hidden border px-3 py-2 text-right">${it.precio}</td>
                                    <td className="hidden border px-3 py-2 text-right">${it.costo}</td>
                                    <td className="border px-3 py-2 text-center">
                                        <button
                                            onClick={() => confirmarEliminar(idx)}
                                            className="text-red-600 hover:underline">Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-4 text-gray-500">
                                        No hay artículos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ModalMensaje
                show={mostrarModal}
                onClose={handleCerrarModal}
                titulo="Mensaje"
                mensaje={mensajeModal}
            />
            <ModalMensaje
                show={mostrarConfirmacion}
                onClose={() => setMostrarConfirmacion(false)}
                titulo="Confirmar eliminación"
                mensaje="¿Deseas eliminar este artículo del listado?"
                botones={[
                    {
                        texto: "Cancelar",
                        onClick: () => setMostrarConfirmacion(false),
                        estilo: "bg-gray-400 hover:bg-gray-500",
                    },
                    {
                        texto: "Eliminar",
                        onClick: eliminarArticulo,
                        estilo: "bg-red-600 hover:bg-red-700",
                    },
                ]}
            />
        </div>
    );
};




export default MovimientosInventario;
