var spawn       = require('child_process').spawn;
var PluginError = require('plugin-error');
var Promise     = require('pinkie-promise');


const DEBUGGING_ARGS_RE             = /^--inspect|^--debug/;
const DEBUGGING_BREAKPOINTS_ARGS_RE = /^--inspect-brk|^--debug-brk/;

function getTaskListFromArgs (args) {
    if (Array.isArray(args[0]))
        return args[0];

    return Array.prototype.slice.call(args);
}

function isUnderV8Inspector () {
    try {
        const inspector = require('inspector');

        return !!inspector.url();
    }
    catch (e) {
        return false;
    }
}

function areNodeDebuggingKeysSpecified () {
    return process.argv[1] === 'debug' ||
        process.argv[1] === 'inspect' ||
        process.argv.some(arg => arg.match(DEBUGGING_ARGS_RE)) ||
        process.argv.some(arg => arg.match(DEBUGGING_BREAKPOINTS_ARGS_RE));
}

function isUnderDebugger () {
    return typeof v8debug !== 'undefined' || areNodeDebuggingKeysSpecified() || isUnderV8Inspector() || process.argv.indexOf('--ll-debug') > -1;
}

function GulpLL () {
    this.llTasks          = [];
    this.llTasksDebugOnly = [];
    this.allTasks         = [];

    this.gulp          = null;
    this.gulpFunctions = {};

    this.isDebug      = isUnderDebugger();
    this.isWorker     = process.argv.indexOf('--ll-worker') > -1;
    this.isLLDisabled = process.argv.indexOf('--no-ll') > 0;

    this.args = process.argv.slice(1).filter(function (arg, idx) {
        // NOTE: remove debugger breakpoints from worker args
        return !arg.match(DEBUGGING_BREAKPOINTS_ARGS_RE) && (idx !== 0 || (arg !== 'debug' && arg !== 'inspect'));
    });
}


GulpLL.prototype._getWorkerTaskName = function (taskName) {
    return 'worker:' + taskName;
};

GulpLL.prototype._getWorkerArgs = function (task) {
    var ll = this;

    var args = this.args.filter(function (arg) {
        return ll.allTasks.indexOf(arg) < 0;
    });

    args.splice(1, 0, ll._getWorkerTaskName(task));

    if (!this.isWorker) {
        args.push('--ll-worker');
        args.push('--steps-as-tasks');

        if (this.isDebug)
            args.push('--ll-debug');
    }

    return args;
};

GulpLL.prototype._createWorker = function (task) {
    var worker = spawn(process.execPath, this._getWorkerArgs(task), { stdio: 'inherit' });

    return new Promise(function (resolve, reject) {
        worker.on('exit', function (code) {
            if (code === 0)
                resolve();
            else {
                reject(new PluginError('ll', {
                    message: 'Task ll:' + task + ' failed'
                }));
            }
        })
    });
};

GulpLL.prototype._isLLTask = function (task) {
    return this.llTasks.indexOf(task) > -1 || (this.isDebug && this.llTasksDebugOnly.indexOf(task) > -1);
};

GulpLL.prototype._getNameAndFn = function (gulpTaskArgs) {
    const isNameExplicit = typeof gulpTaskArgs[0] === 'string';

    return {
        name: isNameExplicit ? gulpTaskArgs[0] : (gulpTaskArgs[0].name || gulpTaskArgs[0].displayName),
        fn:   isNameExplicit ? gulpTaskArgs[1] : gulpTaskArgs[0],

        isNameExplicit
    };
};

GulpLL.prototype._getGulpTaskArgs = function (name, fn, { isNameExplicit }) {
    let gulpTaskArgs = [];

    if (isNameExplicit)
        gulpTaskArgs.push(name, fn);
    else {
        fn.displayName = name;

        gulpTaskArgs.push(fn);
    }

    return gulpTaskArgs;
};

GulpLL.prototype._addTaskToGulp = function (gulpFunction, { name, fn, isNameExplicit }) {
    this.allTasks.push(name);
    this.gulpFunctions[gulpFunction].apply(this.gulp, this._getGulpTaskArgs(name, fn, { isNameExplicit }));
};

GulpLL.prototype._createGulpOverload = function (gulpFunction) {
    if (!this.gulp[gulpFunction])
        return;

    const ll = this;

    ll.gulpFunctions[gulpFunction] = this.gulp[gulpFunction];

    this.gulp[gulpFunction] = function (...args) {
        let { name, fn, isNameExplicit } = ll._getNameAndFn(args);

        if (ll._isLLTask(name)) {
            const workerTaskName = ll._getWorkerTaskName(name);

            if (ll.isWorker && ll.args.indexOf(workerTaskName) > -1)
                ll._addTaskToGulp(gulpFunction, { name: workerTaskName, fn, isNameExplicit });
            else {
                fn = function () {
                    return ll._createWorker(name);
                };
            }
        }

        ll._addTaskToGulp(gulpFunction, { name, fn, isNameExplicit });
    };
};

GulpLL.prototype._overrideGulpFunctions = function () {
    this._createGulpOverload('task');
    this._createGulpOverload('step');
};

GulpLL.prototype.install = function (gulp) {
    if (!gulp)
        gulp = require('gulp');

    this.gulp = gulp;

    if (!this.isLLDisabled)
        this._overrideGulpFunctions();

    return this;
};

GulpLL.prototype.uninstall = function () {
    this.llTasks          = [];
    this.llTasksDebugOnly = [];
    this.allTasks         = [];

    Object.keys(this.gulpFunctions).forEach(gulpFunction => {
        if (this.gulp[gulpFunction] === this.gulpFunctions[gulpFunction])
            this.gulp[gulpFunction] = this.gulpFunctions[gulpFunction];

        delete this.gulpFunctions[gulpFunction];
    });

    this.gulp = null;

    return this;
};

GulpLL.prototype.tasks = function () {
    this.llTasks = getTaskListFromArgs(arguments);
    return this;
};

GulpLL.prototype.onlyInDebug = function () {
    this.llTasksDebugOnly = getTaskListFromArgs(arguments);
    return this;
};


module.exports = new GulpLL();
