function azureAppender(config) {
    var missingConfigMessage            = 'Missing required configuration';
    var missingStorageAccountMessage    = 'Missing storage account name';
    var missingStorageAccountKeyMessage = 'Missing storage account key';
    var defaultTableName                = 'log4js';

    if(!config || typeof config !== 'object') {
        throw(new Error(missingConfigMessage));
    }

    if(!config.storageAccount || typeof config.storageAccount !== 'string') {
        throw(new Error(missingStorageAccountMessage));
    }

    if(!config.storageAccountKey || typeof config.storageAccountKey !== 'string') {
        throw(new Error(missingStorageAccountKeyMessage));
    }

    if(!config.tableName) {
        config.tableName = defaultTableName;
    }

    var azure        = require('azure-storage');
    var tableService = azure.createTableService(config.storageAccount, config.storageAccountKey);
    tableService.createTableIfNotExists(config.tableName, function(error) {
        if(error) {
            throw(new Error(error));
        }
    });

    return function(loggingEvent) {
        if(loggingEvent) {
            var entry = {
                PartitionKey: config.tableName,
                RowKey: (new Date()).valueOf(),
                Category: loggingEvent.categoryName,
                Level: loggingEvent.level,
                Data: loggingEvent.data,
                Logger: loggingEvent.logger
            };

            tableService.insertEntity(config.tableName, entry, function(error) {
                if(error)
                {
                    throw(new Error(error));
                }
            });
        }
    }
}

function configure(config) {
    return azureAppender(config);
}

function shutdown(callback) {

}

module.exports.name      = 'azure';
module.exports.appender  = azureAppender;
module.exports.configure = configure;
module.exports.shutdown  = shutdown;