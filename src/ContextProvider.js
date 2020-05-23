import React, { memo } from 'react';
import identity from 'lodash/fp/identity';
import useStateManagement from './useStateManagement';

export const TreeContext = React.createContext();

const ContextProvider = ({
    Context,
    initialPropsMapper = identity,
    derivedStateSyncers = [],
    effects = [],
    debug = false
}) => (Component) => memo((props) => {
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
});

export default ContextProvider;
