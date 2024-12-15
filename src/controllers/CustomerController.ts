import { plainToClass } from 'class-transformer';
import express, { NextFunction, Request, Response } from 'express';
import { CreateCustomerInputs, EditCustomerrofileInputs, useLoginInputs } from '../dto/Customer.dto';
import { validate, ValidationError } from 'class-validator';
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from '../utility';
import { Customer } from '../models/Customer';
import { GenerateOtp, onRequestOtp } from '../utility/NotificationUtility';


export const CustomerSignUp = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
    const customerInpus = plainToClass(CreateCustomerInputs,req.body);
    const inputErrors =await  validate(customerInpus,{validationError:{target:true}});
    if(inputErrors.length > 0 ){
        return res.status(400).json(inputErrors);
    }
    const {email , phone,password} = customerInpus;
    
    const salt = await GenerateSalt()
    const userPassword = await GeneratePassword(password,salt);
    const {otp,expiry}= GenerateOtp();

    const existCustomer = await Customer.findOne({email:email});
    if(existCustomer!==null){
        return res.status(400).json({message: "Error with SignUp"});
    }

    const result = await Customer.create({
        email:email,
        password:userPassword,
        salt:salt,
        phone:phone,
        otp:otp,
        otp_expiry:expiry,
        firstName:'',
        lastName:'',
        address:'',
        verified: false,
        lat: 0,
        lng: 0,
    })
    
    if(result){
        //send otp to customer
        await  onRequestOtp(otp,phone);
        //generate the signature
        const signature = GenerateSignature({
            _id: result.id,
            email: result.email,
            verified: result.verified
        })

        //send the result to client
        return res.status(201).json({signature:signature, verified:result.verified, email:result.email})
    }

    return res.status(400).json({message:'Error with Signup'})

}
export const CustomerLogin = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{

    
    const loginInputs = plainToClass(useLoginInputs, req.body);
    const loginErrors =await  validate(loginInputs,{validationError:{target:false}});
    if(loginErrors.length>0){
        return res.status(400).json(loginErrors)
    }
    const {email,password} = loginInputs;
    const customer = await Customer.findOne({email:email});
    if(customer){
        const validation = await ValidatePassword(password,customer.password,customer.salt);
        if(validation){
            const signature = GenerateSignature({
                _id: customer.id,
                email: customer.email,
                verified: customer.verified
            })
            return res.status(201).json(
                {signature:signature, 
                verified:customer.verified,
                 email:customer.email})
        }
    }
    // else{
    //     //validation error
    // }
    return res.status(400).json({message:'Error with Login'});

}
export const CustomerVerify = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
    const {otp} = req.body;
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id)
        if(profile){
            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date() ){
                profile.verified = true;
                const updatedCustomerResponse:any = await profile.save();
                const signature = GenerateSignature({
                    _id: updatedCustomerResponse._id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                });
                return res.status(201).json({signature:signature, verified:updatedCustomerResponse.verified, email:updatedCustomerResponse.email})

            }
        }
    }
    return res.status(400).json({message:'Error with verification'})
}

export const RequestOtp = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id);
        if(profile){
            const {otp,expiry}= GenerateOtp();
            profile.otp = otp;
            profile.otp_expiry = expiry;
            await profile.save();
            await onRequestOtp(otp,profile.phone);
            res.status(200).json({message:"OTP send to your registred phone number"})
        }
    }
    return res.status(400).json({message:'Error with Request Otp'})
}


export const GetCustomerProfile = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id)
        if(profile){
            return res.status(200).json(profile)
        }
    }
    return res.status(400).json({message:"No Customer found"})
}


export const EditCustomerProfile = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
    const customer = req.user;
    const profileInputs = plainToClass(EditCustomerrofileInputs, req.body);
    const profileErrors =await  validate(profileInputs,{validationError:{target:false}});
    if(profileErrors.length>0){
        return res.status(400).json(profileErrors)
    }
    const {firstName,lastName,address} = profileInputs;
    if(customer){
        const profile = await Customer.findById(customer._id);
        if(profile){
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = await profile.save();
            res.status(200).json(result);
        }
    }
    return res.status(400).json({message:'Error with Update Customer ...'})

}