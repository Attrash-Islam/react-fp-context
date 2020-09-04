import React, { unstable_createMutableSource, createContext } from 'react';
import WisteriaStore from '../WisteriaStore';

export const TreeContext = createContext();

const ContextProvider = ({
    initialPropsMapper = (x) => x
}) => {
    const store = new WisteriaStore({
        initialPropsMapper
    });

    const mutableSource = unstable_createMutableSource(
        store,
        store.getState
    );

    return (Component) => (props) => {
        store.init(props);

        return (
            <TreeContext.Provider value={mutableSource}>
                <Component {...props}/>
            </TreeContext.Provider>
        );
    }
};

export default ContextProvider;
