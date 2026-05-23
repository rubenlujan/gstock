import {
  Users,
  Package,
  BarChart2,
  Settings,
  HelpCircle,
  Menu,
  LogOut,
  X,
  Warehouse,
  Folder,
  FileText,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Boxes,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Layout({ selected, setSelected, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [catalogosOpen, setCatalogosOpen] = useState(false);
  const [reportesOpen, setReportesOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop]);

  const menuItems = [
    {
      id: 'catalogos',
      label: 'Catálogos',
      icon: <Folder size={18} />,
      subItems: [
        { id: 'almacenes', label: 'Almacenes', icon: <Warehouse size={16} /> },
        { id: 'categorias', label: 'Categorías', icon: <Boxes size={16} /> },
        {
          id: 'tipos_documento',
          label: 'Tipos de Documento',
          icon: <FileText size={16} />,
        },
      ],
    },
    { id: 'articulos', label: 'Productos', icon: <Package size={18} /> },
    { id: 'materiaprima', label: 'Materia Prima', icon: <Package size={18} /> },
    {
      id: 'movimientos',
      label: 'Movimientos al Inventario',
      icon: <ClipboardList size={18} />,
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: <BarChart2 size={18} />,
      subItems: [
        {
          id: 'dateSales',
          label: 'Ventas por Producto',
          icon: <BarChart2 size={16} />,
        },
        {
          id: 'generalProfit',
          label: 'Utilidad por Producto',
          icon: <BarChart2 size={16} />,
        },
        {
          id: 'categoryProfit',
          label: 'Utilidad por Categoria',
          icon: <BarChart2 size={16} />,
        },
        {
          id: 'openComandas',
          label: 'Comandas Abiertas',
          icon: <ClipboardList size={16} />,
        },
      ],
    },
    { id: 'usuarios', label: 'Usuarios', icon: <Users size={18} /> },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: <Settings size={18} />,
    },
    { id: 'ayuda', label: 'Ayuda', icon: <HelpCircle size={18} /> },
    { id: 'logout', label: 'Cerrar Sesión', icon: <LogOut size={18} /> },
  ];

  const handleClick = (item) => {
    if (item.id === 'logout') {
      sessionStorage.clear();
      navigate('/login');
      return;
    }
    if (item.id === 'catalogos') {
      setCatalogosOpen((prev) => !prev);
    } else if (item.id === 'reportes') {
      setReportesOpen((prev) => !prev);
    } else {
      setSelected(item.id);
      setSidebarOpen(false);
    }
  };

  const handleSubClick = (subItemId) => {
    setSelected(subItemId);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AnimatePresence>
        {(sidebarOpen || isDesktop) && (
          <motion.div
            key="sidebar"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-white shadow-md p-6 z-40 md:static md:translate-x-0 md:shadow-md md:flex md:flex-col"
          >
            {!isDesktop && (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-600">G-Stock</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X />
                </button>
              </div>
            )}

            {isDesktop && (
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <img
                    src="http://hrg-it.com/img/esfera_small.png"
                    alt="Logo"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <h2 className="text-2xl font-bold text-blue-600">G-Stock</h2>
                </div>
              </div>
            )}

            <ul className="space-y-2">
              {menuItems.map((item) =>
                item.subItems ? (
                  <li key={item.id}>
                    <button
                      onClick={() => handleClick(item)}
                      className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition-all ${
                        (item.id === 'catalogos' && catalogosOpen) ||
                        (item.id === 'reportes' && reportesOpen)
                          ? 'bg-blue-100 text-blue-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        {item.label}
                      </span>
                      {(item.id === 'catalogos' && catalogosOpen) ||
                      (item.id === 'reportes' && reportesOpen) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {(item.id === 'catalogos' && catalogosOpen) ||
                      (item.id === 'reportes' && reportesOpen) ? (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-6 mt-2 space-y-1 overflow-hidden"
                        >
                          {item.subItems.map((sub) => (
                            <li
                              key={sub.id}
                              onClick={() => handleSubClick(sub.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all text-sm ${
                                selected === sub.id
                                  ? 'bg-blue-100 text-blue-700 font-semibold'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {sub.icon}
                              {sub.label}
                            </li>
                          ))}
                        </motion.ul>
                      ) : null}
                    </AnimatePresence>
                  </li>
                ) : (
                  <li
                    key={item.id}
                    onClick={() => handleClick(item)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                      selected === item.id
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </li>
                )
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 p-2 w-full overflow-auto">
        {!isDesktop && (
          <button
            className="mb-4 flex items-center gap-2 text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
            <span>Abrir menú G-Stock</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );
}

export default Layout;
