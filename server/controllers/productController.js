import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js"

//Add Product: /api/product/add
export const addProduct = async (req , res)=>{
    try {
        let productData = JSON.parse(req.body.productData)
        const images = req.files

        let imagesUrl = await Promise.all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url
            })
        )
        await Product.create({...productData, image: imagesUrl})
        return res.json({success: true, message: 'Product Added Successfully!'})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
        
    }
}

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

//Update Product: /api/product/update
//Update Product: /api/product/update
export const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, offerPrice, image, category, inStock, weights } = req.body;

        // Validate required fields
        if (!id) {
            return res.json({ success: false, message: 'Product ID is required' });
        }

        if (!name || !category) {
            return res.json({ success: false, message: 'Name and category are required' });
        }

        // Check if either base prices or weight variants exist
        const hasBasePrice = price && offerPrice && price !== '0' && offerPrice !== '0';
        const hasWeights = weights && Array.isArray(weights) && weights.length > 0;

        if (!hasBasePrice && !hasWeights) {
            return res.json({ success: false, message: 'Either base prices or weight variants are required' });
        }

        // Validate description only if provided
        if (description !== undefined && (!Array.isArray(description))) {
            return res.json({ success: false, message: 'Description must be an array' });
        }

        if (!Array.isArray(image) || image.length === 0) {
            return res.json({ success: false, message: 'At least one image is required' });
        }

        // Prepare update object
        const updateData = {
            name,
            price: Number(price) || 0,
            offerPrice: Number(offerPrice) || 0,
            image,
            category,
            inStock: inStock !== undefined ? inStock : true,
            weights: weights || []
        };

        // Only include description if it exists and has content
        if (description && Array.isArray(description) && description.length > 0) {
            updateData.description = description;
        } else {
            updateData.description = [];
        }

        // Update the product
        const updated = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.json({ success: false, message: 'Product not found' });
        }

        res.json({ 
            success: true, 
            message: 'Product updated successfully', 
            product: updated 
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

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