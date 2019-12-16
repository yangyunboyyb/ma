import Highcharts from 'highcharts'
import React from 'react'
import http from 'http'


class Time extends React.Component {
    componentDidMount() {
        this.shader()
    }

    async shader() {
        let data = await this.getdata()
        let Data = this.getRenderData(data)
        if (this && this.refs && this.refs.time) {
            Highcharts.chart(this.refs.time, Data)
        }
    }

    getRenderData(data) {
        return {
            chart: {
                type: 'column'
            },
            title: {
                text: '各时间段玩家分布示意图'
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: '玩家人数'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}'
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
            },
            series: [{
                name: '玩家人数',
                colorByPoint: true,
                data: data
            }],
            credits: { //去掉版权logo
                enabled: false
            },
        }
    }

    getdata() {
        let url = "http://10.88.0.193:5264/region"
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
    
    render() {
        return (
            <div>
                < div ref="time" />
            </div>
        )
    }
}

export default Time

