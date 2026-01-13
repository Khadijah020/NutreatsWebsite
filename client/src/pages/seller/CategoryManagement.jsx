import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Upload, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function CategoryManagement() {
  const { axios } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${backendUrl}api/category/list`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editMode
        ? `${backendUrl}/api/category/update/${currentCategory._id}`
        : `${backendUrl}/api/category/add`;

      const method = editMode ? 'PUT' : 'POST';

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isActive', formData.isActive);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchCategories();
        closeModal();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const handleEdit = (category) => {
    setEditMode(true);
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    setImagePreview(category.image || '');
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`${backendUrl}api/category/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const moveCategory = async (index, direction) => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    [newCategories[index], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[index],
    ];

    setCategories(newCategories);

    const order = newCategories.map((cat, idx) => ({
      _id: cat._id,
      order: idx,
    }));

    try {
      await fetch(`${backendUrl}/api/category/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ order }),
      });
    } catch (error) {
      console.error('Error reordering categories:', error);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentCategory(null);
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentCategory(null);
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
  };


  const generateAIDescription = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a category name first');
      return;
    }

    try {
      setGeneratingAI(true);
      const { data } = await axios.post('/api/ai/generate-category-description', {
        categoryName: formData.name,
      });

      if (data.success) {
        setAiDescription(data.description);
        setShowAIPreview(true);
        toast.success('AI description generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate description');
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error(error.response?.data?.message || 'Failed to generate description');
    } finally {
      setGeneratingAI(false);
    }
  };

  const approveAIDescription = () => {
    setFormData(prev => ({ ...prev, description: aiDescription }));
    setShowAIPreview(false);
    setAiDescription('');
    toast.success('Description approved and added!');
  };

  const rejectAIDescription = () => {
    setShowAIPreview(false);
    setAiDescription('');
    toast('Description rejected');
  };
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl text-gray-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-0 bg-[#bfd9bde0] min-h-screen py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-[#EB8A14]">Manage Categories</h1>

          <button
            onClick={openAddModal}
            className="bg-[#EB8A14] hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 transition shadow-md text-sm sm:text-base border-2 border-[#EB8A14]"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Category</span>
          </button>
        </div>

        {/* ✅ Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-md overflow-hidden border-4 border-[#EB8A14]">
          <table className="w-full">
            <thead className="bg-[#EB8A14]">
              <tr>
                <th className="text-left p-4 font-semibold text-white">#</th>
                <th className="text-left p-4 font-semibold text-white">Name</th>
                <th className="text-left p-4 font-semibold text-white">Description</th>
                <th className="text-left p-4 font-semibold text-white">Status</th>
                <th className="text-left p-4 font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-[#EB8A14]">
                    No categories found. Add your first category!
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={category._id} className="border-b-2 border-[#EB8A14] hover:bg-[#bfd9bde0] transition">
                    <td className="p-4 text-[#EB8A14] font-medium">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-10 h-10 object-cover rounded-lg border-2 border-[#EB8A14]"
                          />
                        )}
                        <span className="font-medium text-gray-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">{category.description || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${
                        category.isActive
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-red-100 text-red-700 border-red-300'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {/* <button onClick={() => moveCategory(index, 'up')} disabled={index === 0} className={`p-2 rounded-lg border-2 ${index === 0 ? 'text-gray-300 border-gray-300 cursor-not-allowed' : 'text-[#EB8A14] border-[#EB8A14] hover:bg-[#bfd9bde0]'}`}>
                          <ArrowUp size={16} />
                        </button>
                        <button onClick={() => moveCategory(index, 'down')} disabled={index === categories.length - 1} className={`p-2 rounded-lg border-2 ${index === categories.length - 1 ? 'text-gray-300 border-gray-300 cursor-not-allowed' : 'text-[#EB8A14] border-[#EB8A14] hover:bg-[#bfd9bde0]'}`}>
                          <ArrowDown size={16} />
                        </button> */}
                        <button onClick={() => handleEdit(category)} className="p-2 text-[#EB8A14] border-2 border-[#EB8A14] hover:bg-[#bfd9bde0] rounded-lg transition">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(category._id)} className="p-2 text-red-600 border-2 border-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Mobile Card Layout */}
        <div className="md:hidden space-y-4">
          {categories.map((category, index) => (
            <div key={category._id} className="bg-white rounded-2xl shadow-md p-4 border-4 border-[#EB8A14]">
              <div className="flex gap-3 items-center mb-3">
                {category.image && (
                  <img src={category.image} className="w-14 h-14 rounded-xl object-cover border-2 border-[#EB8A14]" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 ${
                  category.isActive
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>

                <div className="flex gap-2">
                  <button onClick={() => moveCategory(index, 'up')} disabled={index === 0} className="text-[#EB8A14] p-1 border-2 border-[#EB8A14] rounded disabled:text-gray-300 disabled:border-gray-300">
                    <ArrowUp size={18} />
                  </button>
                  <button onClick={() => moveCategory(index, 'down')} disabled={index === categories.length - 1} className="text-[#EB8A14] p-1 border-2 border-[#EB8A14] rounded disabled:text-gray-300 disabled:border-gray-300">
                    <ArrowDown size={18} />
                  </button>
                  <button onClick={() => handleEdit(category)} className="text-[#EB8A14] p-1 border-2 border-[#EB8A14] rounded">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(category._id)} className="text-red-600 p-1 border-2 border-red-600 rounded">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm p-3 flex items-end md:items-center justify-center z-50">
            <div className="bg-white rounded-2xl border-4 border-[#EB8A14] max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b-2 border-[#EB8A14] sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-[#EB8A14]">
                  {editMode ? 'Edit Category' : 'Add Category'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-[#EB8A14] hover:text-orange-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#EB8A14] mb-2">
                    Category Name <span className="text-[#EB8A14]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none transition bg-white"
                    placeholder="e.g., Spices, Dry Fruits"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#EB8A14] mb-2">
                    Description
                  </label>
                  
                  {/* AI Generate Button */}
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={generatingAI || !formData.name.trim()}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        generatingAI || !formData.name.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <Sparkles size={16} className={generatingAI ? 'animate-spin' : ''} />
                      {generatingAI ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>

                  {/* AI Preview Modal */}
                  {showAIPreview && (
                    <div className="mb-4 p-4 border-2 border-purple-500 rounded-xl bg-purple-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
                          <Sparkles size={16} />
                          AI Generated Description
                        </h3>
                        <button
                          type="button"
                          onClick={rejectAIDescription}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="mb-3 p-3 bg-white rounded-lg text-sm text-gray-700">
                        {aiDescription}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={approveAIDescription}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          ✓ Approve & Use
                        </button>
                        <button
                          type="button"
                          onClick={rejectAIDescription}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-[#EB8A14] rounded-xl focus:ring-2 focus:ring-[#EB8A14] focus:border-[#EB8A14] outline-none transition resize-none bg-white"
                    placeholder="Brief description of this category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#EB8A14] mb-2">
                    Category Image
                  </label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-[#EB8A14]"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition border-2 border-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer border-2 border-dashed border-[#EB8A14] rounded-xl w-32 h-32 flex flex-col items-center justify-center hover:border-orange-600 transition-all hover:bg-[#bfd9bde0]">
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                      <Upload className="text-[#EB8A14] w-8 h-8 mb-2" />
                      <span className="text-sm text-[#EB8A14]">Upload Image</span>
                    </label>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#EB8A14] border-2 border-[#EB8A14] rounded focus:ring-[#EB8A14] cursor-pointer"
                  />
                  <label className="text-sm font-medium text-[#EB8A14] cursor-pointer">
                    Active (visible to customers)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 border-2 border-[#EB8A14] text-[#EB8A14] rounded-xl hover:bg-[#bfd9bde0] transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2.5 bg-[#EB8A14] text-white rounded-xl hover:bg-orange-600 transition font-medium shadow-md border-2 border-[#EB8A14]"
                  >
                    {editMode ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}