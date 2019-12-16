import React from 'react'

import Region from './region'

class Analysis extends React.Component {
    render() {
        return (
            <div style={{ background: '#1B262E', height: '100%', width: '100%' }}>
                <div style={{ height: '100%', width: '100%' }}>
                    <Region />
                </div>
            </div>
        )
    }
}

export default Analysis