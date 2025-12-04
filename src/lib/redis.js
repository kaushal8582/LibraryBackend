const Redis = require("ioredis");


 const redisClient = new Redis(
"rediss://default:ARjIAAImcDJlNjg3MzkxOTQ5Mzg0MjNhYmUxMGY3ZDA1NjhhZjY5Y3AyNjM0NA@relaxing-toucan-6344.upstash.io:6379"
);


redisClient.on('connect',()=>{
  console.log("redis connected")
})
redisClient.on('error',(error)=>{
  console.log(error.message)
})


module.exports = redisClient