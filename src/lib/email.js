import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async recipientAddress => {
    const msg = {
        to: recipientAddress, // Change to your recipient
        from: "dllmapexnewbie@gmail.com", // Change to your verified sender
        subject: "Sending with SendGrid is Fun",
        text: "and easy to do anywhere, even with Node.js",
        html: "<strong>and easy to do anywhere, even with Node.js</strong>",

    }
    console.log("i just send the email")

    await sgMail.send(msg)
}