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

console.log(currentSetContext);
