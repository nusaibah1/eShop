import express from 'express'
import bodyParser from 'body-parser'
import { products } from '../model/index.js'
import { verifyAToken } from '../middleware/AuthenticateUser.js'




const productRouter = express.Router()
productRouter.use(bodyParser.json())

// Retrieve all Products
productRouter.get('/', verifyAToken , (req, res) => {
products.fetchProducts(req, res)
})

// Recent Products
productRouter.get('/recent', (req, res) => {
    products.recentProducts(req, res)
})

//Rerieve Single Product
productRouter.get('/:id', verifyAToken, (req, res) => {  
    products.fetchProduct(req, res)
})

// Add product
productRouter.post('/add', verifyAToken,  (req, res) => {  
    products.addProduct(req, res)
})

//Update product
productRouter.patch('/:id', verifyAToken,  (req, res) => { 
    products.updateProduct(req, res)
})

//Delete Product
productRouter.delete('/:id',  (req, res) => { //verifyAToken,
    products.deleteProduct(req, res)
})

export {
    productRouter
}


