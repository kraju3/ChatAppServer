require('dotenv').config()

const app = require('express')();
const redis = require('redis');
const bodyParser = require('body-parser')
const redisClient = redis.createClient({host:process.env.REDIS_HOST||'localhost'});
const cors = require('cors')
const {LoginRoom,getRooms} =require('./lib/roomMw');

app.use(cors());
app.use(bodyParser.json());
const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
});

const io = require('socket.io').listen(server);

app.post('/server/login',LoginRoom)
app.get('/',(req,res,next)=>{
    res.send("Chatter App Server is running")
})

io.on('connection',(socket)=>{

    socket.on('client-message',(data)=>{
        redisClient.get(socket.id.toString(),(err,reply)=>{
            if(err) throw err

            console.log(socket.id)
            const newInfo = JSON.parse(reply)
            console.log(newInfo)
            socket.broadcast.to(newInfo.server).emit('chat-message',data)
            redisClient.rpush(newInfo.server,JSON.stringify(data))
        })
        
        
        
    });

    socket.on('disconnect',()=>{
        redisClient.del(socket.id.toString())
        
    });


    socket.on('join',({name,server})=>{
        console.log(socket.id)
        redisClient.set(socket.id.toString(),JSON.stringify({name,server}))

        socket.emit('message',{message:`Welcome to the chat ${name}`,from:'Server'})

        socket.broadcast.to(server).emit('chat-message',{message:`Welcome to the chat ${name}`,from:'Server'})

        socket.join(server)

        ;
    })
})