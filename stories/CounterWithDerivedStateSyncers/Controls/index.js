import React from 'react';
import { connect } from '../../../src';
import './style.scss';

const Controls = ({ onAddition, onDecrement }) => {
    return (
        <div className="controls">
            <div className="control" onClick={onAddition}>+</div>
            <div className="control" onClick={onDecrement}>-</div>
        </div>
    )
};

const onAddition = ({ setContext }) => () => {
    setContext('count', (count) => count + 1);
};

const onDecrement = ({ setContext }) => () => {
    setContext('count', (count) => count - 1);
};

export default connect(null, { onAddition, onDecrement })(Controls);
