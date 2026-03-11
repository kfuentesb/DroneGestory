import bcrypt

def hash_password(password: str) -> str:
    # Convert to bytes
    password_bytes = password.encode('utf-8')

    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)

    return hashed.decode('utf-8')


if __name__ == "__main__":
    password = input("Enter password to hash: ")
    hashed_password = hash_password(password)

    print("\nBCrypt hash (compatible with Spring Security):")
    print(hashed_password)