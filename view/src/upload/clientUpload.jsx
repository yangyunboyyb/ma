/* eslint-disable react/jsx-no-target-blank */
import React from 'react';

import { Input } from 'antd';


let pro_name
let self

class ClientUpload extends React.Component {

    state = {
        isNullProName: true,
        url: '',
    }

    onTextChange() {
        pro_name = document.getElementById('pro_name').value
        if (pro_name !== '') {
            self.setState({
                isNullProName: false
            })
        } else {
            self.setState({
                isNullProName: true
            })
        }
    }

    sendFile(file) {
        let data = new FormData()
        data.append('upload', file)
        data.append('pro_name', pro_name)
        let xhr = new XMLHttpRequest()
        xhr.open("post", "http://10.88.0.193:5263/client", true)
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

    async fileChange(e) {
        let files = e.target.files
        let jszip = require('jszip')()
        if (files.length === 0) {
            return
        }
        self.setState({ url: '压缩中...' })
        for (let k in files) {
            if (/^\d+$/.test(k) === false || files[k].size === 0) {
                continue
            }
            let path = files[k].webkitRelativePath
            let index = path.search('/')
            jszip.file(path.slice(index), files[k])
        }
        let blob = await jszip.generateAsync({ type: "blob" })
        self.setState({ url: '上传中...' })
        self.sendFile(blob)
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
                    id="pro_name"
                    autoFocus
                    onChange={this.onTextChange}
                    style={{ height: '30px', width: '150px', position: 'absolute', left: '355px', top: '70px' }}
                />
                <a href={this.state.url} target="_blank"
                    style={{
                        height: '30px', width: '300px',
                        position: 'absolute', left: '600px',
                        top: '80px',
                        color: '#dbd5df'
                    }}
                > {this.state.url}</a>
                <font
                    size="4"
                    style={{ color: '#dbd5df', position: 'absolute', left: '355px', top: '130px' }}
                >文件上传</font>
                <div style={{
                    height: '29px', width: '200px', color: '#dbd5df',
                    position: 'absolute', left: '355px', top: '170px'
                }}
                >
                    <input type="file" webkitdirectory='true'
                        onChange={this.fileChange}
                        disabled={this.state.isNullProName}
                        id="file"
                    ></input>
                </div>
            </div>
        )
    }
}
export default ClientUpload