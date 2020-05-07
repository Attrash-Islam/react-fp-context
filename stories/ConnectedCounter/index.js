import React from 'react';
import ReactFpContext from '../../src';
import Display from './Display';
import Controls from './Controls';
import CounterContext from './context';
import Strange from './Strange';
import './style.scss';

const ConnectedCounter = () => {
    return (
        <div className="counter">
            <Display/>
            <Controls/>
            <Strange/>
        </div>
    );
};

export default ReactFpContext({
    Context: CounterContext
})(ConnectedCounter);
