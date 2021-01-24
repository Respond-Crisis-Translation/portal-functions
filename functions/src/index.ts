const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "username",
    pass: "password",
  },
});

export const sendInvitationEmail = functions.firestore
  .document("translators/{id}")
  .onUpdate((snapshot: any, context: any) => {
    const before = snapshot.before.data();
    const after = snapshot.after.data();
    const translatorEmail = after.email;
    console.log("translator email: ", translatorEmail);
    if (before.status !== after.status && after.status === "APPROVED") {
      const emailSubject =
        "Welcome to the Respond: Crisis Translators Network!";
      const emailBody = `Hello ${after.first_name}, Please proceed to create your login inforamtion. Thank you`;
      const mailOptions = {
        from:
          "Respond: Crisis Translators Network <respond@crisistranslators.net>",
        to: translatorEmail,
        subject: emailSubject,
        text: emailBody,
      };

      transporter.sendMail(mailOptions, function (error: any, info: any) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }

    return new Promise((res: any, err: any) => true);
  });
