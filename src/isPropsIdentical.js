const isPropsIdentical = (props, otherProps) => {
    const propsKeys = Object.keys(props);
    const otherPropsKeys = Object.keys(otherProps);

    if (propsKeys.length !== otherPropsKeys.length) { return false; }

    for (const k of propsKeys) {
        if (props[k] !== otherProps[k]) { return false; }
    }

    return true;
};

export default isPropsIdentical;
