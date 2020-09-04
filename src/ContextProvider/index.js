import React, { unstable_createMutableSource, createContext } from 'react';
import WisteriaStore from '../WisteriaStore';
import { useRef } from 'react';

export const TreeContext = createContext();

const ContextProvider = ({
    initialPropsMapper = (x) => x
}) => (Component) => (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initRef = useRef();

    if (!initRef.current) {
        const store = new WisteriaStore({
            initialPropsMapper
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
            <Component {...props}/>
        </TreeContext.Provider>
    );
}

export default ContextProvider;
