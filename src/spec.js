import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { connect, Provider } from '../dist';
import {
    INFINITE_SET_CONTEXT_IN_SYNCER_ERROR_MSG,
    CONNECT_WITHOUT_PROVIDER_ERROR_MSG
} from './utils/constants';

jest.spyOn(console, 'groupCollapsed').mockImplementation(() => null);
jest.spyOn(console, 'log').mockImplementation(() => null);
jest.spyOn(console, 'error').mockImplementation(() => null);
jest.spyOn(console, 'trace').mockImplementation(() => null);
jest.spyOn(console, 'groupEnd').mockImplementation(() => null);

let currentContext;
let currentSetContext;
let renderedTimes;

const setContext = ({ setContext }) => setContext;

const ContextInspector = ({ context, setContext }) => {
    currentContext = context;
    currentSetContext = setContext;
    renderedTimes++;

    return null;
};

const ConnectedContextInspector = connect((state) => ({ context: state }), { setContext })(ContextInspector);

const SomeApp = () => (
    <div>
        <ConnectedContextInspector/>
    </div>
);

const App = (options) => Provider(options)(SomeApp);

beforeEach(() => {
    currentContext = null;
    currentSetContext = null;
    renderedTimes = 0;
});

let container;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});
  
afterEach(() => {
    document.body.removeChild(container);
    container = null;
});

it('should build initial context value based on initial props', () => {
    const Spec = App();
    ReactDOM.render(<Spec count={1} name="islam"/>, container);

    expect(currentContext).toEqual({ count: 1, name: 'islam' });
});

it('should update context value when calling setContext with a value for a specific path', () => {
    const Spec = App();
    ReactDOM.render(<Spec count={1} name="islam"/>, container);

    act(() => {
        currentSetContext('count', 2);
    });

    expect(currentContext).toEqual({ count: 2, name: 'islam' });
});

it('should build context nested non-exists value when calling setContext non exist path', () => {
    const Spec = App();
    ReactDOM.render(<Spec count={1} name="islam"/>, container);

    act(() => {
        currentSetContext('path.not.found.here', 2);
    });

    expect(currentContext).toEqual({
        count: 1,
        path: { not: { found: { here: 2 } } },
        name: 'islam'
    });
});

it('should build context nested non-exists array value when calling setContext non exist path', () => {
    const Spec = App();
    ReactDOM.render(<Spec count={1} name="islam"/>, container);

    act(() => {
        currentSetContext('path.not.found.here.0', 1);
        currentSetContext('path.not.found.here.1', 2);
    });

    expect(currentContext).toEqual({
        count: 1,
        path: { not: { found: { here: [ 1,2 ] } } },
        name: 'islam'
    });
});

it('should update context value when calling functional setContext for a specific path', () => {
    const Spec = App();
    ReactDOM.render(<Spec count={1} name="islam"/>, container);

    act(() => {
        currentSetContext('count', (count) => count + 1);
    });

    expect(currentContext).toEqual({ count: 2, name: 'islam' });
});

it('should build initial context value based on initialPropsMapper if get passed', () => {
    const initialPropsMapper = ({ count, name }) => ({ namespace: { count, name, address: '' } });

    const Spec = App({ initialPropsMapper });
    ReactDOM.render(<Spec count={1} name="islam"/>, container);

    expect(currentContext).toEqual({ namespace: { count: 1, name: 'islam', address: '' } });
});

it('should derive state value if derivedStateSyncers get passed with one render cycle', () => {
    const blueColorOnEvenRedOnOdd = ({ context, prevContext, setContext }) => {
        if (context.count === prevContext.count) { return; }

        setContext('color', context.count % 2 === 0 ? 'blue' : 'red');
    };

    const Spec = App({ derivedStateSyncers: [blueColorOnEvenRedOnOdd] });
    ReactDOM.render(<Spec count={0}/>, container);
    expect(renderedTimes).toBe(1);
    expect(currentContext).toEqual({ count: 0, color: 'blue' });

    act(() => {
        currentSetContext('count', 3);
    });

    expect(renderedTimes).toBe(2);
    expect(currentContext).toEqual({ count: 3, color: 'red' });
});

it('should throw error if derivedStateSyncers is calling setContext infinitely', () => {
    const infiniteSyncer = ({ context, setContext }) => {
        // We always call setContext without being wrapped in conditions.
        setContext('color', context.count % 2 === 0 ? 'blue' : 'red');
    };

    const Spec = App({ derivedStateSyncers: [infiniteSyncer] });

    expect(() => {
        ReactDOM.render(<Spec count={0}/>, container);
    }).toThrow(INFINITE_SET_CONTEXT_IN_SYNCER_ERROR_MSG);
});

it('should execute effects when get passed on each update', () => {
    const fun = jest.fn();

    const Spec = App({ effects: [fun] });
    ReactDOM.render(<Spec count={0}/>, container);
    expect(fun).toHaveBeenCalledWith({ context: currentContext, setContext: currentSetContext });

    act(() => {
        currentSetContext('count', 4);
    });

    expect(fun).toHaveBeenCalledWith({ context: currentContext, setContext: currentSetContext });
});

const args = ['%c react-wisteria::setContext Path "count"', 'color:#1dbf73'];

it('should not console when debug mode is OFF', () => {
    const Spec = App({ debug: false });
    ReactDOM.render(<Spec count={0}/>, container);

    act(() => {
        currentSetContext('count', 4);
    });

    expect(console.groupCollapsed).not.toHaveBeenCalledWith(...args);
    expect(console.log).not.toHaveBeenCalledWith({ value: 4 });
    expect(console.trace).not.toHaveBeenCalled();
    expect(console.groupEnd).not.toHaveBeenCalled();
});

it('should console in debug mode', () => {
    const Spec = App({ debug: true });
    ReactDOM.render(<Spec count={0}/>, container);

    act(() => {
        currentSetContext('count', 4);
    });

    expect(console.groupCollapsed).toHaveBeenCalledWith(...args);
    expect(console.log).toHaveBeenCalledWith({ value: 4 });
    expect(console.trace).toHaveBeenCalled();
    expect(console.groupEnd).toHaveBeenCalled();
});

it('should not re-render when connect state slice do not change', () => {
    const ContextInspector = ({ count, setContext }) => {
        currentSetContext = setContext;
        renderedTimes++;
    
        return count;
    };

    const ConnectedContextInspector = connect(({ count }) => ({ count }), { setContext })(ContextInspector);
    const Spec = Provider()(ConnectedContextInspector);

    ReactDOM.render(<Spec count={0}/>, container);
    expect(renderedTimes).toBe(1);
    act(() => {
        currentSetContext('count', (count) => count + 1);
    });

    expect(renderedTimes).toBe(2);

    act(() => {
        currentSetContext('color', 'purple');
    });

    expect(renderedTimes).toBe(2); // Do not re-render
});

it('should throw error when using connect without Provider', () => {
    const ContextInspector = ({ count, setContext }) => {
        currentSetContext = setContext;
        renderedTimes++;
    
        return count;
    };

    const ConnectedContextInspector = connect(({ count }) => ({ count }), { setContext })(ContextInspector);

    expect(() => {
        ReactDOM.render(<ConnectedContextInspector count={0}/>, container);
    }).toThrow(CONNECT_WITHOUT_PROVIDER_ERROR_MSG);
});
