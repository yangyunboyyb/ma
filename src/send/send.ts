import { Response, Request } from "express"
import { mongo } from '../lib/CMongodb'


export async function sendCpu(req: Request, res: Response) {
    let num = req.query.num
    let range = req.query.range
    let arr: number[][] = []
    if (num == 'all') {
        let obj = await mongo.find('sys', { name: 'cpu' })
        arr = average(obj, 'per', Number(range))
    } else if (num) {
        let obj: any = await mongo.findOne('sys', { name: 'cpu' }, Number(num))
        for (let i = obj.length - 1; i >= 0; i--) {
            let ar = [Number(obj[i].time), Number(obj[i].per)]
            arr.push(ar)
        }
    }
    res.end(JSON.stringify(arr))
}

function average(obj: any, flag: string, mul: number): number[][] {
    let tep = Number(obj[0].time)
    var arv = [0, 0]
    let arr: number[][] = []
    mul *= 1000
    for (let i = 0; i < obj.length; i++) {
        obj[i][flag] = Math.ceil(Number(obj[i][flag]))
        if (Number(obj[i]['time']) > tep + mul) {
            arr.push([arv[0], arv[1]])

            tep = Number(obj[i].time)
            arv[0] = Number(obj[i].time)
            arv[1] = Number(obj[i][flag])
        } else {
            arv[0] = (arv[0] + Number(obj[i].time)) / 2
            arv[1] = (arv[1] + Number(obj[i][flag])) / 2
        }
    }
    return arr
}

export async function sendRedis(req: Request, res: Response) {
    let num = req.query.num
    let range = req.query.range
    let arr: number[][] = []
    if (num == 'all') {
        let obj = await mongo.find('sys', { name: 'redis' })
        arr = average(obj, 'mem', Number(range))
    } else if (num) {
        let obj: any = await mongo.findOne('sys', { name: 'redis' }, Number(num))
        for (let i = obj.length - 1; i >= 0; i--) {
            let ar = [Number(obj[i].time), Number(obj[i].mem)]
            arr.push(ar)
        }
    }
    res.end(JSON.stringify(arr))
}

export async function sendMem(req: Request, res: Response) {
    let num = req.query.num
    let range = req.query.range
    let arr: number[][] = []
    if (num == 'all') {
        let obj = await mongo.find('sys', { name: 'memory' })
        arr = average(obj, 'usemom', range)
    } else if (num) {
        let obj: any = await mongo.findOne('sys', { name: 'memory' }, Number(num))
        for (let i = obj.length - 1; i >= 0; i--) {
            let ar = [Number(obj[i].time), Number(obj[i].usemom)]
            arr.push(ar)
        }
    }
    res.end(JSON.stringify(arr))
}

export async function sendDisk(req: Request, res: Response) {
    let obj: any = await mongo.find('sys', { name: 'disk' })
    let arr: number[][] = []
    for (let i = 0; i < obj.length; i++) {
        let ar: number[] = []
        ar.push(Number(obj[i].time))
        ar.push(Number(obj[i].mem))
        arr.push(ar)
    }
    res.end(JSON.stringify(arr))
}

export async function sendUser(req: Request, res: Response) {
    let num = req.query.num
    let range = req.query.range
    let arr: number[][] = []
    if (num == 'all') {
        let obj = await mongo.find('sys', { name: 'user' })
        arr = average(obj, 'num', Number(range))
    } else if (num) {
        let obj: any = await mongo.findOne('sys', { name: 'user' }, Number(num))
        for (let i = obj.length - 1; i >= 0; i--) {
            let ar = [Number(obj[i].time), Number(obj[i].num)]
            arr.push(ar)
        }
    }
    res.end(JSON.stringify(arr))
}