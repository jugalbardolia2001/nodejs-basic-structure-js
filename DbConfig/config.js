//using sequelize mysql
const dotenv = require('dotenv')
dotenv.config()
const { Sequelize,DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    "",
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});


// Object to hold all models
const models = {};
// Get all model files
// const modelFiles = fs.readdirSync('../Models');
const modelFiles = fs.readdirSync(path.join(__dirname, '../Models'));


// Sync all models
modelFiles.forEach((file) => {
  if (file.endsWith('.js')) {
    const model = require(path.join(__dirname, '../Models', file))(sequelize, DataTypes);
    models[model.name] = model;
}
});

// Handle associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Sync all models
sequelize.sync({ alter: true }) // Use `alter: true` for safe updates
    .then(() => console.log('All models were synchronized successfully.'))
    .catch(err => console.error('Error synchronizing models:', err));

// Export the sequelize instance and models
module.exports = { sequelize, models, DataTypes };