
import WSRouter from './CWSRouter'
import http = require('http')
import CFork from './CFork';

let wsRouter = new WSRouter(8081)
wsRouter.listen()
// let fork = new CFork("dataMigrate.js")
/**
 * 测试的注释
 */