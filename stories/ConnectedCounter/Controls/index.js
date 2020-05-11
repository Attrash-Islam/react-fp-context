import React from 'react';
import { connect } from '../../../src';
import './style.scss';

const Controls = ({ onAddition, onDecrement, onConsole }) => {
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

const useStateToProps = ({ context, setContext }) => {

    const onAddition = React.useCallback(() => {
        setContext('count', (count) => count + 1)
    }, [setContext]);

    const onDecrement = React.useCallback(() => {
        setContext('count', (count) => count - 1)
    }, [setContext]);

    const onConsole = React.useCallback(() => {
        alert(context.countx);
    }, [context.countx]);

    return {
        onAddition,
        onDecrement,
        onConsole
    }
};

export default connect(useStateToProps)(Controls);
