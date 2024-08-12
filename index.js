import express from 'express'
import path from 'path'
import {connection as db} from './config/index.js' // always specify filename and extension name when making use of ES module, when making use of common js you dont have to specify
import {createToken} from './middleware/AuthenticateUser.js'
import { hash } from    'bcrypt' 
import bodyParser from 'body-parser' //name parser therefor destructuring doesnt need to be sed
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

//If not specified the rqst body will be empty
router.use(bodyParser.json())
// Endpoint
router.get('^/$|/eShop', (req, res) => {
    res.status(200).sendFile(path.resolve('./static/html/index.html'))
})
//Fetching All Users
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
// Register / Add a user
router.post('/register', async(req, res) => {
try {
let data = req.body
data.pwd = await hash(data.pwd, 12)      //hash fuction is asynchrounous  default salt value is 10  pwd is specified with salt as an arguement to string of characters used to enhance the security of password hashing.
// Payload
let user = {
    emailAdd: data.emailAdd, //can make use of firstName as wll  all data coming from a user will be in req.body
    pwd: data.pwd
}
let strQry = `
INSERT INTO Users
SET ?` //set ? data is sent as an array as we're sending multiple data  and accross all columns in place of set ? VALUES(?, ?, ?, ?, ?) 
db.query(strQry, [data], (err) => {
if(err) {
    res.json({
        status: res.statusCode,
        msg: 'The email provided is already in use'
    })
} else {
    const token = createToken(user)
res.json({
    token,
    msg: 'You are now registered.'
})
}
} )
} catch(e) {
res.json({
    status: 404,
    msg: 'Unable to add new user.Please try again later'
})
}
})

//Update User
router.patch('/user/:id', async (req, res) => {
    try{
        let data = req.body       
        if(data.pwd) {
            data.pwd = await hash(data.pwd, 12)
        }
        //ensure that the params is the same as when routed
        const strQry = `
        UPDATE Users
        SET ?
        WHERE userID = ${req.params.id};  
        `
        db.query(strQry, [data], (err) => {
            //'Unable to update user'
            if(err) throw new Error(err)
            res.json({
            status: res.statusCode,
                msg: 'The user record was updated'
            })
        })
    } catch(e) {
     res.json({
        status: 400,
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
