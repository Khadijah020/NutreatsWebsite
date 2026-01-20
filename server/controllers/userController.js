import User from "../models/user.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

//Register user: /api/user/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }
        
        const existingUser = await User.findOne({ email })
        
        if (existingUser) {
            // If user exists but is a guest (no password), allow conversion
            if (!existingUser.hasPassword) {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUser.password = hashedPassword
                existingUser.hasPassword = true
                existingUser.isGuest = false
                existingUser.name = name
                await existingUser.save()
                
                const token = jwt.sign({id: existingUser._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
                res.cookie('token', token, {
                    httpOnly: true,
                    secure:  process.env.NODE_ENV === 'production',
                    sameSite:  process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                    maxAge: 7*24*60*60*1000
                })
                return res.json({
                    success: true, 
                    message: 'Guest account converted to registered account',
                    user: {email: existingUser.email, name: existingUser.name}
                })
            }
            
            return res.json({ success: false, message: 'User already exists! ' })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword,
            hasPassword: true,
            isGuest: false
        })
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure:  process.env.NODE_ENV === 'production',
            sameSite:  process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        })
        return res.json({success: true, user: {email: user.email, name: user.name}})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}


//Login User: /api/user/login
export const login = async (req, res)=>{
    try{
        const {email, password} = req.body;

        if(!email || !password)
            return res.json({success:false, message:'Email and password are required!'});
        const user = await User.findOne({email})

        if(!user){
            return res.json({success:false, message:'Invalid Email or password!'});  
        }
        
        // Check if user has a password (is registered)
        if(!user.hasPassword || !user.password){
            return res.json({success:false, message:'This account has no password. Please register first.'});  
        }
        
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch)
            return res.json({success: false, message: 'Invalid email or password'})
    
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure:  process.env.NODE_ENV === 'production',
            sameSite:  process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        })
        return res.json({
            success: true,
            message: 'Login successful',
            user: { email: user.email, name: user.name },
        });
    } 
    catch (error){
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//Check Auth :/api/user/is-auth

export const isAuth =async (req, res)=>{
    try{
        //const {userId} = req.body;
        const user = await User.findById(req.userId).select("-password")
        return res.json({success: true, user})
    } catch(error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//Logout User: /api/user/logout

export const logout = async(req, res)=>{
    try{
        res.clearCookie('token', {
         httpOnly: true, 
        secure:  process.env.NODE_ENV === 'production', 
        sameSite:  process.env.NODE_ENV === 'production' ? 'none' : 'strict',    
        })
        return res.json({success: true, message: 'Logged Out'})

    } catch(error){
         console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

// Convert Guest to Registered Account: /api/user/convert-guest
export const convertGuestToRegistered = async(req, res) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }
        
        // Find guest user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.json({ success: false, message: 'No account found with this email' });
        }
        
        if (user.hasPassword) {
            return res.json({ success: false, message: 'This account is already registered. Please login.' });
        }
        
        // Convert guest to registered user
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.hasPassword = true;
        user.isGuest = false;
        if (name) user.name = name;
        
        await user.save();
        
        // Create token and set cookie
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        });
        
        return res.json({
            success: true,
            message: 'Account converted successfully. All your previous orders are now linked to your account.',
            user: { email: user.email, name: user.name }
        });
        
    } catch(error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}