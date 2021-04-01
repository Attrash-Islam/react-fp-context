import React from 'react';
import RootsFeatContext from '../context';

const Child = () => {
    const { setContext } = React.useContext(RootsFeatContext);
  
    return (
      <div onClick={() => setContext('a', a => a + 1)}>
        <b>CLICK HERE</b> to change only the parent values from the PARENT scope
      </div>
    );
  };
  
  export default Child;
  