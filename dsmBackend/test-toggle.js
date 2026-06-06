import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import CategoryService from './src/services/categoryServices.js';
import categoryModel from './src/model/category.model.js';
import subCategoryModel from './src/model/subCategory.model.js';

async function test() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to DB');
  
  // Find a category that is NOT disabled and has subcategories
  let cat = await categoryModel.findOne({ disable: { $ne: true } });
  if(!cat) {
     cat = await categoryModel.findOne(); // Fallback
  }
  
  if(cat) {
    console.log('Found category to toggle:', cat.title, cat._id);
    console.log('Current disable status:', cat.disable);
    
    // Toggle using the service method
    const updatedCat = await CategoryService.toggleCategoryStatus(cat._id.toString());
    console.log('Updated category disable status:', updatedCat.disable);
    
    // Fetch subcategories
    const subs = await subCategoryModel.find({ category: cat._id });
    console.log('SubCategories for this category:');
    subs.forEach(s => {
      console.log(`- ${s.title}: disable = ${s.disable}`);
    });
    
    // Revert back so we don't mess up their DB
    await CategoryService.toggleCategoryStatus(cat._id.toString());
    console.log('Reverted category toggle.');
  } else {
    console.log('No categories found.');
  }
  
  process.exit(0);
}
test();
