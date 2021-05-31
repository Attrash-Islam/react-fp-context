import { get } from 'golden-path';

const isInDebugMode = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    if (window.isWisteriaDebugModeForced) {
        return true;
    }

    const search = get('location.search', window) || '';
    return search.includes('debugWisteria');
};

export default isInDebugMode;
