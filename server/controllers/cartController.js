import User from "../models/user.js"


//Update user cart date: /api/cart/update

export const updateCart = async (req, res)=>{
    try {
        const {cartItems} = req.body
        const userId = req.userId; // ✅ get userId from auth middleware

        if (!userId) {
            return res.json({ success: false, message: "User not authorized" });
        }
        await User.findByIdAndUpdate(userId, {cartItems})
        res.json({success: true, message: "Cart Updated"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}
