
export default function javascriptToXml(javascript) {
    const topBlock = eval(javascript);
    const xml = document.createElement('xml');
    xml.appendChild(topBlock);
    return xml;
}

Element.prototype.next = function (nextBlock) {
    const next = document.createElement('next');
    this.appendChild(next);
    next.appendChild(nextBlock);
    return this;
}

function createBlock(type, inputs, shadow) {
    var block;

    if (shadow) {
        block = document.createElement('shadow');
    } else {
        block = document.createElement('block');
    }

    block.setAttribute('type', type);

    const values = inputs.values;
    const fields = inputs.fields;

    if (values) {
        Object.keys(values).forEach((valueName) => {
            const value = document.createElement('value');
            block.appendChild(value);
            value.setAttribute('name', valueName);
            value.appendChild(values[valueName]);
        });
    }

    if (fields) {
        Object.keys(fields).forEach((fieldName) => {
            const field = document.createElement('field');
            block.appendChild(field);
            field.setAttribute('name', fieldName);
            field.textContent = fields[fieldName];
        });
    }

    return block;
}

function math_number(num) {
    return createBlock('math_number', {
        fields: {
            NUM: num
        }
    }, true);
}

function motion_movesteps(steps) {
    return createBlock('motion_movesteps', {
        values: {
            STEPS: steps
        }
    });
}


