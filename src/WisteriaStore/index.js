import updater from '../updater';

class WisteriaStore {
    constructor({ initialPropsMapper }) {
        this.initialPropsMapper = initialPropsMapper;
        this.subscribes = [];
        this.context = {};
    }

    init = (props) => {
        // We want to call always the `initialPropsMapper` because it can contain useContext in consumer's codebase.
        const transformedProps = this.initialPropsMapper(props);
        this.context = transformedProps;
    }

    setContext = (path, value) => {
        this.context = updater(path, value, this.context);
        this.subscribes.forEach((s) => s && s());
    }

    getState = () => {
        return this.context;
    }

    subscribe = (callback) => {
        this.subscribes.push(callback);
        const index = this.subscribes.length - 1;

        return () => {
            this.subscribes[index] = null;
        };
    }
}

export default WisteriaStore;
