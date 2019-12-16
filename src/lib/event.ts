import *as _  from "./utils";

const KEY_IF = Symbol('IF')
const KEY_PRI = Symbol('PRI')
const KEY_TIMES = Symbol('TIMES')

let _intervalChannel = `__on__`
let defaultSrvType = ''
let _events:{[p:string]:CEvent} = {}
let _channelRouter:{[channel:string]:string[]} = {}

export function EventClass(target: Function) 
export function EventClass(thisChannel?:string, routerKV?:{[k:string]:string|number}) 
export function EventClass(...args){
    if (_.isFunction(args[0])){
        InitEvents(args[0])
    }else{
        return function(target: Function) {
            InitEvents(target, ...args)
        }
    }
}

export function InitEvents(target:Object, thisChannel?:string, routerKV?:{[k:string]:string|number}) {
    if (!target) return
    thisChannel = thisChannel||target['$_channel_']
    if (typeof thisChannel!=='string') thisChannel=''
    let routerStr = ''
    if (thisChannel && routerKV) {
        _channelRouter[thisChannel] = _.keys(routerKV)
        routerStr = _.map(routerKV, (v, k)=>`${k}_${v}`).join('-')
    }
    // let kLen = key.length
    let regExp =  /\$(?!ui_)(\S*)_/
    // let keys:string[] = _.zip(Object.getOwnPropertyNames(obj).filter(v=>regExp.test(v)), _.getMethodNames(obj, regExp))
    let keys:string[] = _.getMethodNames(target, regExp)
    for(let k of keys) {
        // let key = k.slice(1, k.indexOf('_'))
        let kLen = k.indexOf('_')
        let ek = k.slice(1, kLen)
        let [, key='', prefix=''] = ek.match(/(\S*)(Rpc|Api)$/)||[,ek]
        if (!key || key==='on') key = 'event'
        let eventObj = Events.get(key)
        let func =  target[k];
        if (!_.isFunction(func)) {
            console.warn(`Event handler must be function  ---> ${k}`);
            continue;
        }
        let kk = k.slice(kLen+1)
        let channel:string, event:string, suffix:string
        let kks = kk.split('__')
        if (kks.length>1) {
            [channel, event, suffix] = kks.map(v=>_.parseEscape(v))
        }else{
            [channel, event, suffix] = kk.split('_').map(v=>_.parseEscape(v))
        }
        if (thisChannel) {
            if (!channel || channel==='this') channel = thisChannel
            if (channel===thisChannel && routerStr) {
                channel = `${thisChannel}:${routerStr}`
            }
        }
        if (channel==='on') {
            channel = _intervalChannel
            eventObj.subscribe([target, func, event?channel?0:-1:channel?1:2], channel, event)
            // eventObj.on(event, func.bind(target))
        }else{
            if (prefix === 'Rpc' || prefix==='Api') {
                eventObj.setApi(channel, event, target, func)
            }else{
                eventObj.subscribe([target, func, event?channel?0:-1:channel?1:2], channel, event, undefined, 0, undefined,  prefix)
            }                 
        }
    }
}

export function RemoveEvents(target:Object){
    _.each(_events, (event)=>{
        event.removeByTarget(target)
    })
}

// export function attachEvents(target:Object) {
//     for(let k in _events) {
//         _events[k].attach(target)
//     }
// }

export type ISubscribe = {[prop:string]:any} | Function | [Object, Function]
// export interface ISubscribe {
//     PRI?:string
//     obj:{[prop:string]:any} | Function | [Object, Function]
// }
export interface ISubscribeInfo {
    srvType:string
    channel:string
    event:string
    target:any
    [prop:string]:any
}
export interface ISetApiInfo {
    srvType:string
    channel:string
    api:string
    target:any,
    func:Function
    [prop:string]:any
}

export interface IEventRet {
    err?:string
    break?:boolean
    r?:any
}

export interface IApiRet extends IEventRet{
}

// interface ISubscribeData{
//     0:ISubscribe
//     1?:number|string
// }

export function EventRet(result?:any, isBreak?:boolean, err?:string):IEventRet {
    let ret:IEventRet = {}
    if (result) ret.r = ret
    if(isBreak) ret.break = isBreak
    if(err) ret.err = err
    return ret
}

export class CEvent {
    protected _subscribers:{[key:string]:ISubscribe[]} = {};
    protected _apis:{[key:string]:[Object|null, (...args: any)=>any][]} = {};
    private _apiQueue:any[][] = []
    
    protected _key = 'event'
    get key() {return this._key}
    set key(v) {this._key = v}
    private onstructor(key='event') {
        this._key = key
    }
    static newEvent(key?:string) {
        if (!key||key==='on') key = 'event'
        if (_events[key]) return _events[key]
        let e = new CEvent()
        e._key = key
        _events[key] = e
        return e
    }
    has(key:string) {
        if (!key||key==='on') key = 'event'
        return !!_events[key]
    }
    get(key:string) {
        return CEvent.newEvent(key)
    }
    del(key:string) {
        return CEvent.deleteEvent(key)
    }
    static deleteEvent(key:string) {
        if (_events[key]) {
            delete _events[key]
        }
    }

    get srvType() {return defaultSrvType}
    set srvType(v) {defaultSrvType = v}

    reset() {
        this._subscribers = {}
        this._apis = {}
    }


    protected getSubscriber(channel='', event=''):ISubscribe[] {
        if (event) {
            return _.zip(this._subscribers[channel], this._subscribers[`${channel}.${event}`], this._subscribers[`${''}.${event}`], this._subscribers[''])            
        }else{
            return _.zip(this._subscribers[channel], this._subscribers[''])
        }
    }

    protected getApi(cmd:string) {
        let apiData = this._apis[cmd]
        if (apiData && apiData.length>0) return _.rand(apiData)
        return null
        // return this._subscribers[channel];
    }
    setApi(channel:string, api:string, apiTarget:Object|null=null, apiFunc?:(...args: any)=>any) {
        let srvType = this.srvType
        let channelST = channel
        if (srvType && channel !==_intervalChannel) {
            if (!channel || channel.slice(0, 6)==='global') {
                channelST = channel = channel.slice(6)
                srvType = ''
            }else{
                channelST = `${srvType}:${channel}`
                // srvType = `${srvType}:`
            }
        }
        let cmd = channelST?`${channelST}.${api}`:api
        if (apiFunc) {
            if (!this._apis[cmd]) this._apis[cmd] = []
            // if (getter) console.warn(`Event getter cannot duplicate  ---> ${cmd}`);
            this._apis[cmd].push([apiTarget, apiFunc])
        }else{
            let getter = this._apis[cmd]
            if (getter) {
                for(let i= getter.length-1; i--; i>=0) {
                    if (getter[i][0]===apiTarget && (!apiFunc||getter[i][1]===apiFunc)){
                        getter.splice(i, 1)
                    }
                }
            }
        }
        let aniInfo = {
            srvType:srvType,
            key:this.key,
            channel:channel, 
            api:api, 
            target:apiTarget, 
            func:apiFunc
        }
        this.emit('setApi', aniInfo)
        Events.emit('setApi', aniInfo)
        for(let i=this._apiQueue.length-1; i>=0; i--) {
            let [resolve, ch, a, st, ...args] = this._apiQueue[i]
            if (this.hasApi(ch, a, st)) {
                this._apiQueue.splice(i, 1)
                this.apiAsync(ch, a, st, ...args).then(resolve)
            }
        }
        // return this._subscribers[channel];
    }

    subscribe (obj:ISubscribe, channel='', event='', srvType?:string, times=0, condition?:Function,  PRI?:number|string) {
        // let srvType = this.srvType
        if (channel==='on') channel = _intervalChannel        
        if (srvType===undefined) srvType = this.srvType
        let channelST = channel
        if (srvType && channel !==_intervalChannel) {
            if (!channel || channel.slice(0, 6)==='global') {
                channelST = channel = channel.slice(6)
                srvType = ''
            }else{
                channelST = `${srvType}:${channel}`
                // srvType = `${srvType}:`
            }
        }
        let key = event?`${channelST}.${event}` : channelST
        let subscribers = this._subscribers[key]
        if (!subscribers) subscribers = this._subscribers[key] = [];
        condition && (obj[KEY_IF] = condition)
        PRI && (obj[KEY_PRI] = PRI)
        times && (obj[KEY_TIMES] = times)
        if (_.arrayUniquePush(subscribers, obj)) {
            subscribers.sort((sa:ISubscribe, sb:ISubscribe)=>{
                let a = sa[KEY_PRI]||0, b= sb[KEY_PRI]||0
                let c = a==b ? 0 : a-b
                if (isNaN(c)) {
                    if (!a) c = -1
                    else if (!b) c = 1
                    else  c = a.toString()>b.toString()?1:-1
                }
                // console.log(_.logger('INFO'), a, b, c)
                return c
            })
        }
        if (channel !==_intervalChannel) {
            let info = {
                srvType:srvType,
                key:this.key,
                channel:channel, 
                event:event, 
                target:obj
            }
            this.emit('subscribe', info)
            Events.emit('subscribe', info)
        }
    }
    unsubscribe (obj:ISubscribe, channel='', event='', srvType?:string) {
        // let srvType = this.srvType
        if (srvType===undefined) srvType = this.srvType
        let channelST = channel
        if (srvType && channel !==_intervalChannel) {
            if (channel.slice(0, 6)==='global') {
                channelST = channel = channel.slice(6)
                srvType = ''
            }else{
                channelST = `${srvType}:${channel}`
                // srvType = `${srvType}:`
            }
        }
        let key = event?`${channelST}.${event}` : channelST
        let subscribers = this._subscribers[key]
        if (subscribers) _.arrayDel(subscribers, obj);
        obj[KEY_IF] && delete obj[KEY_IF]
        obj[KEY_PRI] && delete obj[KEY_PRI]
        obj[KEY_TIMES] && delete obj[KEY_TIMES]
        if (channel !==_intervalChannel) {
            this.emit('unsubscribe', {
                srvType:srvType,
                channel:channel, 
                event:event, 
                target:obj
            })
        }
    }
    addListener(obj:ISubscribe, channel='', event='', srvType?:string, times=0, condition?:Function, PRI?:number|string){
        return this.subscribe(obj, channel, event, srvType, times, condition, PRI)
    }
    removeListener(obj:ISubscribe, channel='', event='', srvType?:string){
        return this.unsubscribe(obj, channel, event, srvType)
    }

    // 删除所有关联制定目标的事件监听
    removeByTarget(target:Object) {
        _.each(this._apis, (apis:[Object|null, (...args: any)=>any][], k:string)=>{
            for(let i=apis.length-1; i>=0; i--) {
                if (!apis[i] || apis[i][0]===target) {
                    apis.splice(i, 1)
                }
            }
            if (apis.length===0) {
                delete this._apis[k]
            }
        })
        _.each(this._subscribers, (subs:ISubscribe[], k:string)=>{
            for(let i=subs.length-1; i>=0; i--) {
                if (!subs || subs[i][0]===target || subs[0]===target) {
                    subs.splice(i, 1)
                }
            }
            if (subs.length===0) {
                delete this._subscribers[k]
            }
        })
    }

    private get _intervalChannel() {return `_on_${this._key}_`}

    emit(event:string, data?, ...args:any[]) {
        this.publish(_intervalChannel, event, '', data, ...args)
    }

    on(event:string, cb:(data?, ...args:any[])=>void, times=0, condition?:Function) {
        let channel = _intervalChannel
        this.subscribe(cb, channel, event, undefined, times, condition)
        return cb;
    }
    off(event:string, onCallRet:Function) {
        this.unsubscribe(onCallRet, _intervalChannel, event)
    }
    once(event:string, cb:(data?, ...args:any[])=>void, condition?:Function) {
        return this.on(event, cb, 1, condition)
    }

    async wait(channel:string, event:string, srvType?:string, condition?:Function) {
        return await new Promise(async (resolve, reject)=>{
            this.subscribe(resolve, channel, event, srvType, 1, condition)
        })
    }

    attach (obj:Object, thisChannel?:string, routerKV?:{[k:string]:string|number}, eventkey?:string) {
        if (!obj) return
        if (!eventkey && this._key === 'event') {
            this.attach(obj, thisChannel, routerKV, 'on' )
        }
        thisChannel = thisChannel||obj['$_channel_']
        if (typeof thisChannel!=='string') thisChannel=''
        let routerStr = ''
        if (thisChannel && routerKV) {
            _channelRouter[thisChannel] = _.keys(routerKV)
            routerStr = _.map(routerKV, (v, k)=>`${k}_${v}`).join('-')
        }
        let key = typeof eventkey==='string' ? `$${eventkey}`:`$${this._key}`
        let kLen = key.length
        // console.log(_.logger('INFO'), Object.getOwnPropertyNames(Object.getPrototypeOf(obj)))
        // console.log(_.logger('INFO'), _.keys(obj))
        // console.log(_.logger('INFO'), _.getMethodNames(obj))
        // console.log(_.logger('INFO'), Object.getOwnPropertyNames(obj))
        let regExp =   new RegExp(`^(\\${key})`)
        // let keys:string[] = _.zip(Object.getOwnPropertyNames(obj).filter(v=>regExp.test(v)), _.getMethodNames(obj, regExp))
        let keys:string[] = _.getMethodNames(obj, regExp)
        for(let k of keys) {
            if (k.slice(0, kLen)===key) {
                let func =  obj[k];
                if (!_.isFunction(func)) {
                    console.warn(`Event handler must be function  ---> ${k}`);
                    continue;
                }
                let kk = k.slice(kLen)
                let prefix:string, channel:string, event:string, suffix:string
                let kks = kk.split('__')
                if (kks.length>1) {
                    event = _.parseEscape(kks[1])
                    let s = kks[0].indexOf('_')
                    if (s>=0) {
                        prefix = _.parseEscape(kks[0].slice(0, s))
                        channel = _.parseEscape(kks[0].slice(s+1))                        
                    }else{
                        prefix = _.parseEscape(kks[0])
                        channel = ''
                    }
                    suffix = _.parseEscape(kks[2] || '')
                }else{
                    [prefix, channel, event, suffix] = kk.split('_').map(v=>_.parseEscape(v))
                }
                if (thisChannel) {
                    if (!channel || channel==='this') channel = thisChannel
                    if (channel===thisChannel && routerStr) {
                        channel = `${thisChannel}:${routerStr}`
                    }
                }
                if (channel==='on') {
                    channel = _intervalChannel
                    this.subscribe([obj, func, event?channel?0:-1:channel?1:2], channel, event)
                    // this.on(event, func.bind(obj))
                }else{
                    if (prefix === 'Rpc' || prefix==='Api') {
                        this.setApi(channel, event, obj, func)
                    }else{
                        this.subscribe([obj, func, event?channel?0:-1:channel?1:2], channel, event, undefined, 0, undefined, prefix)
                    }                 
                }
            }
        }
    }
    unattach (obj:Object) {
        if (!obj) return
        for(let k in this._subscribers) {
            let a = this._subscribers[k]
            for(let i=a.length-1; i>=0; i--) {
                let o = a[i]
                if (o===obj || o[0]===obj) {
                    a.splice(i, 1)
                }
            }
        }
        for(let k in this._apis) {
            let [o] = this._apis[k]
            if (o===obj) delete this._apis[k]
        }
    }

    private _callSub(obj:any, func: Function, args: any[], resultCB?:(err: any, result: any, obj: any)=>void):IEventRet|Promise<IEventRet>|undefined{
        // let func = obj[funcName]
        if (_.isFunction(func)) {
            let r = func.apply(obj, args)
            if (!r) return r = EventRet()
            if (r && !r.break) {
                if (resultCB) resultCB(r.err, r.r, obj)
            }
            return r
        }
    }

    private _getPubChannel(channel:string, srvType?:string) {
        if (srvType===undefined) {
            return `${this.srvType}:${channel}`
        }else if (srvType==='global' || srvType==='') {
            return channel
        }else{
            return `${srvType}:${channel}`
        }
    }

    // publish(channel:string, event='', data?: string, isCustomerOnce = false, resultCB?:(err: any, result: any, obj: any)=>void) {
    publish(channel:string, event='', srvType?:string, data?, ...args:any[]):(IEventRet|Promise<IEventRet>)[] {
        let pubChannel = this._getPubChannel(channel, srvType)
        let subscribers = this.getSubscriber(pubChannel, event);
        let routerChannel = ''
        if (_channelRouter[channel] && args.length) {
            routerChannel = `${channel}:${_channelRouter[channel].map((k)=>`${k}_${this._getArgsKV(k, args)}`).join('-')}`
        }
        routerChannel&&this.getSubscriber(this._getPubChannel(routerChannel, srvType), event).forEach(v=>_.arrayUniquePush(subscribers, v));
        if (srvType!=='' && srvType) {
            this.getSubscriber(this._getPubChannel(channel, ''), event).forEach(v=>_.arrayUniquePush(subscribers, v));
            routerChannel&&this.getSubscriber(this._getPubChannel(routerChannel, ''), event).forEach(v=>_.arrayUniquePush(subscribers, v));
        }else if (srvType==='' && this.srvType){
            this.getSubscriber(this._getPubChannel(channel), event).forEach(v=>_.arrayUniquePush(subscribers, v));
            routerChannel&&this.getSubscriber(this._getPubChannel(routerChannel), event).forEach(v=>_.arrayUniquePush(subscribers, v));
        }
        let ret:any[] = []
        if (!subscribers.length) return ret;
        let key = `$${this._key}`
        for(let subscriber of subscribers){
            if (!subscriber) {
                console.error(`error publice(${pubChannel}, ${event}): subscriber is undefined!`)
            }else {
                let condition = subscriber[KEY_IF]
                if (typeof condition==='function' && !condition.call(_.isArray(subscriber)?subscriber[0]:null, data, ...args)) {
                    continue
                }
                let times = subscriber[KEY_TIMES]
                if (times) {
                    times--
                    if (times<=0) {
                        delete subscriber[KEY_TIMES]
                        this.unsubscribe(subscriber, channel, event, srvType)
                    }else{
                        subscriber[KEY_TIMES] = times
                    }
                }
                if (_.isFunction(subscriber)) {
                    // console.log(_.logger('INFO'), 'subscriber func', channel, subscriber)
                    // let r = subscriber(channel, event, data, ...args)
                    let r:any = this._callSub(null, <Function>subscriber, [data, ...args])
                    if (r) {
                        ret.push(r)
                        if(r.break) return ret;
                    }
                }else if (_.isArray(subscriber) && _.isFunction(subscriber[1])) {
                    let a = [data, ...args];
                    if (subscriber[2]>0) a.unshift(event);
                    if (subscriber[2]<0 || subscriber[2]>1) a.unshift(pubChannel);
                    let r:any = this._callSub(subscriber[0], subscriber[1], a)
                    if (r) {
                        ret.push(r)
                        if(r.break) return ret;
                    }
                }else{
                    let func = subscriber[key]
                    if (_.isFunction(func)) {
                        let r:any = this._callSub(subscriber, func, [pubChannel, event, data, ...args])
                        if (r) {
                            ret.push(r)
                            if(r.break) return ret;
                        }
                    }
                    func = subscriber[`${key}_${pubChannel}`]
                    if (_.isFunction(func)) {
                        let r:any = this._callSub(subscriber, func, [event, data, ...args])
                        if (r) {
                            ret.push(r)
                            if(r.break) return ret;
                        }
                    }
                    func = subscriber[`${key}_${pubChannel}_${event}`]
                    if (_.isFunction(func)) {
                        let r:any = this._callSub(subscriber, func, [data, ...args])
                        if (r) {
                            ret.push(r)
                            if(r.break) return ret;
                        }
                    }
                }
            }
        }
        return ret;
    }
    dispatch(channel:string, event='', srvType?:string, data?, ...args:any[]) {
        return this.publish(channel, event, srvType, data, ...args)
    }


    private async _callSubAsync(obj:any, func: Function, args: any[], resultCB?:(err: any, result: any, obj: any)=>void):Promise<IEventRet|Promise<IEventRet>|undefined>{
        // let func = obj[funcName]
        if (_.isFunction(func)) {
            let r = await func.apply(obj, args)
            if (!r) return r = EventRet()
            if (r && !r.break) {
                if (resultCB) resultCB(r.err, r.r, obj)
            }
            return r
        }
    }

    // publish(channel:string, event='', data?: string, isCustomerOnce = false, resultCB?:(err: any, result: any, obj: any)=>void) {
    async publishAsync(channel:string, event='', srvType?:string, data?, ...args:any[]):Promise<(IEventRet|Promise<IEventRet>)[]> {
        let pubChannel = this._getPubChannel(channel, srvType)
        let subscribers = this.getSubscriber(pubChannel, event);
        let routerChannel = ''
        if (_channelRouter[channel] && args.length) {
            routerChannel = `${channel}:${_channelRouter[channel].map((k)=>`${k}_${this._getArgsKV(k, args)}`).join('-')}`
        }
        routerChannel&&this.getSubscriber(this._getPubChannel(routerChannel, srvType), event).forEach(v=>_.arrayUniquePush(subscribers, v));
        if (srvType!=='' && srvType) {
            this.getSubscriber(this._getPubChannel(channel, ''), event).forEach(v=>_.arrayUniquePush(subscribers, v));
            routerChannel&&this.getSubscriber(this._getPubChannel(routerChannel, ''), event).forEach(v=>_.arrayUniquePush(subscribers, v));
        }else if (srvType==='' && this.srvType){
            this.getSubscriber(this._getPubChannel(channel), event).forEach(v=>_.arrayUniquePush(subscribers, v));
            routerChannel&&this.getSubscriber(this._getPubChannel(routerChannel), event).forEach(v=>_.arrayUniquePush(subscribers, v));
        }
        let ret:any[] = []
        let retPromise:Promise<any>[] = []
        if (!subscribers.length) return ret;
        let key = `$${this._key}`
        for(let subscriber of subscribers){
            if (!subscriber) {
                console.error(`error publice(${pubChannel}, ${event}): subscriber is undefined!`)
            }else {
                let times = subscriber[KEY_TIMES]
                if (times) {
                    times--
                    if (times<=0) {
                        delete subscriber[KEY_TIMES]
                        this.unsubscribe(subscriber, channel, event, srvType)
                    }else{
                        subscriber[KEY_TIMES] = times
                    }
                }
                if (_.isFunction(subscriber)) {
                    // console.log(_.logger('INFO'), 'subscriber func', channel, subscriber)
                    // let r = subscriber(channel, event, data, ...args)
                    let r:any = this._callSubAsync(null, <Function>subscriber, [data, ...args])
                    retPromise.push(r)
                    // if (r) {
                    //     ret.push(r)
                    //     if(r.break) return ret;
                    // }
                }else if (_.isArray(subscriber) && _.isFunction(subscriber[1])) {
                    let a = [data, ...args];
                    if (subscriber[2]>0) a.unshift(event);
                    if (subscriber[2]<0 || subscriber[2]>1) a.unshift(pubChannel);
                    let r:any = this._callSubAsync(subscriber[0], subscriber[1], a)
                    retPromise.push(r)
                    // if (r) {
                    //     ret.push(r)
                    //     if(r.break) return ret;
                    // }
                }else{
                    let func = subscriber[key]
                    if (_.isFunction(func)) {
                        let r:any = this._callSubAsync(subscriber, func, [pubChannel, event, data, ...args])
                        retPromise.push(r)
                        // if (r) {
                        //     ret.push(r)
                        //     if(r.break) return ret;
                        // }
                    }
                    func = subscriber[`${key}_${pubChannel}`]
                    if (_.isFunction(func)) {
                        let r:any = this._callSubAsync(subscriber, func, [event, data, ...args])
                        retPromise.push(r)
                        // if (r) {
                        //     ret.push(r)
                        //     if(r.break) return ret;
                        // }
                    }
                    func = subscriber[`${key}_${pubChannel}_${event}`]
                    if (_.isFunction(func)) {
                        let r:any = this._callSubAsync(subscriber, func, [data, ...args])
                        retPromise.push(r)
                        // if (r) {
                        //     ret.push(r)
                        //     if(r.break) return ret;
                        // }
                    }
                }
            }
        }
        ret = await Promise.all(retPromise)
        return ret;
    }
    async dispatchAsync(channel:string, event='', srvType?:string, data?, ...args:any[]) {
        return await this.publish(channel, event, srvType, data, ...args)
    }

    private _hasApi(channel:string, cmd:string, srvType?:string) {
        let api = this.getApiName(channel, cmd, srvType)
        let apiData = this._apis[api]
        return (apiData && apiData.length>0)
    }

    hasApi(channel:string, cmd:string, srvType?:string) {
        if (srvType!=='') {
            if (this._hasApi(channel, cmd, '')) return true
        }else if (srvType==='' && this.srvType){
            if (this._hasApi(channel, cmd)) return true
        }
        return this._hasApi(channel, cmd, srvType)
    }
    hasRpc(api:string) {
        return !!this.getApi(api)
    }

    getApiName(channel:string, cmd:string, srvType?:string) {
        let pubChannel = this._getPubChannel(channel, srvType)
        let api = pubChannel?`${pubChannel}.${cmd}`:cmd
        return api
    }

    private _api (channel:string, cmd:string, srvType?:string, ...args: any[]):IApiRet {
        let api = this.getApiName(channel, cmd, srvType)
        let apiData = this.getApi(api)
        if (apiData) {
            return {r:apiData[1].bind(apiData[0])(...args)}
        }else{
            console.error(`Event api not find  ---> ${api}`)
            return {err:'no api'}
        }
    }

    api (channel:string, cmd:string, srvType?:string, ...args: any[]):IApiRet {
        if (srvType===undefined) srvType = this.srvType
        if (_channelRouter[channel] && args.length) {
            let routerChannel = `${channel}:${_channelRouter[channel].map((k)=>`${k}_${this._getArgsKV(k, args)}`).join('-')}`
            if (this._hasApi(routerChannel, cmd, '')) {
                return this._api(routerChannel, cmd, '', ...args)
            }else if (srvType==='' && this.srvType && this._hasApi(routerChannel, cmd)){
                return this._api(routerChannel, cmd, this.srvType, ...args)
            }else if (this._hasApi(routerChannel, cmd, srvType)) {
                return this._api(routerChannel, cmd, srvType, ...args)
            }
        }
        if (srvType && this._hasApi(channel, cmd, '')){
            return this._api(channel, cmd, '', ...args)
        }else if (srvType==='' && this.srvType && this._hasApi(channel, cmd)){
            return this._api(channel, cmd, this.srvType, ...args)
        }
        return this._api(channel, cmd, srvType, ...args)
    }

    private async _apiAsync (channel:string, cmd:string, srvType?:string, ...args: any[]):Promise<IApiRet> {
        try{
            let api = this.getApiName(channel, cmd, srvType)
            let apiData = this.getApi(this.getApiName(channel, cmd, srvType))
            if (apiData) {
                return {r:await apiData[1].bind(apiData[0])(...args)}
            }else{
                console.error(`Event api not find  ---> ${api}`)
                return {err:'no api'}
            }
        }catch(e){
            console.error(e)            
            return {err:e}
        }
    }

    private _getArgsKV(k:string, args:any[]) {
        for(let a of args) {
            if (a && a[k]!==undefined) {
                return a[k]
            }
        }
        return '';
    }

    async apiAsync (channel:string, cmd:string, srvType?:string, ...args: any[]):Promise<IApiRet> {
        if (srvType===undefined) srvType = this.srvType
        if (_channelRouter[channel] && args.length) {
            let routerChannel = `${channel}:${_channelRouter[channel].map((k)=>`${k}_${this._getArgsKV(k, args)}`).join('-')}`
            if (this._hasApi(routerChannel, cmd, '')) {
                return await this._apiAsync(routerChannel, cmd, '', ...args)
            }else if (srvType==='' && this.srvType && this._hasApi(routerChannel, cmd)){
                return await this._apiAsync(routerChannel, cmd, this.srvType, ...args)
            }else if (this._hasApi(routerChannel, cmd, srvType)) {
                return await this._apiAsync(routerChannel, cmd, srvType, ...args)
            }
        }
        if (srvType && this._hasApi(channel, cmd, '')){
            return await this._apiAsync(channel, cmd, '', ...args)
        }else if (srvType==='' && this.srvType && this._hasApi(channel, cmd)){
            return await this._apiAsync(channel, cmd, this.srvType, ...args)
        }
        return await this._apiAsync(channel, cmd, srvType, ...args)
    }

    rpc (api:string, ...args:any[]):IApiRet {
        let apiData = this.getApi(api)
        if (apiData) {
            return {r:apiData[1].bind(apiData[0])(...args)}
        }else{
            console.error(`Event rpc not find  ---> ${api}`)
            return {err:'no rpc'}
        }
    }
    async rpcAsync (api:string, ...args: any[]):Promise<IApiRet> {
        try{
            let apiData = this.getApi(api)
            if (apiData) {
                return {r:await apiData[1].bind(apiData[0])(...args)}
            }else{
                console.error(`Event rpc not find  ---> ${api}`)
                return {err:'no rpc'}
            }
        }catch(e){
            console.error(e)
            return {err:e}
        }
    }

    // rpcMQ 如果找不到调用的方法，会把指令保存到队列，直到有方法执行
    async apiMQ (channel:string, api:string, srvType?:string, ...args:any[]):Promise<IApiRet> {
        if (this.hasApi(channel, api, )) {
            return await this.apiAsync(channel, api, srvType, ...args)
        }else{
            return await new Promise((resolve)=>{
                this._apiQueue.push([resolve, channel, api, srvType, ...args])
            })
        }
    }

    define_listen(channel: string | undefined, event: string, priority=0) {
        return (target:Object,propertyKey:string,descriptor:TypedPropertyDescriptor<any>)=>{
            this.subscribe([target, descriptor.value, event?channel?0:-1:channel?1:2], channel, event, undefined, 0, undefined, priority)
            return descriptor;
        }
    }
    get define_listener() {
        return (target:Object,propertyKey:string,descriptor:TypedPropertyDescriptor<any>)=>{
            let [priority , channel, event] = propertyKey.split('_')
            this.subscribe([target, descriptor.value, event?channel?0:-1:channel?1:2], channel, event, undefined, 0, undefined, priority)
            return descriptor;
        }
    }

    get define_rpc() {
        return (target:Object,propertyKey:string,descriptor:TypedPropertyDescriptor<any>)=>{
            let [, channel, event] = propertyKey.split('_')
            this.setApi(channel, event, target, descriptor.value)
            return descriptor;
        }
    }
}

export var Events = CEvent.newEvent()

