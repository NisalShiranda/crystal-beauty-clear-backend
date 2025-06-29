import express from 'express';
import { createProduct, deleteProduct, getProductByID, getProducts, searchProduct, updateProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/", createProduct);
productRouter.get("/", getProducts);
productRouter.get('/search', searchProduct);
productRouter.delete("/:productID", deleteProduct);
productRouter.put("/:productID", updateProduct);
productRouter.get('/:productID', getProductByID);


export default productRouter;