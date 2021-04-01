import React from 'react';
import App from '.';
import Counter from './Counter';

export default { title: 'Roots Feature' };

export const RootsFeat = () => {
    return (
        <App a={1}>
            <Counter count={0}/>
        </App>
    );
};
