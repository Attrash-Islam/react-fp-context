import React from 'react';
// import { range } from 'lodash';
import { connect } from '../../../src';
import './style.scss';

const Display = ({ count }) => {
    return (
        <div className="display">
            {count}
        </div>
    )
};

const mapStateToProps = ({ count }) => ({
    count
});

export default connect(mapStateToProps)(Display);
