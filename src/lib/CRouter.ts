import express = require('express')
import expressWS = require('express-ws')
import { Application } from 'express-ws'
import {sendCpu,sendDisk,sendMem,sendUser, sendRedis} from '../send/send'

export default class CRouter {
    // ExpressWS应用程序
    private _app: Application

    // 构造函数，创建服务监听
    constructor(port: number) {
        this._app = expressWS(express()).app
        this._app.listen(port,'0.0.0.0')
    }

    // 外部监听接口
    public listen() {
        this.get('/cpu',sendCpu)
        this.get('/mom',sendMem)
        this.get('/disk',sendDisk)
        this.get('/user',sendUser)
        this.get('/redis',sendRedis)
    }

    // 重新封装get请求
    get(url: string,func: Function){
        this._app.get(url,async(request,response) => {
            // 设置服务响应状态码
            response.status(200)
            // 设置允许跨域名访问
            response.append('Access-Control-Allow-Origin', "*")
            // 执行绑定的对应响应函数
            func(request,response)
        })
    }
    
    // 重新封装post请求
    private post(url: string,func: Function){
        this._app.post(url,(request,response) => {
            func(request,response);
        })
    }
}

export {CRouter as router}