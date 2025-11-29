import mysql.connector

DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "$occer08Fire!"
DB_NAME = "er_hospital_management"


def get_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
    )
