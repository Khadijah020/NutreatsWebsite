import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { Trash2, Edit2, Upload } from 'lucide-react'

const EditProductDetails = () => {
    const { axios, currency } = useAppContext()
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [product, setProduct] = useState({
        name: '',
        description: [],
        price: '',
        offerPrice: '',
        image: [],
        category: '',
        inStock: true,
        weights: []
    })
    const [newDescPoint, setNewDescPoint] = useState('')
    const [imagePreview, setImagePreview] = useState([])
    const [uploadingImages, setUploadingImages] = useState(false)
    
    // Weight variant state
    const [currentWeight, setCurrentWeight] = useState({ weight: '', price: '', offerPrice: '' })
    const [editingWeightIndex, setEditingWeightIndex] = useState(null)

    useEffect(() => {
        fetchProduct()
    }, [])

    const fetchProduct = async () => {
        try {
            const { data } = await axios.post('/api/product/id', { id })
            if (data.success) {
                setProduct(data.product)
                setImagePreview(data.product.image)
            } else {
                toast.error('Failed to load product')
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field, value) => {
        setProduct(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const addDescriptionPoint = () => {
        if (newDescPoint.trim()) {
            setProduct(prev => ({
                ...prev,
                description: [...prev.description, newDescPoint.trim()]
            }))
            setNewDescPoint('')
        }
    }

    const removeDescriptionPoint = (index) => {
        setProduct(prev => ({
            ...prev,
            description: prev.description.filter((_, i) => i !== index)
        }))
    }

    // Handle switching to weight variants
    const switchToWeightVariants = () => {
        if (product.price !== '' || product.offerPrice !== '') {
            const confirmed = window.confirm(
                'Switching to weight variants will set base prices to 0. Continue?'
            )
            if (!confirmed) return
        }
        
        setProduct(prev => ({
            ...prev,
            price: '0',
            offerPrice: '0'
        }))
        toast.success('You can now add weight variants')
    }

    // Add or update weight variant
    const addWeightVariant = () => {
        if (!currentWeight.weight || !currentWeight.price || !currentWeight.offerPrice) {
            toast.error('Please fill all weight fields')
            return
        }

        // Check if base prices need to be set to 0
        if ((product.price !== '0' || product.offerPrice !== '0') && product.weights.length === 0) {
            const confirmed = window.confirm(
                'Adding weight variants will set base prices to 0. Continue?'
            )
            if (!confirmed) return
            
            setProduct(prev => ({
                ...prev,
                price: '0',
                offerPrice: '0'
            }))
        }

        if (editingWeightIndex !== null) {
            // Update existing weight
            setProduct(prev => ({
                ...prev,
                weights: prev.weights.map((w, i) => i === editingWeightIndex ? currentWeight : w)
            }))
            setEditingWeightIndex(null)
            toast.success('Weight variant updated')
        } else {
            // Add new weight
            setProduct(prev => ({
                ...prev,
                weights: [...(prev.weights || []), currentWeight]
            }))
            toast.success('Weight variant added')
        }
        
        setCurrentWeight({ weight: '', price: '', offerPrice: '' })
    }

    // Start editing a weight variant
    const startEditingWeight = (index) => {
        setCurrentWeight(product.weights[index])
        setEditingWeightIndex(index)
    }

    // Cancel editing
    const cancelEditingWeight = () => {
        setCurrentWeight({ weight: '', price: '', offerPrice: '' })
        setEditingWeightIndex(null)
    }

    // Remove weight variant
    const removeWeightVariant = (index) => {
        const newWeights = product.weights.filter((_, i) => i !== index)
        setProduct(prev => ({
            ...prev,
            weights: newWeights
        }))
        
        if (editingWeightIndex === index) {
            cancelEditingWeight()
        }
        
        toast.success('Weight variant removed')
    }

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setUploadingImages(true)
        const formData = new FormData()
        
        files.forEach(file => {
            formData.append('images', file)
        })

        try {
            const { data } = await axios.post('/api/product/upload-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            if (data.success) {
                setProduct(prev => ({
                    ...prev,
                    image: [...prev.image, ...data.imageUrls]
                }))
                setImagePreview(prev => [...prev, ...data.imageUrls])
                toast.success('Images uploaded successfully')
            } else {
                toast.error(data.message || 'Failed to upload images')
            }
        } catch (error) {
            toast.error(error.message || 'Failed to upload images')
        } finally {
            setUploadingImages(false)
        }
    }

    const removeImage = (index) => {
        setProduct(prev => ({
            ...prev,
            image: prev.image.filter((_, i) => i !== index)
        }))
        setImagePreview(prev => prev.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        // Validation
        if (!product.name || !product.category) {
            toast.error('Please fill all required fields')
            return
        }

        // Check if either base prices or weight variants exist
        const hasBasePrice = product.price !== '0' && product.offerPrice !== '0'
        const hasWeights = product.weights && product.weights.length > 0

        if (!hasBasePrice && !hasWeights) {
            toast.error('Please add either base prices or weight variants')
            return
        }

        if (product.image.length === 0) {
            toast.error('Please add at least one product image')
            return
        }

        setSaving(true)
        try {
            const updateData = {
                id,
                name: product.name,
                price: product.price,
                offerPrice: product.offerPrice,
                image: product.image,
                category: product.category,
                inStock: product.inStock,
                weights: product.weights || []
            }
            
            // Only include description if it has items
            if (product.description && product.description.length > 0) {
                updateData.description = product.description
            }
            
            const { data } = await axios.post('/api/product/update', updateData)
            if (data.success) {
                toast.success('Product updated successfully')
                navigate('/seller/product-list')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    const hasWeightVariants = product.weights && product.weights.length > 0
    const hasBasePricing = product.price !== '0' || product.offerPrice !== '0'

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
            <div className="w-full max-w-4xl mx-auto p-4 md:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Edit Product Details</h2>
                    <button
                        onClick={() => navigate('/seller/product-list')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                        ← Back
                    </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter product name"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={product.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Electronics, Clothing, etc."
                        />
                    </div>

                    {/* Base Price Fields - Only show if no weight variants */}
                    {!hasWeightVariants && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Base Price <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currency}</span>
                                    <input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Base Offer Price <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currency}</span>
                                    <input
                                        type="number"
                                        value={product.offerPrice}
                                        onChange={(e) => handleInputChange('offerPrice', e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Weight Variants Section */}
                    <div className="border-t pt-5">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Weight Variants {hasWeightVariants && <span className="text-red-500">*</span>}
                            </label>
                            {hasBasePricing && !hasWeightVariants && (
                                <button
                                    onClick={switchToWeightVariants}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    Switch to Weight Variants
                                </button>
                            )}
                        </div>
                        
                        {/* Display existing weights */}
                        {product.weights && product.weights.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {product.weights.map((w, index) => (
                                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${editingWeightIndex === index ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex gap-4 text-sm">
                                            <span className="font-medium text-gray-900">{w.weight}</span>
                                            <span className="text-gray-600">{currency}{w.price}</span>
                                            <span className="text-green-600">Offer: {currency}{w.offerPrice}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => startEditingWeight(index)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium transition-colors"
                                                disabled={editingWeightIndex !== null && editingWeightIndex !== index}
                                            >
                                                <Edit2 size={14} />
                                                {editingWeightIndex === index ? 'Editing' : 'Edit'}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => removeWeightVariant(index)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add/Edit weight form */}
                        {(!hasBasePricing || hasWeightVariants) && (
                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                {editingWeightIndex !== null && (
                                    <div className="text-sm font-medium text-green-600 mb-2">
                                        Editing weight variant
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Weight (e.g., 50g, 100g, 1kg)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={currentWeight.weight}
                                        onChange={(e) => setCurrentWeight({...currentWeight, weight: e.target.value})}
                                        placeholder="50g" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{currency}</span>
                                            <input 
                                                type="number" 
                                                value={currentWeight.price}
                                                onChange={(e) => setCurrentWeight({...currentWeight, price: e.target.value})}
                                                placeholder="100" 
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Offer Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{currency}</span>
                                            <input 
                                                type="number" 
                                                value={currentWeight.offerPrice}
                                                onChange={(e) => setCurrentWeight({...currentWeight, offerPrice: e.target.value})}
                                                placeholder="80" 
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        onClick={addWeightVariant}
                                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                                    >
                                        {editingWeightIndex !== null ? 'Update Weight Variant' : 'Add Weight Variant'}
                                    </button>
                                    {editingWeightIndex !== null && (
                                        <button 
                                            type="button"
                                            onClick={cancelEditingWeight}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description Points */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description Points (Optional)
                        </label>
                        {product.description && product.description.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {product.description.map((point, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <span className="flex-1 text-sm">{point}</span>
                                        <button
                                            onClick={() => removeDescriptionPoint(index)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium transition-colors"
                                        >
                                            <Trash2 size={14} />
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newDescPoint}
                                onChange={(e) => setNewDescPoint(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addDescriptionPoint()}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Add a description point"
                            />
                            <button
                                onClick={addDescriptionPoint}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Product Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Images <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {imagePreview.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={img}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <label className="relative flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Upload size={20} />
                                <span className="text-sm font-medium">
                                    {uploadingImages ? 'Uploading...' : 'Choose images to upload'}
                                </span>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImages}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* In Stock Toggle */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">In Stock</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={product.inStock}
                                onChange={(e) => handleInputChange('inStock', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving || uploadingImages}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={() => navigate('/seller/product-list')}
                            disabled={saving}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditProductDetails