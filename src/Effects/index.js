import connect from '../connect';

const Effects = ({ effects, setContext, context }) => {
    effects.forEach((effect) => effect({ context: context, setContext: setContext }))

    return null;
};

const mapStateToProps = (state) => ({ context: state });

const setContext = ({ setContext }) => setContext;

export default connect(mapStateToProps, { setContext })(Effects);
