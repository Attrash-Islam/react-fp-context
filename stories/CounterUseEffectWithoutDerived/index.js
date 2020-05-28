import React from 'react';
import { Provider } from '../../src';
import CounterContext from './context';
import Display from './Display';
import Controls from './Controls';
import useBlueOnEvenRedOnOdd from './effects/useBlueOnEvenRedOnOdd';
import './style.scss';

const Counter = () => {

    return (
        <div className="counter">
            <Display/>
            <Controls/>
        </div>
    );
};

export default Provider({
    Context: CounterContext,
    effects: [useBlueOnEvenRedOnOdd]
})(Counter);
