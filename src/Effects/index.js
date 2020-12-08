import { useEffect, useRef } from 'react';
import connect from '../connect';

const Effects = ({ name, effects, setContext, context }) => {
    effects.forEach((effect) => effect({ context: context, setContext: setContext }));
    const warnedAboutMissingDevToolRef = useRef();

    useEffect(() => {
        if (typeof window !== 'undefined' && window._REACT_CONTEXT_DEVTOOL) {
            window._REACT_CONTEXT_DEVTOOL({ id: name, displayName: name, values: context });
        } else if (!warnedAboutMissingDevToolRef.current) {
            warnedAboutMissingDevToolRef.current = true;
            console.log('%cConsider installing "React Context DevTool" in order to inspect the Wisteria state', 'color:#1dbf73');
        }
    }, [context, name]);

    return null;
};

const mapStateToProps = (state) => ({ context: state });

const setContext = ({ setContext }) => setContext;

export default connect(mapStateToProps, { setContext })(Effects);
