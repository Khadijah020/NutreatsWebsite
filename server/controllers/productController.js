import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js"
import { slugify, generateUniqueSlug } from "../utils/slugify.js"
import mongoose from "mongoose"

// Add Product
// ✅ FIX 1: addProduct - Keep description as string
export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData);
    const { name, description, category, price, offerPrice, weights, isFeatured } = productData;

    console.log('➕ Adding product:', name);
    console.log('📝 Description received:', description);
    console.log('📝 Description type:', typeof description);

    if (!name || name.trim() === '') {
      return res.json({ success: false, message: "Product name is required" });
    }

    const baseSlug = slugify(name);
    const slug = await generateUniqueSlug(baseSlug, Product);

    const images = req.files;
    let imagesUrl = [];

    if (images && images.length > 0) {
      imagesUrl = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: 'image',
            folder: 'products'
          });
          return result.secure_url;
        })
      );
    }

    // ✅ IMPORTANT: Keep description as string, don't convert to array
    const product = new Product({
      name,
      slug,
      description: description || '', // ← Keep as string!
      category,
      price: weights && weights.length > 0 ? null : Number(price),
      offerPrice: weights && weights.length > 0 ? null : Number(offerPrice),
      image: imagesUrl,
      weights: weights || [],
      inStock: true,
      isFeatured: isFeatured || false, // ✅ ADD THIS
      date: Date.now()
    });

    await product.save();
    
    console.log('✅ Product saved with description type:', typeof product.description);
    
    res.json({ 
      success: true, 
      message: "Product added successfully", 
      product 
    });
  } catch (error) {
    console.error('❌ Error adding product:', error);
    res.json({ success: false, message: error.message });
  }
};


// Backend: /api/product/bulk-update
export const bulkUpdateProducts = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.json({ success: false, message: 'No updates provided' });
    }

    // Use transaction if using MongoDB with sessions
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let updatedCount = 0;

      for (const update of updates) {
        const { _id, name, description, weights, price, offerPrice } = update;
        
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (description !== undefined) updateFields.description = description;
        if (weights !== undefined) updateFields.weights = weights;
        if (price !== undefined) updateFields.price = Number(price);
        if (offerPrice !== undefined) updateFields.offerPrice = Number(offerPrice);

        if (Object.keys(updateFields).length > 0) {
          await Product.findByIdAndUpdate(
            _id,
            updateFields,
            { session, new: true }
          );
          updatedCount++;
        }
      }

      await session.commitTransaction();
      
      res.json({ 
        success: true, 
        message: `Successfully updated ${updatedCount} product${updatedCount > 1 ? 's' : ''}` 
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Bulk update error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Update Product
// Update Product - FIXED VERSION
export const updateProduct = async (req, res) => {
  try {
    const { 
      id, 
      name, 
      description, 
      category, 
      price, 
      offerPrice, 
      image, 
      weights, 
      inStock,
      isFeatured // ✅ ADD THIS - Accept isFeatured from request
    } = req.body;
    
    console.log('🔄 Updating product:', id);
    console.log('📝 Description received:', description);
    console.log('📝 Description type:', typeof description);
    console.log('⭐ isFeatured received:', isFeatured); // ✅ DEBUG LOG
    
    const updateData = {
      category,
      price: Number(price) || 0,
      offerPrice: Number(offerPrice) || 0,
      image: image || [],
      weights: weights || [],
      inStock: inStock !== undefined ? inStock : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false // ✅ ADD THIS LINE
    };

    // ✅ Keep description as string - don't convert to array!
    if (description !== undefined) {
      updateData.description = description || '';
    }
    
    // If name changed, regenerate slug
    if (name) {
      const product = await Product.findById(id);
      if (product && product.name !== name) {
        const baseSlug = slugify(name);
        updateData.slug = await generateUniqueSlug(baseSlug, Product, id);
        updateData.name = name;
        console.log('🔗 Updated slug:', updateData.slug);
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updated) {
      return res.json({ success: false, message: 'Product not found' });
    }
    
    console.log('✅ Product updated');
    console.log('   - Description type:', typeof updated.description);
    console.log('   - isFeatured:', updated.isFeatured); // ✅ VERIFY IT SAVED
    
    res.json({ success: true, message: "Product updated successfully", product: updated });
  } catch (error) {
    console.error('❌ Update error:', error);
    res.json({ success: false, message: error.message });
  }
};


//List Products: /api/product/list
export const productList = async (req , res) => {
    try {
        const products = await Product.find({}).lean(); // lean() gives plain JS objects

        // Convert ObjectIds to strings (both _id and nested weights)
        const formattedProducts = products.map((p) => ({
            ...p,
            _id: p._id.toString(),
            weights: p.weights?.map((w) => ({
                ...w,
                _id: w._id.toString(),
            })) || [],
        }));

        res.json({ success: true, products: formattedProducts });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};


//Get Single Product: /api/product/id
export const productById = async (req , res)=>{
    try {
        const {id} = req.body
        const product = await Product.findById(id)
        res.json({success: true, product})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
        
    }
}

// //Update Product: /api/product/update
// //Update Product: /api/product/update
// export const updateProduct = async (req, res) => {
//     try {
//         const { id, name, description, price, offerPrice, image, category, inStock, weights } = req.body;

//         // Validate required fields
//         if (!id) {
//             return res.json({ success: false, message: 'Product ID is required' });
//         }

//         if (!name || !category) {
//             return res.json({ success: false, message: 'Name and category are required' });
//         }

//         // Check if either base prices or weight variants exist
//         const hasBasePrice = price && offerPrice && price !== '0' && offerPrice !== '0';
//         const hasWeights = weights && Array.isArray(weights) && weights.length > 0;

//         if (!hasBasePrice && !hasWeights) {
//             return res.json({ success: false, message: 'Either base prices or weight variants are required' });
//         }

//         // Validate description only if provided
//         if (description !== undefined && (!Array.isArray(description))) {
//             return res.json({ success: false, message: 'Description must be an array' });
//         }

//         if (!Array.isArray(image) || image.length === 0) {
//             return res.json({ success: false, message: 'At least one image is required' });
//         }

//         // Prepare update object
//         const updateData = {
//             name,
//             price: Number(price) || 0,
//             offerPrice: Number(offerPrice) || 0,
//             image,
//             category,
//             inStock: inStock !== undefined ? inStock : true,
//             weights: weights || []
//         };

//         // Only include description if it exists and has content
//         if (description && Array.isArray(description) && description.length > 0) {
//             updateData.description = description;
//         } else {
//             updateData.description = [];
//         }

//         // Update the product
//         const updated = await Product.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         );

//         if (!updated) {
//             return res.json({ success: false, message: 'Product not found' });
//         }

//         res.json({ 
//             success: true, 
//             message: 'Product updated successfully', 
//             product: updated 
//         });

//     } catch (error) {
//         console.log(error.message);
//         res.json({ success: false, message: error.message });
//     }
// }

//Remove Product: /api/product/remove
export const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.json({ success: false, message: 'Product ID is required' });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.json({ success: false, message: 'Product not found' });
        }

        // Optional: Delete images from Cloudinary
        // if (product.image && product.image.length > 0) {
        //     await Promise.all(
        //         product.image.map(async (imageUrl) => {
        //             const publicId = imageUrl.split('/').pop().split('.')[0];
        //             await cloudinary.uploader.destroy(`products/${publicId}`);
        //         })
        //     );
        // }

        res.json({ 
            success: true, 
            message: 'Product removed successfully'
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//Upload Product Images: /api/product/upload-images
export const uploadImages = async (req, res) => {
    try {
        const images = req.files

        if (!images || images.length === 0) {
            return res.json({ success: false, message: 'No images provided' })
        }

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, {
                    resource_type: 'image',
                    folder: 'products'
                });
                return result.secure_url
            })
        )

        res.json({ 
            success: true, 
            message: 'Images uploaded successfully',
            imageUrls: imagesUrl 
        })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

//Change Product inStock: /api/product/stock
export const changeStock = async (req , res)=>{
    try {
        const {id, inStock} = req.body
        await Product.findByIdAndUpdate(id, {inStock})
        res.json({success: true, message: 'Stock Updated'})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }

}