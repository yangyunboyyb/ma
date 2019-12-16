import React from 'react';
import { Row, Col } from 'antd'

let a = ''
class Log extends React.Component {

    click() {
        a += '测试的'
        document.getElementById('log').innerHTML = a
    }

    render() {
        return (
            <div style={{ height: '400px', width: '400px',  padding: '70px 600px'}}>
                <Row>
                    <Col span={18} pull={0}>
                        {/* <Button onClick={this.click} ghost></Button> */}
                    </Col>
                </Row>
                <Row>
                    <Col span={2} push={4}>
                        <div id='log' style={{ background: 'rgb(190, 200, 200)', height: '400px', width: '400px', overflow: 'auto' }}></div>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Log