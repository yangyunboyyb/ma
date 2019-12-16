import os = require('os')
import cpuStat = require('cpu-stat')
import {mongo} from '../lib/CMongodb'
import {redis} from '../lib/CRedis'

// 保存在线玩家的数量
export async function saveUser() {
    let info = {
        name : 'user',
        time : new Date().getTime(),
        num : Math.ceil((Math.random() + 1) * 1000)
    }
    mongo.insertDoc('sys', info)
}

// 保存redis数据库内存使用情况
export async function saveRedis() {
    let mem = await redis.getMom()
    
    let obj = {
        name: 'redis',
        time: new Date().getTime(),
        mem: mem
    }
    mongo.insertDoc('sys', obj)
}

// 保存系统cpu的使用情况
export async function saveCpu() {
    return new Promise((resolve,reject) => {
        cpuStat.usagePercent(async (err: null | Error, percent: number) => {
            if (err) {
                reject(err)
            }else {
                let info = {
                    name : 'cpu',
                    time : new Date().getTime(),
                    per : percent
                }
                mongo.insertDoc('sys',info)
                resolve(percent)
            }
        });
    })
}

// 保存系统内存的使用情况
export async function saveMemory() {
    let info = {
        name : 'memory',
        time : new Date().getTime(),
        totalmem: os.totalmem(),
        freemem: os.freemem(),
        usemom: os.totalmem() - os.freemem()
    }
    mongo.insertDoc('sys', info)
}

// 保存系统磁盘的使用情况
export function saveDisk() {
    let info = {
        name : 'disk',
        time : new Date().getTime(),
        total : 200,
        free : 150
    }
    mongo.insertDoc('sys', info)
}