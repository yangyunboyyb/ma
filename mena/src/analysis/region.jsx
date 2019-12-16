import Highcharts from 'highcharts'
import React from 'react'
import http from 'http'


class Region extends React.Component {
    componentDidMount() {
        this.shader()
    }

    async shader() {
        let data = await this.getdata()
        let Data = this.getRenderData(data)
        if (this && this.refs && this.refs.region) {
            Highcharts.chart(this.refs.region, Data)
        }
    }

    getRenderData(data) {
        return {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: '各地区玩家分布示意图'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
            <div style={{ background: '#1B262E', height: '100%', width: '100%' }}>
                <div style={{ height: '800px', width: '800px', position: 'absolute', left: '355px', top: '70px' }}>
                    < div ref="region" />
                </div>
            </div>
        )
    }
}

export default Region

