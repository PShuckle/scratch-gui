import JSZip from 'jszip';

export default function createProject(files) {
    var zip = new JSZip();

    Object.keys(files).forEach((name) => {
        var fileCode = createFileSkeleton(name);
        var generatedJsCode = files[name];

        var codeSnippets = generatedJsCode.split('\n\n');

        codeSnippets.forEach(snippet => {
            if (snippet.includes('event_whenflagclicked')) {
                // remove first line of code from snippet 
                // - this is the code representing the hat block
                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replaceAll('event_whenflagclicked() {',
                    'event_whenflagclicked() {\n' + trimmedSnippet + '\n');
            }
            if (snippet.includes('event_whenkeypressed')) {
                var greaterThanMatch = snippet.match(/event_whenkeypressed\([^()]*\)/);
                var key = greaterThanMatch[0];
                key = key.substring(key.indexOf('(') + 1, key.indexOf(')'));

                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replaceAll('event_whenkeypressed(key) {',
                    `event_whenkeypressed(key) {
                        if (key == ` + key + `) {
                            ` + trimmedSnippet + `\n}`);
            }
            if (snippet.includes('event_whenthisspriteclicked')) {
                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replaceAll('event_whenthisspriteclicked() {',
                    'event_whenflagclicked() {\n' + trimmedSnippet + '\n');
            }

            if (snippet.includes('event_whenbackdropswitchesto')) {
                var greaterThanMatch = snippet.match(/event_whenbackdropswitchesto\([^()]*\)/);
                var backdrop = greaterThanMatch[0];
                backdrop = backdrop.substring(backdrop.indexOf('(') + 1, backdrop.indexOf(')'));

                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replaceAll('event_whenbackdropswitchesto(backdrop) {',
                `event_whenkeypressed(backdrop) {
                    if (backdrop == ` + backdrop + `) {
                        ` + trimmedSnippet + `\n}`);
            }

            if (snippet.includes('event_whengreaterthan')) {
                console.log(snippet);
                var greaterThanMatch = snippet.match(/event_whengreaterthan\((.|\s)*?\);/);
                var params = greaterThanMatch[0];
                var whengreaterthanmenu = params.substring(params.indexOf('(') + 1, params.indexOf(','));
                var value = params.substring(params.indexOf(',') + 1, params.lastIndexOf(')'));

                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replaceAll('event_whengreaterthan() {',
                `event_whengreaterthan() {
                    if (` + whengreaterthanmenu + ` > ` + value + `) {
                        ` + trimmedSnippet + `\n}`);
            }

            if (snippet.includes('event_whenbroadcastreceived')) {
                var messageMatch = snippet.match(/event_whenbroadcastreceived\([^()]*\)/);
                var message = messageMatch[0];
                message = message.substring(message.indexOf('(') + 1, message.indexOf(')'));

                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replaceAll('event_whenbroadcastreceived(message) {',
                    `event_whenbroadcastreceived(message) {
                        if (message == ` + message + `) {
                            ` + trimmedSnippet + `\n}`);
            }

            if (snippet.includes('control_start_as_clone')) {
                // remove first line of code from snippet 
                // - this is the code representing the hat block
                var trimmedSnippet = snippet.substring(snippet.indexOf('\n') + 1);
                fileCode = fileCode.replaceAll('control_start_as_clone() {',
                    'control_start_as_clone() {\n' + trimmedSnippet + '\n');
            }
        })

        var fileName = name + '.js';

        console.log(fileCode);

        zip.file(fileName, fileCode);
    });

    zip.file('project.js', createProjectFile(files));
    zip.file('broadcaster.js', createBroadcasterFile(files));
    zip.file('sprite.js', createSpriteFile(files));

    zip.generateAsync({
            type: "blob"
        })
        .then(function (content) {
            // see FileSaver.js
            var a = document.createElement("a");
            var url = URL.createObjectURL(content);
            a.href = url;
            a.download = 'project.zip';
            document.body.appendChild(a);
            a.click();
        });
}

function createFileSkeleton(name) {
    const fileCode = `import Sprite from './sprite.js';

    class ` + name + ` extends Sprite {
        constructor (broadcaster) {
            super(broadcaster);
        }

        event_whenflagclicked() {

        }

        event_whenkeypressed(key) {

        }

        event_whenthisspriteclicked() {

        }

        event_whenbackdropswitchesto(backdrop) {

        }

        event_whengreaterthan() {

        }

        event_whenbroadcastreceived(message) {

        }

        control_start_as_clone() {

        }
    }

    export default ` + name + `;`;

    return fileCode;

}

function createProjectFile(files) {
    var code = `import Broadcaster from './broadcaster.js';\n`

    Object.keys(files).forEach((name) => {
        code += 'import ' + name + ' from \'./' + name + '.js\';\n';
    });
    
    code += `
    const broadcaster = new Broadcaster();
    
    const targets = {\n`;
    Object.keys(files).forEach((name) => {
        code += name + ': new ' + name + '(broadcaster),\n';
    });
    code += `};
    
    broadcaster.setTargets(targets);
    
    Object.keys(targets).forEach(targetName => {
        targets[targetName].event_whenflagclicked();
    });`

    return code;
}

function createBroadcasterFile(files) {
    var code = `
    class Broadcaster {
        constructor () {
            this.targets = {};
        }
    
        broadcast(message) {
            Object.keys(this.targets).forEach(targetName => {
                this.targets[targetName].event_whenbroadcastreceived(message);
            })
        }
    
        setTargets(targets) {
            this.targets = targets;
        }
    }
    
    export default Broadcaster;`

    return code;
}

function createSpriteFile() {
    return `class Sprite {
        constructor(broadcaster) {
            this.x = 0;
            this.y = 0;
            this.direction = 90;
    
            this.broadcaster = broadcaster;
        }
    
        motion_movesteps(steps) {
            // change this.x and this.y accordingly
        }
    
    }
    
    export default Sprite;`
}