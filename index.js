// based on hyper-john music playing functionality
// https://github.com/cwright017/hyper-john

const AUDIO_SRC = require('./cringe.js');

exports.middleware = (store) => (next) => (action) => {
    if ('SESSION_ADD_DATA' === action.type) {
        const { data } = action;
        if (/(cringe: command not found)|(command not found: cringe)/.test(data)) {
            store.dispatch({
                type: 'CRINGE'
            });
        } else {
            next(action);
        }
    } else {
        next(action);
    }
};

exports.reduceUI = (state, action) => {
    switch (action.type) {
        case 'CRINGE':
            return state.set('cringe', true);
        default: 
            return state.set('cringe', false);
    }
    return state;
};

exports.mapTermsState = (state, map) => {
    return Object.assign(map, {
        cringe: state.ui.cringe
    });
};

const passProps = (uid, parentProps, props) => {
    return Object.assign(props, {
        cringe: parentProps.cringe
    });
}

exports.getTermGroupProps = passProps;
exports.getTermProps = passProps;

module.exports.decorateTerm = (Term, {React, notify}) => {
    return class extends React.Component {
        constructor (props, context) {
            super(props, context)
            this._onTerminal = this._onTerminal.bind(this);            
            this._audio = new Audio(AUDIO_SRC);
            this._playAudio = this._playAudio.bind(this);
            this._audio.onended = this._onAudioEnded.bind(this);
        }

        _playAudio() {
            this._audio.play();
        }

        _resetAudio() {
            this._audio.pause();
            this._audio.currentTime = 0;                    
        }

        _onAudioEnded () {
            this._resetAudio();                            
        }

        _onTerminal (term) {   
            if (this.props.onTerminal) this.props.onTerminal(term);           
        }

        componentWillReceiveProps (next) {            
            if (next.cringe && !this.props.cringe) {
                notify('CRINGE!!!');
                this._playAudio();
            }
        }

        componentWillUnmount () {       
            this._resetAudio();            
        }

        render () {
            return React.createElement(Term, Object.assign({}, this.props, {
                onTerminal: this._onTerminal
            }));
        }
    }
}