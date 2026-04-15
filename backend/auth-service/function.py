"""
Authentication Lambda function for login, register, and token validation.
"""

import json
import logging
import os
from urllib.parse import parse_qs

# Configure logging for Lambda
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# PostgreSQL connection string built from environment variables with sensible defaults
PG_CONFIG = (
    f"host={os.getenv('POSTGRES_HOST', 'localhost')} "
    f"port={os.getenv('POSTGRES_PORT', '5432')} "
    f"user={os.getenv('POSTGRES_USER', 'test')} "
    f"password={os.getenv('POSTGRES_PASS', 'test')} "
    f"dbname={os.getenv('POSTGRES_NAME', 'test')} "
    f"connect_timeout=15"
)

def get_db_connection():
    """Create database connection."""
    import psycopg2
    return psycopg2.connect(
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        port=int(os.getenv('POSTGRES_PORT', '5432')),
        user=os.getenv('POSTGRES_USER', 'test'),
        password=os.getenv('POSTGRES_PASS', 'test'),
        database=os.getenv('POSTGRES_NAME', 'test'),
        connect_timeout=15
    )

def create_tables_if_not_exists():
    """Create user table if it doesn't exist."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(255) PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'member',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
    finally:
        conn.close()

def hash_password(password):
    """Simple password hashing (in production, use bcrypt)."""
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify password against hash."""
    return hash_password(password) == hashed

def create_access_token(user_id, email, role):
    """Create a simple JWT-like token (in production, use proper JWT)."""
    import base64
    import json
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": 9999999999  # Simple token for demo
    }
    token_data = base64.b64encode(json.dumps(payload).encode()).decode()
    return f"Bearer {token_data}"

def decode_token(token):
    """Decode and verify token."""
    if not token or not token.startswith("Bearer "):
        return None
    
    try:
        import base64
        import json
        token_data = token.split(" ")[1]
        payload = json.loads(base64.b64decode(token_data).decode())
        return payload
    except Exception:
        return None

def handler(event=None, context=None):
    """
    Authentication handler for login, register, and token validation.

    Args:
        event (dict): The Lambda event containing HTTP request info
        context (object): The Lambda context

    Returns:
        dict: HTTP response with statusCode, headers, and body
    """
    logger.debug("Received event: %s", event)
    
    # Initialize database tables
    create_tables_if_not_exists()
    
    try:
        # Parse HTTP request
        http_method = event.get('httpMethod', event.get('requestContext', {}).get('http', {}).get('method', 'GET'))
        path = event.get('path', '/')
        
        # Parse body for POST requests
        body = {}
        if http_method in ['POST', 'PUT'] and event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                body = parse_qs(event['body'])
                # Convert lists to single values
                body = {k: v[0] if isinstance(v, list) and len(v) == 1 else v for k, v in body.items()}
        
        # Route the request
        if path == '/api/auth/login' and http_method == 'POST':
            return handle_login(body)
        elif path == '/api/auth/register' and http_method == 'POST':
            return handle_register(body)
        elif path == '/api/auth/me' and http_method == 'GET':
            return handle_get_current_user(event)
        else:
            return {
                "statusCode": 404,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Endpoint not found"})
            }
            
    except Exception as e:
        logger.error("Handler error: %s", str(e))
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Internal server error",
                "message": str(e)
            })
        }

def handle_login(body):
    """Handle user login."""
    try:
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Email and password are required"})
            }
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT id, email, password, name, role FROM users WHERE email = %s", (email.lower(),))
                user = cur.fetchone()
                
                if not user or not verify_password(password, user[2]):
                    return {
                        "statusCode": 401,
                        "headers": {"Content-Type": "application/json"},
                        "body": json.dumps({"error": "Invalid email or password"})
                    }
                
                # Create token
                token = create_access_token(user[0], user[1], user[4])
                
                return {
                    "statusCode": 200,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({
                        "token": token,
                        "user": {
                            "id": user[0],
                            "email": user[1],
                            "name": user[3],
                            "role": user[4]
                        }
                    })
                }
        finally:
            conn.close()
            
    except Exception as e:
        logger.error("Login error: %s", str(e))
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Login failed", "message": str(e)})
        }

def handle_register(body):
    """Handle user registration."""
    try:
        email = body.get('email')
        password = body.get('password')
        name = body.get('name')
        role = body.get('role', 'member')
        
        if not email or not password or not name:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Email, password, and name are required"})
            }
        
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                # Check if user already exists
                cur.execute("SELECT id FROM users WHERE email = %s", (email.lower(),))
                if cur.fetchone():
                    return {
                        "statusCode": 400,
                        "headers": {"Content-Type": "application/json"},
                        "body": json.dumps({"error": "Email already registered"})
                    }
                
                # Create new user
                import uuid
                user_id = str(uuid.uuid4())
                hashed_password = hash_password(password)
                
                cur.execute(
                    "INSERT INTO users (id, email, password, name, role) VALUES (%s, %s, %s, %s, %s)",
                    (user_id, email.lower(), hashed_password, name, role)
                )
                conn.commit()
                
                return {
                    "statusCode": 201,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({
                        "message": "User registered successfully",
                        "user_id": user_id
                    })
                }
        finally:
            conn.close()
            
    except Exception as e:
        logger.error("Register error: %s", str(e))
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Registration failed", "message": str(e)})
        }

def handle_get_current_user(event):
    """Handle getting current user info from token."""
    try:
        # Get token from headers
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization') or headers.get('authorization')
        
        if not auth_header:
            return {
                "statusCode": 401,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "No authorization header"})
            }
        
        # Decode token
        token_data = decode_token(auth_header)
        if not token_data:
            return {
                "statusCode": 401,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Invalid token"})
            }
        
        # Get user from database
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, email, name, role FROM users WHERE id = %s",
                    (token_data['user_id'],)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        "statusCode": 401,
                        "headers": {"Content-Type": "application/json"},
                        "body": json.dumps({"error": "User not found"})
                    }
                
                return {
                    "statusCode": 200,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({
                        "id": user[0],
                        "email": user[1],
                        "name": user[2],
                        "role": user[3]
                    })
                }
        finally:
            conn.close()
            
    except Exception as e:
        logger.error("Get current user error: %s", str(e))
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Failed to get user info", "message": str(e)})
        }

# Main entry point for local testing
if __name__ == "__main__":
    # Test the handler
    test_event = {
        "httpMethod": "GET",
        "path": "/api/auth/me",
        "headers": {}
    }
    print(json.dumps(handler(test_event), indent=2))
