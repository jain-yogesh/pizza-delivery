const Order = require('../../../models/order')
const moment = require('moment')

function orderController() {
    return {
        store(req, res){

            //validate request

            const { phone, address } = req.body

            if(!phone || !address){
                req.flash('error','Phone and adress are required')
                res.redirect('/cart')
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })

            order.save().then(result => {
                Order.populate(result, { path: 'customerId'}).then(placedOrder => {

                    // req.flash('success', 'Order placed sucessfully..')
                    //clear cart
                    delete req.session.cart
                    
                    //Emit event
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', placedOrder)
                    
                    
                    // res.redirect('/customer/orders')

                    //as we are using axios
                    return res.json({message: 'Order placed sucessfully..'})
                }).catch(err => {
                    
                })

            }).catch(err => {
                req.flash('error', 'Something went wrong')
                return res.redirect('/cart')
            })
        },
        async index(req, res){
            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { 'createdAt': -1 }})
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
            res.render('customers/orders', { orders: orders, moment: moment })
        },
        async singleOrder(req, res){
            const order =  await Order.findById(req.params.id)
            
            // Authorize user to view only his/her orders
            if(req.user._id.toString() === order.customerId.toString()){

                return res.render('customers/singleOrder', { order })

            }
                return res.redirect('/')
        }
    }
}

module.exports = orderController