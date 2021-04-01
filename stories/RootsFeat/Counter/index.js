import React from 'react';
import { connect, Provider } from '../../../src';
import Display from './Display';
import Controls from './Controls';
import CounterContext from './context';
import Strange from './Strange';
import RootsFeatContext from '../context';
import './style.scss';

const ConnectedCounter = ({ roots, setRootContext }) => {
    return (
        <div className="counter">
            <pre>
                Child:
                <h2>a: {roots.a}</h2>
                <h2>b: {roots.b}</h2>
                <h2>c: {roots.c}</h2>
                <h2>d: {roots.d}</h2>
            </pre>
            <div onClick={() => setRootContext('a', a => a + 1)}>
                <b>CLICK HERE</b> to change only the parent values from the CHILD scope
            </div>
            <Controls/>
            <Strange/>
            <Display/>
        </div>
    );
};

const useStateToProps = ({ roots: { RootsFeatContext } }) => {
    return {
        roots: RootsFeatContext.context,
        setRootContext: RootsFeatContext.setContext
    };
};

const connected = connect(useStateToProps)(ConnectedCounter);

const useCustomEffect = ({ roots: { RootsFeatContext }}) => {
    React.useEffect(() => {
        console.log('a got changed', RootsFeatContext.context.a);
    }, [RootsFeatContext.context.a])
};

export default Provider({
    Context: CounterContext,
    effects: [
        useCustomEffect
    ],
    roots: {
        RootsFeatContext
    }
})(connected);
