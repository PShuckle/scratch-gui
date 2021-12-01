import React from 'react';
import PropTypes from 'prop-types';


const Dropdown = props => {
    const {
        names
    } = props;

    console.log(names);

    // const nameOptions = names.map(name => <option key={name} value={name}>{name}</option>);

    return (
        <select>
            {/* {nameOptions}; */}
        </select>
    );
}

Dropdown.propTypes = {
    names: PropTypes.arrayOf(PropTypes.string)
};

export default Dropdown;