/* eslint-disable no-cond-assign */

import React from 'react'
import 'antd/dist/antd.css'
import { Layout, Menu, Icon, Row, Col, Avatar, Dropdown, Button } from 'antd'
// import Sys from '../system/sys'
import List from '../user/list'
import Analysis from '../analysis/analysis'
import { getUserInfo } from '../login/login'

const { Sider } = Layout


class Bar extends React.Component {

  state = {
    collapsed: true,
    userInfo: getUserInfo(),
    index: [1, 2, 1, 1, 1, 1, 1, 1]
  }

  menu = (
    <div style={{ height: "200px", width: "200px", background: "#ffffff" }}>
      <font size="5" style={{ background: '#dbd5df', }}
      >{this.state.userInfo.name}</font>
      <font size="4" style={{ background: '#dbd5df', }}
      >@{this.state.userInfo.username}</font>
    </div>
  );


  changeLayout(index) {
    let tem = this.state.index
    for (let i = 0; i < tem.length; i++) {
      if (index === i) {
        tem[i] = 2
      } else {
        tem[i] = 1
      }
    }
    this.setState({ index: tem })
  }

  handleClick = (e) => {
    this.changeLayout(Number(e.key))
  }

  handleMouseOver = () => {
    this.setState({ collapsed: false })
  }

  handleMouseOut = () => {
    this.setState({ collapsed: true })
  }


  render() {
    return (
      <div style={{ height: '96.2%' }}>
        <div style={{ height: '4%', background: '#002040' }}>
          <div style={{ position: 'absolute', right: '20px' }}>
            <Dropdown
              overlay={this.menu}
              trigger={["click"]}
              placement={'bottomRight'}
            >
              <div>
                <Button style={{ height: '36px'}}>
                  <Avatar src={this.state.userInfo.avatar_url}></Avatar>
                  <Icon type="down" />
                </Button>
              </div>
            </Dropdown>
          </div>
        </div>
        <Row style={{ height: '100%' }}>
          <Col span={23} push={1} style={{ height: '100%' }}>
            <Layout style={{ height: '100%', width: '100%', position: 'relative' }} >
              <div style={{ height: '100%', width: '100%', zIndex: this.state.index[2], position: 'absolute' }}>
                <List />
              </div>
              <div style={{ height: '100%', width: '100%', zIndex: this.state.index[7], position: 'absolute' }}>
                <Analysis />
              </div>
            </Layout>
          </Col>
          <Col span={1} pull={23} style={{ height: '100%', zIndex: 2 }}>
            <Sider style={{ height: '100%' }}
              collapsible collapsed={this.state.collapsed}
              onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseOut}
            >
              <div />
              <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" onClick={this.handleClick}>
                <Menu.Item key="2">
                  <Icon type="team" />
                  <span>玩家列表</span>
                </Menu.Item>
                <Menu.Item key="7">
                  <Icon type="team" />
                  <span>分析</span>
                </Menu.Item>
              </Menu>
            </Sider>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Bar