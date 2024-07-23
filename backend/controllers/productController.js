const productModal = require('../models/productModal')
const firmModal = require('../models/firmModal');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      
      cb(null, Date.now() + path.extname(file.originalname))
    }
  })
  
  const upload = multer({ storage: storage })

/* This one is to add the product by firm id by req.params.firmId */
const addProduct = async (req, res) =>{
    try {
        const {Productname, price, category, description, BestSeller} = req.body;
        const image = req.file ? req.file.filename : undefined;

        const firmId = req.params.firmId
        const firmData = await firmModal.findById(firmId);

        if(!firmData){
            return res.status(404).json({meaasge : "firm not found"})
        }

        const product = new productModal({
            Productname,
            price,
            category,
            description,
            BestSeller,
            image,
            firm : firmData._id
        })

        const savedProduct = await product.save();
        firmData.product.push(savedProduct);

        await firmData.save()
        res.status(200).json({message : "Product Added "})
    } catch (error) {
        console.log(error);
        return res.status(500).json({meaasge : "Internal server error"})
    }
}


/*This one is to get the all the products of that firm */
const getProductsByFirm = async (req, res) =>{
    try {
        const firmId = req.params.firmId
        const firmData =  await firmModal.findById(firmId);
        if(!firmData){
            return res.status(500).json({message: "FirmData not found"})
        }
        const resturentName = firmData.firmName;
        const products = await productModal.find({firm : firmId})
        res.status(200).json({resturentName, products})
    } catch (error) {
        console.log(error);
        return res.status(404).json({message : "Internal server error"})
    }
}


const deleteProductById = async (req, res) =>{
    try {
        const productId = req.params.productId;
        // Find and delete the product
        const deletedProduct = await productModal.findByIdAndDelete(productId)
        if(!deleteProductById){
            return res.status(404).json({message : "No product found"})
        }
         // Find the firm associated with the deleted product
        const firmData = await firmModal.findById(deletedProduct.firm)
        if(!firmData){
            return res.status(404).json({message : "No product found"})
        }

        // Remove the product ID from the firm's product array
        firmData.product = firmData.product.filter(prodId => !prodId.equals(productId));

        // Save the updated firm document
        await firmData.save();
        return res.status(200).json({message : "Product Deleted"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : "Internal Server Error"})
    }
}

module.exports = {addProduct: [upload.single('image'), addProduct], getProductsByFirm, deleteProductById}