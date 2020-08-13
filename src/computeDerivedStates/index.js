import traceUpdates from '../traceUpdates';
import updater from '../updater';

const MAX_INFINITE_CYCLES_COUNT = 100;

export const INFINITE_SET_CONTEXT_IN_SYNCER_ERROR_MSG = `One of your derivedStateSyncers is infinitely calling setContext. Reached Max limit: ${MAX_INFINITE_CYCLES_COUNT}.
Pass the "debug" option to the Provider in order to see the state updates.`;

const computeDerivedStates = ({ prevState, state, derivedStateSyncers, debug }) => {
    let lastCurrentState = state;
    let lastPrevState = prevState;
    let updates = [];

    const _setContext = (path, value) => {
        if (debug) {
            traceUpdates({ path, value });
        }

        updates.push({ path, value });
    };

    let cycleCount = 0;

    do {
        cycleCount++;

        if (cycleCount === MAX_INFINITE_CYCLES_COUNT) {
            throw new Error(INFINITE_SET_CONTEXT_IN_SYNCER_ERROR_MSG);
        }

        updates = [];

        derivedStateSyncers.forEach((d) => d({
            context: lastCurrentState,
            prevContext: lastPrevState,
            setContext: _setContext
        }));

        let stateBeforeUpdates = lastCurrentState;

        updates.forEach(({ path, value }) => {
            lastCurrentState = updater(path, value, lastCurrentState);
        });

        lastPrevState = stateBeforeUpdates;
    } while(updates.length > 0);

    return lastCurrentState;
};

export default computeDerivedStates;
