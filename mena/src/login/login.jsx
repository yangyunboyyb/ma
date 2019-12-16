import cookie from 'react-cookies'

export function isLogin() {
    if (getUserInfo() === false) {
        login()
    }
}

export function login() {
    let token = window.location.href.split('/#')
    if (token[1]) {
        let url = 'http://10.88.0.181/gitlab/api/v4/user?' + token[1]

        let xhr = new XMLHttpRequest()
        xhr.open("get", url, true)
        xhr.onload = (res) => {
            let data = JSON.parse(res.target.responseText)
            cookie.save('name', data.name, { path: '/' })
            cookie.save('username', data.username, { path: '/' })
            cookie.save('avatar_url', data.avatar_url, { path: '/' })
            window.location.href = 'http://10.88.0.193:7563/client/'
        }
        xhr.send()
    } else {
        thirdLogin()
    }
}

function thirdLogin() {
    let id = 'client_id=abf8f61a4e7cc737b801cb6c5e0f101da781ff2d3b023ae98c4d715cc72d083d'
    let uri = 'redirect_uri=http://10.88.0.193:7563/client/'
    let type = 'response_type=token'
    let url = `http://10.88.0.181/gitlab/oauth/authorize?${id}&${uri}&${type}`
    window.location.href = url
}

export function getUserInfo() {
    let name = cookie.load('name')
    let username = cookie.load('username')
    let avatar_url = cookie.load('avatar_url')
    if (name && username && avatar_url) {
        return { name: name, username: username, avatar_url: avatar_url }
    } else {
        return false
    }
}

