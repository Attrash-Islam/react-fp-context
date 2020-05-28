import React from 'react';
import { Provider } from '../../src';
import NestedRelationContext from './context';
import Child from './Child';
import derivedA from './syncers/a';
import derivedB from './syncers/b';
import derivedC from './syncers/c';

const App = () => {
    const { context } = React.useContext(NestedRelationContext);

    return (
        <div className="App">
            <h1>
                Derived rules:<br/>
                b = a + 1;<br/>
                c = b + 1;<br/>
                d = c + 1;<br/>
            </h1>
            <h2>a: {context.a}</h2>
            <h2>b: {context.b}</h2>
            <h2>c: {context.c}</h2>
            <h2>d: {context.d}</h2>
            <Child/>
      </div>
      );
};

export default Provider({
    Context: NestedRelationContext,
    derivedStateSyncers: [derivedA, derivedB, derivedC]
})(App);
