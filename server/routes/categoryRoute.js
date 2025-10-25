import express from 'express'
import { 
  getCategories, 
  getCategory, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController.js'
import authSeller from '../middlewares/authSeller.js'
import { upload } from '../configs/multer.js'

const categoryRouter = express.Router()

// Public routes
categoryRouter.get('/list', getCategories)
categoryRouter.get('/:id', getCategory)

// Protected routes (seller only)
categoryRouter.post('/add', authSeller, upload.single('image'), addCategory)
categoryRouter.put('/update/:id', authSeller, upload.single('image'), updateCategory)
categoryRouter.delete('/delete/:id', authSeller, deleteCategory)

export default categoryRouter