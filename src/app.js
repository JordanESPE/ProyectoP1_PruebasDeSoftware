const express = require('express');
const patientRoutes = require('./routes/pacientes.routes');
const medicamentosRoutes = require('./routes/medicamentos.routes');
const especialidadesRoutes = require('./routes/especialidades.routes');

const app = express(); // Crea una instancia de la aplicación Express

// Middleware para parsear JSON del cuerpo de las solicitudes
app.use(express.json());

// Rutas Base de cada modelo
app.use('/api/pacientes', patientRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/especialidades', especialidadesRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Exportamos app para poder usarla en tests o en un archivo de servidor separado
module.exports = app;
