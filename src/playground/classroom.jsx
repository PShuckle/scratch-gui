import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/classroom-gui.jsx';

const WrappedClassroom = compose(
    AppStateHOC,
    HashParserHOC
)(GUI);

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

ReactDOM.render(<WrappedClassroom />, appTarget);