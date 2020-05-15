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

const Context = React.createContext();

const ContextInspector = ({ context, setContext }) => {
    currentContext = context;
    currentSetContext = setContext;

    return null;
};

const ConnectedContextInspector = connect(identity)(ContextInspector);

const App = (options) => ReactFpContextProvider(options)(() => <ConnectedContextInspector/>);

beforeEach(() => {
    currentContext = null;
    currentSetContext = null;
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
