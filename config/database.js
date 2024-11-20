const mysql=require('mysql2');
require('dotenv').config()
const {MYSQL_HOST,MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE}=process.env

const pool=mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
}).promise();



module.exports=pool;