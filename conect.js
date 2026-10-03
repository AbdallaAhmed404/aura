const mongoose = require('mongoose');

const connect = async () => {
    try {
        const uri = 'mongodb://aurawebdevv_db_user:h4mgdD12t74gkg1s@ac-srchuvx-shard-00-00.rmjmfb9.mongodb.net:27017,ac-srchuvx-shard-00-01.rmjmfb9.mongodb.net:27017,ac-srchuvx-shard-00-02.rmjmfb9.mongodb.net:27017/?ssl=true&replicaSet=atlas-tighkl-shard-0&authSource=admin&appName=Cluster0';
        
        await mongoose.connect(uri);
        console.log('✅ MongoDB Atlas connected successfully');
    } catch (err) {
        console.error('❌ Error connecting to MongoDB Atlas:', err.message);
        process.exit(1); 
    }
    
};

module.exports = connect;