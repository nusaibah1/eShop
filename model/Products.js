import {connection as db} from '../config/index.js' 



class Products {
    fetchProducts(req, res) {
        try {
            const strQry = `
            SELECT productID, prodName, category, prodDescription, prodURL,amount
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
}
fetchProduct(req, res) {
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
                    msg: 'Issue when retrieving product.Please try again later'
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
}
async registerProduct(req, res) {
    try {
        let data = req.body
        data.pwd = await hash(data.pwd, 12)     
        // Payload
        let user = {
            emailAdd: data.emailAdd, 
            pwd: data.pwd
        }
        let strQry = `
        INSERT INTO Products
        SET ?` 
        db.query(strQry, [data], (err) => {
        if(err) {
            res.json({
                status: res.statusCode,
                msg: 'The specified product already exits.'
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
}
 async updateProduct(req, res) {
    try{
        let data = req.body       
     
        //ensure that the params is the same as when routed
        const strQry = `
        UPDATE Products
        SET ?
        WHERE productID = ${req.params.id};  
        `
        db.query(strQry, [data], (err) => {
            //'Unable to update user'
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
}
deleteUser(req, res) {
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
}

}

export {
    Products
}