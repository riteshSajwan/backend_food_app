import express, { Request, Response } from 'express';
import { CustomerLogin, CustomerSignUp, CustomerVerify, GetCustomerProfile, RequestOtp, EditCustomerProfile, CreateOrder, GetOrders, GetOrderById, AddToCart, GetCart, DeleteCart } from '../controllers';
import { Authenticate } from '../middlewares';

const router = express.Router();

/*---------------Sign/Create Customer -----------------*/

router.post('/signup',CustomerSignUp)


/*---------------Login -----------------*/
router.post('/login',CustomerLogin)

//authentication

router.use(Authenticate)

/*----------------------Verify Customer Account -----------------*/

router.post('/verify',CustomerVerify)

/*-----------------------OTP / Requesting OTP -----------------*/

router.post('/otp',RequestOtp)

/*-----------------------Profile -----------------*/

router.post('/profile',GetCustomerProfile)


router.patch('/profile',EditCustomerProfile)

/*----------------------Cart Section--------------*/

router.post('/cart',AddToCart)
router.get('/cart',GetCart)
router.delete('/cart',DeleteCart)

/*----------------------Payment Section--------------*/


/*----------------------Order Section--------------*/


router.post('/create-order',CreateOrder);
router.get('/order',GetOrders);
router.get('/order/:id',GetOrderById);

export { router as CustomerRoute}