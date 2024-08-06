import express from 'express'
import path from 'path'
import {connection as db} from './config/index.js' // always specify filename and extension name when making use of ES module, when making use of common js you dont have to specify

// Create express app
const app = express()  
const port = +process.env.PORT || 4000
const router = express.Router()

//Middelware anything between sending a request and retrieving a response
app.use(router, //allows for dynamic routing
express.static('./static'),
express.json(),
express.urlencoded ({
extended: true
})) //application level middelware

// Endpoint
router.get('^/$|/eShop', (req, res) => {
    res.status(200).sendFile(path.resolve('./static/html/index.html'))
})
router.get('/users', (req, res) => {
try {
const strQry = `
SELECT firstname, lastName, age, emailAdd
FROM Users;`
db.query(strQry, (err, results) => {
    if(err)  throw new Error(`Unable to fetch all users`) 
        res.json({
    status: res.statusCode, results
        })
}) 
} catch(e) {
    res.json({
        status: 404,
        msg: e.message //e.message is the error message in in the if statements
    })
}
})

// Fetching a single user
router.get('/user/:id', (req, res) => {  //:id is a placeholder user will specify the id
try {
    const strQry = `
    SELECT userID, firstname, lastName, age, emailAdd
    FROM Users
    WHERE userID = ${req.params.id};`
    db.query(strQry, (err, result) => {
        if(err) throw new Error ('Unable to retreive user.')
            res.json({
                status: res.statusCode, 
                result: result[0]
        })
    })
    
} catch(e) {
    res.json({
        status: 404,
        msg: e.message 
    })
}
})

// router.get('*' , (req, res) => {
//     res.json({
//         status: 404,
//         msg: 'Resource not found'
//     })
// })

app.listen(port, () => { // listen method assigns a port number to a server
    console.log(`Server is running on ${port}`)
})
