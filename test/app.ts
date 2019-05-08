import { Request } from '../main/app'
import https = require('https')

// Request.get('http://baidu.com').then(console.log)

(async () => {
    // const back_baidu = await Request.get('https://baidu.com')
    // console.log(back_baidu)
    const back = await Request.get('https://api.github.com/users/pch18', {
        debug: true,
        raw:true
    })
    console.log(back)
})()


setInterval(() => { }, 100000000)
