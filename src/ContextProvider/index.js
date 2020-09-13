import React, { unstable_createMutableSource, createContext } from 'react';
import WisteriaStore from '../WisteriaStore';
import { useRef } from 'react';
import Effects from '../Effects';

export const TreeContext = createContext();

const ContextProvider = ({
    initialPropsMapper = (x) => x,
    effects = [],
    derivedStateSyncers = []
} = {}) => (Component) => (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initRef = useRef();

    if (!initRef.current) {
        const store = new WisteriaStore({
            initialPropsMapper,
            derivedStateSyncers
        });
    
        const mutableSource = unstable_createMutableSource(
            store,
            store.getState
        );

        store.init(props);
        initRef.current = { mutableSource, store };
    }

    return (
        <TreeContext.Provider value={initRef.current.mutableSource}>
            <Effects effects={effects}/>
            <Component {...props}/>
        </TreeContext.Provider>
    );
}

export default ContextProvider;
