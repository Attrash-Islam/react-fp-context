import React from 'react';

const withDebugMode = (Story) => {
    window.isWisteriaDebugModeForced = true;
    return <Story/>;
};

export default withDebugMode;
