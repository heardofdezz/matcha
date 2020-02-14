const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'matcha',
    password: 'piscinephp'
});
module.exports = pool.promise();