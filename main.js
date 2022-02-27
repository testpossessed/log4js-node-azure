function azureAppender(config) {
    var missingConfigMessage = 'Missing required configuration';
    var missingStorageAccountMessage = 'Missing storage account name';
    var missingStorageAccountKeyMessage = 'Missing storage account key';
    var defaultTableName = 'log4js';

    if (!config || typeof config !== 'object') {
        throw (new Error(missingConfigMessage));
    }

    if (!config.storageAccount || typeof config.storageAccount !== 'string') {
        throw (new Error(missingStorageAccountMessage));
    }

    if (!config.storageAccountKey || typeof config.storageAccountKey !== 'string') {
        throw (new Error(missingStorageAccountKeyMessage));
    }

    if (!config.tableName) {
        config.tableName = defaultTableName;
    }

    var azure = require('azure-storage');
    var tableService = azure.createTableService(config.storageAccount, config.storageAccountKey);
    tableService.createTableIfNotExists(config.tableName, function (error) {
        if (error) {
            throw (new Error(error));
        }
    });

    return function (loggingEvent) {
        if (loggingEvent) {
            var entGen = azure.TableUtilities.entityGenerator;
            var rowKey = (new Date()).valueOf();
            for (var i = 0; i < loggingEvent.data.length; i++) {
                var entry = {
                    PartitionKey: entGen.String(config.tableName),
                    RowKey: entGen.String(rowKey + '_' + i),
                    Category: entGen.String(loggingEvent.categoryName),
                    Level: entGen.String(loggingEvent.level.levelStr),
                    Data: entGen.String(loggingEvent.data[i])
                };

                tableService.insertEntity(config.tableName, entry, function (error) {
                    if (error) {
                        throw (new Error(error));
                    }
                });
            }
        }
    }
}

function configure(config) {
    return azureAppender(config);
}

module.exports.name = 'azure';
module.exports.configure = configure;
