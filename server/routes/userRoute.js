import express from 'express';
import { isAuth, login, logout, register, convertGuestToRegistered } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router()

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.post('/convert-guest', convertGuestToRegistered)
userRouter.get('/is-auth',authUser, isAuth)
userRouter.get('/logout',authUser, logout)

export default userRouter