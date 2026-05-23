import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import { ArticuloEditar } from './components/ArticuloEditar';
import { ArticuloNuevo } from './components/ArticuloNuevo';
import { Login } from './components/Login';
import Articulos from './components/Articulos';
import Configuracion from './components/Configuracion';
import { MateriaPrimaEditar } from './components/MateriaPrimaEditar';
import { MateriaPrimaNueva } from './components/MateriaPrimaNueva';
import MovimientosInventario from './components/MovimientosInventario';
import DocInv from './components/DocInv';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          }
        />
        <Route
          path="/articulos"
          element={
            <PrivateRoute>
              <Articulos />
            </PrivateRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <PrivateRoute>
              <Configuracion />
            </PrivateRoute>
          }
        />
        <Route
          path="/articulos/editar/:id"
          element={
            <PrivateRoute>
              <ArticuloEditar />
            </PrivateRoute>
          }
        />
        <Route
          path="/articulos/nuevo"
          element={
            <PrivateRoute>
              <ArticuloNuevo />
            </PrivateRoute>
          }
        />
        <Route
          path="/materiaprima/editar/:id"
          element={
            <PrivateRoute>
              <MateriaPrimaEditar />
            </PrivateRoute>
          }
        />
        <Route
          path="/materiaprima/nuevo"
          element={
            <PrivateRoute>
              <MateriaPrimaNueva />
            </PrivateRoute>
          }
        />
        <Route
          path="/docinv/editar"
          element={
            <PrivateRoute>
              <MovimientosInventario action={1} />
            </PrivateRoute>
          }
        />
        <Route
          path="/docinv"
          element={
            <PrivateRoute>
              <App initialPage="movimientos" />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
