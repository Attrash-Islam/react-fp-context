import { useContext } from 'react';

export const useRootsContext = ({ roots }) => {
    // We sort object keys so hooks run in stable order.
    const rootsKeys = Object.keys(roots);
    let rootsValues = {};

    // Since roots is a stable object then we can disable the rules-of-hooks below.
    for (let i = 0; i < rootsKeys.length; i++) {
        const rootKey = rootsKeys[i];
        // eslint-disable-next-line react-hooks/rules-of-hooks
        rootsValues[rootKey] = useContext(roots[rootKey]);
    }

    return rootsValues;
}

export const isObjectsIdentical = (props, otherProps) => {
    const propsKeys = Object.keys(props);
    const otherPropsKeys = Object.keys(otherProps);

    if (propsKeys.length !== otherPropsKeys.length) { return false; }

    for (const k of propsKeys) {
        if (props[k] !== otherProps[k]) { return false; }
    }

    return true;
};
