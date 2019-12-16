import mongodb = require('mongodb')
import { MongoError, MongoClient } from 'mongodb'

export default class CMongoDB {
    // mongodb
    private _db!: mongodb.Db

    connect() {
        let self = this
        return new Promise((resolve, rejects) => {
            let url = 'mongodb://10.88.0.193:27017/mongodb'
            let opt = { useNewUrlParser: true, useUnifiedTopology: true }
            if (self._db) {
                return (resolve())
            }
            // 连接mongodb
            mongodb.connect(url, opt, (error: MongoError, client: MongoClient) => {
                if (error) {
                    console.log('mongodb connection Error:' + error)
                    rejects('')
                } else {
                    console.log('Connection success!')
                }
                // 赋值
                self._db = client.db('mongodb')
                resolve('')
            })
        })
    }

    // 将文件插入表中
    async insertDoc(colName: string, doc: object) {
        await this.connect()
        return new Promise((resolve) => {
            this._db.collection(colName).insertOne(doc, (error) => {
                if (error) {
                    resolve(error)
                } else {
                    // console.log('insert: ', doc)
                    resolve()
                }
            })
        })
    }

    async remove(colName: string, opt: object) {
        await this.connect()
        this._db.collection(colName).remove(opt, (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('remove success')
            }
        })
    }

    async delColl(colName: string) {
        await this.connect()
        this._db.collection(colName).drop((error) => {
            if (error) {
                throw error
            } else {
                console.log('delete %s success', colName)
            }
        })
    }

    async find(colName: string, condition: object): Promise<object[]> {
        await this.connect()
        return new Promise((resolve, rejects) => {
            this._db.collection(colName).find(condition).toArray((err, result) => {
                if (err) {
                    rejects(err)
                    throw err
                } else {
                    resolve(result)
                }
            })
        })
    }

    async findOne(colName: string, condition: object, limit: number): Promise<object> {
        await this.connect()
        return new Promise((resolve, rejects) => {
            this._db.collection(colName).find(condition, { sort: { time: -1 }, limit: limit }).toArray((err, res) => {
                if (err) {
                    console.log(err)
                    rejects(err)
                } else {
                    resolve(res)
                }
            })
        })
    }

    async aggregate(colName: string, condition: object[]) {
        await this.connect()
        return new Promise((resolve, rejects) => {
            this._db.collection(colName).aggregate(condition).toArray((err, res) => {
                if (err) {
                    console.log(err)
                    rejects(err)
                } else {
                    resolve(res[0])
                }
            })
        })
    }
}

let mongo = new CMongoDB
export { mongo }