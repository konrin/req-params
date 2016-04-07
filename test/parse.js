/**
 * Created by konrin on 07.04.2016.
 */

const reqParams = require('./../index');

// var parse = reqParams.parse({
//     a: 123,
//     //b: '[1,2,3]1',
//     c: '12yyyyyy3',
//     d: 'w',
//     id: '990',
//     name: 'f'
// }, [
//     'a:(string)',
//     {
//         key: 'b',
//         type: reqParams.TYPE_OBJECT,
//         def: new Date()
//     },
//     {
//         key: 'c',
//         type: reqParams.TYPE_STRING,
//         rules: [
//             {
//                 name: 'length',
//                 min: 100,
//                 max: 5000,
//                 message: {
//                     max: 'Значение больше {max} символов 1'
//                 }
//             },
//             {
//                 name: 'range',
//                 min: 100,
//                 max: 5000,
//                 message: 'Значение {val} параметра {key} не входит в диапазон'
//             },
//             {
//                 name: 'email',
//                 message: 'Значение {val} параметра {key} не является валидным Email адресом'
//             }
//         ]
//     },
//     'd',
//     {
//         key: 'name',
//         type: reqParams.TYPE_BOOL
//     },
//     'id:(int)'
// ]);

var parse = reqParams.parse({
    id: '1',
    name: 'User Name',
    email: 'wfefw'
}, [
    'id:(int)',
    {
        key: 'name',
        type: reqParams.TYPE_STRING,
        def: 'Default Name'
    },
    {
        key: 'date',
        type: reqParams.TYPE_OBJECT,
        def: new Date()
    },
    {
        key: 'email',
        rules: [
            {
                name: 'email'
            }
        ]
    }
]);

console.log('Errors: ', parse.errors);
console.log('Params: ', parse.params);


