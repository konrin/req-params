/**
 * Created by konrin on 07.04.2016.
 */
module.exports = {
    name: 'email',
    def: {},
    fn: function (val, params, message) {
        val = String(val);

        if (!validateEmail(val))
            return new Error(String(message));

        return true;
    },
    message: 'Некорректный Email адрес'
};

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}