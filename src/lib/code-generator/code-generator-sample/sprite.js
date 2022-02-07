import clone from 'clone';
import readline from 'readline';

class Sprite {
    constructor(broadcaster, targetManager, globalVariableManager, params) {
        this.broadcaster = broadcaster;
        this.targetManager = targetManager;
        this.globalVariableManager = globalVariableManager;
        this.name = params.name;
        this.x = params.x;
        this.y = params.y;
        this.direction = params.direction;
        this.rotationStyle = params.rotationStyle;
        this.speechBubbleMessage = null;
        this.thoughtBubbleMessage = null;
        this.visible = params.visible;
        this.costume = params.costume;
        this.costumes = params.costumes;
        this.size = params.size;
        this.effects = params.effects;
        this.drawableID = params.drawableID;
        this.volume = params.volume;
        this.dragMode = params.dragMode;
        this.timer = new Date();

        this.clones = [this];

        this.stage = this.targetManager.getTargetByName('Stage');
    }

    // pause execution of a thread for a given number of seconds
    delay(secs) {
        const msecs = secs * 1000;
        const date = Date.now();
        let currentDate = Date.now();
        while (currentDate - date < msecs) {
            currentDate = Date.now();
        }
    }

    radToDeg(radians) {
        return 180 * radians / Math.PI;
    }

    degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    math_number(num) {
        return parseInt(num);
    }

    math_whole_number(num) {
        return parseInt(num);
    }

    math_positive_number(num) {
        return parseInt(num);
    }

    math_integer(num) {
        return parseInt(num);
    }

    math_angle(num) {
        return parseInt(num);
    }

    text(text) {
        return text;
    }

    motion_movesteps(steps) {
        const radians = degToRad(90 - this.direction);
        const dx = steps * Math.cos(radians);
        const dy = steps * Math.sin(radians);
        this.x += dx;
        this.y += dy;
    }

    motion_turnright(degrees) {
        this.direction += degrees;
    }

    motion_turnleft(degrees) {
        this.direction -= degrees;
    }

    motion_gotoxy(x, y) {
        this.x = x;
        this.y = y;
    }

    motion_goto(to) {
        //TODO
        if (to == '_random_') {

        } else if (to == '_mouse_') {

        } else {
            const target = this.targetManager[to];
            this.x = target.x;
            this.y = target.y;
        }
    }

    motion_goto_menu(to) {
        return to;
    }

    motion_glidesecstoxy(secs, x, y) {
        //TODO make it glide properly
        this.delay(secs).then(() => {
            this.x = x;
            this.y = y;
        })
    }

    motion_glideto(secs, to) {
        //TODO
        this.delay(secs).then(motion_goto(to));
    }

    motion_glideto_menu(to) {
        return to;
    }

    motion_pointindirection(direction) {
        this.direction = direction;
    }

    motion_pointtowards(towards) {
        //TODO
        if (to == '_random_') {

        } else if (to == '_mouse_') {

        } else {
            const target = this.targetManager[towards];
            var targetX = target.x;
            var targetY = target.y;

            const dx = targetX - this.x;
            const dy = targetY - this.y;
            this.direction = 90 - this.radToDeg(Math.atan2(dy, dx));
        }
    }

    motion_pointtowards_menu(towards) {
        return towards;
    }

    motion_changexby(dx) {
        this.x += dx;
    }

    motion_setx(x) {
        this.x = x;
    }

    motion_changeyby(dy) {
        this.y += dy;
    }

    motion_sety(y) {
        this.y = y;
    }

    motion_ifonedgebounce() {
        //TODO
    }

    motion_setrotationstyle(style) {
        this.rotationStyle = style;
    }

    motion_xposition() {
        return this.x;
    }

    motion_yposition() {
        return this.y;
    }

    motion_direction() {
        return this.direction;
    }

    looks_sayforsecs(message, secs) {
        this.thoughtBubbleMessage = null;
        this.speechBubbleMessage = message;
        this.delay(secs).then(this.speechBubbleMessage = null);
    }

    looks_say(message) {
        this.thoughtBubbleMessage = null;
        this.speechBubbleMessage = message;
    }

    looks_thinkforsecs(message, secs) {
        this.speechBubbleMessage = null;
        this.thoughtBubbleMessage = message;
        this.delay(secs).then(this.thoughtBubbleMessage = null);
    }

    looks_think(message) {
        this.speechBubbleMessage = null;
        this.thoughtBubbleMessage = message;
    }

    looks_show() {
        this.visible = true;
    }

    looks_hide() {
        this.visible = false;
    }

    looks_switchcostumeto(costume) {
        this.costume = this.costumes.indexOf(costume);
    }

    looks_costume(costume) {
        return costume;
    }

    looks_nextcostume() {
        this.costume++;
        if (this.costume >= this.costumes.length) {
            this.costume = 0;
        }
    }

    looks_switchbackdropto(backdrop) {
        this.stage.looks_switchcostumeto(backdrop);
    }

    looks_backdrops(backdrop) {
        return backdrop;
    }

    looks_nextbackdrop() {
        this.stage.looks_nextcostume();
    }

    looks_changesizeby(change) {
        this.size += change;
    }

    looks_setsizeto(size) {
        this.size = size;
    }

    looks_changeeffectby(effect, change) {
        this.effects[effect.toLowerCase()] += change;
    }

    looks_seteffectto(effect, value) {
        this.effects[effect.toLowerCase()] = value;
    }

    looks_clearGraphicEffects() {
        Object.keys(this.effects).forEach((effect) => {
            this.effects[effect] = 0;
        })
    }

    looks_show() {
        this.visible = true;
    }

    looks_hide() {
        this.visible = false;
    }

    looks_gotofrontback(front_back) {
        var drawOrderIndex = this.globalVariableManager.drawList.indexOf(this.drawableID);
        this.globalVariableManager.drawList.splice(drawOrderIndex, 1);
        if (front_back == 'front') {
            // insert at position 1
            this.globalVariableManager.splice(1, 0, this.drawableID);
        } else if (front_back == 'back') {
            this.globalVariableManager.push(this.drawableID);
        } else {
            throw 'Invalid option passed to looks_gotofrontback: ' + front_back;
        }
    }

    looks_goforwardbackwardlayers(forward_backward, num) {
        var drawOrderIndex = this.globalVariableManager.drawList.indexOf(this.drawableID);
        const drawList = this.globalVariableManager.drawList;
        for (let i = 0; i < num; i++) {
            if (forward_backward == 'forward') {
                if (drawOrderIndex == drawList.length) {
                    return;
                }
                [drawList[drawOrderIndex],
                    drawList[drawOrderIndex] + 1
                ] = [drawList[drawOrderIndex] + 1, drawList[drawOrderIndex]]
                drawOrderIndex++;
            } else if (forward_backward == 'backward') {
                if (drawOrderIndex == 1) {
                    return;
                }
                [drawList[drawOrderIndex],
                    drawList[drawOrderIndex] - 1
                ] = [drawList[drawOrderIndex] - 1, drawList[drawOrderIndex]]
                drawOrderIndex--;
            } else {
                throw 'Invalid option passed to looks_goforwardbackwardlayers: ' +
                    forward_backward;
            }
        }
    }

    looks_costumenumbername(number_name) {
        if (number_name == 'number') {
            return this.costume;
        } else if (number_name == 'name') {
            return this.costumes[this.costume];
        } else {
            throw 'Invalid option passed to looks_costumenumbername: ' + number_name;
        }
    }

    looks_backdropnumbername(number_name) {
        if (number_name == 'number') {
            return this.stage.costume;
        } else if (number_name == 'name') {
            return this.stage.costumes[this.stage.costume];
        } else {
            throw 'Invalid option passed to looks_backdropnumbername: ' + number_name;
        }
    }

    looks_size() {
        return this.size;
    }

    sound_playuntildone(sound_menu) {
        //TODO
    }

    sound_play(sound_menu) {
        //TODO
    }

    sound_sounds_menu(sound_menu) {
        return sound_menu;
    }

    sound_stopallsounds() {
        //TODO
    }

    sound_changeeffectby(effect, value) {
        //TODO
    }

    sound_seteffectto(effect, value) {
        //TODO
    }

    sound_cleareffects() {
        //TODO
    }

    sound_changevolumeby(volume) {
        this.volume += volume;
    }

    sound_setvolumeto(volume) {
        this.volume = volume;
    }

    sound_volume() {
        return this.volume;
    }

    event_broadcast(broadcast_input) {
        this.broadcaster.broadcast(broadcast_input);
    }

    event_broadcastandwait(broadcast_input) {
        //TODO
        this.broadcaster.broadcast(broadcast_input);
    }

    event_broadcast_menu(broadcast_option) {
        return broadcast_option;
    }

    control_wait(duration) {
        delay(duration);
    }

    control_repeat(times, substack) {
        for (let i = 0; i < times; i++) {
            substack();
        }
    }

    control_forever(substack) {
        while (true) {
            substack();
        }
    }

    control_if(condition, substack) {
        if (condition) {
            substack();
        }
    }

    control_if(condition, substack, substack2) {
        if (condition) {
            substack();
        } else {
            substack2();
        }
    }

    control_if_else(condition, substack, substack2) {
        if (condition) {
            substack();
        } else {
            substack2();
        }
    }

    control_wait_until(condition) {
        while (!condition) {
            //pass
        }
    }

    control_repeat_until(condition, substack) {
        while (!condition) {
            substack();
        }
    }

    control_while(condition, substack) {
        while (condition) {
            substack();
        }
    }

    // this function does not correspond to a block, rather it is generated when the user has
    // a control block with a blank conditional statement
    default_condition() {
        return false;
    }

    control_stop(stop_option) {
        if (stop_option == 'all') {
            // TODO
        } else if (stop_option == 'this script') {
            throw 'thread stopped by control_stop block'
        } else if (stop_option == 'other scripts in sprite') {
            // TODO
        }
    }

    control_create_clone_of(clone_option) {
        if (clone_option == 'myself') {
            var targetToClone = this;
        } else {
            var targetToClone = this.targetManager.getTargetByName(clone_option)
        }

        var clone = clone(targetToClone);

        for (i = 0; i < targetToClone.clones.length; i++) {
            targetToClone.clones[i].clones.push[clone];
        }

        clone.control_start_as_clone();
    }

    control_create_clone_of_menu(clone_option) {
        return clone_option;
    }

    control_delete_this_clone() {
        // remove all references to other objects so that the clone can no longer affect the 
        // rest of the program
        for (i = 0; i < this.clones.length; i++) {
            this.clones[i].clones.splice(this.clones[i].clones.indexOf(this), 1);
        }

        this.targetManager = null;
        this.broadcaster = null;
        this.globalVariableManager = null;
        this.clones = null;
        this.stage = null;
    }

    sensing_touchingobject(touchingobjectmenu) {
        // TODO
        return false;
    }

    sensing_touchingobjectmenu(touchingobjectmenu) {
        return touchingobjectmenu;
    }

    sensing_touchingcolor(color) {
        // TODO
        return false;
    }

    sensing_coloristouchingcolor(color1, color2) {
        // TODO
        return false;
    }

    colour_picker(colour) {
        return colour;
    }

    sensing_distanceto(distancetomenu) {
        if (distancetomenu == 'mouse-pointer') {
            // TODO
        } else {
            const target = this.targetManager.getTargetByName(distancetomenu);
            const dx = this.x - target.x;
            const dy = this.y - target.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            return distance;
        }
    }

    sensing_distancetomenu(distancetomenu) {
        return distancetomenu;
    }

    sensing_askandwait(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question, function (answer) {
            this.globalVariableManager.setVariable('answer', answer);
        });
    }

    sensing_answer() {
        return this.globalVariableManager.answer;
    }

    sensing_keypressed(key_option) {
        // TODO
        // no document to detect keypresses?
        return false;
    }

    sensing_keyoptions(key_option) {
        return key_option;
    }

    sensing_mousedown() {
        // TODO
        return false;
    }

    sensing_mousex() {
        // TODO
        return 0;
    }

    sensing_mousey() {
        // TODO
        return 0;
    }

    sensing_setdragmode(drag_mode) {
        this.dragMode = drag_mode;
    }

    sensing_loudness() {
        // TODO
        return 0;
    }

    sensing_timer() {
        return new Date().getTime() - this.timer.getTime();
    }

    sensing_resettimer() {
        this.timer = new Date();
    }

    sensing_of(property, object) {
        if (property == 'backdrop #') {
            return this.stage.costume;
        } else if (property == 'backdrop name') {
            return this.stage.costumes[costume];
        } else if (property == 'volume') {
            const target = this.targetManager.getTargetByName(object);
            return target.volume;
        } else {
            const target = this.targetManager.getTargetByName(object);
            return target[object];
        }
    }

    sensing_of_object_menu(object) {
        return object;
    }

    sensing_current(currentmenu) {
        const date = new Date();
        switch (currentmenu) {
            case 'year':
                return date.getFullYear();
            case 'month':
                return date.getMonth() + 1; // getMonth is zero-based
            case 'date':
                return date.getDate();
            case 'dayofweek':
                return date.getDay() + 1; // getDay is zero-based, Sun=0
            case 'hour':
                return date.getHours();
            case 'minute':
                return date.getMinutes();
            case 'second':
                return date.getSeconds();
        }
    }

    sensing_dayssince2000() {
        const currentDate = new Date();
        const startDate = new Date(2000, 0, 1); // 1 jan 2000

        const msecSince2000 = currentDate.getTime() - startDate.getTime();
        const daysSince2000 = msecSince2000 / (1000 * 60 * 60 * 24);
    }

    sensing_username() {
        // TODO
    }

    operator_add(num1, num2) {
        return num1 + num2;
    }

    operator_subtract(num1, num2) {
        return num1 - num2;
    }

    operator_multiply(num1, num2) {
        return num1 * num2;
    }

    operator_divide(num1, num2) {
        return num1 / num2;
    }

    operator_random(from, to) {
        var low = from;
        var high = to;
        if (to < from) {
            low = to;
            high = from;
        }
        if (from.isInteger() && to.isInteger()) {
            return low + Math.floor(Math.random() * ((high + 1) - low));
        }
        return (Math.random() * (high - low)) + low;
    }

    operator_gt(operand1, operand2) {
        return operand1 > operand2;
    }

    operator_lt(operand1, operand2) {
        return operand1 < operand2;
    }

    operator_equals(operand1, operand2) {
        return operand1 == operand2;
    }

    operator_and(operand1, operand2) {
        return operand1 && operand2;
    }

    operator_or(operand1, operand2) {
        return operand1 || operand2;
    }

    operator_not(operand) {
        return !operand;
    }

    operator_join(string1, string2) {
        return string1 + string2;
    }

    operator_letter_of(letter, string) {
        return string.charAt(letter);
    }

    operator_length(string) {
        return string.length;
    }

    operator_contains(string1, string2) {
        return string1.toLowerCase().includes(string2.toLowerCase());
    }

    operator_mod(num1, num2) {
        return num1 % num2;
    }

    operator_round(num) {
        return Math.round(num);
    }

    operator_mathop(operator, num) {
        switch (operator) {
            case 'abs':
                return Math.abs(num);
            case 'floor':
                return Math.floor(num);
            case 'ceiling':
                return Math.ceil(num);
            case 'sqrt':
                return Math.sqrt(num);
            case 'sin':
                return parseFloat(Math.sin((Math.PI * num) / 180).toFixed(10));
            case 'cos':
                return parseFloat(Math.cos((Math.PI * num) / 180).toFixed(10));
            case 'tan':
                return MathUtil.tan(num);
            case 'asin':
                return (Math.asin(num) * 180) / Math.PI;
            case 'acos':
                return (Math.acos(num) * 180) / Math.PI;
            case 'atan':
                return (Math.atan(num) * 180) / Math.PI;
            case 'ln':
                return Math.log(num);
            case 'log':
                return Math.log(num) / Math.LN10;
            case 'e ^':
                return Math.exp(num);
            case '10 ^':
                return Math.pow(10, num);
        }
    }

}

export default Sprite;
