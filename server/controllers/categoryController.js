import Category from '../models/Category.js'
import { v2 as cloudinary } from 'cloudinary'

// Get All Categories: /api/category/list
// Get All Categories: /api/category/list
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ order: 1 }); // 👈 sort by order ascending
    return res.json({ success: true, categories });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// Get Single Category: /api/category/:id
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params
    const category = await Category.findById(id)
    
    if (!category) {
      return res.json({ success: false, message: 'Category not found' })
    }
    
    return res.json({ success: true, category })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

// Add Category: /api/category/add
export const addCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body

    if (!name) {
      return res.json({ success: false, message: 'Category name is required' })
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return res.json({ success: false, message: 'Category already exists' })
    }

    let imageUrl = ''

    // Upload image to cloudinary if provided
    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image'
      })
      imageUrl = imageUpload.secure_url
    }
    const count = await Category.countDocuments();

    const category = new Category({
      name,
      description: description || '',
      image: imageUrl,
      isActive: isActive === 'false' ? false : true,
      order: count, 
    })

    await category.save()
    return res.json({ success: true, message: 'Category added successfully', category })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

// Reorder Categories: /api/category/reorder
export const reorderCategories = async (req, res) => {
  try {
    const { order } = req.body; // array of { _id, order }

    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'Invalid order data' });
    }

    const updatePromises = order.map(item =>
      Category.findByIdAndUpdate(item._id, { order: item.order })
    );
    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Categories reordered successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Update Category: /api/category/update/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, isActive } = req.body

    const category = await Category.findById(id)
    if (!category) {
      return res.json({ success: false, message: 'Category not found' })
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name })
      if (existingCategory) {
        return res.json({ success: false, message: 'Category name already exists' })
      }
    }

    // Upload new image to cloudinary if provided
    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image'
      })
      category.image = imageUpload.secure_url
    }

    if (name) category.name = name
    if (description !== undefined) category.description = description
    if (isActive !== undefined) category.isActive = isActive === 'false' ? false : true

    await category.save()
    return res.json({ success: true, message: 'Category updated successfully', category })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

// Delete Category: /api/category/delete/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findByIdAndDelete(id)
    if (!category) {
      return res.json({ success: false, message: 'Category not found' })
    }

    return res.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}