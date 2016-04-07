/**
 * Created by konrin on 07.04.2016.
 */

module.exports = {
    name: 'length',
    def: {
        min: 0,
        max: 250
    },
    fn: function (val, params, message) {
        val = String(val);

        if (val.length < params.min)
            return new Error(String(message['min']).replace('{min}', params.min));

        if (val.length > params.max)
            return new Error(String(message['max']).replace('{max}', params.max));

        return true;
    },
    message: {
        min: 'Значение меньше {min} символов',
        max: 'Значение больше {max} символов'
    }
};