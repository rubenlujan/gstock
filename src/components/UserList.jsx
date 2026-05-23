import { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../services/api';

function UserList({ onEdit }) {
    const [users, setUsers] = useState([]);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            await deleteUser(id);
            fetchUsers(); // recargar lista
        }
    };

    return (
        <div>
            <h2>Lista de Usuarios</h2>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Status</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.nombre}</td>
                            <td>{u.rol}</td>
                            <td>{u.status}</td>
                            <td>
                                <button onClick={() => onEdit(u)}>Editar</button>
                                <button onClick={() => handleDelete(u.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserList;
