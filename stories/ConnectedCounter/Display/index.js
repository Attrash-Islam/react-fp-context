import React from 'react';
import { connect } from '../../../src';
import './style.scss';

const Display = ({ count }) => {

    console.log('Display updated');

    return (
        <div className="display">
            {count}
        </div>
    )
};

const mapStateToProps = ({ context }) => ({
    count: context.count
});

export default connect(mapStateToProps)(Display);
