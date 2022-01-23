let topLevelBlocks = [];

export default function javascriptToXml(javascript) {
    Element.prototype.next = function (nextBlock) {
        if (nextBlock) {
            const next = document.createElement('next');
            this.appendChild(next);
            next.appendChild(nextBlock);
            return this;
        }
        return this;
    }

    const topBlock = eval(javascript);
    const xml = document.createElement('xml');

    topLevelBlocks.forEach(block => {
        xml.appendChild(block);
    })

    console.log(xml);

    return xml;
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
            if (values[valueName]) {
                value.appendChild(values[valueName]);
            }
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

function sound_playuntildone(sound_menu) {
    return createBlock('sound_playuntildone', {
        values: {
            SOUND_MENU: sound_menu
        }
    })
}

function sound_play(sound_menu) {
    return createBlock('sound_play', {
        values: {
            SOUND_MENU: sound_menu
        }
    })
}

function sound_sounds_menu(sound_menu) {
    return createBlock('sound_sounds_menu', {
        fields: {
            SOUND_MENU: sound_menu
        }
    }, true)
}

function sound_stopallsounds() {
    return createBlock('sound_stopallsounds', {
        
    })
}

function sound_changeeffectby(effect, value) {
    return createBlock('sound_changeeffectby', {
        values: {
            VALUE: value
        },
        fields: {
            EFFECT: effect
        }
    })
}

function sound_seteffectto(effect, value) {
    return createBlock('sound_seteffectto', {
        values: {
            VALUE: value
        },
        fields: {
            EFFECT: effect
        }
    })
}

function sound_cleareffects() {
    return createBlock('sound_cleareffects', {
        
    })
}

function sound_changevolumeby(volume) {
    return createBlock('sound_changevolumeby', {
        values: {
            VOLUME: volume
        }
    })
}

function sound_setvolumeto(volume) {
    return createBlock('sound_setvolumeto', {
        values: {
            VOLUME: volume
        }
    })
}

function sound_volume() {
    return createBlock('sound_volume', {
        
    })
}

function event_whenflagclicked() {
    const block = createBlock('event_whenflagclicked', {
        
    })

    topLevelBlocks.push(block);
    return block;
}

function event_whenkeypressed(key_option) {
    const block = createBlock('event_whenkeypressed', {
        fields: {
            KEY_OPTION: key_option
        }
    })

    topLevelBlocks.push(block);
    return block;
}

function event_whenthisspriteclicked() {
    const block = createBlock('event_whenthisspriteclicked', {
        
    })

    topLevelBlocks.push(block);
    return block;
}

function event_whenbackdropswitchesto(backdrop) {
    const block = createBlock('event_whenbackdropswitchesto', {
        fields: {
            BACKDROP: backdrop
        }
    })

    topLevelBlocks.push(block);
    return block;
}

function event_whengreaterthan(whengreaterthanmenu, value) {
    const block = createBlock('event_whengreaterthan', {
        fields: {
            WHENGREATERTHANMENU: whengreaterthanmenu
        },
        values: {
            VALUE: value
        }
    })

    topLevelBlocks.push(block);
    return block;
}

function event_whenbroadcastreceived(broadcast_option) {
    const block = createBlock('event_whenbroadcastreceived', {
        fields: {
            BROADCAST_OPTION: broadcast_option
        }
    })

    topLevelBlocks.push(block);
    return block;
}

function event_broadcast(broadcast_input) {
    return createBlock('event_broadcast', {
        values: {
            BROADCAST_INPUT: broadcast_input
        }
    })
}

function event_broadcastandwait(broadcast_input) {
    return createBlock('event_broadcastandwait', {
        values: {
            BROADCAST_INPUT: broadcast_input
        }
    })
}

function event_broadcast_menu(broadcast_option) {
    return createBlock('event_broadcast_menu', {
        fields: {
            BROADCAST_OPTION: broadcast_option
        }
    })
}

function control_wait(duration) {
    return createBlock('control_wait', {
        values: {
            DURATION: duration
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

function control_if(condition, substack) {
    return createBlock('control_if', {
        values: {
            CONDITION: condition
        },
        statements: {
            SUBSTACK: substack
        }
    })
}

function control_if_else(condition, substack, substack2) {
    return createBlock('control_if_else', {
        values: {
            CONDITION: condition
        },
        statements: {
            SUBSTACK: substack,
            SUBSTACK2: substack2
        }
    })
}

function control_wait_until(condition) {
    return createBlock('control_wait_until', {
        values: {
            CONDITION: condition
        }
    })
}

function control_repeat_until(condition, substack) {
    return createBlock('control_repeat_until', {
        values: {
            CONDITION: condition
        },
        statements: {
            SUBSTACK: substack
        }
    })
}

function control_while(condition, substack) {
    return createBlock('control_while', {
        values: {
            CONDITION: condition
        },
        statements: {
            SUBSTACK: substack
        }
    })
}

function control_stop(stop_option) {
    return createBlock('control_stop', {
        fields: {
            STOP_OPTION: stop_option
        }
    })
}

function control_start_as_clone() {
    const block = createBlock('control_start_as_clone', {

    })

    topLevelBlocks.push(block);
    return block;
}

function control_create_clone_of(clone_option) {
    return createBlock('control_create_clone_of', {
        values: {
            CLONE_OPTION: clone_option
        }
    })
}

function control_create_clone_of_menu(clone_option) {
    return createBlock('control_create_clone_of_menu', {
        fields: {
            CLONE_OPTION: clone_option
        }
    }, true)
}

function control_delete_this_clone() {
    return createBlock('control_delete_this_clone', {

    })
}

function sensing_touchingobject(touchingobjectmenu) {
    return createBlock('sensing_touchingobject', {
        values: {
            TOUCHINGOBJECTMENU: touchingobjectmenu
        }
    })
}

function sensing_touchingobjectmenu(touchingobjectmenu) {
    return createBlock('sensing_touchingobjectmenu', {
        fields: {
            TOUCHINGOBJECTMENU: touchingobjectmenu
        }
    }, true)
}

function sensing_touchingcolor(color) {
    return createBlock('sensing_touchingcolor', {
        values: {
            COLOR: color
        }
    })
}

function sensing_coloristouchingcolor(color, color2) {
    return createBlock('sensing_coloristouchingcolor', {
        values: {
            COLOR: color,
            COLOR2: color2
        }
    })
}

function colour_picker(colour) {
    return createBlock('colour_picker', {
        fields: {
            COLOUR: colour
        }
    }, true)
}

function sensing_distanceto(distancetomenu) {
    return createBlock('sensing_distanceto', {
        values: {
            DISTANCETOMENU: distancetomenu
        }
    })
}

function sensing_distancetomenu(distancetomenu) {
    return createBlock('sensing_distancetomenu', {
        fields: {
            DISTANCETOMENU: distancetomenu
        }
    }, true)
}

function sensing_askandwait(question) {
    return createBlock('sensing_askandwait', {
        values: {
            QUESTION: question
        }
    })
}

function sensing_answer() {
    return createBlock('sensing_answer', {
        
    })
}

function sensing_keypressed(key_option) {
    return createBlock('sensing_keypressed', {
        values: {
            KEY_OPTION: key_option
        }
    })
}

function sensing_keyoptions(key_option) {
    return createBlock('sensing_keyoptions', {
        fields: {
            KEY_OPTION: key_option
        }
    })
}

function sensing_mousedown() {
    return createBlock('sensing_mousedown', {

    })
}

function sensing_mousex() {
    return createBlock('sensing_mousex', {
        
    })
}

function sensing_mousey() {
    return createBlock('sensing_mousey', {
        
    })
}

function sensing_setdragmode(drag_mode) {
    return createBlock('sensing_setdragmode', {
        fields: {
            DRAG_MODE: drag_mode
        }
    })
}

function sensing_loudness() {
    return createBlock('sensing_loudness', {
        
    })
}

function sensing_timer() {
    return createBlock('sensing_timer', {
        
    })
}

function sensing_resettimer() {
    return createBlock('sensing_resettimer', {
        
    })
}

function sensing_of(property, object) {
    return createBlock('sensing_of', {
        values: {
            OBJECT: object
        },
        fields: {
            PROPERTY: property
        }
    })
}

function sensing_of_object_menu(object) {
    return createBlock('sensing_of_object_menu', {
        fields: {
            OBJECT: object
        }
    })
}

function sensing_current(currentmenu) {
    return createBlock('sensing_current', {
        fields: {
            CURRENTMENU: currentmenu
        }
    })
}

function sensing_dayssince2000() {
    return createBlock('sensing_dayssince2000', {
        
    })
}

function sensing_username() {
    return createBlock('sensing_username', {
        
    })
}

function operator_add(num1, num2) {
    return arithmeticOperator('operator_add', num1, num2);
}

function operator_subtract(num1, num2) {
    return arithmeticOperator('operator_subtract', num1, num2);
}

function operator_multiply(num1, num2) {
    return arithmeticOperator('operator_multiply', num1, num2);
}

function operator_divide(num1, num2) {
    return arithmeticOperator('operator_divide', num1, num2);
}

function arithmeticOperator(type, num1, num2) {
    return createBlock(type, {
        values: {
            NUM1: num1,
            NUM2: num2
        }
    })
}

function operator_random(from, to) {
    return createBlock('operator_random', {
        values: {
            FROM: from,
            TO: to
        }
    })
}

function operator_gt(operand1, operand2) {
    return logicalOperator('operator_gt', operand1, operand2);
}

function operator_lt(operand1, operand2) {
    return logicalOperator('operator_lt', operand1, operand2);
}

function operator_equals(operand1, operand2) {
    return logicalOperator('operator_equals', operand1, operand2);
}

function operator_and(operand1, operand2) {
    return logicalOperator('operator_and', operand1, operand2);
}

function operator_or(operand1, operand2) {
    return logicalOperator('operator_or', operand1, operand2);
}

function logicalOperator(type, operand1, operand2) {
    return createBlock(type, {
        values: {
            OPERAND1: operand1,
            OPERAND2: operand2
        }
    })
}

function operator_not(operand) {
    return createBlock('operator_not', {
        values: {
            OPERAND: operand
        }
    })
}

function operator_join(string1, string2) {
    return createBlock('operator_join', {
        values: {
            STRING1: string1,
            STRING2: string2
        }
    })
}

function operator_letter_of(letter, string) {
    return createBlock('operator_letter_of', {
        values: {
            LETTER: letter,
            STRING: string
        }
    })
}

function operator_length(string) {
    return createBlock('operator_length', {
        values: {
            STRING: string
        }
    })
}

function operator_contains(string1, string2) {
    return createBlock('operator_contains', {
        values: {
            STRING1: string1,
            STRING2: string2
        }
    })
}

function operator_mod(num1, num2) {
    return arithmeticOperator('operator_mod', num1, num2);
}

function operator_round(num) {
    return createBlock('operator_round', {
        values: {
            NUM: num
        }
    })
}

function operator_mathop(operator, num) {
    return createBlock('operator_mathop', {
        values: {
            NUM: num
        },
        fields: {
            OPERATOR: operator
        }
    })
}

function data_setvariableto(variable, value) {
    return createBlock('data_setvariableto', {
        values: {
            VALUE: value
        },
        fields: {
            VARIABLE: variable
        }
    })
}

function data_changevariableby(variable, value) {
    return createBlock('data_changevariableby', {
        values: {
            VALUE: value
        },
        fields: {
            VARIABLE: variable
        }
    })
}

function data_showvariable(variable) {
    return createBlock('data_showvariable', {
        fields: {
            VARIABLE: variable
        }
    })
}

function data_hidevariable(variable) {
    return createBlock('data_hidevariable', {
        fields: {
            VARIABLE: variable
        }
    })
}

function data_variable(variable) {
    return createBlock('data_variable', {
        fields: {
            VARIABLE: variable
        }
    })
}