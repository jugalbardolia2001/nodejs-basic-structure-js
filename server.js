const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const cors = require('cors')
const dbconfig= require('./DbConfig/config.js')
const UserRoutes = require('./Routes/UserRoutes.js')

const port = process.env.PORT
const app = express()

app.use(express.json())
app.use(cors())
app.use('/api/v1',UserRoutes)


app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})