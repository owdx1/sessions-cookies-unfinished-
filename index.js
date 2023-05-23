const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const ioredis = require('ioredis');
const connectRedis = require('connect-redis');

const app = express();
dotenv.config();

const RedisStore = connectRedis.default;

const redis = new ioredis();

app.use(express.json());

app.use(
    session({
        name: "sessid",
        store: new RedisStore({
            client: redis,
            disableTouch: true
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production"
        },
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

app.post('/login' ,async (req , res) =>{
    try {
        const {username , password} = req.body;

        if(!(username === 'admin' && password === "123")) {
            return res.status(400).send('Invalid credentials');
        }

        const user = {
            username,
            favorite: "strawberry"
        }

        req.session.user = user;

        return res.status(200).json(user);
    } catch (error) {
        console.error(error.message);
    }
})


app.get('/logout' , (req ,res) =>{

try {
    req.session.destroy((err) =>{
        if(err){
            console.log(err);
            return res.send(false)
        }
    res.clearCookie("sessid")
    return res.send(true);
        
    })
    
} catch (error) {
    console.error(error.message); 
}


})

app.listen(5000, () =>{
    console.log("listening on port 5000");
})
