import React, { useEffect } from 'react';
import isInDebugMode from '../isInDebugMode';
import useStateManagement from '../useStateManagement';

export const TreeContext = React.createContext();

const ContextProvider = ({
    name = parseInt(1000 + Math.random() * 1000),
    Context,
    initialPropsMapper = (x) => x,
    derivedStateSyncers = [],
    effects = [],
}) => (Component) => (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [context, setContext] = useStateManagement(initialPropsMapper(props), derivedStateSyncers, name);
    effects.forEach((effect) => effect({ context, setContext }));

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (isInDebugMode()) {
            console.log('%cRun window.ReactWisteriaStores in order to inspect the React Wisteria state', 'color:#1dbf73');
        }
    }, []);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (isInDebugMode()) {
            window.ReactWisteriaStores = window.ReactWisteriaStores || {};
            window.ReactWisteriaStores[name] = context;
        }
    }, [context]);

    return (
        <TreeContext.Provider value={Context}>
            <Context.Provider value={{ context, setContext }}>
                <Component {...props}/>
            </Context.Provider>
        </TreeContext.Provider>
    );
};

export default ContextProvider;
