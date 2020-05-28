import React from 'react';
import { Provider } from '../../src';
import Display from './Display';
import Controls from './Controls';
import CounterContext from './context';
import Strange from './Strange';
import './style.scss';

const ConnectedCounter = () => {
    return (
        <div className="counter">
            <Controls/>
            <Strange/>
            <Display/>
        </div>
    );
};

export default Provider({
    Context: CounterContext
})(ConnectedCounter);
