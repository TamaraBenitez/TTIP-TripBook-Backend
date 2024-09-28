import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'fran.arciniega96@gmail.com',
    pass: 'wybpxbontnizabxv',
  },
})

export default transporter;
