const Service = require('../models/Service');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Get all services with filters
const getAllServices = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    min_price = 0,
    max_price,
    search,
    sortBy = 'name',
    sortOrder = 'ASC'
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    min_price: parseFloat(min_price),
    max_price: max_price ? parseFloat(max_price) : null,
    search,
    sortBy,
    sortOrder
  };

  const result = await Service.findAll(options);

  res.status(200).json({
    success: true,
    message: 'Services retrieved successfully',
    data: result.services,
    pagination: result.pagination
  });
});

// Get service by ID
const getServiceById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const service = await Service.findById(id);
  
  if (!service) {
    return next(new AppError('Service not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Service retrieved successfully',
    data: {
      service
    }
  });
});

// Create service (Admin only)
const createService = catchAsync(async (req, res, next) => {
  const { name, description, price, duration, category } = req.body;
  
  const service = await Service.create({
    name,
    description,
    price,
    duration,
    category
  });
  
  logger.info(`Admin created new service: ${name}`);
  
  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    data: {
      service
    }
  });
});

// Update service (Admin only)
const updateService = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const service = await Service.findById(id);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }
  
  const updatedService = await Service.updateById(id, req.body);
  
  logger.info(`Admin updated service: ${service.name}`);
  
  res.status(200).json({
    success: true,
    message: 'Service updated successfully',
    data: {
      service: updatedService
    }
  });
});

// Delete service (Admin only)
const deleteService = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const service = await Service.findById(id);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }
  
  await Service.deleteById(id);
  
  logger.info(`Admin deleted service: ${service.name}`);
  
  res.status(200).json({
    success: true,
    message: 'Service deleted successfully'
  });
});

// Get services by category
const getServicesByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { limit = 10, sortBy = 'price', sortOrder = 'ASC' } = req.query;
  
  const services = await Service.findByCategory(category, {
    limit: parseInt(limit),
    sortBy,
    sortOrder
  });
  
  res.status(200).json({
    success: true,
    message: `Services in category '${category}' retrieved successfully`,
    data: services
  });
});

// Get popular services
const getPopularServices = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const services = await Service.getPopularServices(parseInt(limit));
  
  res.status(200).json({
    success: true,
    message: 'Popular services retrieved successfully',
    data: services
  });
});

// Get service categories
const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Service.getCategories();
  
  res.status(200).json({
    success: true,
    message: 'Service categories retrieved successfully',
    data: categories
  });
});

// Get service statistics (Admin only)
const getServiceStats = catchAsync(async (req, res, next) => {
  const stats = await Service.getStats();
  
  res.status(200).json({
    success: true,
    message: 'Service statistics retrieved successfully',
    data: stats
  });
});

// Search services
const searchServices = catchAsync(async (req, res, next) => {
  const { q, category, limit = 10 } = req.query;
  
  if (!q || q.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters long', 400));
  }
  
  const services = await Service.search(q.trim(), {
    category,
    limit: parseInt(limit)
  });
  
  res.status(200).json({
    success: true,
    message: 'Search completed successfully',
    data: services
  });
});

// Get services for a specific barber
const getServicesForBarber = catchAsync(async (req, res, next) => {
  const { barberId } = req.params;
  
  const services = await Service.getServicesForBarber(barberId);
  
  res.status(200).json({
    success: true,
    message: 'Services for barber retrieved successfully',
    data: services
  });
});

// Toggle service status (Admin only)
const toggleServiceStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { is_active } = req.body;
  
  if (typeof is_active !== 'boolean') {
    return next(new AppError('is_active must be a boolean value', 400));
  }
  
  const service = await Service.findById(id);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }
  
  const updatedService = await Service.updateById(id, { is_active });
  
  const action = is_active ? 'activated' : 'deactivated';
  logger.info(`Admin ${action} service: ${service.name}`);
  
  res.status(200).json({
    success: true,
    message: `Service ${action} successfully`,
    data: {
      service: updatedService
    }
  });
});

// Bulk update services (Admin only)
const bulkUpdateServices = catchAsync(async (req, res, next) => {
  const { service_ids, update_data } = req.body;
  
  if (!Array.isArray(service_ids) || service_ids.length === 0) {
    return next(new AppError('Please provide an array of service IDs', 400));
  }
  
  if (!update_data || Object.keys(update_data).length === 0) {
    return next(new AppError('Please provide update data', 400));
  }
  
  const allowedFields = ['is_active', 'category', 'price'];
  const filteredUpdateData = {};
  
  Object.keys(update_data).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdateData[key] = update_data[key];
    }
  });
  
  if (Object.keys(filteredUpdateData).length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }
  
  const results = [];
  const errors = [];
  
  for (const serviceId of service_ids) {
    try {
      const updatedService = await Service.updateById(serviceId, filteredUpdateData);
      results.push(updatedService);
    } catch (error) {
      errors.push({ service_id: serviceId, error: error.message });
    }
  }
  
  logger.info(`Admin performed bulk update on ${results.length} services`);
  
  res.status(200).json({
    success: true,
    message: `Bulk update completed. ${results.length} services updated, ${errors.length} errors.`,
    data: {
      updated_services: results,
      errors: errors
    }
  });
});

// Get service price range
const getPriceRange = catchAsync(async (req, res, next) => {
  const { category } = req.query;
  
  let whereClause = 'WHERE is_active = 1';
  let queryParams = [];
  
  if (category) {
    whereClause += ' AND category = ?';
    queryParams.push(category);
  }
  
  const query = `
    SELECT 
      MIN(price) as min_price,
      MAX(price) as max_price,
      AVG(price) as avg_price
    FROM services
    ${whereClause}
  `;
  
  const { executeQuery } = require('../config/database');
  const result = await executeQuery(query, queryParams);
  
  const priceRange = {
    min_price: parseFloat(result[0].min_price) || 0,
    max_price: parseFloat(result[0].max_price) || 0,
    avg_price: parseFloat(result[0].avg_price) || 0
  };
  
  res.status(200).json({
    success: true,
    message: 'Price range retrieved successfully',
    data: priceRange
  });
});

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  getPopularServices,
  getCategories,
  getServiceStats,
  searchServices,
  getServicesForBarber,
  toggleServiceStatus,
  bulkUpdateServices,
  getPriceRange
};
