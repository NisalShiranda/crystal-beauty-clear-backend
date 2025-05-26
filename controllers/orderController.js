import Order from '../Models/order.js';
import Product from '../Models/product.js';

export async function createOrder(req,res){
    if(req.user == null){
        res.status(403).json({
            message: "You Need to Login First"
        })
        return;
    }

    const body = req.body;
    
    const orderData = {
        orderID : "",
        email : req.user.email,
        name : body.name,
        address : body.address,
        phoneNumber : body.phoneNumber,
        billItems : [],
        total : 0
    }
    
    Order.find().sort({date : -1}).limit(1).then(async (lastBills) => {
        if(lastBills.length == 0){
            orderData.orderID = "ORD0001";
        }else{
            const lastBill = lastBills[0];
            const lastOrderID = lastBill.orderID;//"ORD0061"
            const lastOrderNumber = lastOrderID.replace("ORD","");//"0061"
            const lastOrderNumberInt = parseInt(lastOrderNumber);//61
            const newOrderNumberInt = lastOrderNumberInt + 1;//62
            const newOrderNumberStr = newOrderNumberInt.toString().padStart(4,'0');//"0062"
            orderData.orderID = "ORD" + newOrderNumberStr;
        }
        

        for(let i=0; i<body.billItems.length; i++){

            const product = await Product.findOne({productID : body.billItems[i].productID});
            if(product == null){
                res.status(404).json({
                    message: "Product with ID " + body.billItems[i].productID + " Not Found"
                })
                return;
            }
            
            orderData.billItems[i] = {
                productID: product.productID,
                productName: product.name,
                image: product.images[0],
                quantity: body.billItems[i].quantity,
                price: product.price,
            };
            
            orderData.total = orderData.total + (product.price * body.billItems[i].quantity);
            
           

        }

      
        const order = new Order(orderData);
        console.log(order);
        order.save().then((res) => {
            console.log(res);
            res.json({
                message: "Order Created"
            })
        }).catch(() => {
            res.json({

                message: "Order Not Created"
            })
        })

    });
    
}

export function getOrders(req,res){
    if(req.user == null){
        res.status(403).json({
            message: "You Need to Login First"
        })
        return;
    }

    if(req.user.role == 'admin'){
        Order.find().then((orders) => {
            res.json(orders);
        }).catch(() => {
            res.status(500).json({
                message: "Orders Not Found"
            })
        })
    }else{
        Order.find({
            email: req.user.email
        }).then((orders) => {
            res.json(orders);
            console.log(orders);
        }).catch(() => {
            res.status(500).json({
                message: "Orders Not Found"
            })
        })
    }

    
}

export async function updateOrder(req,res){
    try{
        if(req.user == null){
            res.status(403).json({
                message: "You Need to Login First"
            })
            return;
        }
        if(req.user.role != 'admin'){
            res.status(403).json({
                message: "You are not allowed to update orders"
            })
            return;
        }
    
        const orderID = req.params.orderID;
        const order = await Order.findOneAndUpdate({orderID: orderID},req.body);
        res.json({
            message: "Order Updated",
            
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Order Not Updated"
        });
    }
    
}

export async function deleteOrder(req,res){
    try{
        if(req.user == null){
            res.status(403).json({
                message: "You Need to Login First"
            })
            return;
        }
        if(req.user.role != 'admin'){
            res.status(403).json({
                message: "You are not allowed to delete orders"
            })
            return;
        }

        const orderID = req.params.orderID;
        const order = await Order.findOneAndDelete({orderID: orderID}).then(() => {
            res.json({
                message: "Order Deleted"
            })
        })
    
    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Order Not Deleted"
        });
    }
}