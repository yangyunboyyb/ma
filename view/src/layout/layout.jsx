
import React from 'react'
import Bar from '../bar/bar'
import { isLogin } from '../login/login'


class Layout extends React.Component {

    componentWillMount() {
        isLogin()
    }

    render() {
        return (
            <div style={{ height: '100%', width: '100%' }}>
                <div style={{ height: '100%', width: '100%', position: 'absolute' }}>
                    <Bar />
                </div>
            </div>
        )
    }
}
export default Layout