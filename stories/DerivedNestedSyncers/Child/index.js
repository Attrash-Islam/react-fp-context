import React from 'react';
import { connect } from '../../../src';

const Child = ({ updateA }) => {
    return (
      <div onClick={updateA}>
        <b>CLICK HERE</b> to change only the (a) value
      </div>
    );
  };
  
  const updateA = ({ setContext }) => () => {
    setContext('a', a => a + 1);
  };

  export default connect(null, { updateA })(Child);
  