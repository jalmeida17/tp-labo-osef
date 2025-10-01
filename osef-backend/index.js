require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
require('./config/database') // This will test the connection automatically
const userRoute = require('./routes/user_route')
const authenticationRoute = require('./routes/authentication_route')
const eventRoute = require('./routes/event_route')

//
app.use(express.json())
app.use(cors())
app.use('/users', userRoute)
app.use('/auth', authenticationRoute)
app.use('/events', eventRoute)
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});