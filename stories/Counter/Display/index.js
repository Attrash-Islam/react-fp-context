import React from 'react';
import CounterContext from '../context';
import './style.scss';

const Display = () => {
    const { context } = React.useContext(CounterContext);
    const { count } = context;

    console.log('Display updated');

    return (
        <div className="display">
            {count}
        </div>
    )
};

export default Display;
