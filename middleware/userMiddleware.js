const jwt = require('jsonwebtoken');


//This is a middleware which verify wether user is logged in or not
exports.userMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res
            .status(401)
            .json({success: false, message: "Please login"})
    }
    try {

        //verify the token recieved from user brower cookie
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userEmail = decoded.email
        next()
    } catch (err) {
        console.log("Error during token verification" + err.message)
        res
            .status(403)
            .json({success: false, message: "Invalid during token verification"})
    }
}