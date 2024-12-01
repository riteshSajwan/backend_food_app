import bcrypt from 'bcrypt'
import { Request } from 'express';
import jwt from 'jsonwebtoken'
import { VandorPayload } from '../dto';
// import { APP_SECRET } from '../config';
const APP_SECRET = process.env.APP_SECRET as string;
import { AuthPayload } from '../dto';

export const GenerateSalt = async ()=>{
    return await bcrypt.genSalt();
}

export const GeneratePassword = async(password:string,salt:string)=>{
    return await bcrypt.hash(password,salt)
}


export const ValidatePassword = async(enteredPassword:string,savedPassword:string,salt:string) =>{
    return await GeneratePassword(enteredPassword,salt)===savedPassword;
}

export const GenerateSignature = (payloads:VandorPayload)=>{
    return jwt.sign(payloads,APP_SECRET,{expiresIn:'1d'})
}
export const ValidateSignature = async (req: any): Promise<boolean> => {
    const signature  = req.get('Authorization')
    if(signature){
        const payload = await jwt.verify(signature.split('')[1],APP_SECRET) as AuthPayload
        req.user = payload;
        return true;
    }
    return false;
}