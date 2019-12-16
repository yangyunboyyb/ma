import React from 'react'
import { httpRes } from '../tools/tool'
import Highcharts from 'highcharts'
import { Button, Icon } from 'antd'

class UserInfo extends React.Component {

    constructor(props) {
        super(props);
        console.log(props)
    } 
    
    async componentDidMount() {
        let userId = '26324'
        let region_tims = await httpRes('loginRegionCount', { userId: userId })
        let average_time = await httpRes('loginAverageTime', { userId: userId })
        let time_times = await httpRes('loginTimeCount', { userId: userId })
        this.setState({
            region_tims: region_tims,
            average_time: average_time,
            time_times: time_times
        })
        let region_data = this.getRenderData('登录地点', region_tims)
        let time_data = this.getRenderData('登录时间', time_times)
        Highcharts.chart(this.refs.region, region_data)
        Highcharts.chart(this.refs.time, time_data)
    }

    

    getRenderData(name, data) {
        return {
            chart: {
                type: 'column'
            },
            title: {
                text: name + "统计示意图"
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: '次数'
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
                        format: '{point.y}次'
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b>次<br/>'
            },
            series: [{
                name: name,
                colorByPoint: true,
                data: data
            }],
            credits: { //去掉版权logo
                enabled: false
            }
        }
    }

    backOnClick() {
        
    }

    render() {
        return (
            <div style={{ background: '#1B262E', height: '100%', width: '100%' }}>
                <div>
                    <Button type="primary" onClick={this.backOnClick}>
                        <Icon type="left" /> 返回
                    </Button>
                </div>
                <div style={{ height: '400px', width: '45%', position: 'absolute', top: '40px' }}>
                    <div ref="time" />
                </div>
                <div style={{ height: '400px', width: '45%', position: 'absolute', top: '40px', left: '50%' }}>
                    <div ref="region" />
                </div>
            </div>
        )
    }
}

export default UserInfo