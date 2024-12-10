import express from 'express'
import bodyParser from 'body-parser';
import { AdminRoute , VandorRoute } from './routes';
import mongoose from 'mongoose';
// import { MONGO_URI } from './config';
import dotenv from "dotenv";
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true})) //for multi part file data
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/admin',AdminRoute)
app.use('/vandor',VandorRoute)

const MONGO_URI = process.env.MONGO_URI as string;

mongoose.connect(MONGO_URI)
.then(() => {
    console.log("Database connected successfully!");
})
.catch(err => {
    console.error("Database connection error: " + err);
});


app.listen(8000,()=>{
    console.log(`App is listning to port 8000`)
})
