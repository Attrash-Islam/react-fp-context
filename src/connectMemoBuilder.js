import sortBy from 'lodash/fp/sortBy';
import identity from 'lodash/fp/identity';
import isFunction from 'lodash/fp/isFunction';

const connectMemoBuilder = (connectProps, ownProps) => {
    // to preserve stable sort so useCallback and useMemo can work as expected.
    // useMemo deps sort is important to do the check and objects are not
    // guaranteed to be sorted as expected and because of that we use lodash `sortBy` stable sort.
    // and useCallback should execute as a hook in a stable order (the thing that hooks depends on).
    const sortByIdentity = sortBy(identity);
    const connectPropsKeys = sortByIdentity(Object.keys(connectProps));
    const ownPropsKeys = sortByIdentity(Object.keys(ownProps));

    let readyProps = {};
    let valuesToMemo = [];

    for (const oKey of ownPropsKeys) {
        const value = ownProps[oKey];
        readyProps[oKey] = value;
        valuesToMemo.push(value);
    }

    for (const oKey of connectPropsKeys) {
        const value = connectProps[oKey];
        // Execute lazy functions so they can use React.useCallback.
        readyProps[oKey] = isFunction(value) ? value() : value;
        valuesToMemo.push(readyProps[oKey]);
    }

    return {
        readyProps,
        valuesToMemo
    };
};

export default connectMemoBuilder;
