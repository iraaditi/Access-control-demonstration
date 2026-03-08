require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
.then(()=>console.log('Succesfully connected to MongoDB!'))
.catch((err)=> console.error('Error connecting to MongoDB: ',err));

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    role:{type:String , required: true},
    permissions:{
        read:{ type: Boolean, default:false},
        write: {type: Boolean, default: false},
        readWrite:{ type: Boolean , default: false}
    }
});

const User = mongoose.model('User', userSchema);

const seedUser = async() => {
    try{
        const count = await User.countDocuments();
        if(count === 0){
            const initialUsers = [
                {
                    username:'admin1',
                    password:'123',
                    role:'admin',
                    permissions:{
                        read:true,
                        write:true,
                        readWrite:true
                    }
                },
                {
                    username:'admin2',
                    password:'123',
                    role:'admin',
                    permissions:{
                        read:true,
                        write:true,
                        readWrite:true
                    }
                },
                {
                    username:'user1',
                    password:'123',
                    role:'normal',
                    permissions:{
                        read:true,
                        write:false,
                        readWrite:false
                    }
                },
                {
                    username:'user2',
                    password:'123',
                    role:'normal',
                    permissions:{
                        read:false,
                        write:false,
                        readWrite:false
                    }
                },
                {
                    username:'user3',
                    password:'123',
                    role:'normal',
                    permissions:{
                        read:false,
                        write:true,
                        readWrite:false
                    }
                }
            ];
            await User.insertMany(initialUsers);
            console.log('Succes: 5 Users added to the database');
        }else{
            console.log('Database already has users, seed not added');
        }
    }catch(error){
        console.log('Error seeding database:', error);
    }
};
seedUser();



app.get('/',(req,res)=>{
    res.send('The server is running!');
});

app.post('/api/login',async (req,res)=>{
    const {username, password} = req.body;
    try{    
        const user = await User.findOne({username:username, password:password});

        if(!user){
            return res.status(401).json({ success: false, message: 'Invalid credentials'});
        }
        if(user.role!=='admin'){
            return res.status(403).json({ success: false, message: 'Access denied. Only Admins are allowed to sign in!'});
        }

        res.json({ success:true , message: 'Login successful'});
    }catch(error){
        res.status(500).json({ success: false, message: 'Server error'});
    }
});

app.get('/api/users', async(req,res) => {
    try{
        const users = await User.find({});
        res.json(users);
    }catch (error) {
        res.status(500).json({ message: 'Error  fetching users '});
    }
});

app.put('/api/users/:id/permissions',async(req, res) => {
    const userId = req.params.id;
    const {permissionName , isChecked} = req.body;

    try{
        const updateQuery ={};
        updateQuery[`permissions.${permissionName}`] =isChecked;

        await User.findByIdAndUpdate(userId, {$set: updateQuery});

        res.json({ success: true, message: 'Permissions updated successfullt '});
    }catch(error){
        res.status(500).json({ success: false, message: 'Error updating permissions'});
    }
});
app.listen(PORT,()=>{
    console.log(`Server is listening on http://localhost:${PORT}`);
});