import { useEffect, useState } from "react";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
}

function Users() {

    const [firstUser, setFirstUser] = useState<User | null>(null);

    useEffect(() => {
    fetch("http://localhost:8080/api/auth/users", 
        {credentials: "include"}
    )
        .then(response => response.json())
        .then((data: User[]) => {
        if (data.length > 0) {
            setFirstUser(data[0]);
        }
        })
        .catch(error => console.error("Error:", error));
    }, []);

    return (
    <div>
        <h2>First User</h2>

        {firstUser ? (
        <div>
            <p>Name: {firstUser.firstName} {firstUser.lastName}</p>
            <p>Username: {firstUser.username}</p>
            <p>Email: {firstUser.email}</p>
        </div>
        ) : (
        <p>Loading...</p>
        )}

    </div>
    );
}

export default Users;
