

// const mysql = require('mysql');
// require('dotenv').config();

// console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_DATABASE);


// const pool = mysql.createPool({
//   connectionLimit: process.env.DB_CONNECTION_LIMIT, // Use the environment variable
//   host: process.env.DB_HOST, // Use the environment variable
//   user: process.env.DB_USER, // Use the environment variable
//   password: process.env.DB_PASSWORD, // Use the environment variable
//   database: process.env.DB_DATABASE // Use the environment variable
// });

// module.exports = pool;


const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: process.env.DB_CONNECTION_LIMIT
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.end();
