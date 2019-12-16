import mysql = require('mysql')

export default class CMysql {
    // mysql客户端
    private _connection: mysql.Connection

    // 构造函数，连接数据库
    constructor (user: string, password: string, database: string) {
        this._connection = mysql.createConnection({user:user,password:password,database:database})
        this._connection.connect((error: mysql.MysqlError) => {
            if (error == null) {
                console.log('Mysql has been connected') 
            }else {
                console.log(error)
            }
        })
    }

    // 封装SQL访问
    private query(sql: string, func: Function) {
        this._connection.query(sql, (error: mysql.MysqlError, results, fields) => {
            func(error,results,fields)
        }) 
    }

    // 添加玩家信息回调
    private addUserInfoCallBack(error: mysql.MysqlError){
        if (error == null) {
            console.log('add user info to mysql successed')
        }else{
            console.log(error)
        }
    }

    // 添加玩家详细信息
    public addUserInfo(obj: {userid: number, nickname: string,password: string}) {
        let sql = 'insert into player (userid,nickname,password)'
        sql += ' values (' + obj.userid + ',\'' + obj.nickname + '\',\'' + obj.password + '\');'
        console.log('SQL:' + sql)
        this.query(sql,this.addUserInfoCallBack)
    }

    // 发送心跳
    public sendHeart(){
        this.query(';', () => {})
    }
}