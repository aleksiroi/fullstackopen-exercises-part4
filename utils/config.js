require('dotenv').config()

const PORT = process.env.PORT
const URI = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

const MONGODB_URI = URI.replace('<password>', process.env.MONGODB_PASSWORD);

module.exports = {
  MONGODB_URI,
  PORT
}