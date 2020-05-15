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

const useStateToProps = ({ setContext }) => {
    const onAddition = React.useCallback(() => {
        setContext('count', (count) => count + 1);
    }, [setContext]);

    const onDecrement = React.useCallback(() => {
        setContext('count', (count) => count - 1);
    }, [setContext]);


    return {
        onAddition,
        onDecrement
    };
};

export default connect(useStateToProps)(Controls);
