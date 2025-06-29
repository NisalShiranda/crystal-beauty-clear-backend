import User from '../Models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { Otp } from '../Models/otp.js';
dotenv.config();

const transport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "nisalshiranda001@gmail.com",
        pass: "bubzizazqujohjjx"
    },
})

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

export async function sendOTP(req, res) {
    console.log(req.body);
    const email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000);

    const message = {
        from: "nisalshiranda001@gmail.com",
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
    };

    try {
        await Otp.findOneAndUpdate(
            { email: email },
            { otp: otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        transport.sendMail(message, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: "Failed to send OTP" });
            } else {
                console.log("Email sent:", info.response);
                return res.json({ message: "OTP sent successfully", otp: otp });
            }
        });
    } catch (error) {
        console.error("Error saving OTP to DB:", error);
        res.status(500).json({ message: "Database error" });
    }
}


export function changePassword(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const otp = req.body.otp;

    try {
        Otp.findOne({ email: email }).sort({ createdAt: -1 }).limit(1).then((otpRecord) => {
            if (!otpRecord) {
                return res.status(404).json({ message: "OTP not found" });
            }

            if (otpRecord.otp !== otp || (Date.now() - otpRecord.createdAt.getTime()) > 5 * 60 * 1000) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);

            User.findOneAndUpdate({ email: email }, { password: hashedPassword }, { new: true })
                .then((user) => {
                    if (!user) {
                        return res.status(404).json({ message: "User not found" });
                    }
                    res.json({ message: "Password changed successfully" });
                })
                .catch((err) => {
                    console.error("Error updating password:", err);
                    res.status(500).json({ message: "Failed to change password" });
                });
        }).catch((err) => {
            console.error("Error finding OTP:", err);
            res.status(500).json({ message: "Failed to find OTP" });
        });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ message: "Failed to change password" });
    }
}

