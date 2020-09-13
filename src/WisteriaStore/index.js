import updater from '../utils/updater';
import { MAX_INFINITE_CYCLES_COUNT, INFINITE_SET_CONTEXT_IN_SYNCER_ERROR_MSG } from '../utils/constants';
import traceUpdates from '../utils/traceUpdates';

class WisteriaStore {
    constructor({ initialPropsMapper, derivedStateSyncers, debug }) {
        this.initialPropsMapper = initialPropsMapper;
        this.derivedStateSyncers = derivedStateSyncers;
        this.debug = debug;
        this.subscribes = [];
        this.context = {};
    }

    init = (props) => {
        // We want to call always the `initialPropsMapper` because it can contain useContext in consumer's codebase.
        const initialState = this.initialPropsMapper(props);
        this.context = this.computeDerivedStates({ prevState: {}, state: initialState });
    }

    setContext = (path, value) => {
        if (this.debug) {
            traceUpdates({ path, value });
        }

        const newState = updater(path, value, this.context);
        const stateAfterDerived = this.computeDerivedStates({ prevState: this.context, state: newState });

        this.context = stateAfterDerived;
        this.subscribes.forEach((s) => s && s());
    }

    getState = () => {
        return this.context;
    }

    computeDerivedStates = ({ prevState, state }) => {
        let lastCurrentState = state;
        let lastPrevState = prevState;
        let updates = [];
    
        const _setContext = (path, value) => {
            if (this.debug) {
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
    
            this.derivedStateSyncers.forEach((d) => d({
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
    }

    subscribe = (callback) => {
        this.subscribes.push(callback);
        const index = this.subscribes.length - 1;

        return () => {
            this.subscribes[index] = null;
        };
    }
}

export default WisteriaStore;
