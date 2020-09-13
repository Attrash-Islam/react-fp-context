import React from 'react';
import { Provider, connect } from '../../src';
import Child from './Child';
import derivedA from './syncers/a';
import derivedB from './syncers/b';
import derivedC from './syncers/c';

const App = ({ a, b, c, d }) => {
    console.log('rendered', { a, b, c, d });

    return (
        <div className="App">
            <h1>
                Derived rules:<br/>
                b = a + 1;<br/>
                c = b + 1;<br/>
                d = c + 1;<br/>
            </h1>
            <h2>a: {a}</h2>
            <h2>b: {b}</h2>
            <h2>c: {c}</h2>
            <h2>d: {d}</h2>
            <Child/>
      </div>
      );
};

const Connected = connect((state) => state)(App);

export default Provider({
    derivedStateSyncers: [derivedA, derivedB, derivedC]
})(Connected);
