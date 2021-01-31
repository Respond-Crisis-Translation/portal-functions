import { UserRecord } from "firebase-functions/lib/providers/auth";

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "",
    pass: "",
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
      // if user hasn't been created,
      // then create user, generate password reset link and send email
      console.log("translator uid: ", context.params.id);

      admin
        .auth()
        .createUser({
          uid: context.params.id,
          email: translatorEmail,
          password: randomString(10),
          emailVerified: true,
          displayName: after.first_name,
          disabled: false,
        })
        .then((userRecord: UserRecord) => {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log("Successfully created new user:", userRecord.uid);

          admin
            .auth()
            .generatePasswordResetLink(userRecord.email, {
              url: "https://rct-portal.web.app/",
            })
            .then((link: string) => {
              // Construct password reset email template, embed the link and send
              // using custom SMTP server.
              console.log("Successfully created link:", link);
              return sendEmail(userRecord, link);
            })
            .catch((error: any) => {
              // Some error occurred.
              console.log("Error send an reset email: ", error);
            });
        })
        .catch((error: any) => {
          console.log("Error creating new user: ", error);
        });
    }
    return new Promise((res: any, err: any) => true);
  });

function sendEmail(user: UserRecord, link: string) {
  const emailSubject = "Welcome to the Respond: Crisis Translators Network!";
  const emailBody = `Hello ${user.displayName}, Please proceed to create your login information by clicking ${link}. Thank you`;
  const mailOptions = {
    from: "Respond: Crisis Translators Network <respond@crisistranslators.net>",
    to: user.email,
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

function randomString(len: number) {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(len);
  });
}