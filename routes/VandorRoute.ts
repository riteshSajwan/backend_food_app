import express, { Request, Response ,NextFunction } from 'express';
import { VandorLogin , GetVandorProfile, UpdateVandorProfile, UpdateVandorService } from '../controllers/VandorController';
import { Authenticate } from '../middlewares';

const router = express.Router();

router.post('/login',VandorLogin);

router.use(Authenticate);
router.get('/profile' , GetVandorProfile);
router.patch('/profile',UpdateVandorProfile);
router.patch('/service',UpdateVandorService);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Hello World' });
});

export {router as VandorRoute}
