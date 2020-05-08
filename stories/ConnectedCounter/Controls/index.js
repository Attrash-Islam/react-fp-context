import React from 'react';
import { connect } from '../../../src';
import './style.scss';

const Controls = ({ useAddition, useDecrement, useConsoleLog }) => {
    return (
        <>
            <div className="controls">
                <div className="control" onClick={useAddition}>+</div>
                <div className="control" onClick={useDecrement}>-</div>
            </div>
            <h4 onClick={useConsoleLog}>Alert other state value</h4>
        </>
    )
};

const mapStateToProps = ({ context, setContext }) => ({
    useAddition: () =>
        // eslint-disable-next-line react-hooks/exhaustive-deps
        React.useCallback(() => {
            setContext('count', (count) => count + 1)
        }, []),
    useDecrement: () =>
        // eslint-disable-next-line react-hooks/exhaustive-deps
        React.useCallback(() => {
            setContext('count', (count) => count - 1)
        }, []),
    useConsoleLog: () =>
        // eslint-disable-next-line react-hooks/exhaustive-deps
        React.useCallback(() => alert(context.countx), [context.countx])
});

export default connect(mapStateToProps)(Controls);
