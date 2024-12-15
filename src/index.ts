import express from 'express'
import App from './services/ExpressApp'
import dbConnection from './services/Database'
import "reflect-metadata";
const PORT = process.env.PORT

const StartServer = async()=>{
    const app = express();
    await dbConnection();
    await App(app);
    app.listen(PORT,()=>{
        console.log(`Server Listing to port ${PORT}`)
    })
}

StartServer();