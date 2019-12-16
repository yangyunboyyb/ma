import Router from './lib/CRouter'
import {write} from './write/write'

import {mongo} from './lib/CMongodb'


let router = new Router(5263)
router.listen()

// mongo.delColl('sys')

// mongo.remove('sys',{'name':'momery'})

write()