const EventCategory = require('../models/EventCategory');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs');
const mongoose = require('mongoose');

const handleError = (res, error, message = 'An error occurred') => {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
  res.status(500).json({ success: false, message });
};

exports.getEventCategories = async (req, res) => {
  try {
    console.log('Fetching event categories...');
    const categories = await EventCategory.find().sort({ order: 1 });
    res.json({
      success: true,
      data: categories,
      message: 'Event categories fetched successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch event categories');
  }
};


exports.createEventCategory = async (req, res) => {
  try {
    console.log('Creating new event category...', req.body);

    const requiredFields = ['title', 'description', 'icon', 'capacity'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const id = req.body.id || req.body.title.toLowerCase().replace(/\s+/g, '-');

    let imageUrl = null;

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, 'website-content/event-categories');
        imageUrl = result.secure_url;
        console.log('Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading image to Cloudinary',
          error: uploadError.message
        });
      }
    }


    let features = [];
    let membershipPricing = {};

    try {
      features = JSON.parse(req.body.features || '[]');
      if (!Array.isArray(features)) {
        throw new Error('Features must be an array');
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid features format',
        error: e.message
      });
    }

    try {
      membershipPricing = JSON.parse(req.body.membershipPricing || '{}');
      if (!membershipPricing.samajMember || !membershipPricing.nonSamajMember) {
        throw new Error('Membership pricing must include samajMember and nonSamajMember');
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership pricing format',
        error: e.message
      });
    }

    const categoryData = {
      id,
      title: req.body.title,
      description: req.body.description,
      icon: req.body.icon,
      capacity: req.body.capacity,
      image: imageUrl || 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/website-content/default-category.jpg',
      features,
      membershipPricing,
      isActive: req.body.isActive === 'true',
      order: parseInt(req.body.order) || 0
    };

    console.log('Creating category with data:', categoryData);

    const category = new EventCategory(categoryData);
    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: 'Event category created successfully'
    });
  } catch (error) {
    console.error('Error creating event category:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An event category with this ID already exists'
      });
    }

    handleError(res, error, 'Failed to create event category');
  }
};

exports.updateEventCategory = async (req, res) => {
  try {
    console.log('Update request received:', {
      params: req.params,
      body: req.body,
      file: req.file ? 'File present' : 'No file'
    });


    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }
  
    const category = await EventCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Event category not found'
      });
    }

    let imageUrl = category.image;
    if (req.file) {
      try {
      
        if (category.image) {
          const publicId = category.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`website-content/event-categories/${publicId}`);
        }

     
        const result = await uploadToCloudinary(req.file, 'website-content/event-categories');
        imageUrl = result.secure_url;
        console.log('Image updated in Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('Error updating image in Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error updating image in Cloudinary',
          error: uploadError.message
        });
      }
    }

    let features = [];
    let membershipPricing = {};

    try {
      features = JSON.parse(req.body.features || '[]');
      if (!Array.isArray(features)) {
        throw new Error('Features must be an array');
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid features format',
        error: e.message
      });
    }

    try {
      membershipPricing = JSON.parse(req.body.membershipPricing || '{}');
      if (!membershipPricing.samajMember || !membershipPricing.nonSamajMember) {
        throw new Error('Membership pricing must include samajMember and nonSamajMember');
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership pricing format',
        error: e.message
      });
    }

    category.title = req.body.title || category.title;
    category.description = req.body.description || category.description;
    category.icon = req.body.icon || category.icon;
    category.capacity = req.body.capacity || category.capacity;
    category.image = imageUrl;
    category.features = features;
    category.membershipPricing = membershipPricing;
    category.isActive = req.body.isActive === 'true';
    category.order = parseInt(req.body.order) || category.order;

    await category.save();

    res.json({
      success: true,
      data: category,
      message: 'Event category updated successfully'
    });
  } catch (error) {
    console.error('Error in updateEventCategory:', error);
    handleError(res, error, 'Failed to update event category');
  }
};


exports.deleteEventCategory = async (req, res) => {
  try {
    console.log('Deleting event category...', req.params.id);
    const category = await EventCategory.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
        { id: req.params.id }
      ]
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Event category not found'
      });
    }

    if (category.image) {
      try {
        const publicId = category.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`website-content/event-categories/${publicId}`);
      } catch (uploadError) {
        console.error('Error deleting image from Cloudinary:', uploadError);

      }
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Event category deleted successfully'
    });
  } catch (error) {
    handleError(res, error, 'Failed to delete event category');
  }
}; 