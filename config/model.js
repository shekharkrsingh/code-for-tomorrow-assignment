const pool = require("./database")


//responsible for creating new user in mysql
exports.createUser = async (firstName, lastName, email, password) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO userdata (firstName, lastName, email, password) VALUES (?, ?, ?, ?' +
                    ')',
            [firstName, lastName, email, password]
        );
        return result
    } catch (err) {
        throw new Error('Error creating user' + err.message)
    }
}


//responsible for checking wether email is already is present.
exports.getEmail = async (email) => {
    try {
        const [rows] = await pool.query(
            'select * from userdata where email=?',
            [email]
        )
        return rows[0]
            ? true
            : false
    } catch (err) {
        throw new Error('Error fetching email: ' + err.message)
    }
}



//responsible for getting user profile
exports.getUser = async (email) => {
    try {
        const [rows] = await pool.query(
            'select * from userdata where email=?',
            [email]
        )
        return rows[0];
    } catch (err) {
        throw new Error('Error fetching email: ' + err.message)
    }
}



//responsilble for add reset token on database 
exports.updateResetToken = async (email, resetToken, resetTokenExpiry) => {
    try {
        const [result] = await pool.query(
            'update userdata set resetToken=?, resetTokenExpiry=? where email=?',
            [resetToken, resetTokenExpiry, email]
        )
        return result
    } catch (err) {
        throw new Error('Error updating the token by email: ' + err.message)
    }
}



//responsilbe for getting user profile with respect to forget token provided by user
exports.getProfileByToken = async (token) => {
    try {
        const [result] = await pool.query(
            'select * from userdata where resetToken= ? and resetTokenExpiry>NOW()',
            [token]
        )
        return result
    } catch (err) {
        throw new Error('Error updating the token by email: ' + err.message)
    }
}




//responsible of updating passwod of user by token
exports.updatePassword = async (id, password) => {
    try {
        const [result] = await pool.query(
            'update userdata set password=?, resetToken=NULL, resetTokenExpiry=NULL where i' +
                    'd=?',
            [password, id]
        )
        console.log(result)
        return result
    } catch (err) {
        throw new Error('Error during password update: ' + err.message)
    }
}
