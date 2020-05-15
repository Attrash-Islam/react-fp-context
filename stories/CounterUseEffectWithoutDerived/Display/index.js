import React from 'react';
import { connect } from '../../../src';
import './style.scss';

const Display = ({ count, color }) => {
    return (
        <div className="display" style={{ color }}>
            {count}
        </div>
    )
};

const useStateToProps = ({ context }) => ({
    count: context.count,
    color: context.color
});

export default connect(useStateToProps)(Display);
