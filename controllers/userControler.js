const bcrypt = require('bcrypt');
const {createUser} = require('../config/model');
const {getEmail} = require('../config/model');
const {getUser} = require('../config/model');
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const {updateResetToken} = require('../config/model');
const {mailSend} = require('../util/mailSend');
const {getProfileByToken} = require('../config/model');
const {updatePassword} = require('../config/model');


//User Sign Up Controler

exports.signUp = async (req, res) => {
    try {
        const {firstName, lastName, email, password} = req.body;

        if (!firstName, !lastName, !email, !password) {
            return res
                .status(400)
                .json(
                    {success: false, message: "First Name, Last Name, Email, and Password are required"}
                )
        }
        //checking is there any account linked with provided email
        const validEmail = await getEmail(email);
        console.log(validEmail)
        if (validEmail) {
            return res
                .status(400)
                .json(
                    {success: false, message: "Account corresponding to this email already exits"}
                )
        }


        //hashing the password for storing into the database
        const hashedPassword = await bcrypt.hash(password, 10);


        //adding user into the database
        const response = await createUser(firstName, lastName, email, hashedPassword)

        res
            .status(201)
            .json({succcess: true, message: "User signed up Successfully", response})

    } catch (error) {
        console.log(error)
        return res
            .status(500)
            .json({success: false, message: "User signup controler failed"})
    }
}




//User login controler
exports.login = async (req, res) => {
    try {

        const {email, password} = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({success: false, message: "For Login Email and Password are required"})
        }


        //fetching the user data correspoing the provided email
        const user = await getUser(email);
        if (!user) {
            return res
                .status(404)
                .json({success: false, message: "User doesn't exits with this email id"})
        }

        //checking wether provided password is same as stored password or not
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({success: false, message: "Password is invalid"})
        }

        //creating a jwt token for user seation
        const token = jwt.sign({
            email: user.email
        }, process.env.JWT_SECRET, {expiresIn: "1d"})


        //setting cookie and sending response to client
        res
            .cookie("authToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000
            })
            .status(200)
            .json({success: true, message: "Login Successfull", token})

    } catch (err) {
        console.log("Error during login " + err.message);
        res
            .status(500)
            .json({success: false, message: "user login controlker failed"})
    }
}





//user get profile controler can only work after login 
exports.userProfile = async (req, res) => {
    try {
        const email = req.userEmail;
        const user = await getUser(email);
        if (!user) {
            return res
                .status(404)
                .json({success: false, message: "User profile doesn't exits"})
        }

        //desibling the password to null for security purpose
        user.password = null

        res
            .status(200)
            .json(
                {success: true, message: "User profile fetched successfully", userProfile: user}
            )
    } catch (err) {
        console.log("Error in UserProfile Controler" + err.message)
        res
            .status(500)
            .json(
                {success: false, message: " err during fetching profile in profile controler"}
            )
    }
}



//this is forgetpasswrod controler responsible for sending url to user email for updating password
exports.forgetPassword = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email) {
            return res
                .status(400)
                .json({success: false, message: "For reset password email is required"})
        }

        //checking the wether eamil provided by client belongs to any user or not
        const user = await getUser(email);
        if (!user) {
            return res
                .status(404)
                .json({success: false, message: "User doesn't exits with this email id"})
        }


        //generating a resettoken 
        const resetToken = crypto
            .randomBytes(32)
            .toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 5 * 60 * 1000);


        //saving resettoken on database
        await updateResetToken(email, resetToken, resetTokenExpiry);
        const mailResponse = await mailSend(
            email,
            `${process.env.SERVER_URL}/api/v1/updatepassword/${resetToken}`
        ); //currently sending on token
        console.log(resetToken)

        res
            .status(200)
            .json(
                {success: true, message: "Rest password link is sended on corresponding email"}
            )
    } catch (err) {
        console.log("Error in forget passsword controler" + err.message)
        res
            .status(500)
            .json({success: false, message: " err during forget password  controler"})
    }
}





//after reciving forget passwrod url this is responsible for changing the passsword with the help of token
exports.resetPassword = async (req, res) => {
    try {
        const {password, confirmPassword} = req.body
        //fetching token from url
        const {token} = req.params;

        if (!password || !confirmPassword) {
            return res
                .status(400)
                .json({success: false, message: " Password and confirmPassword are  required"})
        }
        //checking wether confirmpassword and passord are same or not
        if (password !== confirmPassword) {
            return res
                .status(400)
                .json({success: false, message: " Password and confirmPassword must be same"})
        }


        //fetching the user profile corresponding the provided token
        const user = await getProfileByToken(token);
        if (!user) {
            return res
                .status(404)
                .json({success: false, message: "Token is invalid or expired"})
        }

        //hashing the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        //updating the password and removing the token from database
        const response = await updatePassword(user[0].id, hashedPassword);

        res
            .status(200)
            .json({success: true, message: "password is updated successfully"})

    } catch (err) {
        console.log("Error in updating passsword controler" + err.message)
        res
            .status(500)
            .json({success: false, message: " err during updating password  controler"})
    }
}