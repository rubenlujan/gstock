import { API_BASE_URL } from '../config/apiConfig';

// Suponiendo que tienes una función para obtener el CompanyId
const getCompanyId = () => {
  return parseInt(sessionStorage.getItem('CompanyId')); //1;
};

export const postWithCompany = async (endpoint, body = {}) => {
  //console.log("Entró");
  const fullBody = {
    ...body,
    CompanyId: getCompanyId(),
  };
  console.log(
    'POST a:',
    `${API_BASE_URL}/${endpoint}`,
    'con body:',
    JSON.stringify(fullBody)
  );
  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fullBody),
  });

  if (!res.ok) throw new Error(`Error en POST a ${endpoint}`);

  const json = await res.json();

  /*console.log("Response:", json);*/

  //return res.json();
  return json;
};

export const post = async (endpoint, body = {}) => {
  const fullBody = {
    ...body,
  };
  console.log(
    'POST a:',
    `${API_BASE_URL}/${endpoint}`,
    'con body:',
    JSON.stringify(fullBody)
  );

  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fullBody),
  });

  if (!res.ok) throw new Error(`Error en POST a ${endpoint}`);

  /*const json = await res.json();
  console.log('Response:', json);*/

  return res.json();
};

const API_URL = '/api/Usuarios'; // cambia la URL si tu API está en otro puerto

const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  const companyId = getCompanyId();
  if (companyId) params.CompanyId = companyId;

  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value)
  );

  return url.toString();
};

export const getItemById = async (id) => {
  const url = buildUrl(`Item/${id}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener el artículo');
  return res.json();
};

export const updateItem = async (itemData) => {
  const companyId = getCompanyId();

  const requestBody = {
    ...itemData,
    CompanyId: companyId,
  };

  const res = await fetch(`${API_BASE_URL}/Item`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) throw new Error('Error al actualizar el artículo');
  return res.json();
};

export const getAllCategorias = async () => {
  const url = buildUrl('Categories');
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener categorías');
  return res.json();
};

export const getUsers = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const createUser = async (user) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return res.json();
};

export const updateUser = async (id, user) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return res.json();
};

export const deleteUser = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
};
