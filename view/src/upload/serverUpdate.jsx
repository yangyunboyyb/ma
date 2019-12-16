/* eslint-disable react/jsx-no-target-blank */
import React from 'react'

import { Input, Button } from 'antd'


let pro_name
let self

class ServerDeploy extends React.Component {

    state = {
        isNullProName: true,
        url: '',
    }

    onTextChange() {
        pro_name = document.getElementById('su_pro_name').value
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
        self.setState({ url: '文件压缩中...' })
        let blob = await jszip.generateAsync({ type: "blob" })
        self.setState({ url: '文件上传中...' })
        let data = new FormData()
        data.append('upload', blob)
        data.append('pro_name', pro_name)
        let xhr = new XMLHttpRequest()
        xhr.open("post", "http://10.88.0.193:5263/server", true)
        xhr.onload = (res) => {
            let data = JSON.parse(res.target.responseText)
            if (data.success === false) {
                alert(data.msg)
            } else {
                self.setState({ url: data.url })
            }
        }
        xhr.send(data)
    }

    restart(name) {
        let xhr = new XMLHttpRequest()
        xhr.open("get", `http://10.88.0.193:5263/restart?name=${name}`, true)
        xhr.onload = (res) => {
            let data = JSON.parse(res.target.responseText)
            alert(data.msg)
        }
        xhr.send()
    }

    stop(name) {
        let xhr = new XMLHttpRequest()
        xhr.open("get", `http://10.88.0.193:5263/stop?name=${name}`, true)
        xhr.onload = (res) => {
            let data = JSON.parse(res.target.responseText)
            alert(data.msg)
        }
        xhr.send()
    }

    restartClick() {
        let name = document.getElementById('su_pro_name').value
        if (name === '') {
            alert('请输入项目名')
            return
        }
        self.restart(name)
    }

    stopClick() {
        let name = document.getElementById('su_pro_name').value
        if (name === '') {
            alert('请输入项目名')
            return
        }
        self.stop(name)
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
                    id="su_pro_name"
                    autoFocus
                    onChange={this.onTextChange}
                    style={{ height: '30px', width: '80px', position: 'absolute', left: '355px', top: '60px' }}
                />
                <font
                    size="4"
                    style={{ color: '#dbd5df', position: 'absolute', left: '355px', top: '120px' }}
                >文件上传</font>
                <a href={this.state.url} target="_blank"
                    style={{
                        height: '30px', width: '300px',
                        position: 'absolute', left: '600px',
                        top: '150px',
                        color: '#dbd5df'
                    }}
                > {this.state.url}</a>
                <input type="file" webkitdirectory='true'
                    onChange={this.fileChange}
                    disabled={this.state.isNullProName}
                    id="file"
                    style={{
                        height: '30px', width: '200px', color: '#dbd5df',
                        position: 'absolute', left: '355px', top: '150px'
                    }}
                ></input>
                <Button
                    style={{ height: '30px', width: '80px', position: 'absolute', left: '355px', top: '210px' }}
                    onClick={this.restartClick}
                >重启</Button>
                <Button
                    style={{ height: '30px', width: '80px', position: 'absolute', left: '355px', top: '270px' }}
                    onClick={this.stopClick}
                >停止</Button>
            </div>
        )
    }
}

export default ServerDeploy