import {saveCpu, saveMemory, saveUser, saveDisk, saveRedis} from '../save/sys'


export async function write() {
    while(true) {
        saveCpu()
        saveMemory()
        saveUser()
        saveDisk()
        saveRedis()
        await new Promise((resolve) => {
            setTimeout(resolve,1000)
        })
    }
}