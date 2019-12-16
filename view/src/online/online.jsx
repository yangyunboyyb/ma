

import { Button } from 'antd'
import Highcharts from 'highcharts'
import React from 'react'
import http from 'http'


let self

export default class Online extends React.Component {
    handleClick(e) {
        if (e === 's') {
            this.shader(e, true)
        }else {
            this.shader(e, false)
        } 
    }

    getRenderData(data, isChange) {
        return new Promise(async (resolve) => {
            resolve({
                chart: {
                    type: 'spline',
                    marginRight: 10,
                    backgroundColor: '#1B262E',
                    events: {
                        load: function () {
                            Highcharts.setOptions({ global: { timezoneOffset: -8 * 60 } })
                            var series = this.series[0]
                            setInterval(async () => {
                                if (isChange) {
                                    let data = await self.getdata('s')
                                    if (!series.data) { return }
                                    series.addPoint(data[29], true, true)
                                }
                            }, 1000);
                        }
                    }
                },
                title: {
                    text: "在线人数",
                    style: {
                        color: '#dbd5df',      //字体颜色
                        "fontSize": "34px",   //字体大小
                        fontWeight: 'bold'
                    }
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 150,
                    lineColor: '#6f6f6f'
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    // tickPositions: [0, 10, 20, 30, 40, 50, 100],
                    gridLineColor: '#6f6f6f',
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + '</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2);
                    }
                },
                legend: {
                    enabled: false,
                },
                series: [{
                    name: 'user',
                    data: data
                }],
                colors: ['#2b908f'],
                credits: { //去掉版权logo
                    enabled: false
                }
            })
        })
    }

    getdata(range) {
        let url = "http://10.88.0.193:5264/user?range=" + range
        return new Promise((resolve) => {
            http.get(url, (res) => {
                res.setEncoding('utf8')
                res.on('data', (chunck) => {
                    let arr = JSON.parse(chunck)
                    resolve(arr)
                })
            })
        })
    }

    async shader(range, isChange) {
        let data = await this.getdata(range)
        let Data = await this.getRenderData(data, isChange)
        Highcharts.chart(this.refs.user, Data)
    }

    async componentDidMount() {
        self = this
        this.shader('s', true)
    }

    render() {
        return (
            <div>
                <Button type="dashed" onClick={this.handleClick.bind(this, 's')} ghost>实时</Button>
                <Button type="dashed" onClick={this.handleClick.bind(this, 'm')} ghost>分</Button>
                <Button type="dashed" onClick={this.handleClick.bind(this, 'h')} ghost>时</Button>
                <Button type="dashed" onClick={this.handleClick.bind(this, 'd')} ghost>天</Button>
                <Button type="dashed" onClick={this.handleClick.bind(this, 'w')} ghost>周</Button>
                <Button type="dashed" onClick={this.handleClick.bind(this, 'month')} ghost>月</Button>
                < div ref="user" />
            </div>
        )
    }
}