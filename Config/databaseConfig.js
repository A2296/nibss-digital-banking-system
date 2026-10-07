// Config/databaseConfig.js
//Import the mongoose module to connect to MongoDB
//Mongodb Database connection configuration


const mongose = require('mongoose');
//Database connection configuration
const connectDB = async () => {
  try {
    const conn = await mongose.connect(process.env.MONGODB_URL);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
