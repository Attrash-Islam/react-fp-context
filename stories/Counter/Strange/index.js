import React from 'react';
import connect from '../../../src/connect';

const Strange = ({ countx, onClick }) => {
    return (
        <button onClick={onClick}>
            Update some value that Table do not refer to - current: {countx}
        </button>
    )
};

const useStateToProps = ({ context, setContext }) => {
    const onClick = React.useCallback(() => {
        setContext('countx', 'id: ' + Math.random());
    }, [setContext]);

    return {
        countx: context.countx,
        onClick
    }
};

export default connect(useStateToProps)(Strange);
