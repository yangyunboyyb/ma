import http from 'http'

export function httpRes(url,param={}) {
    let paramStr = '?'
    for (let k in param) {
        paramStr += k + '=' + param[k] + '&'
    }
    paramStr = paramStr.substring(0,paramStr.length-1)
    url = "http://10.88.0.193:5264/" + url + paramStr
    let chunck_temp = ''
    return new Promise((resolve) => {
      http.get(url, (res) => {
        res.setEncoding('utf8')
        res.on('data', (chunck) => {
          try{
            let arr = JSON.parse(chunck)
            resolve(arr)
          } catch {
            // 返回字符串过长处理
            chunck_temp += chunck
            try{
              let arr = JSON.parse(chunck_temp)
              resolve(arr)
            }catch {}
          }     
        })
      })
    })
}

export function getdata() {
    
}