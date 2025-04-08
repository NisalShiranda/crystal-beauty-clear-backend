import User from '../Models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function saveUser(req,res) {

    if(req.body.role == 'admin'){
        if(req.user == null){
            res.status(403).json({
                message: "Please log as an admin to create admin account"
            })
            return;
        }
        if(req.user.role != 'admin'){
            res.status(403).json({
                message: "You are not allowed to create an admin account"
            })
            return;
        }
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        role: req.body.role,
        
    })

    user.save().then(() => {
        res.json({
            message: "User Added"
        })
    }).catch(() => {
        res.json({
            message: "User Not Added"
    })
})
}

export function loginUser(req,res) {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        email:email,
    }).then((user)=>{
        if(user == null){
            res.status(404).json({
                message: "Invalid Email"
            })
        }else{
            const isPasswordCorrect = bcrypt.compareSync(password, user.password);
            if(isPasswordCorrect){
                
                const userData = {
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    isDisabled: user.isDisabled,
                    isEmailVerified: user.isEmailVerified
                }

                const token = jwt.sign(userData, process.env.JWT_KEY)

                res.json({
                    message: "Login Success",
                    token: token,
                    user: userData
                })


            }else{
                res.status(403).json({
                    message: "Invalid Password"
                })
            }
        }
    })
}

