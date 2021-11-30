import React from 'react';
import Dropdown from '../components/dropdown/dropdown.jsx';

import Box from '../components/box/box.jsx';
import ScreenCaptureOutput from '../containers/screen-capture-output.jsx';

class ClassroomGUI extends React.Component {
    render() {
        return (
            <Box>
                <Dropdown></Dropdown>
                <ScreenCaptureOutput></ScreenCaptureOutput>
            </Box>
        );
    }
}

export default ClassroomGUI;