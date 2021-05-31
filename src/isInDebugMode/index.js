import { get } from 'golden-path';

let cache = null;

const isInDebugMode = () => {
    if (cache !== null) {
        return cache;
    }

    if (typeof window === 'undefined') {
        cache = false;
        return cache;
    }

    if (window.isWisteriaDebugModeForced) {
        cache = true;
        return cache;
    }

    const search = get('location.search', window) || '';
    cache = search.includes('debugWisteria');
    return cache;
};

export default isInDebugMode;
