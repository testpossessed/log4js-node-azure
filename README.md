## log4js-node-azure
A log4js appender that writes to Azure table storage

###Installing
Install with npm using the following command

```
    npm install log4js-node-azure --save
```

###Configuring
Like all log4js appenders, log4js-node-azure can be configured via a file or code.

Add as an appender via config file:

####lpg4js.json

```
{
    "appenders": [
    {
        "type": "log4js-node-azure",
        "storageAccount": "<azure storage account name>",
        "storageAccountKey": "<azure storage account key>",
        "tableName": "<table name to use or create, defaults to log4jslog>"
    }
    ]
}
```

####Code

```javascript

var log4js = require('log4js');
var azureAppender = require('log4js-node-azure');

log4js.addAppender(azureAppender.appender({
    storageAccount: "<azure storage account name>",
    storageAccountKey: "<azure storage account key>",
    tableName: "<table name to use or create, defaults to log4jslog>"), 'azure');

```




