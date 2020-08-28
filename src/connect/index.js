import React, { useContext, unstable_useMutableSource } from 'react';
import { TreeContext } from '../ContextProvider';
import isPropsIdentical from '../isPropsIdentical';

export const CONNECT_WITHOUT_PROVIDER_ERROR_MSG = 'Are you trying to use ReactWisteria\'s connect() without a Provider?';

const connect = (mapStateToProps, mapDispatchToProps = {}) => (Component) => (ownProps) => {
    const memo = React.useRef({ mappedPropsSnapshot: {}, dispatchSnapshot: {} });
    const Context = useContext(TreeContext);

    if (!Context) {
        throw new Error(CONNECT_WITHOUT_PROVIDER_ERROR_MSG);
    }

    const mutableSource = useContext(Context);
    const subscribe = (store, callback) => store.subscribe(callback);

    const getSnapshot = (store) => {
        const mappedPropsSnapshot = mapStateToProps ? mapStateToProps(store.getState(), ownProps) : {};
        if (!isPropsIdentical(mappedPropsSnapshot, memo.current.mappedPropsSnapshot)) {
            memo.current.mappedPropsSnapshot = mappedPropsSnapshot;
        }

        const { getState: getContext, setContext } = store;

        for (let key of Object.keys(mapDispatchToProps)) {
            memo.current.dispatchSnapshot[key] = mapDispatchToProps[key]({ getContext, setContext });
        }

        return memo.current.mappedPropsSnapshot;
    };

    const mappedProps = unstable_useMutableSource(mutableSource, getSnapshot, subscribe);

    const props = Object.assign({}, ownProps, mappedProps, memo.current.dispatchSnapshot);

    return (
        <Component {...props}/>
    );
};

export default connect;
