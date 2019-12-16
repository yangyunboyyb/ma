let Highcharts = require('highcharts')
let React = require('react')


export default class Disk extends React.Component {
    componentDidMount() {
        let Data = {
            chart: {
                type: 'spline',
                marginRight: 10,
                events: {
                    load: function () {
                        var series = this.series[0],
                            chart = this;
                        activeLastPointToolip(chart);
                        setInterval(function () {
                            var x = (new Date()).getTime(), // 当前时间
                                y = Math.random()/1 * 100;          // 随机值
                            series.addPoint([x, y], true, true);
                            activeLastPointToolip(chart);
                        }, 1000);
                    }
                }
            },
            title: {
                text: '磁盘'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: null
                }
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y + '%', 2);
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: '磁盘',
                data: (function () {
                    // 生成随机值
                    var data = [],
                        time = (new Date()).getTime(),
                        i;
                    for (i = -19; i <= 0; i += 1) {
                        data.push({
                            x: time + i * 1000,
                            y: Math.random()/1 * 100
                        });
                    }
                    return data;
                }())
            }],
            credits: { //去掉版权logo
                enabled: false
            }
        }
        Highcharts.chart(this.refs.disk, Data);
    }
    render() {
        return (
          <div ref="disk" />
        );
    }
}

function activeLastPointToolip(chart) {
    var points = chart.series[0].points;
    chart.tooltip.refresh(points[points.length - 1]);
}