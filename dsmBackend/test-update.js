import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import categoryModel from './src/model/category.model.js';
import subCategoryModel from './src/model/subCategory.model.js';

async function test() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to DB');
  
  const subcats = await subCategoryModel.find({ category: { $ne: null } }).populate('category');
  let validSub = null;
  for(let sub of subcats) {
    if(sub.category && sub.category._id) {
      validSub = sub;
      break;
    }
  }
  
  if(validSub) {
    const catId = validSub.category._id;
    console.log('Found valid subcat:', validSub.title, 'with Category ID:', catId);
    
    const idMatch = { $in: [catId, new mongoose.Types.ObjectId(catId), catId.toString()] };
    const res = await subCategoryModel.updateMany({ category: idMatch }, { $set: { disable: true } });
    console.log('Update result for this category id:', res);
  } else {
    console.log('No valid subcategories found.');
  }
  process.exit(0);
}
test();
