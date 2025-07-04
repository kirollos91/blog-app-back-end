const CategoryDB = require("../models/category.model");
const ApiErrorHandle = require("../utils/ApiErrorHandle");
const asyncHandler = require("express-async-handler");

/**---------------------------------------- 
 * @desc    Get All Categories
 * @route   /api/categories
 * @method  GET
 * @access  public
----------------------------------------**/
module.exports.getAllCategoriesCtrl = asyncHandler(
  async (request, response, next) => {
    // Get Categories
    const categories = await CategoryDB.find();

    // Sent response to the client
    response
      .status(200)
      .json({ message: "get all categories successfully", data: categories });
  }
);

/**---------------------------------------- 
 * @desc    Create New Category
 * @route   /api/categories/
 * @method  POST
 * @access  private (Only Admin)
----------------------------------------**/
module.exports.createCategoryCtrl = asyncHandler(
  async (request, response, next) => {
    // get data from client in body
    const { title } = request.body;
    const { id: user } = request.user;

    // Create category
    const category = await CategoryDB.create({ title, user });

    // Sent response to the client
    response
      .status(201)
      .json({ message: "created category successfully", data: category });
  }
);

/**---------------------------------------- 
 * @desc    Delete Category By Id
 * @route   /api/categories/:id
 * @method  DELETE
 * @access  private (only admin)
----------------------------------------**/
module.exports.deleteCategoryCtrl = asyncHandler(
  async (request, response, next) => {
    const { id } = request.params;

    // Check if category exist
    const category = await CategoryDB.findById(id);
    if (!category) return next(new ApiErrorHandle("category not found", 404));

    // Delete Category
    await CategoryDB.findByIdAndDelete(id);

    // Sent response to the client
    response.status(200).json({
      message: "deleted category successfully",
      data: { categoryId: category._id },
    });
  }
);
