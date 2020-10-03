const redis = require('redis');
const redisClient = redis.createClient({host:process.env.REDIS_HOST||'localhost'})
module.exports={
    LoginRoom:async (req,res,next)=>{
        const {name,server} = req.body

        console.log(`Server: ${server}`)
        redisClient.lrange('rooms',0,-1,(err,rooms)=>{
                if(err) throw err
                console.log(`Rooms :${rooms}`)
                if (rooms.filter(room=>room===server).length===0){
                    redisClient.rpush('rooms',server)
                    return res.json([])
                }
                console.log("That server exist")
        })





    },
    getRooms:async (req,res,next)=>{
        redisClient.lrange('rooms',0,-1,(err,rooms)=>{
            res.json(rooms)
        })
    
        
    }
}