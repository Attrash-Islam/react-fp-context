import React from 'react';
import { mount } from 'enzyme';
import identity from 'lodash/fp/identity';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import connect from './connect';
import ReactFpContextProvider from '.';

configure({ adapter: new Adapter() });

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

const App = (options) => ReactFpContextProvider(options)(() => <ConnectedContextInspector/>);

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

    currentSetContext('count', 2);

    expect(currentContext).toEqual({ count: 2, name: 'islam' });
});

it('should update context value when calling functional setContext for a specific path', () => {
    const Spec = App({ Context });
    mount(<Spec count={1} name="islam"/>);

    currentSetContext('count', (count) => count + 1);

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

    currentSetContext('count', 3);
    expect(renderedTimes).toBe(2);
    expect(currentContext).toEqual({ count: 3, color: 'red' });
});
