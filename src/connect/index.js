import React from 'react';
import { TreeContext } from '../ContextProvider';
import { useRootsContext, isObjectsIdentical } from '../utils';

export const CONNECT_WITHOUT_PROVIDER_ERROR_MSG = 'Are you trying to use ReactWisteria\'s connect() without a Provider?';

const connect = (useStateToProps) => (Component) => (ownProps) => {
    const memo = React.useRef({ props: {}, forceUpdate: 0 });
    const Context = React.useContext(TreeContext);

    if (!Context) {
        throw new Error(CONNECT_WITHOUT_PROVIDER_ERROR_MSG);
    }

    const { context, roots, setContext } = React.useContext(Context);
    const rootsValues = useRootsContext({ roots });
    const connectProps = useStateToProps({ context, setContext, roots: rootsValues }, ownProps);

    // Merge connect props with ownProps.
    const props = Object.assign({}, ownProps, connectProps);

    // Check if the props is not identical to the memomized props in order to force update
    // and to update the memo to recent props.
    if (!isObjectsIdentical(props, memo.current.props)) {
        memo.current.props = props;
        memo.current.forceUpdate++;
    }

    return React.useMemo(() =>
        React.createElement(Component, props), [memo.current.forceUpdate]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default connect;
