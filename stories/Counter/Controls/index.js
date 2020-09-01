import React from 'react';
import { connect } from '../../../src';
import './style.scss';

const Controls = ({ onAddition, onDecrement, onConsole }) => {
    console.log('Controls Rendered');

    return (
        <>
            <div className="controls">
                <div className="control" onClick={onAddition}>+</div>
                <div className="control" onClick={onDecrement}>-</div>
            </div>
            <h4 onClick={onConsole}>Alert other state value</h4>
        </>
    )
};

const onAddition = ({ getContext, setContext }) => () => {
    const {count } = getContext();
    setContext('count', count + 1)
};

const onDecrement = ({ getContext, setContext }) => () => {
    setContext('count', getContext().count - 1)
};

const onConsole = ({ getContext }) => () => {
    alert(getContext().countx);
};

export default connect(null, { onAddition, onDecrement, onConsole })(Controls);
