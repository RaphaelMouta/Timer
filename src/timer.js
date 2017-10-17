'use strict';
//
// Timer V 0.2.0
// by: Raphael Mouta
//
(function ($) {
    var instances = [];
    var defaultOptions = {
        type: 'asc',
        initTime: 0,
        timeLimit: 10000,
        autoStart: true,
        onBegin: function () { return null; },
        onComplete: function () { return null; },
        onSecondComplete: function () { return null; },
        onStop: function () { return null; },
        onPause: function () { return null; },
        onRestart: function () { return null; }
    };
    // Auxiliar function to format time
    function formatTime(seconds) {
        var hourSeconds = 3600;

        var hour = Math.trunc(seconds / hourSeconds);
        var minute = Math.trunc((seconds - (hour * hourSeconds)) / 60);
        var second = Math.trunc(seconds - (hour * hourSeconds) - (minute * 60));

        return (hour >= 10 ? hour : "0" + hour) + ":" + (minute >= 10 ? minute : "0" + minute) + ":" + (second >= 10 ? second : "0" + second);
    }

    function verifyConfig(config) {
        if (config.type != null) {
            if (config.type.toLowerCase() != 'asc' && config.type.toLowerCase() != 'desc') throw "'type' setting must be 'asc' or 'desc'";
        } else throw "'type' setting can't be null.";

        if (typeof config.initTime != "number") throw "'initTime' setting value must be number greater than 0";

        if (config.initTime < 0) throw "'initTime' setting must be greater than 0";

        if (typeof config.timeLimit != "number" && config.timeLimit !== false) throw "'timeLimit' setting value must be number greater than 0 or false.";

        if (config.timeLimit < 0) throw "'timeLimit' setting must be greater than 0";

        if (config.type.toLowerCase() == 'asc' && (config.initTime > config.timeLimit)) throw "'initTime' setting value must be less then 'timeLimit' setting value";

        if (config.type.toLowerCase() == 'desc' && (config.initTime < config.timeLimit)) throw "'initTime' setting value must be greater than 'timeLimit' setting value";

        if (typeof config.onBegin != 'function' || config.onBegin == null) throw "'onBegin' setting must be a function";

        if (typeof config.onComplete != 'function' || config.onComplete == null) throw "'onComplete' setting must be a function";

        if (typeof config.onSecondComplete != 'function' || config.onSecondComplete == null) throw "'onSecondCompvare' setting must be a function";

        if (typeof config.onStop != 'function' || config.onStop == null) throw "'onStop' setting must be a function";

        if (typeof config.onPause != 'function' || config.onPause == null) throw "'onPause' setting must be a function";

        if (typeof config.onRestart != 'function' || config.onRestart == null) throw "'onRestart' setting must be a function";

        if (typeof config.autoStart != "boolean") throw "'autoStart' setting must be 'true' or 'false'";

        return true;
    }

    // Inicialization of counter function
    function initCounting(el) {
        el.count = config.initTime;

        if (config.type.toLowerCase() === 'asc') {
            $(element).html(formatTime(count));
        } else {
            $(element).html(formatTime(config.initTime));
        }

        if (interval != null) clearInterval(interval);

        config.onBegin();
        interval = setInterval(counting, 1000);
    }

    // Configure Timer
    var Timer = function (el, argumentsArray) {
        this.el = el;
        this.$el = $(el);
        this.interval = null;
        this.count = 0;
        // Apply default Options
        this.options = $.extend({}, defaultOptions);
        this.stopCtrl = false;

        // Take number of instance
        this.instanceNumber = instances.length;
        instances.push(this);

        // set in the element the  number of instance to which it belong
        this.$el.data('timer', this.instanceNumber);

        if (argumentsArray.length > 0) {
            if (typeof argumentsArray[0] === 'object') {
                $.extend(this.options, argumentsArray[0]);
                // Check on the options object if the values were filled correctly
                this.verifyConfig();

                // Register callBacks
                this.$el.on('begin.timer', this.options.onBegin);
                this.$el.on('complete.timer', this.options.onComplete);
                this.$el.on('secondComplete.timer', this.options.onSecondComplete);
                this.$el.on('stop.timer', this.options.onStop);
                this.$el.on('pause.timer', this.options.onPause);
                this.$el.on('restart.timer', this.options.onRestart);
            }
        }

        this.initCount();

    };

    // Apply default Configurations
    $.extend(Timer.prototype, {
        verifyConfig: function () { verifyConfig(this.options); },
        initCount: function () {
            this.count = this.options.initTime;

            if (this.options.type.toLowerCase() === 'asc') {
                this.$el.html(formatTime(this.count));
            } else {
                this.$el.html(formatTime(this.options.initTime));
            }

            if (this.interval != null) clearInterval(this.interval);

            var self = this;
            this.callEvent('begin');
            this.counting();
            this.interval = setInterval(function () {
                self.counting.call(self);
            }, 1000);
        },
        counting: function () {
            if (!this.stopCtrl) {
                if (this.options.type.toLowerCase() === 'asc') {
                    this.count += 1;
                    this.$el.html(formatTime(this.count));
                } else {
                    this.count -= 1;
                    this.$el.html(formatTime(this.count));
                }

                this.callEvent('secondComplete');

                if (this.options.timeLimit !== false) {
                    if (this.options.timeLimit === this.count) {
                        this.stopCtrl = true;
                        this.callEvent('complete');
                    }
                }
            }
        },
        restart: function () {
            this.initCount();
            this.callEvent('restart');
        },
        pause: function () {
            this.stopCtrl = !this.stopCtrl;
            this.callEvent('pause');
        },
        stop: function () {
            this.stopCtrl = true;
            if (this.interval)
                clearInterval(this.interval);
            this.count = this.options.options.initCount;
            this.$el.html(formatTime(this.count));
            this.callEvent('stop');
        },
        callEvent: function (event) {
            this.$el.trigger(event + ".timer");
        },
        methods: {
            start: function (instance) {
                instance.initCount();
            },
            stop: function (instance) {
                instance.stop();
            },
            pause: function (instance) {
                if (!instance.interval)
                    throw "The pause method is only usable when timer is running";

                instance.pause();
            },
            restart: function (instance) {
                if (!instance.interval)
                    throw "The restart method is only usable when timer is running";

                instance.restart();
            },
            isPaused: function (instance) {
                return instance.stopCtrl;
            },
            getCurrentTime: function (instance) {
                return instance.count;
            },
            getFormattedCurrentTime: function (instance) {
                return formatTime(instance.count);
            },
            setCurrentTime: function (instance, argumentsArray) {
                var time = argumentsArray[0];
                if (typeof time !== "number" || isNaN(time))
                    throw "Inválid value";

                if (time < 0)
                    throw "The value must be greater than 0.";

                instance.count = time - 1;
            }
        }
    });

    $.fn.timer = function () {
        var argumentsArray = Array.prototype.slice.call(arguments, 0);

        if (argumentsArray.length > 0) {
            // check if a method was called
            if (typeof argumentsArray[0] === "string") {
                var instanceId = $(this).data('timer');
                // call a method
                if (instanceId !== undefined) {
                    var instance = instances[instanceId];

                    var method = argumentsArray.shift();

                    if (instance.methods.hasOwnProperty(method)) {
                        // Remove first element
                        return instance.methods[method](instance, argumentsArray);
                    } else {
                        throw "The method " + method + " doesn't exist.";
                    }
                }
            }
        }

        // return instances
        return this.each(function () {
            var instanceId = $(this).data('timer');

            if (instanceId === undefined) {
                new Timer(this, argumentsArray);
            }
        });
    };
})(jQuery)