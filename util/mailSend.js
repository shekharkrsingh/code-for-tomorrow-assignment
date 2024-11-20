const nodeMailer = require('nodemailer')

const {MAIL_HOST, MAIL_USER, MAIL_PASSWORD} = process.env



//this is a nodemailer responsible for sending the main corresponding to provided email
exports.mailSend = async (email, body) => {
    try {
        let transport = nodeMailer.createTransport({
            host: MAIL_HOST,
            auth: {
                user: MAIL_USER,
                pass: MAIL_PASSWORD
            }
        })

        let info = await transport.sendMail(
            {from: "Mail", to: email, subject: "Forget Password", html: `<h2>${body}</h2>`}
        )

        return info
    } catch (err) {
        console.log("Error sending mail" + err.message)
        return err.message
    }
}