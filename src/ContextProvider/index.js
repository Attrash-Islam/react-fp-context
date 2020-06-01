import React from 'react';
import useStateManagement from '../useStateManagement';

export const TreeContext = React.createContext();

const ContextProvider = ({
    Context,
    initialPropsMapper = (x) => x,
    derivedStateSyncers = [],
    effects = [],
    debug = false
}) => (Component) => (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [context, setContext] = useStateManagement(initialPropsMapper(props), derivedStateSyncers, debug);
    effects.forEach((effect) => effect({ context, setContext }));

    return (
        <TreeContext.Provider value={Context}>
            <Context.Provider value={{ context, setContext }}>
                <Component {...props}/>
            </Context.Provider>
        </TreeContext.Provider>
    );
};

export default ContextProvider;
