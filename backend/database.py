# database.py
import psycopg2
from config import DB_CONFIG

def connect_db():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

def close_db(conn):
    if conn:
        conn.close()
