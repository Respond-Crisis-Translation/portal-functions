import { UserRecord } from "firebase-functions/lib/providers/auth";

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().rct.email,
    pass: functions.config().rct.password,
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
          displayName: `${after.first_name} ${after.last_name}`,
          disabled: false,
        })
        .then((userRecord: UserRecord) => {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log("Successfully created new user:", userRecord.uid);
          admin
            .auth()
            .generatePasswordResetLink(userRecord.email)
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
  const htmlBody = `<p>Hello ${user.displayName},</p>
  <p>Thank you so much for your interest of becoming a part of the translators network,
  and congratulations! You are now a part of our volunteer program.</p>
  <p>Please proceed to create your login information <a href='${link}'>here</a> where you can join
  the community of translators who are just like you,
  eager to help the asylum seekers by translating their documents.</p>
  <p>Thank you again for your time.</p>
  <p>If you didn’t ask to reset your password, you can ignore this email.</p>
  <p>Best,</p>
  <p>Respond: Crisis Translators Network Team</p>`;

  const emailSubject = "Welcome to the Respond: Crisis Translators Network!";
  const mailOptions = {
    from: "Respond: Crisis Translators Network <respond@crisistranslators.net>",
    to: user.email,
    subject: emailSubject,
    html: htmlBody,
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
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(len);
  });
}
