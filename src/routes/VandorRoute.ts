import express, { Request, Response ,NextFunction } from 'express';
import { VandorLogin , GetVandorProfile, UpdateVandorProfile, UpdateVandorService, AddFood, GetFoods, UpdateVandorCoverImage, GetCurrentOrders, ProcessOrder, GetOrderDetails } from '../controllers';
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router = express.Router();

//config multer
const imageStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'images')
    },
    filename:function(req,file,cb){
        cb(null,new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname)
    }
})

const images = multer({storage:imageStorage}).array('images',10);


router.post('/login',VandorLogin);


router.use(Authenticate);
router.get('/profile' , GetVandorProfile);
router.patch('/profile',UpdateVandorProfile);
router.patch('/coverimage',images,UpdateVandorCoverImage);
router.patch('/service',UpdateVandorService);


router.post('/food',images,AddFood)
router.get('/foods',GetFoods)


/*------------------Orders-----------------*/
router.get('/orders',GetCurrentOrders);
router.get('/orders/:id/process', ProcessOrder);
router.get('/orders/:id', GetOrderDetails);



router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Hello World' });
});

export {router as VandorRoute}
