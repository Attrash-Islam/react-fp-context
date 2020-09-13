export const MAX_INFINITE_CYCLES_COUNT = 100;
export const INFINITE_SET_CONTEXT_IN_SYNCER_ERROR_MSG = `One of your derivedStateSyncers is infinitely calling setContext. Reached Max limit: ${MAX_INFINITE_CYCLES_COUNT}.
Pass the "debug" option to the Provider in order to see the state updates.`;
export const CONNECT_WITHOUT_PROVIDER_ERROR_MSG = 'Are you trying to use ReactWisteria\'s connect() without a Provider?';
