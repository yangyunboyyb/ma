
import React from 'react'
import { Table, Input, Button, Icon } from 'antd'
import 'antd/dist/antd.css'
import './list.css'
import Highcharts from 'highcharts'

import { httpRes } from '../tools/tool.js'

class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      pagination: {
        showQuickJumper: true,
        defaultPageSize: 21,
        onChange: (num) => { this.fetch(num) },
        style: { background: '#ffffff', color: '#1B262E', position: 'absolute', right: '40px' }
      },
      rowStyle: { 'backgroundColor': '#e6f7ff' },
      searchText: '',
      loading: true,
      userId: '',
      display: 'none',
    }
  }

  componentDidMount() {
    this.fetch(1)
  }

  async fetch(page) {
    this.setState({ loading: true })
    let pagination = { ...this.state.pagination }
    let data = await httpRes('userInfo', { page: page })
    this.setState({ loading: false })
    pagination.total = (await httpRes('userCount')).count
    this.setState({
      loading: false,
      data: data,
      pagination,
    })
  }

  async search(key, index) {
    this.setState({ loading: true })
    let pagination = { ...this.state.pagination }
    let data = await httpRes('searchUser', { key: key, index: index })
    this.setState({ loading: false })
    pagination.total = data.length
    this.setState({
      loading: false,
      data: data,
      pagination,
    })
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

  getColumnSearchProps = index => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${index}`}
          value={selectedKeys}
          onChange={e => setSelectedKeys(e.target.value)}
          onPressEnter={() => this.handleSearch(selectedKeys, index, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, index, confirm)}
          icon="search"
        >
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} > Reset </Button>
      </div>
    ),
    filterIcon: () => (
      <Icon type="search" style={{ color: '#1890ff' }} />
    ),
  })

  handleSearch(key, index, confirm) {
    confirm()
    if (key && key.length > 0) {
      this.search(key, index)
    }
  }

  handleReset(clear) {
    clear()
    this.fetch(1)
  }

  backOnClick(self) {
    self.setState({ display: 'none' })
  }

  async userItemClick(userId) {
    this.setState({ display: '', })
    let region_tims = await httpRes('loginRegionCount', { userId: userId })
    // let average_time = await httpRes('loginAverageTime', { userId: this.state.userId })
    let time_times = await httpRes('loginTimeCount', { userId: userId })
    let region_data = this.getRenderData('登录地点', region_tims)
    let time_data = this.getRenderData('登录时间', time_times)
    Highcharts.chart(this.refs.region, region_data)
    Highcharts.chart(this.refs.time, time_data)
  }

  render() {
    const columns = [
      {
        key: 'userId',
        title: 'userId',
        dataIndex: 'userId',
        align: 'center',
        width: '20%',
        ...this.getColumnSearchProps('userId'),
        sorter: (a, b) => Number(a.userId) - Number(b.userId),
        // render: text => <div style={{ color: '#ffffff' }} >{text}</div>
      },
      {
        key: 'nickName',
        title: 'nickName',
        dataIndex: 'nickName',
        align: 'center',
        width: '20%',
        ...this.getColumnSearchProps('nickName'),
        // render: text => <div style={{ color: '#ffffff' }} >{text}</div>
      },
      {
        key: 'sex',
        title: 'sex',
        dataIndex: 'sex',
        align: 'center',
        width: '20%',
        ...this.getColumnSearchProps('sex'),
        // render: text => <div style={{ color: '#ffffff' }} >{text}</div>
      },
      {
        key: 'age',
        title: 'age',
        dataIndex: 'age',
        align: 'center',
        width: '20%',
        ...this.getColumnSearchProps('age'),
        sorter: (a, b) => Number(a.age) - Number(b.age),
        // render: text => <div style={{ color: '#ffffff' }} >{text}</div>
      },
    ]

    return (
      <div style={{ background: '#1B262E', height: '100%', width: '100%' }}>
        <Table
          onHeaderRow={(column, index) => {
            return {
              style: { background: '#dae9f0' },
            }
          }}
          onRow={(record, index) => {
            if (index % 2 === 1) {
              return {
                style: { 'backgroundColor': '#fffff9', cursor: 'pointer' },
                onClick: (e) => { this.userItemClick(record.userId) }
              }
            } else {
              return {
                style: { 'backgroundColor': '#ffffff', cursor: 'pointer' },
                onClick: (e) => { this.userItemClick(record.userId) }
              }
            }
          }}
          size='small'
          columns={columns}
          dataSource={this.state.data}
          pagination={this.state.pagination}
          loading={this.state.loading}
          bordered
        />
        <div style={{
          background: '#1B262E', height: '100%', width: '100%',
          display: this.state.display, position: 'absolute', right: '0px', top: '0px'
        }}>
          <div style={{ background: '#1B262E', height: '100%', width: '100%' }}>
            <div style={{ position: 'absolute' }}>
              <Button type="primary" onClick={this.backOnClick.bind(this, this)}>
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
        </div>
      </div>
    );
  }
}

export default List