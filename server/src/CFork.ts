import child_process = require('child_process')

export default class CFork {
    private _child_proces: child_process.ChildProcess

    // 创建子进程
    constructor(modulePath: string){
        this._child_proces = child_process.fork(modulePath)
        
        // 监听子进程结束
        this._child_proces.on('close',() => {
            console.log('fork end')
        })     
    }
}
