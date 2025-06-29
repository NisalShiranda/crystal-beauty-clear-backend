import Product from "../Models/product.js";

export async function createProduct(req,res){
    if(req.user == null){
        res.status(403).json({
            message: "You Need to Login First"
        })
        return;
        
    }

    if(req.user.role != 'admin'){
        res.status(403).json({
            message: "Unauthorized"
        })
        return;
    }

    const product  = new Product(req.body);

    // product.save().then(() => {
    //     res.json({
    //         message: "Product Added"
    //     })
    // }).catch(() => {

    //     res.status(500).json({
    //         message: "Product Not Added"
    //     })
    // })

    try{
        await product.save();
        res.json({
            message: "Product Added"
        })
    }catch(err){
        res.status(500).json({
            message: "Product Not Added"
        })
    }


}

export function getProducts(req,res){
    Product.find().then((products) => {
        res.json(products);
    }).catch(
        () => {
            res.status(500).json({
                message: "Product Not Found"
            })
        }
    )
}

export async function getProductByID(req,res){
    const productID = req.params.productID;
    const product = await Product.findOne({productID: productID});
    if(product == null){
        res.status(404).json({
            message: "Product Not Found"
        })
        return
    }
    res.json({
        product : product
    });
}
   

export function deleteProduct(req,res){
    if(req.user == null){
        res.status(403).json({
            message: "You Need to Login First"
        })
        return;
        
    }

    if(req.user.role != 'admin'){
        res.status(403).json({
            message: "Unauthorized"
        })
        return;
    }

   Product.findOneAndDelete({
       productID: req.params.productID
   }).then(() => {
       res.json({
           message: "Product Deleted"
       })
   }).catch(() => {
       res.status(500).json({
           message: "Product Not Deleted"
       })
       
   })
}

export function updateProduct(req,res){
    if(req.user == null){
        res.status(403).json({
            message: "You Need to Login First"
        })
        return;
        
    }

    if(req.user.role != 'admin'){
        res.status(403).json({
            message: "Unauthorized"
        })
        return;
    }

    Product.findOneAndUpdate({
        productID: req.params.productID
    }, req.body).then(() => {
        res.json({
            message: "Product Updated"
        })
    }).catch(() => {
        res.status(500).json({
            message: "Product Not Updated"
        })
    })
}

export async function searchProduct(req, res) {
    const search = req.query.q;

    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { altNames: { $elemMatch: { $regex: search, $options: 'i' } } }
            ]
        });

        res.json({ products });
    } catch (err) {
        res.status(500).json({ message: 'Error in Search' });
    }
}