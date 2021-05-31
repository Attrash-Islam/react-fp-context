const traceUpdates = ({ name, path, value }) => {
    console.groupCollapsed(`%c react-wisteria::${name} setContext Path "${path}"`, 'color:#1dbf73');
    console.log({ value });
    console.trace();
    console.groupEnd();
};

export default traceUpdates;
