import React, { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import identity from 'lodash/fp/identity';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import connect, { CONNECT_WITHOUT_PROVIDER_ERROR_MSG } from './connect';
import ReactWisteriaProvider from '.';

configure({ adapter: new Adapter() });

jest.spyOn(console, 'groupCollapsed');
jest.spyOn(console, 'log');
jest.spyOn(console, 'trace');
jest.spyOn(console, 'groupEnd');

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

const ConnectedContextInspector = connect(identity)(ContextInspector);

const App = (options) => ReactWisteriaProvider(options)(ConnectedContextInspector);

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
    const Spec = ReactWisteriaProvider({ Context })(ConnectedContextInspector);

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

it('should not re-render when some App parent of the provider renders if the props of the Provider did\'n changed', () => {
    const Child = () => {
        const { context, setContext } = React.useContext(Context);
        ContextInspector({ context, setContext });

        return null;
    };

    const App = ReactWisteriaProvider({ Context })(() => (
        <Child/>
    ));

    const AppSomeParent = () => {
        const [, setState] = useState(0);
        const forceUpdate = () => setState((x) => x + 1);

        return (
            <>
                <App count={1}/>
                <div className="force-update" onClick={forceUpdate}/>
            </>
        );
    }

    const wrapper = mount(<AppSomeParent count={0}/>);
    expect(renderedTimes).toBe(1);

    wrapper.find('.force-update').simulate('click');
    expect(renderedTimes).toBe(1);
});
