import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import io from "socket.io-client";

const Dropdown = props => {

    return (
        <select id = 'dropdown'></select>
    );
}

Dropdown.propTypes = {
    names: PropTypes.arrayOf(PropTypes.string)
};

export default Dropdown;