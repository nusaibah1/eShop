import {connection as db} from '../config/index.js' 
import {createToken} from '../middleware/AuthenticateUser.js'
import { compare, hash } from    'bcrypt' 

class Users {
fetchUsers(req, res) {
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
                    msg: e.message
                })
            }
}
fetchUser(req, res) {
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
}
async registerUser(req, res) {
    try {
        let data = req.body
        data.pwd = await hash(data.pwd, 12)     
        // Payload
        let user = {
            emailAdd: data.emailAdd, 
            pwd: data.pwd
        }
        let strQry = `
        INSERT INTO Users
        SET ?` 
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
}
 async updateUser(req, res) {
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
}
deleteUser(req, res) {
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
}
async login(req, res) {
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
}
}

export {
    Users
}
