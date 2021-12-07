import React from 'react';
import ReactDOM from 'react-dom';

import GUI from '../containers/classroom-gui.jsx';

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

ReactDOM.render(<GUI />, appTarget);