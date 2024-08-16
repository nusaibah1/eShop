import express from 'express'
import path from 'path'
import {connection as db} from './config/index.js' // always specify filename and extension name when making use of ES module, when making use of common js you dont have to specify
import {createToken} from './middleware/AuthenticateUser.js'
import { compare, hash } from    'bcrypt' 
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

//If not specified the rqst body will be empty/ not be able to read the data
//if you have a form the content of the form will be rqst body 
router.use(bodyParser.json()) // rqst.body pipeline where we reetriev data from user 
// Endpoint
router.get('^/$|/eShop', (req, res) => {
    res.status(200).sendFile(path.resolve('./static/html/index.html'))
})
//Fetching All Users
router.get('/users', (req, res) => {
try {
const strQry = `
SELECT firstname, lastName, age, emailAdd, userRole, ProfileURL
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
// Fetching a single user //:id is a placeholder user will specify the id
router.get('/user/:id', (req, res) => {
    try {
        const strQry = `
        SELECT userID, firstName, lastName, age, emailAdd, userRole, ProfileURL
        FROM Users
        WHERE userID = ${req.params.id};
        `
        db.query(strQry, (err, result) => {
            if (err) {
                res.json({
                    status: 404,
                    msg: 'Issue when retrieving a user.'
                })
            }
            if (!result.length) {
                res.json({
                    status: 404,
                    msg: 'Incorrect ID was used.'
                })
            } else { 
                res.json({
                    status: res.statusCode,
                    result: result[0]
                })
            } 
        })
    } catch (e) {
        res.json({
            status: 404,
            msg: 'Please try again later.'
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

// Delete specific user
router.delete('/user/:id', (req, res) => {
try {
 const strQry = `
  DELETE FROM Users
  WHERE userID =  ${req.params.id};
  ` 

  db.query(strQry, (err) => {
    if(err) throw new Error('Unable to delete user.To delete the user, please review your delete query.')
        res.json({
    status: res.statusCode,
    msg: 'A user\'s information was removed.'
        })
  })
}
catch(e) {
res.json({
    status: 404,
    msg: e.message
})
}
})

//User Login
router.post('/login', (req, res) => {
  try{
  const { emailAdd, pwd } = req.body
  const strQry = `
  SELECT userID, firstName, lastName, age, emailAdd, pwd, userRole, ProfileURL
  FROM Users
  WHERE emailAdd = '${emailAdd}';
  `
  
  db.query(strQry,  async(err, result) =>{
    if(err) throw new Error ('To login, please review your query.')
        if(!result?.length) {
            res.json(
                {
            
                status: 401, 
                msg: 'You provided the wrong email.'
            }
        )
         } else {
         
            const isValidPass = await compare
            (pwd, result[0].pwd)
            if(isValidPass) {
                
                const token  = createToken ({
                    emailAdd,
                    pwd
                })
                res.json({
                    status: res.statusCode,
                    token,
                    result: result[0]
                })
            } else {
                res.json({
                    status: 401,
                    msg: 'Incorrect password provided or registration invalid.'
                })
            }
        }
  })
  } catch(e) {
res.json({
    status: 404,
    msg: e.message
}) 
  }
})
//Fetching All Products
router.get('/products', (req, res) => {
    try {
    const strQry = `
    SELECT  productID, prodName, category, prodDescription, prodURL,amount
    FROM Products;`
    db.query(strQry, (err, results) => {
        if(err)  throw new Error(`Unable to fetch all products`) 
            res.json({
        status: res.statusCode, results
            })
    }) 
    } catch(e) {
        res.json({
            status: 404,
            msg: e.message
        })
    }
    })
    // Fetching a single product
    router.get('/product/:id', (req, res) => {
        try {
            const strQry = `
            SELECT  productID, prodName, category, prodDescription, prodURL,amount
            FROM Products
            WHERE productID = ${req.params.id};
            `
            db.query(strQry, (err, result) => {
                if (err) {
                    res.json({
                        status: 404,
                        msg: 'Issue when retrieving product.'
                    })
                }
                if (!result.length) {
                    res.json({
                        status: 404,
                        msg: 'Incorrect productID provided.'
                    })
                } else { 
                    res.json({
                        status: res.statusCode,
                        result: result[0]
                    })
                } 
            })
        } catch (e) {
            res.json({
                status: 404,
                msg: 'Please try again later.'
            })
        }
    })
    
    // Add product
    router.post('/product/add', async(req, res) => {
    try {
    let data = req.body
    
    let product = {
        prodName: data.prodName,
        pwd: data.pwd
    }
    let strQry = `
    INSERT INTO Products
    SET ?` 
    db.query(strQry, [data], (err) => {
    if(err) {
        res.json({
            status: res.statusCode,
            msg: 'The product already exists'
        })
    } else {
        const token = createToken(user)
    res.json({
        token,
        msg: 'The product is now registered.'
    })
    }
    } )
    } catch(e) {
    res.json({
        status: 404,
        msg: 'Unable to add new product.Please try again later'
    })
    }
    })
    
    //Update Product
    router.patch('/product/:id', async (req, res) => {
        try{
            let data = req.body       
            if(data.pwd) {
                data.pwd = await hash(data.pwd, 12)
            }
            //ensure that the params is the same as when routed
            const strQry = `
            UPDATE Products
            SET ?
            WHERE productID = ${req.params.id};  
            `
            db.query(strQry, [data], (err) => {
                //'Unable to update product'
                if(err) throw new Error(err)
                res.json({
                status: res.statusCode,
                    msg: 'The product record was updated'
                })
            })
        } catch(e) {
         res.json({
            status: 400,
            msg: e.message
         })
        }
    })
    
    // Delete specific user
    router.delete('/product/:id', (req, res) => {
    try {
     const strQry = `
      DELETE FROM Products
      WHERE productID =  ${req.params.id};
      ` 
    
      db.query(strQry, (err) => {
        if(err) throw new Error('Unable to delete product.To delete the product, please review your delete query.')
            res.json({
        status: res.statusCode,
        msg: 'A product\'s information was removed.'
            })
      })
    }
    catch(e) {
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

//using patch is more efficient than put because patch uses a single request to update a database while put uses mutliple request to update data 
//Class = ES6 Feauture provides a more structured and cleaner way to work with objects, compared to traditional constructor functions ex. static keyword, encapsulation, inheritance

//model is an object

//create a class (an object) => Generate a controller for the class that allows CRUD
//Build the views