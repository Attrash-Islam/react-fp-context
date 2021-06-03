import React from 'react';
import { addDecorator } from '@storybook/react';

addDecorator((storyFn) => (
    <React.StrictMode>
        {storyFn()}
    </React.StrictMode>
));

window.isWisteriaDebugModeForced = true;
