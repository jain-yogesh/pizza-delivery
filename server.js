require('dotenv').config()
const express = require("express")
const ejs = require("ejs")
const expressLayout = require("express-ejs-layouts")
const path = require("path")
const mongoose = require('mongoose')
const expressSession = require('express-session')
const flash = require('express-flash')
const { collection } = require('./app/models/menu')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')
const { createServer } = require('http')
const Emitter = require('events')


const app = express()
const PORT = process.env.PORT || 3300

const httpServer = createServer(app)

//Database Connection

mongoose.connect(process.env.MONGO_CONNECTION_URL,{useNewUrlParser: true, useUnifiedTopology: true});

// Handle connection events
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
connection.once('open', () => {
    console.log('Connected to MongoDB');
});


// Session Store
let mongoStore = new MongoDbStore({
                    client: connection.getClient(),
                    collection: 'sessions'
                })


// Event Emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)


//Session config
app.use(expressSession({
    // name: 'example.sid',
    secret : process.env.COOKIE_SECRET,
    // httpOnly: true,
    // secure: true,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
    // cookie: { maxAge: 1000 * 15 } // 15 seconds
}))


//Passport config for Login functionality
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Global Middleare
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})


//set template engine
app.use(expressLayout)
app.set('views', path.join(__dirname,'/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)
app.use((req, res) => {
    //res.status(404).send('<h1>404, Page not found!!</h1>')
    res.status(404).render('errors/404')
})

httpServer.listen(PORT, () => {
                    console.log(`Listeneing on port ${PORT}`)
                })


//Socket 
const io = require('socket.io')(httpServer)
io.on('connection', (socket) => {
    //Join

    //console.log(socket.id)

    socket.on('join', (orderId) =>
    {
        //console.log(orderId)
        socket.join(orderId)
    })

})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)

})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})