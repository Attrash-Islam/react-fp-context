import React from 'react';
import { connect } from '../../../src';
import './style.scss';

const Controls = ({ onAddition, onDecrement, consoleLog }) => {
    return (
        <>
            <div className="controls">
                <div className="control" onClick={onAddition}>+</div>
                <div className="control" onClick={onDecrement}>-</div>
            </div>
            <h4 onClick={consoleLog}>Alert other state value</h4>
        </>
    )
};

const mapStateToProps = ({ context, setContext }) => ({
    onAddition: () =>
        // eslint-disable-next-line
        React.useCallback(() => {
            setContext('count', (count) => count + 1)
        }, []),
    onDecrement: () =>
        // eslint-disable-next-line
        React.useCallback(() => {
            setContext('count', (count) => count - 1)
        }, []),
    consoleLog: () =>
        // eslint-disable-next-line
        React.useCallback(() => alert(context.countx), [context.countx])
});

export default connect(mapStateToProps)(Controls);
