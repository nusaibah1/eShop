// Import mysql2 and newdb connection
import { createPool } from "mysql2"; //mysql2 is faster than mysql
import 'dotenv/config'

let connection = createPool({
  host: process.env.hostDb,
  user: process.env.userDb,
  password: process.env.pwdDb,
  database: process.env.dbName,
  multipleStatements: true,  //allows multiple data to be inserted at the same time
  connectionLimit: 30 // default is 5 
})
connection.on('connection', (pool) => { // make use of on to ensure dbconnection is fine. on can be thought of as an event handler and connection is the event
    if(!pool) throw new Error('Couldn\'t connect to the database.Please try again later')
}) 

//throw new to 
export {
    connection
}

//could name config.js 