import React from 'react';
import useStateManagement from '../useStateManagement';
import { useRootsContext } from '../utils';

export const TreeContext = React.createContext();

const ContextProvider = ({
    name = parseInt(1000 + Math.random() * 1000),
    Context,
    initialPropsMapper = (x) => x,
    derivedStateSyncers = [],
    effects = [],
    roots = {},
    debug = false
}) => (Component) => (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [context, setContext] = useStateManagement(initialPropsMapper(props), derivedStateSyncers, debug, roots);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const rootsValues = useRootsContext({ roots });
    effects.forEach((effect) => effect({ context, setContext, roots: rootsValues }));

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const warnedAboutMissingDevToolRef = React.useRef();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
        if (typeof window !== 'undefined' && window._REACT_CONTEXT_DEVTOOL) {
            window._REACT_CONTEXT_DEVTOOL({ id: name, displayName: name, values: context });
        } else if (!warnedAboutMissingDevToolRef.current) {
            warnedAboutMissingDevToolRef.current = true;
            console.log('%cConsider installing "React Context DevTool" in order to inspect the Wisteria state', 'color:#1dbf73');
        }
    }, [context]);

    return (
        <TreeContext.Provider value={Context}>
            <Context.Provider value={{ context, setContext, roots }}>
                <Component {...props}/>
            </Context.Provider>
        </TreeContext.Provider>
    );
};

export default ContextProvider;
