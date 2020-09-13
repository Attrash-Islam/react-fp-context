const derivedA = ({ context, prevContext, setContext }) => {
    const { a } = context;
    const { a: prevA } = prevContext;
  
    if (a === prevA) {
      return;
    }
  
    setContext('b', a + 1);
  };
  
  export default derivedA;
  