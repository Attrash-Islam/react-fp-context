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

const mapStateToProps = ({ count }) => ({ count });

export default connect(mapStateToProps)(Display);
