import { Request, Response ,NextFunction } from "express";
import { EditVandorInput, VandorLoginInputs } from "../dto";
import { FindVandor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Food } from "../models";
import { Order } from "../models/Order";


export const VandorLogin = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const {email,password} = <VandorLoginInputs>req.body;
    const existingVandor = await FindVandor('',email);
    if(existingVandor!==null){
        const validation = await ValidatePassword(password,existingVandor.password,existingVandor.salt);
        if(validation){
            const signature = GenerateSignature({
                _id:existingVandor.id,
                email:existingVandor.email,
                foodTypes:existingVandor.foodType,
                name:existingVandor.name
            })
            return res.json(signature);
        }
    }
    res.json({"message":"Login Cred are wrong"})
}

export const GetVandorProfile = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const user = req.user;
    if(user){
        const existingVandor = await FindVandor(user._id)
        return res.json(existingVandor)
    }
    return res.json({"message":"Vandor information not found"})
  
}
export const UpdateVandorProfile = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const {foodTypes , name , address, phone} = <EditVandorInput>req.body;
    const user = req.user;
    if(user){
        const existingVandor = await FindVandor(user._id)
        if(existingVandor!==null){
            existingVandor.name=name;
            existingVandor.address=address;
            existingVandor.phone=phone;
            existingVandor.foodType=foodTypes;
            const savedResult = await existingVandor.save();
            return res.json(savedResult)
        }
    }
    return res.json({"message":"Vandor information not found"})
  
}
export const UpdateVandorCoverImage = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const user = req.user;
    
    if(user){
        const vandor = await FindVandor(user._id)
        if(vandor!==null){
            const files = req.files as [Express.Multer.File]  //desctructing multer file
            const images = files.map((file: Express.Multer.File) => file.filename)
            vandor.coverImages.push(...images);
            const result = await vandor.save();
            return res.json(result);
        }
    }
    return res.json({"message":"Something went wrong"})
  
}

export const UpdateVandorService = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const user = req.user;
    console.log("user",user)
    if(user){
        const existingVandor = await FindVandor(user._id)
        if(existingVandor!==null){
            existingVandor.serviceAvailable=!existingVandor.serviceAvailable;
            const savedResult = await existingVandor.save();
            return res.json(savedResult)
        }
        return res.json(existingVandor);
    }
    return res.json({"message":"Vandor information not found"})
  
}

export const AddFood = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const user = req.user;
    
    if(user){
        const {name,description,category,foodType,price,readyTime}= <CreateFoodInputs>req.body;
        const vandor = await FindVandor(user._id)
        if(vandor!==null){
            const files = req.files as [Express.Multer.File]  //desctructing multer file
            console.log("files",files)
            const images = files.map((file: Express.Multer.File) => file.filename)
            console.log("images",images)
            const createdFood = await Food.create({
                vandorId:vandor.id,
                name:name,
                description:description,
                category:category,
                foodType:foodType,
                images:images,
                readyTime:readyTime,
                price:price
            });
            vandor.foods.push(createdFood);
            const result = await vandor.save();
            return res.json(result);
        }
    }
    return res.json({"message":"Something went wrong"})
  
}

export const GetFoods = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const user = req.user;
    if(user){
        const foods = await Food.find({vandorId:user._id})
        if(foods!==null){
            return res.json(foods);
        }
    }
    return res.json({"message":"Something went wrong"})
  
}

export const GetCurrentOrders = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const user = req.user;
    if(user){
        const orders = await Order.find({vendorId: user._id}).populate('item.food')
        if(orders!==null){
            return res.status(200).json(orders);
        }
    }
    return res.json({"message":"Orders not found"})
  
}

export const GetOrderDetails = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const orderId = req.params.id;
    if(orderId){
        const order = await Order.findById(orderId).populate('item.food')
        if(order!==null){
            return res.status(200).json(order);
        }
    }
    return res.json({"message":"Order not found"})
  
}
export const ProcessOrder = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
    const orderId = req.params.id;
    const { status,remarks,time} = req.body;
    if(orderId){
        const order = await Order.findById(orderId).populate('food');
        if(order!==null){
            order.orderStatus = status;
            order.remarks=remarks;
            if(time){
                order.readyTime=time;
            }
            const orderResult = await order.save();
            if(orderResult!==null){
                return res.status(200).json(orderResult);
            }
        }
    }
    return res.json({"message":"Unable to process order not found"})
}