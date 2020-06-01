import { assocPath, path } from 'ramda';
import resolvePath from '../resolvePath';

const updater = (unReolsvedPath, value, state) => {
    const resolvedPath = resolvePath(unReolsvedPath);
    let newVal = value;

    if (typeof value === 'function') {
        newVal = value(
            path(resolvedPath, state)
        );
    }

    return assocPath(resolvedPath, newVal, state);
};

export default updater;
