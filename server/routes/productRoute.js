import express from 'express'
import authSeller from '../middlewares/authSeller.js'
import { upload } from '../configs/multer.js'
import { 
    addProduct, 
    changeStock, 
    productById, 
    productList, 
    updateProduct,
    uploadImages,
    removeProduct
} from '../controllers/productController.js'

const productRouter = express.Router()

productRouter.post('/add', upload.array("images"), authSeller, addProduct)
productRouter.get('/list', productList)
productRouter.post('/id', productById)
productRouter.post('/stock', authSeller, changeStock)
productRouter.post('/update', authSeller, updateProduct)
productRouter.post('/upload-images', upload.array("images"), authSeller, uploadImages)
productRouter.post('/remove', removeProduct);
export default productRouter