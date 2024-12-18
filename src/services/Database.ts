import mongoose from 'mongoose';
// import { MONGO_URI } from './config';
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();
const MONGO_URI = process.env.MONGO_URI as string;



export default async()=>{
    try{
        await mongoose.connect(MONGO_URI)
        console.log("DB connected")
    }catch(err){
        console.log("err",err)
    }

}





