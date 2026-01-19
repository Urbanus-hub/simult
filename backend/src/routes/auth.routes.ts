import {Router} from 'express';
const router=Router();
import {register,login,logout,getProfile,updateProfile,deleteAccount}from'../controllers/auth.controller';
import {authenticate} from '../middleware/auth';



// create user

router.post('/user/register',register);//register user
router.post('/user/login',login);//user login
router.post('/user/logout',logout);//user logout
router.get('/user/profile',authenticate,getProfile);//get user profile
router.put('/user/profile',authenticate,updateProfile);//update user profile
router.delete('/user/delete',authenticate,deleteAccount);//delete user account

export default router;