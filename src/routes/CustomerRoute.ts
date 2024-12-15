import express, { Request, Response } from 'express';
import { CustomerLogin, CustomerSignUp, CustomerVerify, GetCustomerProfile, RequestOtp, EditCustomerProfile } from '../controllers';
import { Authenticate } from '../middlewares';

const router = express.Router();

/*---------------Sign/Create Customer -----------------*/

router.post('/signup',CustomerSignUp)


/*---------------Login -----------------*/
router.post('/login',CustomerLogin)

//authentication

router.use(Authenticate)

/*---------------Verify Customer Account -----------------*/

router.post('/verify',CustomerVerify)

/*---------------OTP / Requesting OTP -----------------*/

router.post('/otp',RequestOtp)

/*---------------Profile -----------------*/

router.post('/profile',GetCustomerProfile)


router.patch('/profile',EditCustomerProfile)

export { router as CustomerRoute}