const mongoose = require('mongoose');
const mongo_url = process.env.MONGODB_URL
// const mongo_url = "mongodb+srv://satyaprakashroy280:795CsznzxSaJ2St6@cluster0.zkpi7.mongodb.net/Infinder2?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(mongo_url)
    .then(() => {
        console.log("DataBase connected.........");
    }).catch((err) => {
        console.log("MongoDb Conaction error", err.message);
    })  