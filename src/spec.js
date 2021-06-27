import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { connect, Provider } from '../dist';
import { CONNECT_WITHOUT_PROVIDER_ERROR_MSG } from './connect';
import { INFINITE_SET_CONTEXT_IN_SYNCER_ERROR_MSG } from './computeDerivedStates';

configure({ adapter: new Adapter() });

jest.spyOn(console, 'groupCollapsed').mockImplementation(() => null);
jest.spyOn(console, 'log').mockImplementation(() => null);
jest.spyOn(console, 'error').mockImplementation(() => null);
jest.spyOn(console, 'trace').mockImplementation(() => null);
jest.spyOn(console, 'groupEnd').mockImplementation(() => null);

let currentContext;
let currentSetContext;
let renderedTimes;

const Context = React.createContext();

const ContextInspector = ({ context, setContext }) => {
    currentContext = context;
    currentSetContext = setContext;
    renderedTimes++;

    return null;
};

const ConnectedContextInspector = connect((x) => x)(ContextInspector);

const App = (options) => Provider(options)(ConnectedContextInspector);

beforeEach(() => {
    currentContext = null;
    currentSetContext = null;
    renderedTimes = 0;
});

it('should build initial context value based on initial props', () => {
    const Spec = App({ Context });
    mount(<Spec count={1} name="islam"/>);

    expect(currentContext).toEqual({ count: 1, name: 'islam' });
});

it('should update context value when calling setContext with a value for a specific path', () => {
    const Spec = App({ Context });
    mount(<Spec count={1} name="islam"/>);

    act(() => {
        currentSetContext('count', 2);
    });

    expect(currentContext).toEqual({ count: 2, name: 'islam' });
});

it('should build context nested non-exists value when calling setContext non exist path', () => {
    const Spec = App({ Context });
    mount(<Spec count={1} name="islam"/>);

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
    const Spec = App({ Context });
    mount(<Spec count={1} name="islam"/>);

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
    const Spec = App({ Context });
    mount(<Spec count={1} name="islam"/>);

    act(() => {
        currentSetContext('count', (count) => count + 1);
    });

    expect(currentContext).toEqual({ count: 2, name: 'islam' });
});

it('should build initial context value based on initialPropsMapper if get passed', () => {
    const initialPropsMapper = ({ count, name }) => ({ namespace: { count, name, address: '' } });

    const Spec = App({ Context, initialPropsMapper });
    mount(<Spec count={1} name="islam"/>);

    expect(currentContext).toEqual({ namespace: { count: 1, name: 'islam', address: '' } });
});

it('should derive state value if derivedStateSyncers get passed with one render cycle', () => {
    const blueColorOnEvenRedOnOdd = ({ context, prevContext, setContext }) => {
        if (context.count === prevContext.count) { return; }

        setContext('color', context.count % 2 === 0 ? 'blue' : 'red');
    };

    const Spec = App({ Context, derivedStateSyncers: [blueColorOnEvenRedOnOdd] });
    mount(<Spec count={0}/>);
    expect(renderedTimes).toBe(1);
    expect(currentContext).toEqual({ count: 0, color: 'blue' });

    act(() => {
        currentSetContext('count', 3);
    });

    expect(renderedTimes).toBe(2);
    expect(currentContext).toEqual({ count: 3, color: 'red' });
});

it('should derive state value if derivedStateSyncers get passed with one render cycle based on "syncerDeps"', () => {
    const blueColorOnEvenRedOnOdd = ({ context, setContext }) => {
        setContext('color', context.count % 2 === 0 ? 'blue' : 'red');
    };

    blueColorOnEvenRedOnOdd.syncerDeps = ['count'];

    const Spec = App({ Context, derivedStateSyncers: [blueColorOnEvenRedOnOdd] });
    mount(<Spec count={0}/>);
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

    const Spec = App({ Context, derivedStateSyncers: [infiniteSyncer] });

    expect(() => {
        mount(<Spec count={0}/>);
    }).toThrow(INFINITE_SET_CONTEXT_IN_SYNCER_ERROR_MSG);
});

it('should console error if derivedStateSyncers is asynchronous', (done) => {
    const asyncSyncer = ({ context, prevContext, setContext }) => {
        if (context.count === prevContext.count) { return; }

        const color  = context.count % 2 === 0 ? 'blue' : 'red';

        setTimeout(() => {
            console.log('async');
            setContext('color', color);
        });
    };

    const Spec = App({ Context, derivedStateSyncers: [asyncSyncer] });
    mount(<Spec count={0}/>);

    setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('derived state syncer: "asyncSyncer" should be synchronous. Got asynchronous update for path: "color" with the value: blue');
        done();
    }, 100);
});

it('should execute effects when get passed on each update', () => {
    const fun = jest.fn();

    const Spec = App({ Context, effects: [fun] });
    mount(<Spec count={0}/>);
    expect(fun).toHaveBeenCalledWith({ context: currentContext, setContext: currentSetContext });

    act(() => {
        currentSetContext('count', 4);
    });

    expect(fun).toHaveBeenCalledWith({ context: currentContext, setContext: currentSetContext });
});

it('should not re-render when connect state slice do not change', () => {
    const ContextInspector = ({ count, setContext }) => {
        currentSetContext = setContext;
        renderedTimes++;
    
        return count;
    };

    const ConnectedContextInspector = connect(({ context: { count }, setContext }) => ({ count, setContext }))(ContextInspector);
    const Spec = Provider({ Context })(ConnectedContextInspector);

    mount(<Spec count={0}/>);
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

    const ConnectedContextInspector = connect(({ context: { count }, setContext }) => ({ count, setContext }))(ContextInspector);

    expect(() => {
        mount(<ConnectedContextInspector count={0}/>);
    }).toThrow(CONNECT_WITHOUT_PROVIDER_ERROR_MSG);
});
