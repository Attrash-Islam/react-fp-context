import React from 'react';
import difference from 'lodash/fp/difference';
import { TreeContext } from './ContextProvider';
import connectMemoBuilder from './connectMemoBuilder';

const connect = (mapStateToProps) => (Component) => (ownProps) => {
    const memo = React.useRef({ lastValues: [], forceUpdate: 0 });
    const Context = React.useContext(TreeContext);
    const { context, setContext } = React.useContext(Context);
    const connectProps = mapStateToProps({ context, setContext }, ownProps);

    const {
        readyProps,
        valuesToMemo
    } = connectMemoBuilder(connectProps, ownProps);

    if(difference(valuesToMemo, memo.current.lastValues).length !== 0) {
        memo.current.forceUpdate++;
    }

    memo.current.lastValues = valuesToMemo;
    
    return React.useMemo(() =>
        React.createElement(Component, readyProps), [memo.current.forceUpdate]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default connect;
