import sortBy from 'lodash/fp/sortBy';
import identity from 'lodash/fp/identity';
import isFunction from 'lodash/fp/isFunction';

const buildProps = (connectProps, ownProps) => {
    // to preserve stable sort so useCallback can work as expected.
    // objects are not guaranteed to be sorted as expected and because of that we use lodash `sortBy` stable sort.
    // and useCallback should execute as a hook in a stable order (the thing that hooks depends on).
    const connectPropsKeys = sortBy(identity, Object.keys(connectProps));
    const ownPropsKeys = Object.keys(ownProps);

    let props = {};

    for (const oKey of ownPropsKeys) {
        const value = ownProps[oKey];
        props[oKey] = value;
    }

    for (const oKey of connectPropsKeys) {
        const value = connectProps[oKey];
        // Execute lazy functions so they can use React.useCallback.
        props[oKey] = isFunction(value) ? value() : value;
    }

    return props;
};

export default buildProps;
