import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios'; // Necesario para hablar con Python
import { User } from './models/User';
import { Sale } from './models/Sale';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
// Asegúrate de usar las credenciales correctas de tu docker-compose
const MONGO_URI = 'mongodb://admin:password123@localhost:27017/concesionaria_users?authSource=admin';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🟢 Conectado a MongoDB'))
  .catch((err) => console.error('🔴 Error Mongo:', err));

// --- RUTAS ---

app.get('/', (req, res) => {
  res.send('API Node.js Funcionando 🚀');
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario || usuario.password !== password) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }
    // IMPORTANTE: Enviar el email de vuelta para que Laravel no pierda la sesión
    res.json({
      mensaje: 'Login exitoso 🔓',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        email: usuario.email 
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error servidor' });
  }
});

// Registro de Usuarios
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        const existe = await User.findOne({ email });
        if (existe) return res.status(400).json({ error: 'Correo duplicado' });
        
        const nuevo = new User({ nombre, email, password, rol });
        await nuevo.save();
        res.status(201).json({ mensaje: 'Usuario creado', usuario: nuevo });
    } catch (e) { res.status(500).json({ error: 'Error creando usuario' }); }
});

// VENTA (ACTUALIZADA CON DATOS DE CLIENTE)
app.post('/api/ventas', async (req, res) => {
  try {
    // 1. Recibir los nuevos campos del cuerpo de la petición (req.body)
    const { 
        vendedor_email, 
        cliente_nombre, 
        cliente_telefono,   // --- NUEVO ---
        cliente_direccion,  // --- NUEVO ---
        vehiculo_vin 
    } = req.body;

    // PASO 1: Consultar a Python (AHORA EN PUERTO 8001)
    let precioAuto = 0;
    try {
        // Buscamos el auto en el microservicio de Python
        const respuestaPython = await axios.get('http://127.0.0.1:8001/vehiculos');
        const listaAutos = respuestaPython.data;
        const autoEncontrado = listaAutos.find((auto: any) => auto.vin === vehiculo_vin);
        
        if (!autoEncontrado) return res.status(404).json({ error: 'Auto no encontrado en inventario' });
        if (autoEncontrado.stock <= 0) return res.status(400).json({ error: 'Sin stock' });

        precioAuto = autoEncontrado.precio;
    } catch (error) {
        console.error("Error contactando a Python:", error);
        return res.status(500).json({ error: 'Error de comunicación con Inventario (Python)' });
    }

    // PASO 2: Guardar Venta en Mongo (Con datos completos)
    const nuevaVenta = new Sale({
      vendedor_email,
      cliente_nombre,
      cliente_telefono,   // --- NUEVO: Guardamos teléfono ---
      cliente_direccion,  // --- NUEVO: Guardamos dirección ---
      vehiculo_vin,
      total: precioAuto
    });
    await nuevaVenta.save();

    // PASO 3: Restar Stock en Python (AHORA EN PUERTO 8001)
    try {
        await axios.post(`http://127.0.0.1:8001/vehiculos/${vehiculo_vin}/restar-stock`);
    } catch (error) {
        console.error('Error restando stock en Python');
    }

    res.status(201).json({ mensaje: 'Venta exitosa', ticket: nuevaVenta });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno Node' });
  }
});

// Listar Ventas (Para el reporte del Consultor)
app.get('/api/ventas', async (req, res) => {
  try {
    // Buscamos todas las ventas en MongoDB, ordenadas por fecha descendente
    const ventas = await Sale.find().sort({ fecha: -1 });
    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el historial de ventas' });
  }
});

// --- GESTIÓN DE MARCAS (NUEVO) ---
// Estas rutas sirven de puente (Proxy) hacia el servicio de Python

// 1. Crear Marca
app.post('/api/marcas', async (req, res) => {
    try {
        const { nombre, pais_origen } = req.body;
        // Validación simple antes de enviar
        if (!nombre) return res.status(400).json({ error: 'El nombre de la marca es obligatorio' });

        // Enviar petición a Python (Puerto 8001)
        const response = await axios.post('http://127.0.0.1:8001/marcas', {
            nombre, 
            pais_origen
        });
        res.status(201).json(response.data);
    } catch (error: any) {
        console.error("Error creando marca en Python:", error.message);
        if (error.response) {
            // Si Python responde error (ej. marca duplicada)
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Error de comunicación con el servicio de Vehículos' });
        }
    }
});

// 2. Listar Marcas (Para llenar selects en el frontend)
app.get('/api/marcas', async (req, res) => {
    try {
        const response = await axios.get('http://127.0.0.1:8001/marcas');
        res.json(response.data);
    } catch (error) {
        console.error("Error obteniendo marcas:", error);
        res.status(500).json({ error: 'Error obteniendo las marcas' });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor Node corriendo en http://localhost:${PORT}`);
});