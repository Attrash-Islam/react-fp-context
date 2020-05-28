# React Wisteria

**react-wisteria** is a library that wraps the [React Context](https://reactjs.org/docs/context.html) with a functional API ([lodash/fp](https://gist.github.com/jfmengels/6b973b69c491375117dc) API) that makes it easier to work with state. It provides you with a single way to get your state and a single way to update it without the need for selectors, actions, reducers, types, etc.

## Background

The idea arose during a Hackathon in [Fiverr](https://github.com/fiverr) (the company I work for) where @igor-burshtein and I had to develop a full React project over the course of just 2 days. With such a fast turnaround, there was no time to set up the usual structure with actions, selectors, reducers, etc, but we still found ourselves in need of a quick & easy way to manage state. And, so, enter this library.

(BTW we won in the Hackathon!)

## Wisteria

Wisteria is a genus of flowering plants in the legume family, Fabaceae, that includes ten species of woody climbing bines that are native to China.

![image](https://user-images.githubusercontent.com/7091543/82143581-9e106600-984d-11ea-9baf-426d1adf4174.png)


## Installation

```js
npm i react-wisteria --save
```

## Options
| **Option** | **Description** | **Default Value** |
| --- | --- | --- |
| **Context** | A React Context as the state container | *Required*
| **initialPropsMapper?** | A mapper to map the Root Component props to a different state shape | *_.identity*
| **effects?** | A list of effects | *[]*
| **derivedStateSyncers?** | A list of derived state syncers | *[]*
| **debug?** | Debug mode to trace state updates in the console | *false*

## Important Notice

React Context and useContext is often used to avoid prop drilling, however it's known that there's a performance issue. When a context value is changed, **all components that useContext** will re-render even those who consume a slice of the context that didn't changed. (react-redux maintainers have talked about this pain [in a big discussion](https://github.com/reduxjs/react-redux/issues/1177)).

React team have talked about introducing something called [Context Selectors](https://github.com/reactjs/rfcs/pull/119) to solve this issue where component only re-render if and only if the selector returns a different value of that slice. Unfortunately, this is something that will need a refactor in React infrastructure and a multi-month project.

Once the Context Selector proposal land we'll add Hooks as another way to get/update the state as well as keeping the `connect` for backward compatibility.

## Usage

This library exposes a ContextProvider-like HOC that can be passed configurations & the Root component we have in our app.

As an example, let's use a standard Counter application where we can increment/decrement a counter whilst the value is being displayed.

![Apr-23-2020 11-48-06](https://user-images.githubusercontent.com/7091543/80079053-708b1200-8558-11ea-92d8-7756ac7d855e.gif)

This application has 3 components (`Counter`, `Display` and `Controls`) with `<Display/>` and `<Controls/>` being the children of `<Counter/>` (the Root component of our app).

First step is to create the context:

```js
import React from 'react';

const CounterContext = React.createContext();
export default CounterContext;
```

then we wrap our **Root component** (`<Counter/>`) like this:

```js
import { Provider } from 'react-wisteria';
import CounterContext from './CounterContext';

const Counter = () => {
    return (
        <div className="counter">
            <Display/>
            <Controls/>
        </div>
    );
};

export default Provider({
    Context: CounterContext
})(Counter);
```

As you can see, the context is being sent to Provider as part of its options.

Let us now render our Root component with its initial props (only the current counter value):

```js
export const CounterAt_0 = () => {
    return (<Counter count={0}/>);
};
```

The `<Display/>` component, which is a child of Root, can now reach the state easily.

```js
import { connect } from 'react-wisteria';

const Display = ({ count }) => {
    return (
        <div className="display">
            {count}
        </div>
    )
};

const useStateToProps = ({ context }) => ({
    count: context.count
});

export default connect(useStateToProps)(Display);
```

In our second child, `<Controls/>`, we want to update the state:

```js
import { connect } from 'react-wisteria';

const Controls = ({ onAddition, onDecrement }) => {
    return (
        <div className="controls">
            <div className="control" onClick={onAddition}>+</div>
            <div className="control" onClick={onDecrement}>-</div>
        </div>
    )
};

const useStateToProps = ({ context, setContext }) => {
    const { count } = context;

    // NOTE: All the inline functions MUST be wrapped with React.useCallback,
    // so we can take the benefit of `useMemo` that we use in order to not re-render unnecessary components.
    // without this, inline function will get reference on each render and our `connect` can't do the performance optimization
    const onAddition = React.useCallback(() => {
        setContext('count', count + 1);
    }, [setContext, count]);

    const onDecrement = React.useCallback(() => {
        setContext('count', count + 1);
    }, [setContext, count]);

    return {
        onAddition,
        onDecrement
    };
}

export default connect(useStateToProps)(Controls);
```

**Please note:** Multiple `setContext` calls will be batched based on React.setState batching whilst having only one render phase. Also, `setContext` is using the `lodash/fp#set` and `lodash/fp#update` methods under the hood which means that you can update nested paths and arrays easily.

```js
    // create complex path that do not exist.
    setContext('new.path.that.not.exist', 5);
    // { new: { path: { that: { not: { exist: 5 } } } } }

    // add new member to nested members array.
    setContext('add.member.to.members', (members) => members.concat({ name: 'test' }));
    // { add: { member: { to: { members: [{ name: 'myself' }, { name: 'test' }] } } } }
```

Up until now, we can see that the Context we passed into the options of the library has wrapped the values of the Root props and we can inspect the state by extracting `{ context }` and update it by extracting `{ setContext }`.

## initialPropsMapper Option

But what if we need to map the Root props to a different state structure? Easy. We just pass another option (`initialPropsMapper`):

```js
import { Provider } from 'react-wisteria';
import CounterContext from './CounterContext';

const Counter = () => {
    return (
        <div className="counter">
            <Display/>
            <Controls/>
        </div>
    );
};

export default Provider({
    Context: CounterContext,
    initialPropsMapper: ({ count }) => ({ mystate: { count }})
})(Counter);

```

If you console log your Context, you'll see that it now received the new shape.

(We can even compare objects by referental equality (===) in`lodash/fp` since updates break the reference in the changed object upto the upper parent reference, so we can distinguish changes in each level without having to do expensive diffing.)

## effects Option

There are two other major principles of `react-wisteria` - the handling of effects and derived states.

Let's say that we have an effect that pops an alert message (or triggers a service request) if a specific condition is met (e.g. once the counter hits 10). In order to do this, we need access to `context` and `setContext` in our `effects` which allows us to inspect and respond with updates:

```js
import React from 'react';

const useRequestReportOnTen = ({ context }) => {
    const { count } = context;

    React.useEffect(() => {
        if (count !== 10) { return; }

        alert('Got ten and sending to the backend!');
    }, [count]);
};

export default useRequestReportOnTen;
```

First we define our hook - then we inject it into our options:

```js
import { Provider } from 'react-wisteria';
import CounterContext from './CounterContext';

const Counter = () => {
    return (
        <div className="counter">
            <Display/>
            <Controls/>
        </div>
    );
};

export default Provider({
    Context: CounterContext,
    effects: [useRequestReportOnTen]
})(Counter);
```

(react-wisteria will inject `({ context, setContext })` into all these `effects` arrays.)

## derivedStateSyncers Option

The next thing is the syncing of derived states. But why would you need derived state handling different from `effects` when you can simply use `effects` and be done with it?

Below, we'll present the `effects` solution of syncing states. We want to color the even numbers with blue and the odd numbers with red in the `<Display/>` component. (You may think that it can be computed in the render phase, but we want to see it in another place, so we need it in the state).

![Apr-23-2020 13-20-45](https://user-images.githubusercontent.com/7091543/80088505-4855e000-8565-11ea-8a07-54d71ad6f255.gif)

Here's the implementation:

```js
import React from 'react';

const useBlueOnEvenRedOnOdd = ({ context, setContext }) => {
    const { count } = context;

    React.useEffect(() => {
        setContext('color', count % 2 === 0 ? 'blue' : 'red');
    }, [count, setContext]);
};

export default useBlueOnEvenRedOnOdd;
```

That's really nice! Whenever the count changes, we update the color in the `useEffect`. But there's something missing in this implementation. Let's build it in another way while consoling some logs:

```js
import React from 'react';

const useBlueOnEvenRedOnOdd = ({ context, setContext }) => {
    const { count, color } = context;

    React.useEffect(() => {
        console.log('unsynced state at some point in effects', { count, color });
        const newColor = count % 2 === 0 ? 'blue' : 'red';

        if (newColor === color) { return; }

        setContext('color', newColor);
    }, [count, setContext, color]);
};

export default useBlueOnEvenRedOnOdd;
```

If we run this and click **just once** on the control, we will get these logs:

![image](https://user-images.githubusercontent.com/7091543/80085215-96b4b000-8560-11ea-9aaf-d846616db610.png)

We're rendering the component twice since the `count` was changed and the sync only starts in `useEffect` (after the render phase). But the unnecessary re-render isn't the worst thing - at some point in our effect, we got a unsynced state of number 1 being blue first and after that the sync comes which means that we can't be sure that our state is actually synced in our effects.

How can we solve this situation? Since we're syncing states and we aren't using the Browser API (DOM Mutations or Async Operations), we have another option to pass for derivedState syncing called `derivedStateSyncers`. First we define a function:

```js
const blueOnEvenRedInOdd = ({ context, prevContext, setContext }) => {
    const { count } = context;
    const { count: prevCount } = prevContext;

    if (count === prevCount) { return; }

    setContext('color', count % 2 === 0 ? 'blue' : 'red');
};

export default blueOnEvenRedInOdd;
```

This function receives the context, setContext, prevContext (empty object {} in initial render) and updates the `color` based on changes in the `count`.

After that we define this syncer in our syncers list:

```js
import { Provider } from 'react-wisteria';
import CounterContext from './CounterContext';

const Counter = () => {
    return (
        <div className="counter">
            <Display/>
            <Controls/>
        </div>
    );
};

export default Provider({
    Context: CounterContext,
    derivedStateSyncers: [blueOnEvenRedInOdd]
})(Counter);
```

Now we get synced state at each point of time in our `effects` and we also have just one render (even with the two changes - `count` and `color`) thanks to React.setState batching.

Remember that you can always mix `effects` and `derivedStateSyncers` at the same time whenever it fits your purpose.

## debug Option

You can debug and trace your state updates by passing this option as `true`. Once you do you will see logs in the console that will make it easy to track the execution flow.

![image](https://user-images.githubusercontent.com/7091543/80594046-f6143380-8a2a-11ea-86ea-222984922cd7.png)
