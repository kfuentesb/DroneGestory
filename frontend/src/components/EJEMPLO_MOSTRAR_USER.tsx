import { useEffect, useState } from "react";

function Users() {

    const [users, setUsers] = useState([]);

    useEffect(() => {
    fetch("http://localhost:8080/api/users")
        .then(res => res.json())
        .then(data => setUsers(data));
    }, []);

    return (
    <div>
        <h1>Users</h1>

        {users.map(user => (
            // da error no se detectan los campos, hay q arreglar el user controller para que devuelva un json con los campos correctos, o crear un DTO para eso
            // <p key={user.user_id}>{user.first_name} {user.last_name}</p>
            <p></p>
        ))}
    </div>
    );
}

export default Users;