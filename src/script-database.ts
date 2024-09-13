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
      ('${user3Id}', 'Charlie', 'Brown', 'charlie@example.com', 'password789', 28, 'Santa Fe', 'Rosario', -32.9468, -60.6393),
      ('testid1', 'Mock', 'User', 'mockuser@example.com', 'password111', 11, 'La Plata', 'Buenos Aires', -32.9468, -60.6393);
    `);

    // Generate UUIDs for the trips
const trip1Id = uuidv4();
const trip2Id = uuidv4();
const trip3Id = uuidv4();
const trip4Id = uuidv4();
const trip5Id = uuidv4();
const trip6Id = uuidv4();
const trip7Id = uuidv4();
const trip8Id = uuidv4();

// Insert trips into the 'trip' table with UUIDs
await connection.query(`
  INSERT INTO trip (id, startPoint, endPoint, startDate, description, estimatedCost, numberOfRegistrants, latitud, longitud) VALUES 
  ('${trip1Id}', 'Neuquén', 'Salta', '2024-09-15','Explora la belleza del norte.', 800000.00, 1, -38.9516, -68.0591),
  ('${trip2Id}', 'Mendoza', 'San Juan', '2024-10-01','Descubre los paisajes cuyanos.', 17351.00, 2, -32.8894, -68.8458),
  ('${trip3Id}', 'Santa Fe', 'Buenos Aires', '2024-11-05','Viaje hacia la ciudad mágica.', 86178.00, 0, -31.6325, -60.7004),
  ('${trip4Id}', 'Bariloche', 'El Bolsón', '2024-12-10','Aventura en los Andes patagónicos.', 120000.00, 0, -41.1335, -71.3103),
  ('${trip5Id}', 'Córdoba', 'Villa Carlos Paz', '2024-10-20','Relax en las sierras cordobesas.', 45000.00, 0, -31.4201, -64.1888),
  ('${trip6Id}', 'Rosario', 'La Pampa', '2024-11-22','Paseo por la llanura pampeana.', 32000.00, 0, -32.9442, -60.6505),
  ('${trip7Id}', 'Buenos Aires', 'Mar del Plata', '2024-12-05','Disfruta del verano en la costa atlántica.', 96000.00, 0, -34.6037, -58.3816),
  ('${trip8Id}', 'Tucumán', 'Catamarca', '2024-09-28','Descubre los secretos del noroeste argentino.', 60000.00, 0, -26.8083, -65.2176);
`);

    // Genera UUIDs para las inscripciones de usuarios a viajes
    const tripUser1Id = uuidv4();
    const tripUser2Id = uuidv4();
    const tripUser3Id = uuidv4();

    // Inserta inscripciones en la tabla 'trip_users' con coherencia geográfica usando los UUIDs generados
    await connection.query(`
      INSERT INTO trip_users (id, user_id, trip_id, joinDate, status) VALUES 
      ('${tripUser1Id}', '${user1Id}', '${trip1Id}', '2024-08-31 10:00:00', 'confirmed'),  -- Alice viaja desde Neuquén a Salta
      ('${tripUser2Id}', '${user2Id}', '${trip2Id}', '2024-08-31 11:00:00', 'confirmed'),  -- Bob se inscribió al viaje desde Mendoza a San Juan
      ('${tripUser3Id}', 'testid1', '${trip2Id}', '2024-08-31 11:00:00', 'confirmed');  -- Mock se inscribió al viaje desde Mendoza a San Juan
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
