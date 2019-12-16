import Cpu from './cpu'
import Memory from './memory'
import Online from '../online/online'
import Redis from '../redis/redis'

import React from 'react'

export default class Sys extends React.Component {
    render() {
        return (
            <div style={{ background: '#1B262E', height: '100%', width: '100%' }}>
                <div style={{ height: '100%' }}>
                    <div style={{ height: '40%', width: '40%', position: 'absolute', left: '100px', top: '10px' }}>
                        < Cpu />
                    </div>
                    <div style={{ height: '40%', width: '40%', position: 'absolute', left: '1000px', top: '10px' }}>
                        < Memory />
                    </div>
                    <div style={{ height: '40%', width: '40%', position: 'absolute', left: '100px', top: '460px' }}>
                        < Online />
                    </div>
                    <div style={{ height: '40%', width: '40%', position: 'absolute', left: '1000px', top: '460px' }}>
                        < Redis />
                    </div>
                </div>
            </div>
        )
    }
}