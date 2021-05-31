import React from 'react';
import { addDecorator } from '@storybook/react';
import withDebugMode from '../storybook';

addDecorator((storyFn) => (
    <React.StrictMode>
        {storyFn()}
    </React.StrictMode>
));

addDecorator(withDebugMode);
