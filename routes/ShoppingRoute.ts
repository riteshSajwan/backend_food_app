import express, { Request, Response ,NextFunction } from 'express';
import { CreateVandor, GetVandor, GetVandorByID } from '../controllers/AdminController';
import { GetFoodAvailability, GetFoodsIn30Min, GetTopResturants, ResturantById, SearchFoods } from '../controllers';

const router = express.Router();

/* -----------------Food Availability -----------------*/

router.get('/:pincode',GetFoodAvailability)

/* ----------------------Top Resturants-----------------------*/

router.get('/top-resturants/:pincode',GetTopResturants)


/* ----------------------Foods Available in 30 mins-----------------------*/

router.get('/foods-in-30min/:pincode',GetFoodsIn30Min)

/* ----------------------Search Foods -----------------------*/

router.get('/search/:pincode',SearchFoods)

/* ----------------------Find Resturant By Id-----------------------*/

router.get('/resturant/:id',ResturantById)



export {router as ShoppingRoute}
