/* eslint-disable react/jsx-no-target-blank */
import React from 'react'
import Websocket from 'react-websocket'
import { Input, Button } from 'antd'

let pro_name
let self
let logData = ''
let index
class ServerDeploy extends React.Component {

    state = {
        isNullProName: true,
        url: '',
        log: ''
    }

    onTextChange() {
        pro_name = document.getElementById('ser_pro_name').value
        if (pro_name === '') {
            self.setState({
                isNullProName: true
            })
        } else {
            self.setState({
                isNullProName: false
            })
        }
    }

    async fileChange(e) {
        let files = e.target.files
        let jszip = require('jszip')()
        if (files.length === 0) {
            return
        }
        Object.keys(files).forEach(async (k) => {
            let path = files[k].webkitRelativePath
            let index = path.search('/')
            jszip.file(path.slice(index), files[k])
        })
        self.setState({ url: '压缩中...' })
        let blob = await jszip.generateAsync({ type: "blob" })
        self.setState({ url: '上传中...' })
        let data = new FormData()
        data.append('upload', blob)
        data.append('pro_name', pro_name)
        let xhr = new XMLHttpRequest()
        xhr.open("post", "http://10.88.0.193:5263/server", true)
        xhr.onload = (res) => {
            let data = JSON.parse(res.target.responseText)
            self.setState({ display: 'none' })
            if (data.success === false) {
                alert(data.msg)
            } else {   
                self.setState({ url: data.url })
            }
        }
        xhr.send(data)
    }

    deployClick() {
        let name = document.getElementById('ser_pro_name').value
        let port = document.getElementById('pro_port').value
        let cmd = document.getElementById('pro_cmd').value
        if (name === '' || port === '' || cmd === '') {
            alert('请输入完整的参数')
            return
        }
        logData = ''
        self.build(name, port, cmd)
    }

    build(name, port, cmd) {
        this.setState({ log: '构建镜像中...' })
        let xhr = new XMLHttpRequest()
        xhr.open("get", `http://10.88.0.193:5263/deploy?name=${name}&port=${port}&cmd=${cmd}&type=build&index=${index}`, true)
        xhr.onload = (res) => {
            let data = JSON.parse(res.target.responseText)
            if (data.success) {
                // this.setState({ log: '创建容器中...' })
                this.run(name, port, cmd)
            } else {
                // this.setState({ log: `${data.msg}` })
            }
        }
        xhr.send()
    }

    run(name, port, cmd) {
        let xhr = new XMLHttpRequest()
        xhr.open("get", `http://10.88.0.193:5263/deploy?name=${name}&port=${port}&cmd=${cmd}&type=run&index=${index}`, true)
        xhr.onload = (res) => {
            let data = JSON.parse(res.target.responseText)
            alert ( data.msg )
        }
        xhr.send()
    }

    recMsg(msg) {
        let data = JSON.parse(msg)
        if (typeof (data.index) == 'number') {
            index = data['index']
        }
        if (data.log) {
            logData += data['log']
            let scroll = document.getElementById('deployScroll')
            let scrollHeight = scroll.scrollHeight
            let scrollTop = scroll.scrollTop
            let clientHeight = scroll.clientHeight
            if (scrollTop === 0) {
                scrollTop = scrollHeight - clientHeight
            }
            if (scrollHeight === (scrollTop + clientHeight)) {
                this.setState({ log: logData })
                scroll.scrollTop = scroll.scrollHeight
            } else {
                this.setState({ log: logData })
            }
        }
    }

    render() {
        self = this
        return (
            <div style={{ background: '#1B262E', height: '100%', width: '100%' }}>
                <font
                    size="4"
                    style={{ color: '#dbd5df', position: 'absolute', left: '355px', top: '30px' }}
                >项目名称</font>
                <Input
                    placeholder="项目名称"
                    id="ser_pro_name"
                    autoFocus
                    onChange={this.onTextChange}
                    style={{ height: '30px', width: '80px', position: 'absolute', left: '355px', top: '60px' }}
                />
                <font
                    size="4"
                    style={{ color: '#dbd5df', position: 'absolute', left: '355px', top: '120px' }}
                >开放端口</font>
                <Input
                    placeholder="开放端口"
                    id="pro_port"
                    onChange={this.onTextChange}
                    style={{ height: '30px', width: '80px', position: 'absolute', left: '355px', top: '150px' }}
                />
                <font
                    size="4"
                    style={{ color: '#dbd5df', position: 'absolute', left: '355px', top: '220px' }}
                >启动命令  例如:(node bin/main.js && node main.js)</font>
                <Input
                    placeholder="启动命令  例如:(node bin/main.js && node main.js)"
                    id="pro_cmd"
                    onChange={this.onTextChange}
                    style={{ height: '30px', width: '400px', position: 'absolute', left: '355px', top: '250px' }}
                />
                <a href={this.state.url} target="_blank"
                    style={{
                        height: '30px', width: '300px',
                        position: 'absolute', left: '600px',
                        top: '340px',
                        color: '#dbd5df'
                    }}
                > {this.state.url}</a>
                <font
                    size="4"
                    style={{ color: '#dbd5df', position: 'absolute', left: '355px', top: '310px' }}
                >文件上传</font>
                <input type="file" webkitdirectory='true'
                    onChange={this.fileChange}
                    disabled={this.state.isNullProName}
                    id="file"
                    style={{
                        height: '30px', width: '200px', color: '#dbd5df',
                        position: 'absolute', left: '355px', top: '340px'
                    }}
                ></input>
                <Button
                    style={{ height: '30px', width: '80px', position: 'absolute', left: '355px', top: '410px' }}
                    onClick={this.deployClick}
                >部署</Button>
                <span
                    id='deployScroll'
                    style={{
                        background: '#1E1E1E',
                        height: '400px', width: '600px',
                        position: 'absolute', left: '355px', top: '480px',
                        overflowY: 'scroll',
                        whiteSpace: 'pre-line',
                        color: '#ffffff'
                    }}
                >{this.state.log}</span>
                <Websocket url='ws://10.88.0.193:5263/deploy' onMessage={this.recMsg.bind(this)} />
            </div>
        )
    }
}
export default ServerDeploy