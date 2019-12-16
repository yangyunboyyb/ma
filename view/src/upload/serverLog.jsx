/* eslint-disable react/jsx-no-target-blank */
import React from 'react'
import Websocket from 'react-websocket'
import { Input, Button } from 'antd'
const { Search } = Input

let index
let logData
class ServerLog extends React.Component {

    state = {
        log: '',
        logData: ''
    }

    onSearch = (value) => {
        if (value === '') {
            return
        }
        let xhr = new XMLHttpRequest()
        logData = ''
        this.setState({ log: logData })
        xhr.open("get", `http://10.88.0.193:5263/search/?name=${value}&index=${index}`, true)
        xhr.onload = (res) => {
            let data = res.target.responseText
            if (data !== '') {
                data = 'no logs'
            }
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
            let scroll = document.getElementById('scroll')
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

    clearOnClick = () => {
        logData = ''
        this.setState({ log: logData })
    }

    render() {
        return (
            <div style={{ background: '#1B262E', height: '100%', width: '100%' }}>
                <Search
                    placeholder="项目名称"
                    autoFocus
                    onSearch={this.onSearch}
                    style={{ height: '30px', width: '180px', position: 'absolute', left: '80px', top: '30px' }}
                />
                <div style={{ height: '30px', width: '180px', position: 'absolute', left: '400px', top: '30px' }} >
                    <Button type="dashed" onClick={this.clearOnClick} ghost>清除</Button>
                    {/* <Button type="dashed"  ghost>最近10条</Button> */}
                </div>
                <span
                    id='scroll'
                    style={{
                        background: '#1E1E1E',
                        height: '80%', width: '90%',
                        position: 'absolute', left: '80px', top: '90px',
                        overflowY: 'scroll',
                        whiteSpace: 'pre-line',
                        color: '#ffffff'
                    }}
                >{this.state.log}</span>
                <Websocket url='ws://10.88.0.193:5263/log' onMessage={this.recMsg.bind(this)} />
            </div>
        )
    }
}
export default ServerLog