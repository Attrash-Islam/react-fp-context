import React from 'react';
import { Provider } from '../../src';
import RootsFeatContext from './context';
import Child from './Child';
import derivedA from './syncers/a';
import derivedB from './syncers/b';
import derivedC from './syncers/c';

const App = ({ children }) => {
    const { context } = React.useContext(RootsFeatContext);

    return (
        <div className="App">
            <h1>
                Derived rules:<br/>
                b = a + 1;<br/>
                c = b + 1;<br/>
                d = c + 1;<br/>
            </h1>
            <pre>
                Parent:
                <h2>a: {context.a}</h2>
                <h2>b: {context.b}</h2>
                <h2>c: {context.c}</h2>
                <h2>d: {context.d}</h2>
            </pre>
            <Child/>
            <div className="blue-lolu">
                {children}
            </div>
        </div>
    );
}

export default Provider({
    Context: RootsFeatContext,
    initialPropsMapper: ({ a }) => ({ a }),
    derivedStateSyncers: [derivedA, derivedB, derivedC]
})(App);
