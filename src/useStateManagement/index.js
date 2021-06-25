import React from 'react';
import computeDerivedStates from '../computeDerivedStates';
import isInDebugMode from '../isInDebugMode';
import traceUpdates from '../traceUpdates';
import updater from '../updater';

/**
 * The state management core.
 *
 * @param initialState
 * @param derivedStateSyncers
 * @returns getter/setter to the context
 */
const useStateManagement = (initialState, derivedStateSyncers, name) => {
    const [state, setState] = React.useState(initialState);
    const [initState, setInitState] = React.useState(true);

    const setContext = React.useCallback((path, value) => {
        if (isInDebugMode()) {
            traceUpdates({ name, path, value });
        }

        setState((state) => {
            const newState = updater(path, value, state);
            const syncerStatus = {};
            syncerStatus.done = false;
            const stateAfterDerived = computeDerivedStates({ name, prevState: state, state: newState, derivedStateSyncers, syncerStatus });
            syncerStatus.done = true;
            return stateAfterDerived;
        });
    }, [derivedStateSyncers, name]);

    if (initState) {
        const syncerStatus = {};
        syncerStatus.done = false;
        const stateAfterDerived = computeDerivedStates({ name, prevState: {}, state, derivedStateSyncers, syncerStatus });
        syncerStatus.done = true;
        setState(stateAfterDerived);
        setInitState(false);
    }

    return [state, setContext];
};

export default useStateManagement;
