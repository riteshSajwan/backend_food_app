const twilio = require('twilio');

//Email


//Notification


//OTP

export const GenerateOtp = ()=>{
     const otp = Math.floor(100000 + Math.random()* 900000)
     let expiry = new Date();
     expiry.setTime( new Date().getTime() + (30*60*1000));
     return {otp,expiry};
}

export const onRequestOtp = async(otp:number,toPhoneNumber:string)=>{
     const accountSid =  process.env.accountSid as string;
     const authToken = process.env.authToken as string;
     console.log("authToken",authToken)
     // const client = require('twilio')(accountSid,authToken);

     const client = twilio(accountSid, authToken);
     const response = await client.messages.create({
          body:`Your OTP is ${otp}`,
          from: process.env.from,
          to: `+91${toPhoneNumber}`
     })
     return response;
}