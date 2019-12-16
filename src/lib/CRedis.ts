import * as red from 'redis'

// 保存到数据库中的用户数据类型
interface IUserInfo {
    [nickName:string]: string
}

export default class CRedis{
    // redis客户端
    private _redis = red.createClient(6379,'10.88.0.193')

    // 获取内存使用
    async getMom() {
        return new Promise((resolve,reject) => {
            this._redis.info((err: null | Error, cb: any) => {
                if(err) {
                    console.log(err)
                    reject(err)
                }else {
                    let arr = cb.split('\r\n')
                    for(let i=0; i<arr.length; i++) {
                        if(arr[i].indexOf('used_memory:') != -1){
                            resolve(arr[i].split(':')[1])
                        }
                    }
                }
            })
        })  
    }
}

let redis = new CRedis
export {redis}