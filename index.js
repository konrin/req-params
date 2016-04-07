/**
 * Created by konrin on 07.04.2016.
 */

const
    TYPE_STRING = 'string',
    TYPE_INT = 'int',
    TYPE_BOOL = 'bool',
    TYPE_OBJECT = 'object',
    TYPE_ARRAY = 'array',

    util = require('util'),
    async = require('async'),
    _ = require('lodash');

var rules = {};

exports.TYPE_STRING = TYPE_STRING;
exports.TYPE_INT = TYPE_INT;
exports.TYPE_BOOL = TYPE_BOOL;
exports.TYPE_OBJECT = TYPE_OBJECT;
exports.TYPE_ARRAY = TYPE_ARRAY;

function Parse(raw, required) {

    this.__raw = raw;

    this.errors = {};
    this.params = {};

    if (!util.isArray(required) || required.length === 0 || !util.isObject(raw))
        return this;

    required.forEach((p) => {
        var result = run(p, raw);

        if (!result)
            return;

        if (!util.isUndefined(result.errors))
            return this.errors[result.key] = result.errors;

        this.params[result.key] = result.val;
    });
}

Parse.prototype.param = (key) => {
    return this.params[key];
};

function run(param, raw) {
    var isVal, type, val, data;

    if (util.isString(param)) {
        var spl = param.split(':'),
            key = String(spl[0]);

        isVal = !util.isUndefined(raw[key]);

        data = {
            key: key
        };

        if (spl.length === 1) {
            if (!isVal)
                return _.extend(data, {
                    errors: 'Обязательный параметр'
                });

            return {
                key: key,
                val: String(raw[key])
            };
        }

        type = isType(spl[1]);

        if (spl.length === 2) {
            if (type) {
                if (!isVal)
                    return _.extend(data, {
                        errors: 'Обязательный параметр'
                    });

                val = valToType(raw[key], type);

                if(val instanceof Error)
                    return _.extend(data, {
                        errors: val.message
                    });

                return {
                    key: key,
                    val: val
                };
            } else
                return {
                    key: key,
                    val: String(raw[key] || raw[key])
                };
        }

        if (spl.length === 3) {
            if (!type)
                return _.extend(data, {
                    errors: replace('Неизвестный формат "{type}"', {'{type}': type})
                });


            val = valToType(isVal ? raw[key] : spl[2], type);

            if(val instanceof Error)
                return _.extend(data, {
                    errors: val.message
                });

            return {
                key: key,
                val: val
            };
        }

        return false;
    }

    if (util.isObject(param)) {
        if (util.isUndefined(param['key']))
            return false;

        isVal = !util.isUndefined(raw[param.key]),
            type = param['type'] || TYPE_STRING;

        if (!isVal && util.isUndefined(param['def']))
            return {
                key: param['key'],
                errors: 'Обязательный параметр'
            };

        val = valToType(isVal ? raw[param.key] : param.def, type);

        if(val instanceof Error)
            return {
                key: param['key'],
                errors: val.message
            };

        data = {
            key: param.key,
            val: val
        };

        if (util.isArray(param.rules) && param.rules.length > 0) {
            for(var i = 0; i < param.rules.length; i++) {

                var rule = param.rules[i];

                if(util.isUndefined(rule['name']))
                    continue;

                var result = runRule(rule['name'], rule, val);

                if(!result)
                    continue;

                if(result instanceof Error)
                    return {
                        key: param['key'],
                        errors: result.message
                    };
            }
        }

        return data;
    }

    return false;
}

function getValType(val) {
    val = String(val);

    if (['true', 'false'].indexOf(val) !== -1)
        return TYPE_BOOL;

    var intCount = 0;

    val.split('').forEach(function (key) {
        if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].indexOf(Number(key)) !== -1)
            intCount++;
    });

    if (val.length === intCount)
        return TYPE_INT;

    try {
        var obj = JSON.parse(val);

        if (util.isArray(obj))
            return TYPE_ARRAY;

        return TYPE_OBJECT;
    } catch (e) {
        return TYPE_STRING;
    }
}

function isType(val) {
    if (val.indexOf('(') === 0 && (val.indexOf(')') === (val.length - 1))) {
        var type = val.slice(1, val.length - 1);

        if ([TYPE_ARRAY, TYPE_BOOL, TYPE_INT, TYPE_OBJECT, TYPE_STRING].indexOf(type) === -1)
            return false;

        return type;
    } else
        return false;
}

function valToType(val, type) {
    var toObj = (v) => {
        try {
            return JSON.parse(v);
        } catch (e) {
            return noConvertError(v, TYPE_OBJECT);
        }
    };

    if (['null', null].indexOf(val) !== -1)
        return null;

    switch (type) {
        case TYPE_BOOL:
            return [1, true, '1', 't', 'y', 'yes', 'true'].indexOf(val) !== -1;
        case TYPE_INT:
            if (getValType(val) !== TYPE_INT)
                return noConvertError(val, TYPE_INT);

            return Number(val);
        case TYPE_ARRAY:
            if (util.isArray(val))
                return val;

            if (getValType(val) !== TYPE_ARRAY)
                return noConvertError(val, TYPE_ARRAY);

            return toObj(val, []);
        case TYPE_OBJECT:
            if (util.isObject(val))
                return val;

            return toObj(val);
        default:
            return String(val);
    }

    function noConvertError(val, type) {
        return new Error(replace('Неудаётся преобразовать "{val}" в "{type}"', {
            '{val}': val,
            '{type}': type
        }));
    }
}

function replace(str, list) {
    Object.keys(list).forEach((key) => {
        str = str.replace(key, list[key]);
    });

    return str;
}

function runRule(name, params, val) {
    const rule = rules[name];

    if(util.isUndefined(rule))
        return false;

    var rp = _.extend(rule[1], params);

    delete rp['name'];
    delete rp['message'];

    var messages = '';

    if(util.isObject(rule[2])) {
        messages = _.extend(rule[2], params['message']);
    } else {
        messages = (rule[2] || params['message']) || '';
    }

    const result = rule[0].apply(this, [val, rp, messages]);

    if(result instanceof Error)
        return result;

    return true;
}

function createRule(name, def, fn, message) {
    rules[name] = [fn, def, message];
}

exports.parse = function (raw, required) {
    return new Parse(raw, required);
};

exports.createRule = createRule;

['length', 'email'].forEach((name) => {
    var rule = require('./rules/' + name);

    createRule(rule.name, rule.def, rule.fn, rule.message);
});