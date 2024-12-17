import  express, { Application } from 'express'
import { AdminRoute , CustomerRoute, ShoppingRoute, VandorRoute } from '../routes';
import path from 'path';

export default async(app:Application)=>{
    app.use(express.json());
    app.use(express.urlencoded({extended:true})) //for multi part file data
    const imagePath = path.join(__dirname,"../images")
    app.use('/images', express.static(imagePath));

    app.use('/admin',AdminRoute)
    app.use('/vandor',VandorRoute)
    app.use('/customer',CustomerRoute)
    app.use(ShoppingRoute)


    return app;
}

