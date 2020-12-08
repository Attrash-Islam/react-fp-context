import React, { unstable_createMutableSource } from 'react';
import WisteriaStore from '../WisteriaStore';
import { useRef } from 'react';
import Effects from '../Effects';
import { TreeContext } from '../utils/constants';

const Provider = ({
    name = parseInt(1000 + Math.random() * 1000),
    initialPropsMapper = (x) => x,
    effects = [],
    derivedStateSyncers = [],
    debug = false
} = {}) => (Component) => (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initRef = useRef();

    if (!initRef.current) {
        const store = new WisteriaStore({
            initialPropsMapper,
            derivedStateSyncers,
            debug
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
            <Effects effects={effects} name={name}/>
            <Component {...props}/>
        </TreeContext.Provider>
    );
}

export default Provider;
