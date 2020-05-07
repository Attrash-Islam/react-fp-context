import React from 'react';
import CounterContext from '../context';

const Strange = () => {
    const { setContext, context } = React.useContext(CounterContext);
    const { countx } = context;

    const onClick = () => {
        setContext('countx', 'id: ' + Math.random());
    };

    return (
        <button onClick={onClick}>
            Update some value that Table do not refer to - current: {countx}
        </button>
    )
};

export default Strange;
