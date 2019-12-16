import * as redis from 'redis'

// 保存到数据库中的用户数据类型
interface IUserInfo {
    [nickName:string]: string
}

export class CRedis{
    // redis客户端
    private _redis: redis.RedisClient

    // 构造函数，连接redis
    constructor() {
        this._redis = redis.createClient(6379)
    }

    // 添加玩家昵称和索引userId
    private async addUserId(nickName: string,userId:string){
        return await new Promise((resolve,rejects) => {
            this._redis.hmset('allUserId',nickName,userId,(error: Error | null,result: string) => {
                if(error == null){
                    resolve(result)
                }else{
                    rejects(error)
                }
            })
        })
    }

    // 检查当前注册昵称是否存在
    public  checkNickNameIsExistence(nickName:string){
        return new Promise((resolve,reject) => {
            this._redis.hexists('allUserId',nickName,(error: Error | null,result: number) => {
                if(error == null){
                    resolve(result);
                }else{
                    reject(error);
                }
            }) 
        })
    }

    // 获取当前索引
    private async getCurrentNum(){
        return await new Promise((resolve,reject) => {
            this._redis.get('curNumId',(error: Error | null,result: string) => {
                if(error == null){
                    let curNumId = Number(result) + 1
                    //当前帐号加一并写入redis
                    this._redis.set('curNumId',curNumId.toString(),(err: Error | null,res: string) => {
                        if(err == null){
                            resolve(curNumId);
                        }else{
                            reject(err)
                        }
                    })
                }
                else{
                    reject(error)
                }
            })
        })
    }

    // 添加玩家详细信息
    async addUserInfo(nickName: string,password: string,otherInfo: string){
        // 获取当前索引
        let curNumId = Number(await this.getCurrentNum())
        return await  new Promise((resolve,rejects) => {
            this._redis.hmset('user' + curNumId,'nickName',nickName,'password',password,'otherInfo',otherInfo,async(error: Error | null,result: string) => {
                if(error == null){
                    //添加玩家昵称和索引userId
                    await this.addUserId(nickName,curNumId.toString())
                    let userInfo = {userid:curNumId,nickname:nickName,password:password}
                    this.addUserInfoCache(JSON.stringify(userInfo))
                    resolve(curNumId)
                }else{
                    rejects(error)
                }
            })
        })
    }

    // 通过昵称获取玩家userId
    async getUserId(nickName: string) {
        return new Promise((resolve,reject) => {
            this._redis.hget('allUserId',nickName,(error: Error | null,result: string) => {
                if(error == null){
                    resolve(result)
                }else{
                    reject(error)
                }
            })
        })
    }

    // 通过玩家userId获取玩家信息
    async getUserInfo(userId: string): Promise<IUserInfo>{
        return new Promise((resolve,rejects) =>{
            this._redis.hgetall('user' + userId,(error: Error | null,result: IUserInfo) => {
                if(error == null){
                    resolve(result);
                }else{
                    rejects(error);
                }
            }) 
        })
    }

    // 添加玩家信息缓存
    addUserInfoCache(userInfo: string){
        this._redis.lpush('userInfoCache', userInfo, (error) => {
            if (error != null){
                console.log('add cache successful')
            }else {
                console.log(error)
            }
        })
    }
    
    // 清理玩家缓存
    async popUserInfoCache(): Promise<string[]>{
        return new Promise((resolve,reject) => {
            this._redis.brpop('userInfoCache', 1, (error, result) => {
                if(error == null) {
                    if (result != null){
                        resolve(result)
                    }else {
                        resolve(['',''])
                    } 
                }else {
                    reject(error)
                }
            })
        })
    }
}