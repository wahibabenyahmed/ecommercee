const express =require('express');
const Connection  = require('./config/dbConnect');
const userRoutes = require('./routes/authRoute');
const app = express();
const cors=require('cors');
const PORT= 5000;

app.use(express.json())// ya9ra format json 

app.use(cors({
origin:["http://localhost:3000"],
method:["GET","POST"],
crendentials:true

}
))

app.use('/api',userRoutes)



Connection()

app.listen(PORT,(err)=>{
    err? console.error(err):console.log(`server running with success in:${PORT}`)
    
    })