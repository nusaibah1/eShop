import { userRouter, express } from './controller/UserController.js'
import { productRouter } from './controller/ProductsController.js'
import path from 'path'

// Create an express app
const app = express()
const port = +process.env.PORT || 4000

// Middleware
app.use('/user', userRouter)
app.use('/product', productRouter)
app.use(
    express.static('./static'),
    express.json(),
    express.urlencoded({
     extended: true
    }))



app.get('^/$|/eShop', (req, res) => {
    res.status(200).sendFile(path.resolve('./static/html/index.html'))
})

app.get('*', (req, res) => {
    res.json({
        status: 404,
        msg: 'Resource not found'
    })
})

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})

//using patch is more efficient than put because patch uses a single request to update a database while put uses mutliple request to update data 
//Class = ES6 Feauture provides a more structured and cleaner way to work with objects, compared to traditional constructor functions ex. static keyword, encapsulation, inheritance

//model is an object

//create a class (an object) => Generate a controller for the class that allows CRUD
//Build the views

//If not specified the rqst body will be empty/ not be able to read the data
//if you have a form the content of the form will be rqst body 
// router.use(bodyParser.json()) // rqst.body pipeline where we retrieve data from user 
