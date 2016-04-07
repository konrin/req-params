# Params Parser

Use:

```jvavascript
	const reqParams = require('req-params');
    
    var parse = reqParams({
    	id: '1',
        name: 'User Name'
    }, [
    	'id:(int)',
        {
        	key: 'name',
            type: reqParams.TYPE_STRING,
            def: 'Default Name',
            rules: [
            	{
                	name: 'length',
                    min: 2,
                    max: 20
                }
            ]
        },
        {
        	key: 'date',
            type: reqParams.TYPE_OBJECT,
            def: new Date()
        }
    ]);
    
    parse.errors // -> {}
    
    parse.params // -> { 
    					id: 1,
                        name: 'User Name',
                        date: Thu Apr 07 2016 14:52:29 GMT+0300 (RTZ 2 (зима)) 
                       }
```