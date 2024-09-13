import { createPool } from 'mysql2/promise'; // Replace with pg if using PostgreSQL

const pool = createPool({
    host: 'localhost',   // Host de la base de datos
    port: 3307,          // Puerto expuesto en Docker Compose
    user: 'tripbook',    // Usuario configurado en Docker Compose
    password: 'root',    // Contraseña configurada en Docker Compose
    database: 'db_tripbook', // Base de datos configurada en Docker Compose
});

async function cleanDatabase(): Promise<void> {
  let connection;

  try {
    connection = await pool.getConnection();
    console.log('Conectado a la base de datos.');

     // Drop the existing database (replace 'mydb' with your database name)
     await connection.query(`DROP DATABASE IF EXISTS db_tripbook;`);

     // Recreate the database
     await connection.query(`CREATE DATABASE db_tripbook;`);

    console.log('Datos eliminados correctamente.');
  } catch (error: any) {
    console.error('Error al limpiar la base de datos:', error);
  } finally {
    if (connection) {
      await pool.releaseConnection(connection); // Release the connection back to the pool
      console.log('Conexión cerrada.');
    }
  }
}

// Run the clean function
cleanDatabase().catch((err) => console.error('Error:', err));