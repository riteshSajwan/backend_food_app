import express from 'express'
import App from './services/ExpressApp'
import dbConnection from './services/Database'
import "reflect-metadata";


const StartServer = async()=>{
    const app = express();
    await dbConnection();
    await App(app);
    app.listen(8000,()=>{
        console.log("Server Listing to port 8000")
    })
}

StartServer();