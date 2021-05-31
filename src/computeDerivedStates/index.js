import isInDebugMode from '../isInDebugMode';
import traceUpdates from '../traceUpdates';
import updater from '../updater';

const MAX_INFINITE_CYCLES_COUNT = 100;

export const INFINITE_SET_CONTEXT_IN_SYNCER_ERROR_MSG = `One of your derivedStateSyncers is infinitely calling setContext. Reached Max limit: ${MAX_INFINITE_CYCLES_COUNT}.
Pass the "debugWisteria" query param to the url or use the storybook decorator in order to see the state updates.`;

const computeDerivedStates = ({ name, prevState, state, derivedStateSyncers, syncerStatus }) => {
    let lastCurrentState = state;
    let lastPrevState = prevState;
    let updates = [];

    const _setContext = (syncer) => (path, value) => {
        if (syncerStatus.done) {
            console.error(`derived state syncer: "${syncer.name}" should be synchronous. Got asynchronous update for path: "${path}" with the value: ${value}`);
            return;
        }

        if (isInDebugMode()) {
            traceUpdates({ name, path, value });
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
            setContext: _setContext(d)
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
