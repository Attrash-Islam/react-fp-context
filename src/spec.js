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

let parentContext;
let parentSetContext;
let currentContext;
let currentSetContext;
let renderedTimes;

const Context = React.createContext();
const ParentContext = React.createContext();

const ContextInspector = ({ context, setContext, roots: { ParentContext } }) => {
    currentContext = context;
    currentSetContext = setContext;
    parentContext = ParentContext && ParentContext.context;
    parentSetContext = ParentContext && ParentContext.setContext;
    renderedTimes++;

    return null;
};

const ConnectedContextInspector = connect((x) => x)(ContextInspector);

const App = (options) => Provider(options)(ConnectedContextInspector);

beforeEach(() => {
    currentContext = null;
    currentSetContext = null;
    parentContext = null;
    parentSetContext = null;
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
    expect(fun).toHaveBeenCalledWith({ context: currentContext, setContext: currentSetContext, roots: {} });

    act(() => {
        currentSetContext('count', 4);
    });

    expect(fun).toHaveBeenCalledWith({ context: currentContext, setContext: currentSetContext, roots: {} });
});

describe('debug mode', () => {
    const args = ['%c react-wisteria::setContext Path "count"', 'color:#1dbf73'];

    it('should not console when debug mode is OFF', () => {
        const Spec = App({ Context, debug: false });
        mount(<Spec count={0}/>);
    
        act(() => {
            currentSetContext('count', 4);
        });
    
        expect(console.groupCollapsed).not.toHaveBeenCalledWith(...args);
        expect(console.log).not.toHaveBeenCalledWith({ value: 4 });
        expect(console.trace).not.toHaveBeenCalled();
        expect(console.groupEnd).not.toHaveBeenCalled();
    });
    
    it('should console in debug mode', () => {
        const Spec = App({ Context, debug: true });
        mount(<Spec count={0}/>);
    
        act(() => {
            currentSetContext('count', 4);
        });
    
        expect(console.groupCollapsed).toHaveBeenCalledWith(...args);
        expect(console.log).toHaveBeenCalledWith({ value: 4 });
        expect(console.trace).toHaveBeenCalled();
        expect(console.groupEnd).toHaveBeenCalled();
    });
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

it('should show parent context as undefined when not being passed through `roots` option', () => {
    const Spec = App({ Context });
    mount(<Spec count={1} name="islam"/>);

    expect(parentContext).toBeUndefined();
    expect(parentSetContext).toBeUndefined();
});

describe('Roots Feature', () => {
    let ChildApp;
    let ParentApp;

    beforeEach(() => {
        ChildApp = App({ Context, roots: { ParentContext } });
        ParentApp = Provider({ Context: ParentContext })(() => <ChildApp count={1} name="islam"/>);
    
        mount(<ParentApp name="parent" isParent={true}/>);
    });

    it('should show parent context as expected when being passed through `roots` option', () => {
        expect(currentContext).toEqual({ count: 1, name: 'islam' });
        expect(parentContext).toEqual({ name: 'parent', isParent: true });
    });
    
    it('should update parent context as expected from child scope', () => {
        expect(parentContext).toEqual({ name: 'parent', isParent: true });
    
        act(() => {
            parentSetContext('name', 'parentGoUpdated');
        });
    
        expect(parentContext).toEqual({ name: 'parentGoUpdated', isParent: true });
    
    });
    
    it('should execute effects when parent updates', () => {
        const fun = jest.fn();
        const ChildApp = App({ Context, roots: { ParentContext }, effects: [fun] });
        const ParentApp = Provider({ Context: ParentContext })(() => <ChildApp count={1} name="islam"/>);
    
        mount(<ParentApp name="parent" isParent={true}/>);

        expect(fun).toHaveBeenCalledTimes(2);

        expect(fun).toHaveBeenCalledWith({
            context: { count: 1, name: 'islam' },
            setContext: currentSetContext,
            roots: {
                ParentContext: {
                    context: { name: 'parent', isParent: true },
                    roots: {},
                    setContext: parentSetContext
                }
            }
        });
    
        act(() => {
            parentSetContext('name', 'parentGoUpdated');
        });
    
        expect(fun).toHaveBeenCalledTimes(3);

        expect(fun).toHaveBeenCalledWith({
            context: { count: 1, name: 'islam' },
            setContext: currentSetContext,
            roots: {
                ParentContext: {
                    context: { name: 'parentGoUpdated', isParent: true },
                    roots: {},
                    setContext: parentSetContext
                }
            }
        });
    });
})
