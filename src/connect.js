import React from 'react';
import { TreeContext } from './ContextProvider';
// import buildProps from './buildProps';
import isPropsIdentical from './isPropsIdentical';

const connect = (useStateToProps) => (Component) => (ownProps) => {
    const memo = React.useRef({ props: {}, forceUpdate: 0 });
    const Context = React.useContext(TreeContext);
    const { context, setContext } = React.useContext(Context);
    const connectProps = useStateToProps({ context, setContext }, ownProps);

    // Merge connect props with ownProps and execute connect functions in sorted order for useCallback hooks.
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
