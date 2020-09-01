const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  product_id: Number,
  product_name: String,
  quantity: Number
})

const customerSchema = new mongoose.Schema({
  customer_id: Number,
  customer_phone: String,
  ecommerce: String,
  carts: [{type: mongoose.Schema.Types.ObjectId, ref:'Product'}]
})

const storeSchema = new mongoose.Schema({
  store_id: Number,
  store_name: String,
  ecommerce: String,
  customers: [{type: mongoose.Schema.Types.ObjectId, ref:'Customer'}]
})

const Product = mongoose.model('Product', productSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Store = mongoose.model('Store', storeSchema);


module.exports = {
  Product,
  Customer,
  Store,
}