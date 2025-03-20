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