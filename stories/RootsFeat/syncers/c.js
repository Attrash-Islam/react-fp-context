const derivedC = ({ context, prevContext, setContext }) => {
    const { c } = context;
    const { c: prevC } = prevContext;
  
    if (c === prevC) {
      return;
    }
  
    setContext('d', c + 1);
  };
  
  export default derivedC;
  