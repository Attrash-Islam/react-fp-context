import React, { useContext, useCallback, unstable_useMutableSource } from 'react';
import { TreeContext } from '../ContextProvider';
import isPropsIdentical from '../utils/isPropsIdentical';
import { CONNECT_WITHOUT_PROVIDER_ERROR_MSG } from '../utils/constants';

const subscribe = (store, callback) => store.subscribe(callback);

const connect = (mapStateToProps, mapDispatchToProps = {}) => (Component) => (ownProps) => {
    const memo = React.useRef({ mappedPropsSnapshot: {}, dispatchSnapshot: {} });
    const mutableSource = useContext(TreeContext);

    if (!mutableSource) {
        throw new Error(CONNECT_WITHOUT_PROVIDER_ERROR_MSG);
    }

    const getSnapshot = useCallback((store) => {
        const mappedPropsSnapshot = mapStateToProps ? mapStateToProps(store.getState(), ownProps) : {};

        // If the mapped props got changed then we override the memoized reference and return it
        // in order to notify the snapshots subscribers about the change.
        if (!isPropsIdentical(mappedPropsSnapshot, memo.current.mappedPropsSnapshot)) {
            memo.current.mappedPropsSnapshot = mappedPropsSnapshot;
        }

        const { getState: getContext, setContext } = store;

        for (let key of Object.keys(mapDispatchToProps)) {
            memo.current.dispatchSnapshot[key] = mapDispatchToProps[key]({ getContext, setContext });
        }

        return memo.current.mappedPropsSnapshot;
    }, [ownProps]);

    const mappedProps = unstable_useMutableSource(mutableSource, getSnapshot, subscribe);

    const props = Object.assign({}, ownProps, mappedProps, memo.current.dispatchSnapshot);

    return (
        <Component {...props}/>
    );
};

export default connect;
