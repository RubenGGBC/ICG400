// Script para crear un usuario administrador
// Ejecutar con: node scripts/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Datos del admin (username es el _id)
    const adminData = {
      _id: 'admin',
      password: 'admin123',
      role: 'admin'
    };

    // Verificar si el admin ya existe
    const existingAdmin = await User.findById('admin');

    if (existingAdmin) {
      console.log('El usuario administrador ya existe');
      process.exit(0);
    }

    // Crear admin
    const admin = await User.create(adminData);
    console.log('Usuario administrador creado exitosamente:');
    console.log('Username:', admin.username);
    console.log('Password: admin123');
    console.log('\n¡IMPORTANTE! Cambia la contraseña después del primer inicio de sesión');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
