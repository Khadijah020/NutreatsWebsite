import Order from "../models/Order.js"
import Product from "../models/Product.js"

//Place Order COD: /api/order/cod
export const placeOrderCOD = async(req , res)=>{
    try {
        const { items, address } = req.body
        const userId = req.userId // get from auth middleware
        if(!address || items.length === 0){
            return res.json ({success: true, message: "Invalid Data"})
        }
        //calculkate amount using items
        let amount = await items.reduce(async(acc, item)=>{
            const product = await Product.findById(item.product)
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)
        //Add tax chaarge (if in future)

        await Order.create({
            userId,
            items, amount, address, paymentType: "COD"
        })
        return res.json({success: true, message: "Order Placed Successfully!"})

 
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//Get Orders by User ID: /api/order/user
export const getUserOrders = async (req, res)=>{
    try {
        const userId = req.userId;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate({
  path: "items.product", // nested populate for array
  model: "product"
})
.populate("address")
.sort({ createdAt: -1 });
        res.json({success: true, orders})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//Get All Orders (for seller/admin): /api/order/seller

export const getAllOrders = async (req, res)=>{
    try {
        
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1})
        res.json({success: true, orders})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }}