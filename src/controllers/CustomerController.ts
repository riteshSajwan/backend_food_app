import { plainToClass } from 'class-transformer';
import express, { NextFunction, Request, Response } from 'express';
import { CreateCustomerInputs, EditCustomerrofileInputs, OrderInputs, useLoginInputs } from '../dto/Customer.dto';
import { validate, ValidationError } from 'class-validator';
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from '../utility';
import { Customer } from '../models/Customer';
import { GenerateOtp, onRequestOtp } from '../utility/NotificationUtility';
import { Food } from '../models';
import { Order } from '../models/Order';


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
        orders:[]
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


export const AddToCart = async (req:Request,res:Response,next:NextFunction):Promise<any> => {
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id).populate('cart.food');
        let cartItems = Array();
        const {_id,unit} = <OrderInputs>req.body;
        const food = await Food.findById(_id);
        if(food){
            if(profile){
                cartItems = profile.cart;
                if(cartItems.length>0){
                    //check and update unit
                    let existFoodItem = cartItems.filter((item)=> item.food._id.toString()===_id);
                    if(existFoodItem.length>0){
                        const index = cartItems.indexOf(existFoodItem[0]);
                        if(unit > 0){
                            cartItems[index]={food,unit};
                        }else{
                            cartItems.splice(index,1);
                        }
                    }
                    else{
                        cartItems.push({food,unit})
                    }

                }
                else{
                    //add new item to cart
                    cartItems.push({food,unit})
                }
            }
            if(cartItems){
                profile.cart = cartItems as any;
                const cartResult = await profile.save();
                return res.status(200).json(cartResult.cart);
            }
        }
    }
    return res.status(400).json({message:'Unable to create Cart'})
    
}

export const GetCart = async (req:Request,res:Response,next:NextFunction):Promise<any> => {
    const customer = req.user;
    if(customer){
        const profile = (await Customer.findById(customer._id)).populated('cart.food');
        if(profile){
            return res.status(200).json(profile.cart);
        }
    }
    return res.status(400).json({message:'Cart is empty!'})
}
export const DeleteCart = async (req:Request,res:Response,next:NextFunction):Promise<any> => {
    const customer = req.user;
    if(customer){
        const profile = (await Customer.findById(customer._id)).populated('cart.food');
        if(profile){
            profile.cart = [] as any;
            const cartResult = await profile.save();
            return res.status(200).json(cartResult);
        }
    }
    return res.status(400).json({message:'Cart is already empty!'})
    
}


export const CreateOrder = async (req:Request,res:Response,next:NextFunction):Promise<any> => {
    
    //grab current login customer
    const customer = req.user;
    if(customer){

        //crete order ID
        const orderId = `${Math.floor(Math.random()+ 89999)+1000}`;
        const profile = await Customer.findById(customer._id);

        //Grab order items from request | {id:xx , unit: xx}
        const cart = <[OrderInputs]>req.body;
        let cartItems = Array();
        let netAmount:number = 0.0;
        let vandorId;
        //Cal order amount
        const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec(); 

        foods.map(food =>{
            cart.map(({_id,unit})=>{
                if(food._id == _id){
                    vandorId= food.vandorId
                    netAmount += (food.price*unit);
                    cartItems.push({food,unit});
                }
            })
        })

        
    // Cretae Order with item Description
    if(cartItems){
        const currentOrder = await Order.create({
            orderID: orderId,
            vandorId:vandorId,
            items: cartItems,
            totalAmount: netAmount,
            orderDate: new Date(),
            paidThrough: 'COD',
            paymentResponse:'',
            orderStatus: 'Waiting',
            remarks:'',
            deliveryId:'',
            appliedOffers:false,
            offerId: null,
            readyTime:45,
        })
        profile.cart= [] as any;
        profile.orders.push(currentOrder);
        const profileSaveResponse = await profile.save();
        return res.status(200).json(profileSaveResponse);

        // if(currentOrder){
        //     profile.orders.push(currentOrder);
        //     await profile.save();
        //     //Finally update orders to user account
        //     return res.status(200).json(currentOrder);
        // }
    } }

    return res.status(400).json({message:"Error with Create Order"})

    
}
export const GetOrders = async (req:Request,res:Response,next:NextFunction):Promise<any> => {
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id).populate("orders");
        if(profile){
            return res.status(200).json(profile.orders);
        }
    }
    return res.status(400).json({message:"Error in get Order API"})
}

export const GetOrderById = async (req:Request,res:Response,next:NextFunction):Promise<any> => {
    const orderId = req.params.id;
    if(orderId){
        const order = await Order.findById(orderId).populate("items.food");
        if(order){
            return res.status(200).json(order);
        }
    }
    return res.status(400).json({message:"Error in get Order By id API"})
    
}