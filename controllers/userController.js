import User from '../Models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
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

export async function googleLogin(req,res){
    const accessToken = req.body.accessToken;
    

    try{
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: "Bearer " +accessToken
            }
        })
        const user =await User.findOne({
            email: response.data.email
        });
        if(user == null){
            const newUser = new User({
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                isEmailVerified: true,
                password : accessToken// Assuming Google users are verified
            })
            await newUser.save();
            const userData = {
                email: newUser.email,
                role: newUser.role,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone,
                isDisabled: newUser.isDisabled,
                isEmailVerified: newUser.isEmailVerified
            }
            console.log(newUser);
            const token = jwt.sign(userData, process.env.JWT_KEY,{
                expiresIn: '48hrs' // Set token expiration time
            })
            res.json({
                message: "Google Login Success",
                token: token,
                user: userData
            })

        }else{
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
            
        }

    }catch(err){
        res.status(500).json({
            message: "Google Login Failed"
        })
        
    }

}

export function getCurrentUser(req,res){
    if(req.user == null){
        res.status(403).json({
            message: "You need to login first"
        })
        return;
    }

    res.json({
        user: req.user
    })
}

