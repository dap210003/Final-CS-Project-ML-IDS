import psycopg2
from psycopg2.extras import RealDictCursor
from config import Config

class Database:
    """Database connection manager"""
    
    def __init__(self):
        self.conn = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(
                Config.DATABASE_URL,
                cursor_factory=RealDictCursor
            )
            return self.conn
        except Exception as e:
            print(f"Database connection error: {e}")
            raise
            
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            
    def execute_query(self, query, params=None, fetch=True):
        """
        Execute a database query
        
        Args:
            query: SQL query string
            params: Query parameters (tuple or dict)
            fetch: Whether to fetch results
            
        Returns:
            Query results if fetch=True, else None
        """
        cursor = self.conn.cursor()
        try:
            cursor.execute(query, params)
            if fetch:
                results = cursor.fetchall()
                cursor.close()
                return results
            else:
                self.conn.commit()
                cursor.close()
                return None
        except Exception as e:
            self.conn.rollback()
            cursor.close()
            raise e
            
    def execute_insert(self, query, params=None):
        """
        Execute INSERT query and return inserted ID
        
        Args:
            query: SQL INSERT query with RETURNING clause
            params: Query parameters
            
        Returns:
            Inserted record ID
        """
        cursor = self.conn.cursor()
        try:
            cursor.execute(query, params)
            result = cursor.fetchone()
            self.conn.commit()
            cursor.close()
            return result['id'] if result else None
        except Exception as e:
            self.conn.rollback()
            cursor.close()
            raise e

# Global database instance
db = Database()