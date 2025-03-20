import Order from '../Models/order.js'

export function createOrder(req,res){
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
    Order.find().sort({date : -1}).limit(1).then((lastBills)=>{
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

      
        const order = new Order(orderData);
        order.save().then(() => {
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
        }).catch(() => {
            res.status(500).json({
                message: "Orders Not Found"
            })
        })
    }

    
}