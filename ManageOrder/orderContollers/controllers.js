require('dotenv').config();
const CustomError = require('../../error/CustomError');
const Order = require('../../Model/OrdarModel');
const User = require('../../Model/UserModal');
const excelJS = require('exceljs');
const Product = require('../../Model/productModel');
const Wallet = require('../../Model/walletModel');

const orderPlace = async (req, res, next) => {
    try {
        const userId = req.user.id
        const filename = req.file.filename;
        let OrderFile = `${process.env.IMGURL}orderFile/${filename}`;
        const { id, products, totalAmount } = req.body;
        if (!products || !totalAmount) {
            throw new CustomError("All fields are required!", 400);
        }
        const userData = await User.findOne({
            _id: userId
        })
        const lastOrder = await Order.findOne({}, {}, { sort: { order_id: -1 } });
        const newOrderId = lastOrder ? lastOrder.order_id + 1 : 1;
        console.log(lastOrder);
        let orderData
        if (userData) {
            orderData = await Order.findOne({
                _id: id
            })
            if (orderData) {
                if (Array.isArray(products) && products.length > 0) {
                    orderData.products.push(...products);
                } else {
                    throw new CustomError("Invalid products format. Must be a non-empty array.", 400);
                }
                const productPromises = products.map(async (product) => {
                    const p = await Product.findOne({
                        _id: product.productId
                    });
                    if (!p) {
                        throw new CustomError(`Product with ID ${product.productId} not found!`, 404);
                    }
                });
                await Promise.all(productPromises);
                orderData.status = "placed";
                return res.status(201).json({
                    success: true,
                    message: "Order updated successfully",
                });
            } else {
                const productPromises = products.map(async (product) => {
                    const p = await Product.findOne({
                        _id: product.productId
                    });
                    if (!p) {
                        throw new CustomError(`Product with ID ${product.productId} not found!`, 404);
                    }
                });
                await Promise.all(productPromises);
                orderData = new Order({
                    order_id: newOrderId,
                    customerId: userId,
                    customerName: req.body.OrderName || userData.name,
                    customerEmail: userData.email,
                    shippingAddress: userData.address,
                    customerPhone: userData.whatsAppNo,
                    products: products,
                    status: "placed",
                    totalAmount: totalAmount,
                    productPdf: OrderFile,
                })
            }
            const updateUserWalletAmount = await Wallet.findOneAndUpdate({
                userId: userId,
            })
            const newAmount = await updateUserWalletAmount.balance - totalAmount
            if (newAmount < 0) {
                throw new CustomError("Insufficient balance in wallet", 400)
            }
            const updateWallet = await Wallet.updateOne({
                userId: userId,
            }, {
                $set: {
                    balance: newAmount
                }
            })
            await orderData.save();
            res.status(201).json({
                success: true,
                message: "Order placed successfully",
            })
        } else {
            throw new CustomError("User not found!", 404);
        }
    } catch (error) {
        console.error("Error retrieving when a products order:", error.message);
        next(error);
    }
}

const getMyOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (userId) {
            const orderData = await Order.find({ customerId: userId }).populate('orderDate').sort({
                orderDate: -1
            });
            return res.status(200).json({
                success: true,
                message: "Order retrieved successfully",
                orderData: orderData
            });
        } else {
            throw new CustomError("You are not able to perfome this orpation!", 403);
        }
    } catch (error) {
        console.error("Error retrieving geting user Order:", error.message);
        next(error)
    }
}

const getAllOrder = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        if (isAdmin == 1) {
            const orderData = await Order.find().populate('orderDate').sort({
                orderDate: -1
            });
            res.status(200).json({
                success: true,
                message: "Orders retrieved successfully",
                orderData: orderData
            });
        } else {
            throw new CustomError("You are not able to perfome this orpation!", 403)
        }
    } catch (error) {
        console.error("Error retrieving geting all order by admin:", error.message);
        next(error)
    }
}

const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId, orderStatus } = req.body
        if (!orderId || !orderStatus) {
            throw new CustomError("Please provide order id and order status", 400)
        }
        const isAdmin = req.user;
        if (isAdmin) {
            const orderData = await Order.findOne({
                _id: orderId
            });
            if (orderData) {
                orderData.status = orderStatus;
                await orderData.save();
                res.status(200).json({
                    success: true,
                    message: "Order status updated successfully",
                    orderData: orderData
                });
            } else {
                throw new CustomError("Order not found", 404)
            }
        } else {
            throw new CustomError("You are not able to perfome this orpation!", 403)
        }
    } catch (error) {
        console.error("Error retrieving updating order status:", error.message);
        next(error)
    }
}

const getMyOrderDaitle = async (req, res, next) => {
    try {

        const userId = req.user.id;
        const { _id } = req.body
        if (!userId) {
            throw new CustomError("You are not login", 400)
        } else {
            const orderDetails = await Order.findOne({
                customerId: userId,
                _id: _id
            });
            if (orderDetails) {
                res.status(200).json({
                    success: true,
                    message: "Order Daitels getting........",
                    orderDetails: orderDetails
                })
            } else {
                throw new CustomError("Order not found", 404)
            }
        }
    } catch (error) {
        console.error("Error retrieving user order daitles:", error.message);
        next(error)
    }
}


const getAllOrderInExcel = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        if (isAdmin) {
            const workbook = new excelJS.Workbook();
            const worksheet = workbook.addWorksheet("All Order Sheet");
            worksheet.columns = [
                { header: "S. No", key: "s_no", width: 10 },
                { header: "Customer Name", key: "customerName", width: 25 },
                { header: "Customer Email", key: "customerEmail", width: 30 },
                { header: "Shipping Address", key: "shippingAddress", width: 40 },
                { header: "Customer Phone", key: "customerPhone", width: 15 },
                { header: "Products", key: "products", width: 50 },
                { header: "Total Amount", key: "totalAmount", width: 15 },
                { header: "Product PDF", key: "productPdf", width: 20 },
                { header: "Status", key: "status", width: 15 },
                { header: "Order Date", key: "orderDate", width: 20 },
                { header: "Updated At", key: "updatedAt", width: 20 }
            ];
            let counter = 1;
            const orders = await Order.find().populate('orderDate').sort({
                orderDate: -1
            });
            orders.forEach(order => {
                const productDetails = order.products.map(product =>
                    `${product.productName} (Qty: ${product.quantity}, Price: ${product.price})`
                ).join("; ");

                worksheet.addRow({
                    s_no: counter,
                    customerName: order.customerName,
                    customerEmail: order.customerEmail,
                    shippingAddress: order.shippingAddress,
                    customerPhone: order.customerPhone,
                    products: productDetails,
                    totalAmount: order.totalAmount,
                    productPdf: order.productPdf,
                    status: order.status,
                    orderDate: order.orderDate,
                    updatedAt: order.updatedAt
                });
                counter++;
            })
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            });
            res.setHeader(
                "content-type",
                "application/vnd.openxmlformates-officedocument.spreadsheatml.sheet"
            )
            res.setHeader("content-Disposition", `attachment;filename=Orders.xlsx`);

            return workbook.xlsx.write(res).then(() => {
                res.status(200);
            })
        }
        else {
            throw new CustomError("You are not able to access", 404)
        }
    } catch (error) {
        console.log("Error retrieving all order in excel:", error.message);
        next(error)
    }
}

const orderCancel = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orderId = req.body._id;
        const isOrder = await Order.findOne({
            _id: orderId,
            userId: userId
        })
        if (isOrder) {
            if (isOrder.status == "proceed" || isOrder.status == "completed") {
                throw new CustomError("You can't cancel this order", 400)
            } else {
                const updateOrder = await Order.findOneAndUpdate({
                    _id: orderId
                }, {
                    $set: {
                        status: "cancelled",
                        updatedAt: new Date()
                    }
                });
                const updateWalletAmount = await Wallet.findOne({
                    userId: userId
                })
                const amount = updateWalletAmount.balance + isOrder.totalAmount
                Wallet.findOneAndUpdate({
                    userId: userId
                }, {
                    $set: {
                        balance: amount
                    }
                })
            }
            res.status(200).json({
                message: "Order cancelled successfully",
                data: updateOrder
            })
        } else {
            throw new CustomError("You are not able to access", 404)
        }
    } catch (error) {
        console.log("Error cancelling order:", error.message);
        next(error)

    }
}

module.exports = {
    orderPlace,
    getMyOrder,
    getAllOrder,
    updateOrderStatus,
    getMyOrderDaitle,
    getAllOrderInExcel,
    orderCancel
}