import React from 'react';
import { TreeContext } from './ContextProvider';
import isPropsIdentical from './isPropsIdentical';

export const CONNECT_WITHOUT_PROVIDER_ERROR_MSG = 'Are you trying to use ReactFpContext\'s connect() without a Provider?';

const connect = (useStateToProps) => (Component) => (ownProps) => {
    const memo = React.useRef({ props: {}, forceUpdate: 0 });
    const Context = React.useContext(TreeContext);

    if (!Context) {
        throw new Error(CONNECT_WITHOUT_PROVIDER_ERROR_MSG);
    }

    const { context, setContext } = React.useContext(Context);
    const connectProps = useStateToProps({ context, setContext }, ownProps);

    // Merge connect props with ownProps.
    const props = Object.assign({}, ownProps, connectProps);

    // Check if the props is not identical to the memomized props in order to force update
    // and to update the memo to recent props.
    if (!isPropsIdentical(props, memo.current.props)) {
        memo.current.props = props;
        memo.current.forceUpdate++;
    }

    return React.useMemo(() =>
        React.createElement(Component, props), [memo.current.forceUpdate]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default connect;
