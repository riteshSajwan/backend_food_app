import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const  FindVandor = async(id:string|undefined,email?:string)=>{
   if(email){
   return  await Vandor.findOne({email:email});
   }
   else{
    return await Vandor.findById(id)
   }
}

export const CreateVandor = async(req:Request, res:Response, next:NextFunction): Promise<any> =>{
    try{
        const {name,address,pincode,foodType,email,password,ownerName,phone}  = <CreateVandorInput>req.body; 
        console.log("ran")
        const existingVendor = await FindVandor(undefined,email);
        if(existingVendor!==null){
            return res.json({"message":"Existing Vendor exist with this email"});
        }

        const salt = await GenerateSalt();
        const userPassword = await GeneratePassword(password,salt);
        const createdVandor = await Vandor.create({
            name:name,
            address:address,
            pincode:pincode,
            foodType:foodType,
            salt: salt,
            raiting:0,
            email:email,
            password:userPassword,
            ownerName:ownerName,
            serviceAvailable:false,
            phone:phone,
            coverImage:[],
        })

        return res.json({createdVandor})
    }
    catch(err){
        next(err);
    }

}

export const GetVandor = async(req:Request,res:Response,next:NextFunction): Promise<any> =>{
        const vandors = await Vandor.find();
        if(vandors!==null){
            return res.json(vandors);
        }
        return res.json({"message":"Vandors are not available"})
}

export const GetVandorByID = async(req:Request,res:Response,next:NextFunction): Promise<any> =>{
    const vandorId = req.body.id;
    const vandor = await FindVandor(vandorId);
    if(vandor!==null){
        return res.json(vandor);
    }
    return res.json({"message":"Vandor with give Id does not exists"})
}