import { Request, Response ,NextFunction } from "express";
import { VandorLoginInputs } from "../dto";
import { FindVandor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility";


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
  
}
export const UpdateVandorProfile = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
  
}

export const UpdateVandorService = async(req:Request,res:Response,next: NextFunction): Promise<any>=>{
  
}