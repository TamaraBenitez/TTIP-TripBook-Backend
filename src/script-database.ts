import { createConnection, Connection, QueryError } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid'; // Importa la función para generar UUIDs

// Configura la conexión a la base de datos
const connectionConfig = {
  host: 'localhost',   // Host de la base de datos
  port: 3307,          // Puerto expuesto en Docker Compose
  user: 'tripbook',    // Usuario configurado en Docker Compose
  password: 'root',    // Contraseña configurada en Docker Compose
  database: 'db_tripbook', // Base de datos configurada en Docker Compose
};

async function mockDataDatabase(): Promise<void> {
  let connection: Connection;

  try {
    connection = await createConnection(connectionConfig);
    console.log('Conectado a la base de datos.');

    // Genera UUIDs para los usuarios
    const user1Id = uuidv4();
    const user2Id = uuidv4();
    const user3Id = uuidv4();

    // Inserta usuarios en la tabla 'user' con UUIDs
    await connection.query(`
      INSERT INTO user (id, name, surname, email, password, age, province, locality, latitud, longitud) VALUES 
      ('${user1Id}', 'Alice', 'Smith', 'alice@example.com', 'password123', 25, 'Neuquén', 'San Carlos de Bariloche', -41.1456, -71.3082),
      ('${user2Id}', 'Bob', 'Johnson', 'bob@example.com', 'password456', 30, 'Mendoza', 'Mendoza Capital', -32.8908, -68.8272),
      ('${user3Id}', 'Charlie', 'Brown', 'charlie@example.com', 'password789', 28, 'Santa Fe', 'Rosario', -32.9468, -60.6393);
    `);

    // Genera UUIDs para los viajes
    const trip1Id = uuidv4();
    const trip2Id = uuidv4();
    const trip3Id = uuidv4();

    // Inserta viajes en la tabla 'trip' con UUIDs
    await connection.query(`
      INSERT INTO trip (id, startPoint, endPoint, startDate, description, estimatedCost, numberOfRegistrants, latitud, longitud) VALUES 
      ('${trip1Id}', 'Neuquén', 'Salta', '2024-09-15','Explora la belleza del norte.', 800000.00, 1, -38.9516, -68.0591),
      ('${trip2Id}', 'Mendoza', 'San Juan', '2024-10-01','Descubre los paisajes cuyanos.', 17351.00, 0, -32.8894, -68.8458),
      ('${trip3Id}', 'Santa Fe', 'Buenos Aires', '2024-11-05','Viaje hacia la ciudad mágica.', 86178.00, 0, -31.6325, -60.7004);
    `);

    // Genera UUIDs para las inscripciones de usuarios a viajes
    const tripUser1Id = uuidv4();
    const tripUser2Id = uuidv4();

    // Inserta inscripciones en la tabla 'trip_users' con coherencia geográfica usando los UUIDs generados
    await connection.query(`
      INSERT INTO trip_users (id, user_id, trip_id, joinDate, status) VALUES 
      ('${tripUser1Id}', '${user1Id}', '${trip1Id}', '2024-08-31 10:00:00', 'confirmed'),  -- Alice viaja desde Neuquén a Salta
      ('${tripUser2Id}', '${user2Id}', '${trip2Id}', '2024-08-31 11:00:00', 'cancelled');  -- Bob se inscribió al viaje desde Mendoza a San Juan pero lo canceló
    `);

    console.log('Datos insertados correctamente.');
  } catch (error: QueryError | any) {
    console.error('Error al insertar datos:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada.');
    }
  }
}

// Ejecuta la función para crear los datos en la base de datos
mockDataDatabase();
