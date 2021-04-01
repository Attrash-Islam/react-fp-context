const derivedB = ({ context, prevContext, setContext }) => {
    const { b } = context;
    const { b: prevB } = prevContext;
  
    if (b === prevB) {
      return;
    }
  
    setContext('c', b + 1);
  };
  
  export default derivedB;
  