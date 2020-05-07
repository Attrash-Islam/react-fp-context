import React from 'react';
import CounterContext from '../context';

const Strange = () => {
    const { setContext } = React.useContext(CounterContext);

    const onClick = () => {
        setContext('countx', 'islam');
    };

    return (
        <button onClick={onClick}>
            Update something else
        </button>
    )

};

export default Strange;
