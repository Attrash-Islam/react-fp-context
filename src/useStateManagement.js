import React from 'react';
import set from 'lodash/fp/set';
import update from 'lodash/fp/update';
import isFunction from 'lodash/fp/isFunction';

/**
 * The state management core.
 * We use functional lodash in order to identify easily if any changes happened at any level in the state
 * and to do an easier way of updating the state.
 *
 * @param initialState
 * @param derivedStateSyncers
 * @returns getter/setter to the context
 */
const useStateManagement = (initialState, derivedStateSyncers) => {
    const initialRenderRef = React.useRef(true);
    const [state, setState] = React.useState(initialState);
    const prevStateRef = React.useRef(state);

    const setContext = React.useCallback((path, value) => {
        const updateFunction = isFunction(value) ? update : set;

        setState((state) => {
            const newState = updateFunction(path, value, state);
            return newState;
        });
    }, []);

    derivedStateSyncers.forEach((d) => d({
        context: state,
        prevContext: prevStateRef.current,
        force: initialRenderRef.current,
        setContext
    }));

    prevStateRef.current = state;
    initialRenderRef.current = false;

    return [state, setContext];
};

export default useStateManagement;
