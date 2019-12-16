import CMysql from "./CMysql";
import {CRedis} from "./CRedis";


let mysql = new CMysql('root','123','mysql')
let redis = new CRedis()

async function dataMigrate() {
    while(true){
        // 获取redis数据缓存
        let userInfo = await redis.popUserInfoCache()
        // console.log('userInfo:' + userInfo[1])
        // 判断redis返回是否为空
        if(userInfo[1] == ''){
            mysql.sendHeart()
            continue
        }
        // 将数据写入Mysql
        if(userInfo != null){
            mysql.addUserInfo(JSON.parse(userInfo[1]))
        }
        // 设置延时函
        // await new Promise((resolve,reject) => {
        //     setTimeout(resolve,1000)
        // })
    } 
}
dataMigrate()