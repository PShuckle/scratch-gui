export default function javascriptToXml(javascript) {
    const topBlock = eval(javascript);
    const xml = document.createElement('xml');
    xml.appendChild(topBlock);

    console.log(xml);

    return xml;
}

Element.prototype.next = function (nextBlock) {
    if (nextBlock) {
        const next = document.createElement('next');
        this.appendChild(next);
        next.appendChild(nextBlock);
        return this;
    }
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
    const statements = inputs.statements;

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

    if (statements) {
        Object.keys(statements).forEach((statementName) => {
            const statement = document.createElement('statement');
            block.appendChild(statement);
            statement.setAttribute('name', statementName);
            const statementBlock = statements[statementName]();
            statement.appendChild(statementBlock);
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

function math_integer(num) {
    return createBlock('math_integer', {
        fields: {
            NUM: num
        }
    }, true);
}

function text(text) {
    return createBlock('text', {
        fields: {
            TEXT: text
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

function motion_turnright(degrees) {
    return turn('motion_turnright', degrees);
}

function motion_turnleft(degrees) {
    return turn('motion_turnleft', degrees);
}

function turn(type, degrees) {
    return createBlock(type, {
        values: {
            DEGREES: degrees
        }
    })
}

function motion_gotoxy(x, y) {
    return createBlock('motion_gotoxy', {
        values: {
            X: x,
            Y: y
        }
    })
}

function motion_goto(to) {
    return createBlock('motion_goto', {
        values: {
            TO: to
        }
    })
}

function motion_goto_menu(to) {
    return createBlock('motion_goto_menu', {
        fields: {
            TO: to
        }
    }, true);
}

function motion_glidesecstoxy(secs, x, y) {
    return createBlock('motion_glidesecstoxy', {
        values: {
            SECS: secs,
            X: x,
            Y: y
        }
    })
}

function motion_glideto(secs, to) {
    return createBlock('motion_glideto', {
        values: {
            SECS: secs,
            TO: to
        }
    })
}

function motion_glideto_menu(to) {
    return createBlock('motion_glideto_menu', {
        fields: {
            TO: to
        }
    }, true);
}

function motion_pointindirection(direction) {
    return createBlock('motion_pointindirection', {
        values: {
            DIRECTION: direction
        }
    })
}

function motion_pointtowards(towards) {
    return createBlock('motion_pointtowards', {
        values: {
            TOWARDS: towards
        }
    })
}

function motion_pointtowards_menu(towards) {
    return createBlock('motion_pointtowards_menu', {
        fields: {
            TOWARDS: towards
        }
    }, true);
}

function motion_changexby(dx) {
    return createBlock('motion_changexby', {
        values: {
            DX: dx
        }
    })
}

function motion_setx(x) {
    return createBlock('motion_setx', {
        values: {
            X: x
        }
    })
}

function motion_changeyby(dy) {
    return createBlock('motion_changeyby', {
        values: {
            DY: dy
        }
    })
}

function motion_sety(y) {
    return createBlock('motion_sety', {
        values: {
            Y: y
        }
    })
}

function motion_ifonedgebounce() {
    return createBlock('motion_ifonedgebounce', {

    })
}

function motion_setrotationstyle(style) {
    return createBlock('motion_setrotationstyle', {
        fields: {
            STYLE: style
        }
    })
}

function motion_xposition() {
    return createBlock('motion_xposition', {

    })
}

function motion_yposition() {
    return createBlock('motion_yposition', {

    })
}

function motion_direction() {
    return createBlock('motion_direction', {
        
    })
}

function looks_sayforsecs(message, secs) {
    return displayMessageForSecs('looks_sayforsecs', message, secs);
}

function looks_say(message) {
    return displayMessage('looks_say', message);
}

function looks_thinkforsecs(message, secs) {
    return displayMessageForSecs('looks_thinkforsecs', message, secs);
}

function looks_think(message) {
    return displayMessage('looks_think', message);
}

function displayMessageForSecs(type, message, secs) {
    return createBlock(type, {
        values: {
            MESSAGE: message,
            SECS: secs
        }
    })
}

function displayMessage(type, message) {
    return createBlock(type, {
        values: {
            MESSAGE: message,
        }
    })
}

function looks_switchcostumeto(costume) {
    return createBlock('looks_switchcostumeto', {
        values: {
            COSTUME: costume
        }
    })
}

function looks_costume(costume) {
    return createBlock('looks_costume', {
        fields: {
            COSTUME: costume
        }
    }, true)
}

function looks_nextcostume() {
    return createBlock('looks_nextcostume', {
        
    })
}

function looks_switchbackdropto(backdrop) {
    return createBlock('looks_switchbackdropto', {
        values: {
            BACKDROP: backdrop
        }
    })
}

function looks_backdrops(backdrop) {
    return createBlock('looks_backdrops', {
        fields: {
            BACKDROP: backdrop
        }
    }, true)
}

function looks_nextbackdrop() {
    return createBlock('looks_nextcostume', {
        
    })
}

function looks_changesizeby(change) {
    return createBlock('looks_changesizeby', {
        values: {
            CHANGE: change
        }
    })
}

function looks_setsizeto(size) {
    return createBlock('looks_setsizeto', {
        values: {
            SIZE: size
        }
    })
}

function looks_changeeffectby(effect, change) {
    return createBlock('looks_changeeffectby', {
        values: {
            CHANGE: change
        },
        fields: {
            EFFECT: effect
        }
    })
}

function looks_seteffectto(effect, value) {
    return createBlock('looks_seteffectto', {
        values: {
            VALUE: value
        },
        fields: {
            EFFECT: effect
        }
    })
}

function looks_cleargraphiceffects() {
    return createBlock('looks_cleargraphiceffects', {
        
    })
}

function looks_show() {
    return createBlock('looks_show', {
        
    })
}

function looks_hide() {
    return createBlock('looks_hide', {
        
    })
}

function looks_gotofrontback(front_back) {
    return createBlock('looks_gotofrontback', {
        fields: {
            FRONT_BACK: front_back
        }
    })
}

function looks_goforwardbackwardlayers(forward_backward, num) {
    return createBlock('looks_goforwardbackwardlayers', {
        values: {
            NUM: num
        },
        fields: {
            FORWARD_BACKWARD: forward_backward
        }
    })
}

function looks_costumenumbername(number_name) {
    return numberNameBlock('looks_costumenumbername', number_name);
}

function looks_backdropnumbername(number_name) {
    return numberNameBlock('looks_backdropnumbername', number_name);
}

function numberNameBlock(type, number_name) {
    return createBlock(type, {
        fields: {
            NUMBER_NAME: number_name
        }
    })
}

function looks_size() {
    return createBlock('looks_size', {
        
    })
}

function operator_add(num1, num2) {
    return createBlock('operator_add', {
        values: {
            NUM1: num1,
            NUM2: num2
        }
    })
}

function control_repeat(times, substack) {
    return createBlock('control_repeat', {
        values: {
            TIMES: times
        },
        statements: {
            SUBSTACK: substack
        }
    });
}

function control_forever(substack) {
    return createBlock('control_forever', {
        statements: {
            SUBSTACK: substack
        }
    })
}