import React from 'react';
import { Provider } from '../../src';
import Display from './Display';
import Controls from './Controls';
import blueOnEvenRedInOdd from './derivedStateSyncers/blueOnEvenRedInOdd';
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
    derivedStateSyncers: [blueOnEvenRedInOdd],
    debug: true
})(Counter);
