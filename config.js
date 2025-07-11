const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 5000,
}; 