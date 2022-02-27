describe('Azure Appender', function() {
    var module;
    var modulePath  = '../main.js';
    var mockery     = require('mockery');
    var substitute  = require('jssubstitute');
    var arg         = substitute.arg;
    var azureMock, tableServiceMock, entityGeneratorMock;
    var validConfig = {
        storageAccount: 'myAccount', storageAccountKey: 'lkasjdflkdlfdjlfjdlfjldfjldjffjlk==', tableName: 'log4jslog'
    };

    beforeEach(function() {
        substitute.throwErrors();
        azureMock        = substitute.for(['createTableService']);
        entityGeneratorMock = substitute.for(['String']);
        entityGeneratorMock.returns('String', {'_': 'string'})
        azureMock.TableUtilities = {
            entityGenerator: entityGeneratorMock
        };

        tableServiceMock = substitute.for(['createTableIfNotExists', 'insertEntity']);
        azureMock.returns('createTableService', tableServiceMock);
        mockery.enable({useCleanCache: true, warnOnUnregistered: false});
        mockery.registerAllowable(modulePath);
        mockery.registerMock('azure-storage', azureMock);
        module           = require(modulePath);
    });

    afterEach(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('Should be defined', function() {
        expect(module).toBeDefined();
    });

    it('Should define a method to configure the appender', function() {
        expect(module.appender).toBeDefined();
        expect(typeof module.appender).toBe('function');
    });

    it('Should define a method to create the appender from code', function() {
        expect(module.appender).toBeDefined();
        expect(typeof module.appender).toBe('function');
    });

    it('Should define a method to shutdown the appender', function() {
        expect(module.shutdown).toBeDefined();
        expect(typeof module.shutdown).toBe('function');
    });

    it('Should report the name of azure', function() {
        expect(module.name).toBeDefined();
        expect(module.name).toBe('azure');
    });

    it('Should throw an error if configure argument is missing', function() {
        expect(function() {
            module.configure();
        }).toThrowError('Missing required configuration');
    });

    it('Should throw an error if storage account name is missing from config', function() {
        expect(function() {
            module.configure({});
        }).toThrowError('Missing storage account name');
    });

    it('Should throw an error if storage account key is missing from config', function() {
        expect(function() {
            module.configure({storageAccount: 'name'});
        }).toThrowError('Missing storage account key');
    });

    it('Should default table name if not provided', function() {
        delete validConfig.tableName;
        assumeConfigureExecuted();
        expect(validConfig.tableName).toBeDefined();
        expect(validConfig.tableName).toBe('log4js');
    });

    it('Should prepare the azure table service on initialisation', function() {
        assumeConfigureExecuted();
        expect(azureMock.receivedWith('createTableService', validConfig.storageAccount, validConfig.storageAccountKey, validConfig.storageHostName));
    });

    it('Should open table creating it if necessary', function() {
        assumeConfigureExecuted();
        expect(tableServiceMock.receivedWith('createTableIfNotExists', validConfig.tableName, arg.any(Function)));
    });

    it('Should throw any error returned during creation of table service', function() {
        assumeConfigureExecuted();
        expect(function() {
            tableServiceMock.invokeArgOfLastCallWith('createTableIfNotExists', 1, 'error');
        }).toThrowError('error');
    });

    it('Should insert logging event into table', function() {
        assumeLoggingEventIsPosted();
        expect(tableServiceMock.receivedWith('insertEntity', validConfig.tableName, function(arg) {
            return arg.PartitionKey !== undefined
            && arg.RowKey !== undefined
            && arg.Category !== undefined
            && arg.Data !== undefined
            && arg.Level !== undefined
        }, arg.any(Function)));
    });

    it('Should use entity generator to create entry properties', function() {
        assumeLoggingEventIsPosted();
        expect(entityGeneratorMock.received('String', 5));
    });

    it('Should throw any error returned from insertion', function() {
        assumeLoggingEventIsPosted();
        expect(function() {
            tableServiceMock.invokeArgOfLastCallWith('insertEntity', 2, 'error');
        }).toThrowError('error');
    });

    function assumeLoggingEventIsPosted() {
        var appender     = module.appender(validConfig);
        var loggingEvent = {categoryName: 'category', data: ['message'], level: {levelStr: 'debug'}};
        appender(loggingEvent);
        return loggingEvent;
    }

    function assumeConfigureExecuted() {
        module.configure(validConfig);
    }
});