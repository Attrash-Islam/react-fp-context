const resolvePath = (unResolvedPath) =>
    unResolvedPath.split('.').map((p) => {
        const numericValue = parseInt(p, 10);
        if (!isNaN(numericValue)) { return numericValue; }

        return p;
    });

export default resolvePath;
