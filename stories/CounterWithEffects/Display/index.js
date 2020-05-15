import React from 'react';
import { connect } from '../../../src';
import './style.scss';

const Display = ({ count }) => {
    return (
        <div className="display">
            {count}
        </div>
    )
};

const useStateToProps = ({ context }) => ({
    count: context.count
});

export default connect(useStateToProps)(Display);
