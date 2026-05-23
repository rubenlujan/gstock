import { useState, useEffect } from 'react';
import CatalogoBase from './components/Catalogo';
import Usuarios from './pages/Usuarios';
import Layout from './components/Layout';
import Articulos from './components/Articulos';
import MateriaPrima from './components/MateriaPrima';
import DocInv from './components/DocInv';
import Configuracion from './components/Configuracion';
import GananciaPorProducto from './components/GananciaPorProducto';
import GananciaPorCategoria from './components/GananciaPorCategoria';
import { useLocation } from 'react-router-dom';
import { startInactivityListener } from './utils/inactivity';
import ComandasAbiertas from './components/ComandasAbiertas';
import VentasPorProducto from './components/VentasPorProducto';

function App({ initialPage = '' }) {
  useEffect(() => {
    startInactivityListener();
  }, []);

  const location = useLocation();
  const [selectedPage, setSelectedPage] = useState(() => {
    // Solo usar el state si viene explícitamente, y estás regresando de alguna edición
    if (location.state?.selectedPage) {
      return location.state.selectedPage;
    }
    return initialPage;
  });

  return (
    <Layout selected={selectedPage} setSelected={setSelectedPage}>
      {selectedPage === 'usuarios' && <Usuarios />}
      {selectedPage === 'almacenes' && (
        <CatalogoBase titulo="Almacenes" apiEndpoint="GetAllWarehouse" />
      )}
      {selectedPage === 'categorias' && (
        <CatalogoBase titulo="Categorías" apiEndpoint="GetAllCategories" />
      )}
      {selectedPage === 'tipos_documento' && (
        <CatalogoBase
          titulo="Tipos de Documento"
          apiEndpoint="GetAllWarehouse"
        />
      )}
      {selectedPage === 'dateSales' && <VentasPorProducto />}
      {selectedPage === 'generalProfit' && <GananciaPorProducto />}
      {selectedPage === 'categoryProfit' && <GananciaPorCategoria />}
      {selectedPage === 'openComandas' && <ComandasAbiertas />}
      {selectedPage === 'articulos' && <Articulos />}
      {selectedPage === 'materiaprima' && <MateriaPrima />}
      {selectedPage === 'movimientos' && <DocInv />}
      {selectedPage === 'configuracion' && <Configuracion />}
      {selectedPage === 'ayuda' && <p>Ayuda y soporte</p>}
    </Layout>
  );
}

export default App;
