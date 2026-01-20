// Script para eliminar el índice antiguo username_1
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Listar índices actuales
    const indexes = await collection.indexes();
    console.log('Índices actuales:', indexes.map(i => i.name));

    // Índices obsoletos a eliminar
    const obsoleteIndexes = ['username_1', 'email_1'];

    for (const indexName of obsoleteIndexes) {
      const hasIndex = indexes.some(i => i.name === indexName);
      if (hasIndex) {
        await collection.dropIndex(indexName);
        console.log(`Índice ${indexName} eliminado exitosamente`);
      } else {
        console.log(`El índice ${indexName} no existe`);
      }
    }

    // Eliminar documentos que tengan campos obsoletos
    const result = await collection.deleteMany({
      $or: [
        { username: { $exists: true } },
        { email: { $exists: true } }
      ]
    });
    console.log(`Documentos con campos obsoletos eliminados: ${result.deletedCount}`);

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropIndex();
