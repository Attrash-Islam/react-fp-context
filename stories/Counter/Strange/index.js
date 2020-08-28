import React from 'react';
import connect from '../../../src/connect';

const Strange = ({ countx, onClick }) => {
    return (
        <button onClick={onClick}>
            Update some value that Table do not refer to - current: {countx}
        </button>
    )
};

const mapStateToProps = ({ countx }) => ({ countx });

const onClick = ({ setContext }) => () => {
    setContext('countx', 'id: ' + Math.random());
};

export default connect(mapStateToProps, { onClick })(Strange);
