

import express = require('express')
import expressWS = require('express-ws')
import * as WebSocket from 'ws'
import {CRedis} from '../build/CRedis' 



// 已连接客户端存储数据类型
interface IWSClient {
    webSocket:WebSocket, 
    nickName:string
}

// 最近连接的webSocket
let CurWebSocket: WebSocket

// 客户端发送类型
interface IClientSendData {
    msg:string,
    type:string
    color:string
    cmd:string
    nickName:string
}

// 
let that: CWSRouter

export default class CWSRouter {
    // ExpressWS应用程序
    private _app:expressWS.Application
    // 存储已连接客户端
    private _clients: Array<IWSClient> = [] 
    //当前验证码
    private _VerificationCode:number = 0
    //redis对象
    private _redis = new CRedis()

    // 构造函数，创建服务监听
    constructor(port: number) {
        this._app = expressWS(express()).app
        this._app.listen(port,'0.0.0.0')
        that = this
    }

    // 外部监听接口
    public listen() {
        this.lintenClientConnect()
        this.get('/login',this.loginCallBack)
        this.get('/register',this.registerCallBack)
        this.get('/getCode',this.getCodeCallBack)
        this.get('/client',this.clientCallBack)
    }
    
    // 接受客户端连接
    private lintenClientConnect() {
        let me = this
        // 新的客户端连接
        this._app.ws('/', (webSocket:WebSocket) => {
            console.log("client connect to server successful!")
            CurWebSocket = webSocket
            // 处理客户端发送的信息
            webSocket.on('message', (data: string) => {
                console.log("receive:", data)   
                me.receiveCmd(JSON.parse(data),webSocket)
            })

            // 处理错误
            webSocket.on('error',(error: Error) => {
                console.log(error)
            })

            // 客户端断开连接
            webSocket.on("close", (msg: string) => {
                console.log("client is closed")
                // 将断开连接的客户端socket删除
                for(var index = 0; index < me._clients.length; index++){
                    if(me._clients[index]['webSocket'] == webSocket){
                        me._clients.splice(index, 1)
                    }
                }
                // 发送在线user
                this.sendAllOnLineUser(webSocket)
            });
        });
    }

    // 重新封装get请求
    private get(url: string,func: Function){
        this._app.get(url,async(request,response) => {
            // 设置服务响应状态码
            response.status(200)
            // 设置允许跨域名访问
            response.append('Access-Control-Allow-Origin', "*")
            // 执行绑定的对应响应函数
            let returnString = await func(request,response)
            // 发送客户端文件不需要执行end
            if (func.name == 'clientCallBack' || func.name == ""){
                return
            }
            if(typeof returnString == 'string'){
                response.end(returnString)
            }else{
                response.end('Return type error')
            }
        })
    }
    
    // 重新封装post请求
    private post(url: string,func: Function){
        this._app.post(url,(request,response) => {
            func(request,response);
        })
    }

    // 登录处理
    private async loginCallBack (request: express.Request,response: Response): Promise<string> {
        // url昵称参数
        let nickName = request.query.nickName
        // url密码参数
        let password = request.query.password
        if(nickName == undefined || password == undefined){
            return "User name or password cannot be empty"
        }else if(nickName == '' || password == ''){
            return "User name or password cannot be empty"
        }else if(await that._redis.checkNickNameIsExistence(nickName) == 0){
            return "User name does not exist"
        }else{
            // 通过昵称获取玩家索引
            let id = Number(await that._redis.getUserId(nickName)).toString()
            // 通过玩家索引获取玩家信息
            let userInfo = await that._redis.getUserInfo(id)
            console.log(userInfo)
            if(userInfo['password'] == password){
                return "Login was successful"
            }else{
                return "Password error"
            }
        }
    }

    // 注册处理
    private async registerCallBack(request: express.Request,response: Response) {
        // url 昵称参数
        let nickname = request.query.nickname
        // url 密码参数
        let password = request.query.password
        // url 验证码参数
        let verCode = request.query.VerificationCode
        if(nickname == undefined || password == undefined){
            return "Nickname or password cannot be empty"
        }else if(password == '' || password == ''){
            return "Nickname or password cannot be empty"
        }else if(Number(verCode) != Number(that._VerificationCode)){
            return "VerificationCode error"
        }else if(await that._redis.checkNickNameIsExistence(nickname) != 0){
            return "User name has exist"
        }
        else{
            // 将注册的玩家信息写入redis
            await that._redis.addUserInfo(nickname,password,'null')
            return "Register was successful"
        }
    }
    
    //获取验证码处理
    private  getCodeCallBack(request: Request,response: Response){
        console.log('getCode')
        // 随机数字赋值给验证码
        that._VerificationCode = Math.floor(Math.random() * 10000)
        return that._VerificationCode.toString()
    }
    
    // 发送注册客户端文件
    private clientCallBack(request: express.Request,response: express.Response){
        // response.sendFile("/Server/view/register.htm")
        let document = request.query.document
        response.sendFile("C:/Users/Administrator/Desktop/login/view/" + document)
    }

    // 发送所有在线的user
    private sendAllOnLineUser(webSocket: WebSocket){
        let allUserNickname = '<option>all</option>'
        // 将所有在线的User的昵称拼接
        for(let i=0; i<this._clients.length; i++){
            allUserNickname += '<option>' + this._clients[i]['nickName'] + '</option>'
        }
        let data = {'cmd':'select','allUserNickname':allUserNickname}
        this.sendMessageToAllUser(JSON.stringify(data),webSocket)
    }

    // 玩家登录处理
    private login(nickName: string,webSocket: WebSocket){    
        this._clients.push({webSocket: webSocket, nickName: nickName})
        this.sendAllOnLineUser(webSocket)
    }

    // 发送消息给所有人
    private sendMessageToAllUser(message: string,webSocket: WebSocket){
        // 发送消息给所有人
        for(let i=0; i < this._clients.length; i++){
            this._clients[i]['webSocket'].send(message)
        }
    }

    // 通过昵称发送消息
    private sendMessageToPersonal(data: string,nickName: string,webSocket: WebSocket){
        for(let i=0; i < this._clients.length; i++){
            if(this._clients[i]['nickName'] == nickName){
                this._clients[i]['webSocket'].send(data)
            }    
        }
    }

    // 转发来自客户端的消息
    private sendMsg(data: IClientSendData,webSocket: WebSocket){
        let dataTocli = {'cmd':'recive','msg':data.msg,'color':data.color,'nickName':data.nickName}
        if (data.type == 'all'){
            this.sendMessageToAllUser(JSON.stringify(dataTocli),webSocket)
        }else {
            this.sendMessageToPersonal(JSON.stringify(dataTocli),data.type,webSocket)
        }
    }

    // 处理接收到的信息
    private receiveCmd(data: IClientSendData,webSocket: WebSocket){
        if (data.cmd == 'login'){
            this.login(data.nickName,webSocket)
        }else if(data.cmd == 'sendMsg'){
            this.sendMsg(data,webSocket)
        }
    }

    // 获取当前最后连接客户端socket
    public getCurWebSocket() {
        return CurWebSocket
    }
}