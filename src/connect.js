import React from 'react';
import sortBy from 'lodash/fp/sortBy';
import isFunction from 'lodash/fp/isFunction';
import identity from 'lodash/identity';
import { TreeContext } from './ContextProvider';

const connect = (mapStateToProps) => (Component) => () => {
    const Context = React.useContext(TreeContext);
    const { context, setContext } = React.useContext(Context);
    const props = mapStateToProps({ context, setContext });

    // to preserve stable sort.
    const propsKeys = sortBy(identity, Object.keys(props));

    // Execute lazy functions so they can use React.useCallback.
    const readyProps = propsKeys.reduce((acc, key) => {
        let newAcc;

        if (isFunction(props[key])) {
            newAcc = { ...acc, [key]: props[key]() };
        } else {
            newAcc = { ...acc, [key]: props[key] };
        }

        return newAcc;
    }, {});

    return React.useMemo(() => {
        return (<Component {...readyProps}/>);
    }, Object.values(readyProps)); // eslint-disable-line react-hooks/exhaustive-deps
};

export default connect;
