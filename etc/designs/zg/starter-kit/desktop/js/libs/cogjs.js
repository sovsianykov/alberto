/* CogJS - v1.0.0 !!!!MODIFICATION ON LINES 2667, 2861!!!! */
var Cog = (function (document, $) {
	'use strict';

	var api = {};

	//backward compatibility
	api.component = {};


	/**
	 * /defaults.js
	 */
	var defaults = {
		noOperation: $.noop,
		emptyArray: [],
		initializedClass: 'initialized',
		initializedSelector: '.initialized',
		globalScopeSelector: 'body',
		modulesGroupSize: 50
	};

	/**
	 * /Type.js
	 */
	var Type = (function () {
		var objectConstructor = Object.prototype.constructor;

		/**
		 * Extends a class
		 * @param BaseType a base class
		 * @param overrides properties and methods of a new class
		 * @returns {Function} a new class
		 */
		function extend(BaseType, overrides) {
			var properties = overrides || {};

			//all classes inherit from Object
			BaseType = BaseType || Object;

			//define a new type by selecting constructor: from properties or base type
			var Type = properties.constructor != objectConstructor ?
				properties.constructor : function () {
				BaseType.apply(this, arguments);
			};

			var baseTypePrototype = BaseType.prototype;
			//create a middle type to keep the inheritance chain
			var T = function () {
			};
			T.prototype = baseTypePrototype;

			var typePrototype = $.extend(new T(), properties);
			typePrototype.constructor = Type;

			//set prototype and superclass of new type
			Type.prototype = typePrototype;
			Type.superclass = baseTypePrototype;

			return Type;
		}

		/**
		 * Defines a class
		 * @param properties properties and methods of a new class
		 */
		function define(properties) {
			return extend(null, properties);
		}

		/**
		 * Singleton
		 */
		function singleton(Type, instance) {
			var api = {};

			api.instance = function () {
				return instance;
			};

			api.superclass = Type.superclass;

			return api;
		}

		function singletonWrapper(Type) {
			var Wrapper = extend(Type, {
				constructor: function (parameters) {
					Wrapper.superclass.constructor.apply(this, parameters);
				}
			});

			return Wrapper;
		}


		function asSingleton(Type) {
			var api = {};

			api.create = function () {
				var Wrapper = singletonWrapper(Type);

				return singleton(Type, new Wrapper(arguments));
			};

			return api;
		}

		return {
			define: define,
			extend: extend,
			asSingleton: asSingleton
		};
	}());

	/**
	 * /core/ICore.js
	 */

	var ICore = Type.define({

		eventManager: null,

		addModule: function (module) {
		},

		queueInitTask: function ($scope, moduleIds) {
		},

		queueFinalizeTask: function ($scope) {
		},

		isValidModuleConfig: function (config) {
		},

		isReady: function () {
		},

		whenReady: function (delegate) {
		}
	});

	/**
	 * /core/IEventManager.js
	 */
	var IEventManager = Type.define({

		/**
		 * @return {EventDispatcher} event dispatcher
		 */
		dispatcherFor: function (moduleName, eventName) {
		}

	});

	/**
	 * /core/IModuleManager.js
	 */
	var IModuleManager = Type.define({

		dependencyGraph: null,

		modules: null,

		staticModuleRegistry: null,

		dynamicModuleRegistry: null,

		add: function (module) {
		}

	});
	/**
	 * /core/ITaskQueues.js
	 */

	var ITaskQueues = Type.define({

		initStaticModule: null,

		initDynamicModules: null,

		finalizeDynamicModules: null

	});

	/**
	 * /util/logger/LogLevel.js
	 */
	var LogLevel = {
		off: 1,
		error: 2,
		info: 3,
		debug: 4,
		trace: 5
	};
	/**
	 * /util/logger/Logger.js
	 */
	var Logger = Type.define({

		level: LogLevel.off,

		source: null,

		constructor: function (source, logLevel) {
			this.source = source;
			this.level = logLevel || LogLevel.off;
		},

		error: function (tag/*, message0, message1, ..., messageN*/) {
			console.error(arguments[1]);
		},

		info: function (tag/*, message0, message1, ..., messageN*/) {
		},

		debug: function (tag/*, message0, message1, ..., messageN*/) {
		},

		trace: function (tag/*, message0, message1, ..., messageN*/) {
		},

		//protected
		isEnabled: function (logLevel) {
			return logLevel <= this.level;
		}

	});

	/**
	 * /util/logger/loggerFactoryConfig/off.js
	 */
	var LoggerFactoryConfig = {
		level: LogLevel.off
	};

	/**
	 * /util/logger/ILoggerFactory.js
	 */

	var ILoggerFactory = Type.define({

		constructor: function (config) {
		},

		create: function (source, maxDepth) {
		}

	});

	/**
	 * /util/logger/default/LoggerFactory.js
	 */

	var LoggerFactory = Type.asSingleton(Type.extend(ILoggerFactory, {

		logger: new Logger(),

		create: function (source, maxDepth) {
			return this.logger;
		}

	})).create().instance();

	/**
	 * /util/Collection
	 */
	var Collection = Type.define({

		items: null,

		ids: null,

		map: null,

		constructor: function () {
			this.items = [];
			this.ids = [];
			this.map = {};
		},

		add: function (id, item) {
			if (!this.map[id]) {
				this.map[id] = item;
				this.ids.push(id);
				this.items.push(item);
			}
		},

		count: function () {
			return this.items.length;
		},

		get: function (id) {
			return this.map[id] || null;
		},

		has: function (id) {
			return this.map.hasOwnProperty(id);
		},

		select: function (searchedIds) {
			var result = new Collection(),
				map = this.map,
				ids = this.filterIds(searchedIds),
				id,
				i;

			for (i = 0; i < ids.length; i++) {
				id = ids[i];
				result.add(id, map[id]);
			}

			return result;
		},

		selectValues: function (searchedIds) {
			var result = {},
				map = this.map,
				ids = this.filterIds(searchedIds),
				id,
				i;

			for (i = 0; i < ids.length; i++) {
				id = ids[i];
				result[id] = map[id];
			}

			return result;
		},

		filterIds: function (searchedIds) {
			var result = [],
				ids = this.uniqueIds(searchedIds),
				map = this.map,
				i;

			for (i = 0; i < ids.length; i++) {
				if (map.hasOwnProperty(ids[i])) {
					result.push(ids[i]);
				}
			}

			return result;
		},

		//private
		uniqueIds: function (ids) {
			var result = [],
				resultMap = {},
				id,
				i;

			for (i = 0; i < ids.length; i++) {
				id = ids[i];
				if (!resultMap[id]) {
					resultMap[id] = true;
					result.push(id);
				}
			}

			return this.sortedIds(result);
		},

		sortedIds: function (ids) {
			var sortDelegate = $.proxy(this.uniqueIdsSorter, this, this.ids);

			ids.sort(sortDelegate);

			return ids;
		},

		//private
		uniqueIdsSorter: function (ids, firstId, secondId) {
			return $.inArray(firstId, ids) - $.inArray(secondId, ids);
		}

	});

	/**
	 * /util/Counter
	 */
	var Counter = Type.define({

		current: 0,

		next: function (id, item) {
			this.current++;

			return this.current;
		}

	});

	/**
	 * /util/ElementsUtil
	 */
	var ElementsUtil = Type.asSingleton(Type.define({

		indexOfElement: function (elements, $element) {
			var index = -1,
				i;

			for (i = 0; index < 0 && i < elements.length; i++) {
				if ($element.is(elements[i])) {
					index = i;
				}
			}

			return index;
		},

		find: function ($scope, selector) {
			var $result = $scope.find(selector),
				$filtered = $scope.filter(selector);

			return $filtered.length > 0 ? $result.add($filtered) : $result;
		},

		isInScope: function ($scope, $element) {
			return $scope != null && $element != null && $element.parents().is($scope);
		}

	})).create().instance();

	/**
	 * /util/ObjectSplitter.js
	 */
	var ObjectSplitter = Type.asSingleton(Type.define({

		defaults: {
			itemsPerGroup: 1
		},

		initializeGroupSize: function (itemsPerGroup) {
			return itemsPerGroup > 0 ? itemsPerGroup : this.defaults.itemsPerGroup;
		},

		groupItems: function (items, itemsPerGroup) {
			var key,
				groupSize = this.initializeGroupSize(itemsPerGroup),
				context = this.createContext(groupSize),
				group = context.group;

			for (key in items) {
				if (items.hasOwnProperty(key)) {
					group[key] = items[key];
					group = this.update(context);
				}
			}

			this.flush(context);

			return context.groups;
		},

		createContext: function (groupSize) {
			return {
				group: {},
				groups: [],
				counter: groupSize,
				groupSize: groupSize
			};
		},

		update: function (context) {
			context.counter--;
			if (context.counter < 1) {
				context.counter = context.groupSize;
				context.groups.push(context.group);
				context.group = {};
			}

			return context.group;
		},

		flush: function (context) {
			if (context.counter !== context.groupSize) {
				context.groups.push(context.group);
			}
		}

	})).create().instance();

	/**
	 * /util/WrapperFactory.js
	 */
	var WrapperFactory = Type.asSingleton(Type.define({

		create: function (subject, exposedApi) {
			var api = {},
				name,
				i;

			for (i = 0; i < exposedApi.length; i++) {
				name = exposedApi[i];
				if ($.isFunction(subject[name])) {
					api[name] = $.proxy(subject[name], subject);
				}
			}

			return api;
		}

	})).create().instance();

	/**
	 * /dependencies/DependencyGraphNode.js
	 */
	var DependencyGraphNode = Type.define({

		id: null,

		isProcessed: false,

		resolved: false,

		dependencies: null,

		requiredBy: null,

		constructor: function (id) {
			this.id = id;
			this.dependencies = [];
			this.requiredBy = [];
		},

		isResolved: function () {
			return this.resolved;
		},

		resolveIfRequired: function () {
			if (!this.resolved) {
				this.resolve();
			}
		},

		resolve: function () {
			var dependencies = this.dependencies,
				isResolved = true,
				i;

			for (i = 0; isResolved && i < dependencies.length; i++) {
				isResolved = dependencies[i].resolved;
			}

			this.resolved = isResolved;
		},

		resolveAllPredecessors: function () {
			var result = [],
				candidates = this.unresolvedPredecessor();

			if (candidates.length) {
				this.resolvePredecessors(candidates, result);
			}

			return result;
		},

		unresolvedPredecessor: function () {
			var result = [],
				requiredBy = this.requiredBy,
				item,
				i;

			for (i = 0; i < requiredBy.length; i++) {
				item = requiredBy[i];
				if (!item.resolved) {
					result.push(item);
				}
			}

			return result;
		},

		resolvePredecessors: function (nodes, result) {
			var node;

			while (nodes.length > 0) {
				node = nodes.shift();
				node.resolve();
				if (node.resolved) {
					nodes.push.apply(nodes, node.unresolvedPredecessor());
					result.push(node.id);
				}
			}
		}

	});

	/**
	 * /dependencies/DependencyGraphItemAdapter.js
	 */
	var DependencyGraphItemAdapter = Type.define({

		id: function (item) {
		},

		dependencies: function (item) {
		},

		dependencyId: function (dependency) {
		}

	});

	/**
	 * /dependencies/DependencyGraph.js
	 */
	var DependencyGraph = Type.define({

		adapter: null,

		nodes: null,

		constructor: function (adapter) {
			this.adapter = adapter;
			this.nodes = {};
		},

		resolve: function (item) {
			var result = null,
				node = this.getNode(this.adapter.id(item));

			if (!node.isProcessed) {
				this.processDependencies(node, this.adapter.dependencies(item));
			}

			node.resolveIfRequired();
			if (node.isResolved()) {
				result = node.resolveAllPredecessors();
				result.unshift(node.id);
			}

			return result;
		},

		hasNode: function (item) {
			var node = this.nodes[this.adapter.id(item)];

			return node && node.isProcessed;
		},

		getNode: function (id) {
			if (this.nodes[id] == null) {
				this.nodes[id] = new DependencyGraphNode(id);
			}

			return this.nodes[id];
		},

		processDependencies: function (node, dependencies) {
			var item,
				i;

			for (i = 0; i < dependencies.length; i++) {
				item = this.getNode(this.adapter.dependencyId(dependencies[i]));
				node.dependencies.push(item);
				item.requiredBy.push(node);
			}

			node.isProcessed = true;
		}

	});

	/**
	 * /events/EventHandler.js
	 */
	var EventHandler = Type.define({

		id: null,

		delegate: null,

		scope: null,

		params: null,

		disposable: false,

		constructor: function (metadata, delegate, options) {
			this.id = metadata.id;
			this.delegate = delegate || defaults.noOperation;
			this.params = {
				data: {},
				eventData: {}
			};

			if (options) {
				this.processOptions(options);
			}
		},

		isDisposable: function () {
			return this.disposable;
		},

		processOptions: function (options) {
			if (options.scope) {
				this.scope = options.scope;
			}

			if (options.data) {
				this.params.data = options.data;
			}

			this.disposable = options.disposable === true;
		}

	});

	/**
	 * /events/EventHandlerMetadataFactory.js
	 */
	var EventHandlerMetadataFactory = Type.asSingleton(Type.define({

		create: function (module, event, id) {
			return {
				module: module,
				event: event,
				id: id
			};
		}

	})).create();

	/**
	 * /events/EventDispatcher.js
	 */
	var EventDispatcher = Type.define({

		asyncDelegatesCount: defaults.modulesGroupSize,

		moduleName: null,

		eventName: null,

		handlers: null,

		ids: null,

		metadataFactory: null,

		constructor: function (moduleName, eventName) {
			this.moduleName = moduleName;
			this.eventName = eventName;
			this.metadataFactory = EventHandlerMetadataFactory.instance();

			this.handlers = [];
			this.ids = {};
		},

		addHandler: function (delegate, options) {
			var metadata = null,
				handler,
				id;

			if ($.isFunction(delegate)) {
				id = this.generateUniqueId();
				this.ids[id] = true;

				metadata = this.metadataFactory.create(this.moduleName, this.eventName, id);
				handler = new EventHandler(metadata, delegate, options);
				if (handler.isDisposable()) {
					handler.delegate = this.disposableHandler(handler);
				}

				this.handlers.push(handler);
			}

			return metadata;
		},

		removeHandler: function (id) {
			var index = this.indexOfHandler(id),
				found = index > -1;

			if (index > -1) {
				delete this.ids[id];
				this.handlers.splice(index, 1);
			}

			return found;
		},

		dispatch: function (eventData) {
			var handlers = this.handlers.slice(0),
				handler,
				params,
				i;

			for (i = 0; i < handlers.length; i++) {
				handler = handlers[i];
				params = $.extend({}, handler.params);
				if (eventData) {
					params.eventData = eventData;
				}
				handler.delegate.call(handler.scope, params);
			}
		},

		dispatchAsync: function (eventData) {
			var delegates = this.createDelegates(eventData),
				groupsCount = Math.ceil(delegates.length / this.asyncDelegatesCount),
				i;

			for (i = 0; i < groupsCount; i++) {
				setTimeout($.proxy(this.executeAsync, this, delegates, i));
			}
		},

		createDelegates: function (eventData) {
			var handlers = this.handlers.slice(0),
				handler,
				params,
				delegates = [],
				i;

			for (i = 0; i < handlers.length; i++) {
				handler = handlers[i];
				params = $.extend({}, handler.params);
				if (eventData) {
					params.eventData = eventData;
				}
				delegates.push({
					handler: handler,
					params: params
				});
			}

			return delegates;
		},

		executeAsync: function (delegates, group) {
			var start = group * this.asyncDelegatesCount,
				end = Math.min(start + this.asyncDelegatesCount, delegates.length),
				handler,
				item,
				i;

			for (i = start; i < end; i++) {
				item = delegates[i];
				handler = item.handler;
				handler.delegate.call(handler.scope, item.params);
			}
		},

		disposableHandler: function (handler) {
			var delegate = handler.delegate,
				context = this;

			return function (params) {
				delegate.call(handler.scope, params);
				context.removeHandler(handler.id);
			};
		},

		indexOfHandler: function (id) {
			var handlers = this.handlers,
				index = -1,
				i;

			for (i = 0; index < 0 && i < handlers.length; i++) {
				if (handlers[i].id === id) {
					index = i;
				}
			}

			return index;
		},

		generateUniqueId: function () {
			var ids = this.ids,
				id;

			do {
				id = Math.round(new Date().getTime() * Math.random());
			}
			while (ids[id] != null);

			return id;
		}

	});


	/**
	 * /modules/operation/ITaskQueue.js
	 */
	var ITaskQueue = Type.define({

		hasNext: function () {
		},

		next: function () {
		},

		nextId: function () {
		},

		last: function () {
		},

		lastId: function () {
		},

		add: function (task) {
		}
	});

	/**
	 * /modules/operation/CompositeTaskQueue.js
	 */
	var CompositeTaskQueue = Type.extend(ITaskQueue, {

		queues: null,

		constructor: function () {
			this.queues = [];
		},

		hasNext: function () {
			var queues = this.queues,
				hasNext = false,
				i;

			for (i = 0; !hasNext && i < queues.length; i++) {
				hasNext = queues[i].hasNext();
			}

			return hasNext;
		},

		next: function () {
			var queue = this.nextQueue();

			return queue != null ? queue.next() : null;
		},

		nextId: function () {
			var queue = this.nextQueue();

			return queue != null ? queue.nextId() : null;
		},

		last: function () {
			var queue = this.lastQueue();

			return queue != null ? queue.last() : null;
		},

		lastId: function () {
			var queue = this.lastQueue();

			return queue != null ? queue.lastId() : null;
		},

		addQueue: function (queue) {
			this.queues.push(queue);
		},

		nextQueue: function () {
			var queues = this.queues,
				queue = null,
				lowestId = Number.MAX_VALUE,
				id,
				i;

			for (i = 0; i < queues.length; i++) {
				id = queues[i].nextId();
				if (id !== null && id < lowestId) {
					lowestId = id;
					queue = queues[i];
				}
			}

			return queue;
		},

		lastQueue: function () {
			var queues = this.queues,
				queue = null,
				highestId = Number.MIN_VALUE,
				id,
				i;

			for (i = 0; i < queues.length; i++) {
				id = queues[i].nextId();
				if (id !== null && id > highestId) {
					highestId = id;
					queue = queues[i];
				}
			}

			return queue;
		}

	});

	/**
	 * /modules/operation/Task.js
	 */
	var Task = Type.define({

		logger: LoggerFactory.create('Task'),

		counter: new Counter(),

		id: null,

		deferred: null,

		promise: null,

		constructor: function () {
			this.id = this.counter.next();
			this.deferred = $.Deferred();

			this.promise = this.deferred.promise();

			if (this.logger.isEnabled(LogLevel.info)) {
				this.promise.done($.proxy(this.onExecuted, this)).fail($.proxy(this.onAborted, this));
				this.logger.debug('created', this.id);
			}
		},

		execute: function () {
		},

		onExecuted: function () {
			this.logger.debug('executed', this.id);
		},

		onAborted: function () {
			this.logger.debug('aborted', this.id);
		}

	});

	/**
	 * /modules/operation/TaskQueue.js
	 */
	var TaskQueue = Type.extend(ITaskQueue, {

		logger: LoggerFactory.create('TaskQueue'),

		tasks: null,

		constructor: function () {
			this.tasks = [];
		},

		hasNext: function () {
			return this.tasks.length > 0;
		},

		next: function () {
			return this.hasNext() ? this.tasks.shift() : null;
		},

		nextId: function () {
			return this.hasNext() ? this.tasks[0].id : null;
		},

		last: function () {
			return this.hasNext() ? this.tasks.pop() : null;
		},

		lastId: function () {
			var id = null;

			if (this.hasNext()) {
				var tasks = this.tasks;
				id = tasks[tasks.length - 1];
			}

			return id;
		},

		add: function (task) {
			var logger = this.logger;

			logger.debug('adding task', task.id);
			if (this.accepts(task)) {
				logger.debug('task accepted', task.id);
				this.process(task);
			}
			else {
				logger.debug('task rejected', task.id);
				task.deferred.reject();
			}
		},

		accepts: function (task) {
			return true;
		},

		process: function (task) {
			this.tasks.push(task);
		}

	});

	/**
	 * /tasks/TaskRunner.js
	 */
	var TaskRunner = Type.define({

		logger: LoggerFactory.create('TaskRunner'),

		delay: 0,

		queues: null,

		locked: false,

		constructor: function (delay) {
			this.queues = [];
			if (delay > 0) {
				this.delay = delay;
			}
		},

		executeNext: function () {
			var logger = this.logger,
				task = !this.locked ? this.findNext() : null;

			if (task != null) {
				this.locked = true;
				logger.trace('locked');

				task.promise.always($.proxy(this.unlock, this));
				logger.debug('execute', task.id);
				this.executeAsync(task);
			}
		},

		findNext: function () {
			var queues = this.queues,
				queue,
				task = null,
				i;

			for (i = 0; task == null && i < queues.length; i++) {
				queue = queues[i];
				task = queue.next();
			}

			return task;
		},

		addQueue: function (queue) {
			this.queues.push(queue);
		},

		unlock: function () {
			this.locked = false;
			this.logger.trace('unlocked');
			this.executeNext();
		},

		executeAsync: function (task) {
			setTimeout($.proxy(task.execute, task), this.delay);
		}

	});

	/**
	 * /iterator/ObjectIterator.js
	 */
	var ObjectIterator = Type.define({

		logger: LoggerFactory.create('ObjectIterator'),

		items: null,

		constructor: function (items) {
			this.items = items || {};
		},

		eachItem: function (itemProcessor, scope) {
			var deferred = $.Deferred();

			try {
				this.executeOnEach(itemProcessor, scope);
			}
			catch (e) {
				this.logger.error('error has occured', e);
				deferred.rejectWith(scope, [e]);
			}
			finally {
				this.logger.trace('processing finished');
				deferred.resolveWith(scope);
			}

			return deferred.promise();
		},

		executeOnEach: function (itemProcessor, scope) {
			var logger = this.logger,
				items = this.items,
				key;

			for (key in items) {
				if (items.hasOwnProperty(key)) {//filtering object properties
					logger.trace('processing', key);
					if (itemProcessor.call(scope, items[key]) === false) { //aborting iteration by itemProcessor
						logger.trace('processing aborted by itemProcessor');
						break;
					}
				}
			}
		}

	});

	/**
	 * /iterator/AsyncObjectIteratorContext.js
	 */
	var AsyncObjectIteratorContext = Type.define({

		itemProcessor: null,

		scope: null,

		aborted: false,

		deferred: null,

		constructor: function (itemProcessor, scope) {
			this.itemProcessor = itemProcessor;
			this.scope = scope;

			this.aborted = false;
			this.deferred = $.Deferred();

			if (!$.isFunction(itemProcessor)) {
				this.abort();
			}
		},

		isAborted: function () {
			return this.aborted;
		},

		abort: function () {
			this.aborted = true;
		},

		resolve: function () {
			return this.deferred.resolveWith(this.scope);
		},

		reject: function (e) {
			this.abort();

			return this.deferred.rejectWith(this.scope, [e]);
		},

		promise: function () {
			return this.deferred.promise();
		},

		processItem: function (item) {
			var result = this.itemProcessor.call(this.scope, item);

			if (result === false) {
				this.abort();
			}

			return result;
		}
	});


	/**
	 * /iterator/AsyncObjectIterator.js
	 */

	var AsyncObjectIterator = Type.extend(ObjectIterator, {

		logger: LoggerFactory.create('AsyncObjectIterator'),

		defaults: {
			timeout: 0,
			itemsPerExecution: 1
		},

		itemsPerExecution: null,

		timeout: null,

		allItems: null,

		constructor: function (items, itemsPerExecution, timeout) {
			AsyncObjectIterator.superclass.constructor.call(this, null);

			var defaults = this.defaults;

			this.allItems = items;
			this.itemsPerExecution = this.isNonNegative(itemsPerExecution) ?
				itemsPerExecution : defaults.itemsPerExecution;
			this.timeout = this.isNonNegative(timeout) ? timeout : defaults.timeout;
		},

		eachItem: function (itemProcessor, scope) {
			var context = new AsyncObjectIteratorContext(itemProcessor, scope),
				groups = ObjectSplitter.groupItems(this.allItems, this.itemsPerExecution);

			if (this.logger.isEnabled(LogLevel.trace)) {
				this.logger.trace('iterating', {
					groupsCount: groups.length,
					maxGroupSize: this.itemsPerExecution,
					timeout: this.timeout
				});
			}

			this.eachItemsGroup(context, groups);

			return context.promise();
		},

		isNonNegative: function (value) {
			return isFinite(value) && value >= 0;
		},

		eachItemsGroup: function (context, groups) {
			if (!context.isAborted() && groups.length > 0) {
				this.logger.trace('iterating over group');

				var group = groups.shift();
				var scope = this;
				setTimeout(function () {
					scope.items = group;
					AsyncObjectIterator.superclass.eachItem.call(scope, context.processItem, context)
						.fail($.proxy(context.reject, context));

					scope.eachItemsGroup(context, groups);

				}, this.timeout);
			}
			else {
				context.resolve();
			}
		}

	});


	/**
	 * /modules/tasks/initModulesTask/SelectElementsStrategy.js
	 */
	var SelectElementsStrategy = Type.define({

		initializedSelector: defaults.initializedSelector,

		notInitializedSelector: ':not(' + defaults.initializedSelector + ')',

		execute: function ($scope, targetModules) {
			return null;
		}

	});

	/**
	 * /modules/tasks/initModulesTask/SelectElementsDefaultStrategy.js
	 */
	var SelectElementsDefaultStrategy = Type.extend(SelectElementsStrategy, {

		logger: LoggerFactory.create('SelectElementsDefaultStrategy'),

		execute: function ($scope, targetModules) {
			this.logger.trace('executing');

			var selector = this.createSelector(targetModules),
				$elements = selector ? ElementsUtil.find($scope, selector) : null;

			this.logger.trace('executed');

			return ($elements && $elements.length > 0) ? $elements : null;
		},

		createSelector: function (targetModules) {
			var selectors = [],
				modules = targetModules.items,
				module,
				i;

			for (i = 0; i < modules.length; i++) {
				module = modules[i];
				if (module.selector) {
					this.processSelector(module.selector, selectors);
				}
			}

			return selectors.join(',');
		},

		processSelector: function (selector, selectors) {
			var notInitializedSelector = this.notInitializedSelector,
				items = selector.split(','),
				i;

			for (i = 0; i < items.length; i++) {
				selectors.push(items[i] + notInitializedSelector);
			}
		}

	});

	/**
	 * /modules/tasks/initModulesTask/SelectElementsPrefetchStrategy.js
	 */
	var SelectElementsPrefetchStrategy = Type.extend(SelectElementsStrategy, {

		logger: LoggerFactory.create('SelectElementsPrefetchStrategy'),

		tagNamePattern: /^\w+/i,

		execute: function ($scope, targetModules) {
			this.logger.trace('executing');

			var selectors = this.createSelectors(targetModules);
			var $elements = null;

			if (selectors.prefetch) {
				$elements = ElementsUtil.find($scope, selectors.prefetch).not(this.initializedSelector);
			}

			this.logger.trace('executed');

			return ($elements && $elements.length > 0) ? $elements : null;
		},

		createSelectors: function (targetModules) {
			var result = this.initializeSelectors(),
				modules = targetModules.items,
				module,
				i;

			for (i = 0; i < modules.length; i++) {
				module = modules[i];
				if (module.selector) {
					this.processSelector(module.selector, result);
				}
			}

			result.all = result.all.join(',');
			result.prefetch = result.prefetch.join(',');

			return result;
		},

		initializeSelectors: function () {
			return {
				all: [],
				prefetch: [],
				prefetchMap: {}
			};
		},

		processSelector: function (selector, result) {
			var pattern = this.tagNamePattern,
				items = selector.split(','),
				item,
				tagName,
				i;

			result.all.push(selector);

			for (i = 0; i < items.length; i++) {
				item = items[i] === (null || undefined) ? "" : (items[i] + "").replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                tagName = pattern.exec(item);
				tagName = (tagName && tagName.length) ? tagName[0] : null;
				if (tagName != null) {
					item = tagName;
				}
				this.addToPrefetched(result, item);
			}
		},

		addToPrefetched: function (selectors, key) {
			if (!selectors.prefetchMap[key]) {
				selectors.prefetch.push(key);
				selectors.prefetchMap[key] = true;
			}
		}

	});

	/**
	 * /modules/tasks/DynamicModuleTaskQueue.js
	 */
	var DynamicModuleTaskQueue = Type.extend(TaskQueue, {

		relatedQueue: null,

		constructor: function (relatedQueue) {
			DynamicModuleTaskQueue.superclass.constructor.call(this);

			this.relatedQueue = relatedQueue || new TaskQueue();
		},

		process: function (task) {
			var index = this.joinIndex(task);
			if (index !== null) {
				this.join(task, index);
			}
			else {
				DynamicModuleTaskQueue.superclass.process.call(this, task);
			}
		},

		//abstract
		//protected
		join: function (task, index) {
		},

		//protected
		joinIndex: function (task) {
			var index = null;

			if (this.tasks.length > 0) {
				var id = this.relatedQueue.lastId();
				index = (id !== null) ? this.nextJoinIndex(id) : 0;
			}

			return index;
		},

		//private
		nextJoinIndex: function (minimalId) {
			var index = null,
				tasks = this.tasks,
				i;

			for (i = 0; index !== null && i < tasks.length; i++) {
				if (tasks[i].id > minimalId) {
					index = i;
				}
			}

			return index;
		}

	});

	/**
	 * /modules/tasks/FinalizeModulesTask.js
	 */
	var FinalizeModulesTask = Type.extend(Task, {

		logger: LoggerFactory.create('FinalizeModulesTask'),

		maxGroupSize: defaults.modulesGroupSize,

		$scope: null,

		$elements: null,

		modules: null,

		constructor: function ($scope, modules) {
			FinalizeModulesTask.superclass.constructor.call(this);

			this.modules = modules;
			this.$scope = $scope;
		},

		execute: function () {
			var logger = this.logger,
				$elements = ElementsUtil.find(this.$scope, defaults.initializedSelector);

			var deferred = this.deferred;
			if ($elements.length > 0) {
				logger.info('executing', this.id);

				this.$elements = $elements;

				var iterator = new AsyncObjectIterator(this.modules.map, this.maxGroupSize);
				iterator.eachItem(this.itemProcessor, this).always($.proxy(deferred.resolve, deferred));
			}
			else {
				logger.info('nothing to do', this.id);

				deferred.resolve();
			}
		},

		itemProcessor: function (module) {
			var $intersection = this.$elements.filter(module.$elements);

			if ($intersection.length > 0) {
				this.logger.trace('elements found', module.name, $intersection.length);

				this.$elements = this.$elements.not($intersection);
				module.$elements = module.$elements.not($intersection);

				this.finalizeElements(module, $intersection);
			}

			return this.$elements.length > 0;
		},

		finalizeElements: function (module, $elements) {
			var i;

			for (i = 0; i < $elements.length; i++) {
				module.finalize($elements.eq(i));
			}
		}

	});

	/**
	 * /modules/tasks/FinalizeModulesTaskQueue.js
	 */
	var FinalizeModulesTaskQueue = Type.extend(DynamicModuleTaskQueue, {

		logger: LoggerFactory.create('FinalizeModulesTaskQueue'),

		accepts: function (task) {
			return task.$scope && task.$scope.length;
		},

		join: function (task, index) {
			var targetTask = this.tasks[index];
			targetTask.$scope = targetTask.$scope.add(task.$scope);

			this.logger.trace('join task', {
				source: task.id,
				target: targetTask.id,
				targetIndex: index
			});

			var deferred = task.deferred;
			targetTask.promise.always($.proxy(deferred.resolve, deferred));

		}

	});

	/**
	 * /modules/tasks/InitModulesTask.js
	 */
	var InitModulesTask = Type.extend(Task, {

		notInitializedSelector: ':not(' + defaults.initializedSelector + ')',

		logger: LoggerFactory.create('InitModulesTask'),

		maxGroupSize: defaults.modulesGroupSize,

		elementsStrategy: null,

		modules: null,

		moduleIds: null,

		targetModules: null,

		$scope: null,

		$elements: null,

		rejectDelegate: null,

		isPrefetchRequired: false,

		constructor: function ($scope, moduleIds, modules) {
			InitModulesTask.superclass.constructor.call(this);

			this.isPrefetchRequired = !$.isFunction(document.getElementsByClassName);
			if (this.isPrefetchRequired) {
				this.maxGroupSize = 1;
			}
			this.elementsStrategy = this.selectElementsStrategy();

			this.$scope = $scope;
			this.moduleIds = moduleIds ? modules.filterIds(moduleIds) : null;
			this.modules = modules;
		},

		selectElementsStrategy: function () {
			return this.isPrefetchRequired ? new SelectElementsPrefetchStrategy() : new SelectElementsDefaultStrategy();
		},

		processAllModules: function () {
			return this.moduleIds == null;
		},

		execute: function () {
			var logger = this.logger;

			this.targetModules = this.processAllModules() ? this.modules : this.modules.select(this.moduleIds);

			if (this.targetModules.count() > 0) {
				logger.info('executing', this.id, {modulesCount: this.targetModules.count()});

				this.$elements = this.elementsStrategy.execute(this.$scope, this.targetModules);
				this.rejectDelegate = $.proxy(this.deferred.reject, this.deferred);
				this.executeBeforeInit();
			}
			else {
				logger.info('nothing to do', this.id);

				this.deferred.resolve();
			}
		},

		executeBeforeInit: function () {
			this.logger.trace('executing beforeInit()', this.id);

			var iterator = new AsyncObjectIterator(this.targetModules.map, this.maxGroupSize);
			iterator.eachItem(this.beforeInitProcessor, this)
				.done($.proxy(this.executeInit, this))
				.fail(this.rejectDelegate);
		},

		executeInit: function () {
			this.logger.trace('executing init()', this.id);

			var deferred = this.deferred;
			var iterator = new AsyncObjectIterator(this.targetModules.map, this.maxGroupSize);
			iterator.eachItem(this.initProcessor, this)
				.done($.proxy(deferred.resolve, deferred))
				.fail(this.rejectDelegate);
		},

		beforeInitProcessor: function (module) {
			module.beforeInit();
		},

		initProcessor: function (module) {
			var $elements = null;

			if (this.$elements && module.selector) {
				$elements = this.$elements.filter(module.selector).addClass(defaults.initializedClass);
			}

			module.init($elements || $());
		}

	});

	/**
	 * /modules/tasks/InitModulesTaskQueue.js
	 */
	var InitModulesTaskQueue = Type.extend(DynamicModuleTaskQueue, {

		logger: LoggerFactory.create('InitModulesTaskQueue'),

		accepts: function (task) {
			var isValidScope = task.$scope && task.$scope.length;

			return isValidScope && (task.moduleIds ? task.moduleIds.length > 0 : true);
		},

		join: function (task, index) {
			var targetTask = this.tasks[index];

			this.logger.trace('join task', {
				source: task.id,
				target: targetTask.id,
				targetIndex: index
			});

			this.joinTasks(targetTask, task);
		},

		joinTasks: function (targetTask, task) {
			this.joinScopes(targetTask, task);
			this.joinModules(targetTask, task);

			var deferred = task.deferred;
			targetTask.promise.always($.proxy(deferred.resolve, deferred));
		},

		joinScopes: function (targetTask, task) {
			if (ElementsUtil.isInScope(task.$scope, targetTask.$scope)) {
				//if targetTask's scope is in task's scope
				targetTask.$scope = task.$scope;
			}
			else if (!targetTask.$scope.is(task.$scope) && !ElementsUtil.isInScope(targetTask.$scope, task.$scope)) {
				//if scopes are different and task's scope is not in targetTask's scope
				targetTask.$scope = targetTask.$scope.add(task.$scope);
			}
		},

		joinModules: function (targetTask, task) {
			if (!targetTask.processAllModules() && task.processAllModules()) {
				targetTask.moduleIds = null;
			}
			else if (!targetTask.processAllModules() && !task.processAllModules()) {
				targetTask.moduleIds = this.joinModuleIds(targetTask.moduleIds, task.moduleIds);
			}
		},

		joinModuleIds: function (firstSet, secondSet) {
			var delta = firstSet.length - secondSet.length,
				target = delta >= 0 ? firstSet : secondSet,
				source = delta <= 0 ? secondSet : firstSet;

			this.addModuleIds(source, target);

			return target;
		},

		addModuleIds: function (source, target) {
			var i;

			for (i = 0; i < source.length; i++) {
				if ($.inArray(source[i], target) < 0) {
					target.push(source[i]);
				}
			}
		},

		//protected
		//override
		joinIndex: function (task) {
			var index = InitModulesTaskQueue.superclass.joinIndex.call(this, task);

			return index !== null ? this.findJoinIndex(task, index) : null;
		},

		findJoinIndex: function (task, startIndex) {
			var index = null,
				tasks = this.tasks,
				i;

			for (i = startIndex; index === null && i < tasks.length; i++) {
				if (this.isTaskJoinable(tasks[i], task)) {
					index = i;
				}
			}

			return index;
		},

		anyProcessesAllModules: function (targetTask, task) {
			return task.processAllModules() || targetTask.processAllModules();
		},

		isTaskJoinable: function (targetTask, task) {
			//check if scopes are equal
			var result = task.$scope.is(targetTask.$scope);

			//if not check if both tasks process all modules
			if (!result) {
				result = task.processAllModules() && targetTask.processAllModules();
			}

			//if not check if both tasks process equal sets of modules
			if (!(result || this.anyProcessesAllModules(targetTask, task))) {
				result = this.equalModuleIds(task.moduleIds, targetTask.moduleIds);
			}

			return result;
		},

		equalModuleIds: function (firstSet, secondSet) {
			var result = firstSet.length == secondSet.length,
				i;

			for (i = 0; result && i < firstSet.length; i++) {
				result = $.inArray(firstSet[i], secondSet) >= 0;
			}

			return result;
		}

	});

	/**
	 * /components/ComponentManager.js
	 */
	var ComponentManager = Type.define({

		defaults: {
			propertyName: '$scope',
			onUnregister: defaults.noOperation,
			onRegister: function ($element) {
				return {$scope: $element};
			},
			scope: null
		},

		components: null,

		config: null,

		constructor: function (settings) {
			settings = settings || {};

			this.components = [];
			this.config = $.extend(true, {}, this.defaults, settings);

			//make sure that onRegister is a function
			if (!$.isFunction(this.config.onRegister)) {
				this.config.onRegister = this.defaults.onRegister;
			}
		},

		register: function ($elements) {
			var component,
				onRegister = this.config.onRegister,
				scope = this.config.scope,
				i;

			for (i = 0; i < $elements.length; i++) {
				component = onRegister.call(scope, $elements.eq(i));
				this.components.push(component);
			}
		},

		unregister: function ($element) {
			var index = this.indexOfComponent($element),
				component;

			if (index >= 0) {
				component = this.components[index];
				this.components.splice(index, 1);
				this.config.onUnregister.call(this.config.scope, component);
			}
		},

		indexOfComponent: function ($element) {
			var items = this.components,
				propertyName = this.config.propertyName;

			if (items != null && propertyName != null) {
				items = this.selectProperty(propertyName);
			}

			return ElementsUtil.indexOfElement(items, $element);
		},

		selectProperty: function (propertyName) {
			var items = this.components,
				result = [],
				empty = {},
				item,
				i;

			for (i = 0; i < items.length; i++) {
				item = items[i] || empty;
				item = item[propertyName];
				if (item) {
					result.push(item);
				}
			}

			return result;
		}

	});

	/**
	 * /modules/StaticModule.js
	 */
	var StaticModule = Type.define({

		name: null,

		api: null,

		sharedApi: null,

		externalApi: null,

		requires: null,

		constructor: function (config) {
			this.name = config.name;
			this.api = config.api;
			this.sharedApi = config.sharedApi || null;
			this.externalApi = config.externalApi || {};
			this.requires = config.requires || defaults.emptyArray;

			this.processApi();

			this.updateRequiredModules();
		},

		init: function () {
			this.api.init();
		},

		//backward compatibility
		updateRequiredModules: function () {
			var requires = this.requires,
				item,
				i;

			for (i = 0; i < requires.length; i++) {
				item = requires[i];
				if ($.type(item) === 'string') {
					requires[i] = {
						name: item
					};
				}
			}
		},

		processApi: function () {
			this.api.init = this.processDelegate(this.api.init);
			this.api.external = this.externalApi;
		},

		processDelegate: function (delegate) {
			return this.isValidDelegate(delegate) ? delegate : defaults.noOperation;
		},

		isValidDelegate: function (delegate) {
			return $.isFunction(delegate);
		}

	});

	/**
	 * /modules/DynamicModule.js
	 */
	var DynamicModule = Type.extend(StaticModule, {

		$elements: null,

		selector: null,

		//private
		hasFinalize: false,

		constructor: function (config) {
			DynamicModule.superclass.constructor.call(this, config);

			this.beforeInit = config.api.beforeInit || defaults.noOperation;
			this.selector = config.selector || null;

			if (this.isFinalizable()) {
				this.$elements = $();
			}
		},

		init: function ($elements) {
			if (this.isFinalizable()) {
				this.$elements = this.$elements.add($elements);
			}
			this.api.init($elements);
		},

		beforeInit: function () {
			this.api.beforeInit();
		},

		finalize: function ($element) {
			if (this.hasFinalize) {
				this.api.finalize($element);
			}
		},

		isFinalizable: function () {
			return this.hasFinalize;
		},

		processApi: function () {
			DynamicModule.superclass.processApi.call(this);

			var api = this.api;
			api.beforeInit = this.processDelegate(api.beforeInit);
			this.hasFinalize = this.isValidDelegate(api.finalize);
		}

	});

	/**
	 * /modules/ComponentModule.js
	 */
	var ComponentModule = Type.extend(DynamicModule, {

		componentManager: null,

		constructor: function (config) {
			ComponentModule.superclass.constructor.call(this, config);

			this.componentManager = new ComponentManager({
				onRegister: this.onRegister,
				onUnregister: this.api.onUnregister,
				scope: this
			});
		},

		init: function ($elements) {
			if ($elements.length > 0) {
				this.componentManager.register($elements);
			}

			ComponentModule.superclass.init.call(this, $elements);
		},

		onRegister: function ($element) {
			var component = {
				$scope: $element
			};

			this.api.onRegister(component);

			return component;
		},

		finalize: function ($element) {
			ComponentModule.superclass.finalize.call(this, $element);

			this.componentManager.unregister($element);
		},

		isFinalizable: function () {
			return true;
		},

		processApi: function () {
			ComponentModule.superclass.processApi.call(this);

			this.api.onRegister = this.processDelegate(this.api.onRegister);
			this.api.onUnregister = this.processDelegate(this.api.onUnregister);
		}


	});

	/**
	 * /modules/DependencyGraphModuleAdapter.js
	 */
	var DependencyGraphModuleAdapter = Type.extend(DependencyGraphItemAdapter, {

		id: function (item) {
			return item.name;
		},

		dependencies: function (item) {
			return item.requires;
		},

		dependencyId: function (dependency) {
			return dependency.name;
		}

	});

	/**
	 * /registry/tasks/InitStaticModuleTask
	 */
	var InitStaticModuleTask = Type.extend(Task, {

		logger: LoggerFactory.create('InitStaticModuleTask'),

		maxGroupSize: defaults.modulesGroupSize,

		moduleIds: null,

		modules: null,

		constructor: function (id, modules) {
			InitStaticModuleTask.superclass.constructor.call(this);

			this.modules = modules;
			this.moduleIds = [];
			if (id) {
				this.moduleIds.push(id);
			}
		},

		execute: function () {
			var modules = this.modules.selectValues(this.moduleIds);
			var iterator = new AsyncObjectIterator(modules, this.maxGroupSize);

			this.logger.trace('executing', this.id, this.moduleIds);

			var deferred = this.deferred;
			iterator.eachItem(this.itemProcessor, this).always($.proxy(deferred.resolve, deferred));
		},

		itemProcessor: function (module) {
			module.init();
		}

	});

	/**
	 * /registry/tasks/InitStaticModuleTaskQueue.js
	 */
	var InitStaticModuleTaskQueue = Type.extend(TaskQueue, {

		logger: LoggerFactory.create('InitStaticModuleTaskQueue'),

		accepts: function (task) {
			return task.moduleIds.length;
		},

		process: function (task) {
			if (this.tasks.length > 0) {
				this.join(task);
			}
			else {
				InitStaticModuleTaskQueue.superclass.process.call(this, task);
			}
		},

		join: function (task) {
			var firstTask = this.tasks[0];

			this.logger.trace('join task', {
				source: task.id,
				target: firstTask.id
			});

			var moduleIds = firstTask.moduleIds;
			moduleIds.push.apply(moduleIds, task.moduleIds);

			var deferred = task.deferred;
			firstTask.promise.always($.proxy(deferred.resolve, deferred));
		}

	});

	/**
	 * /modules/ModuleRegistry.js
	 */
	var ModuleRegistry = Type.define({

		modules: null,

		constructor: function () {
			this.modules = new Collection();
		},

		add: function (module) {
			this.modules.add(module.name, module);
		}

	});

	/**
	 * /modules/StaticModuleRegistry.js
	 */
	var StaticModuleRegistry = Type.extend(ModuleRegistry, {

		taskRunner: null,

		taskQueue: null,

		constructor: function (taskRunner, taskQueue) {
			StaticModuleRegistry.superclass.constructor.call(this);

			this.taskRunner = taskRunner;
			this.taskQueue = taskQueue;
		},

		add: function (module) {
			StaticModuleRegistry.superclass.add.call(this, module);

			this.taskQueue.add(new InitStaticModuleTask(module.name, this.modules));
			this.taskRunner.executeNext();
		}

	});

	/**
	 * /modules/DynamicModuleRegistry.js
	 */
	var DynamicModuleRegistry = Type.extend(ModuleRegistry, {

		finalizableModules: null,

		constructor: function () {
			DynamicModuleRegistry.superclass.constructor.call(this);

			this.finalizableModules = new Collection();
		},

		add: function (module) {
			DynamicModuleRegistry.superclass.add.call(this, module);

			if (module.isFinalizable()) {
				this.finalizableModules.add(module.name, module);
			}
		}

	});

	/**
	 * /core/default/EventManager.js
	 */
	var EventManager = Type.extend(IEventManager, {

		events: null,

		constructor: function () {
			this.events = {};
		},

		dispatcherFor: function (moduleName, eventName) {
			var dispatcher = null,
				events = this.events;

			if (moduleName && eventName) {
				var namespace = events[moduleName];
				if (!(namespace && namespace[eventName])) {
					this.addEvent(moduleName, eventName);
				}
				dispatcher = events[moduleName][eventName];
			}

			return dispatcher;
		},

		//private
		addEvent: function (moduleName, eventName) {
			var events = this.events;

			if (!events[moduleName]) {
				events[moduleName] = {};
			}

			var namespace = events[moduleName];
			if (!namespace[eventName]) {
				namespace[eventName] = new EventDispatcher(moduleName, eventName);
			}
		}

	});

	/**
	 * /core/default/ModuleManager.js
	 */
	var ModuleManager = Type.extend(IModuleManager, {

		logger: LoggerFactory.create('ModuleManager'),

		dependencyGraph: null,

		modules: null,

		staticModuleRegistry: null,

		dynamicModuleRegistry: null,

		constructor: function (staticModuleManager, dynamicModuleManager) {
			this.dependencyGraph = new DependencyGraph(new DependencyGraphModuleAdapter());
			this.staticModuleRegistry = staticModuleManager;
			this.dynamicModuleRegistry = dynamicModuleManager;
			this.modules = {};
		},

		add: function (module) {
			var logger = this.logger;

			logger.trace('trying add module', module.name);
			if (!this.dependencyGraph.hasNode(module)) {
				this.modules[module.name] = module;
				logger.trace('module added', module.name);

				var ids = this.dependencyGraph.resolve(module);
				logger.debug('resolved module id\'s', ids);
				if (ids != null) {
					this.initializeModules(ids);
				}
			}
		},

		initializeModules: function (ids) {
			var modules = this.modules,
				module,
				i;

			for (i = 0; i < ids.length; i++) {
				module = modules[ids[i]];
				if (module) {
					this.initializeModule(module);
				}
			}
		},

		initializeModule: function (module) {
			this.injectApi(module);

			var registry = (module instanceof DynamicModule) ? this.dynamicModuleRegistry : this.staticModuleRegistry;
			registry.add(module);
		},


		injectApi: function (module) {
			var modules = this.modules,
				requires = module.requires,
				requiredModule,
				entry,
				i;

			for (i = 0; i < requires.length; i++) {
				entry = requires[i];
				requiredModule = modules[entry.name];
				if (entry.apiId) {
					module.externalApi[entry.apiId] = requiredModule.sharedApi || null;
				}
			}
		}

	});

	/**
	 * /core/default/TaskQueues.js
	 */

	var TaskQueues = Type.extend(ITaskQueues, {

		constructor: function () {
			this.initStaticModule = new InitStaticModuleTaskQueue();
			this.initializeDynamicModuleQueues();
		},

		initializeDynamicModuleQueues: function () {
			var initRelatedQueue = new CompositeTaskQueue();
			this.initDynamicModules = new InitModulesTaskQueue(initRelatedQueue);

			var finalizeRelatedQueue = new CompositeTaskQueue();
			this.finalizeDynamicModules = new FinalizeModulesTaskQueue(finalizeRelatedQueue);

			initRelatedQueue.addQueue(this.finalizeDynamicModules);
			finalizeRelatedQueue.addQueue(this.initDynamicModules);
		}

	});

	/**
	 * /core/default/Core.js
	 */

	var Core = Type.asSingleton(Type.extend(ICore, {

		eventManager: null,

		taskQueues: null,

		taskRunner: null,

		moduleManager: null,

		dynamicModuleRegistry: null,

		ready: false,

		constructor: function () {
			this.eventManager = new EventManager();
			this.taskQueues = new TaskQueues();
			this.taskRunner = this.initializeTaskRunner();
			this.moduleManager = this.initializeModuleManager();
			this.dynamicModuleRegistry = this.moduleManager.dynamicModuleRegistry;
			this.whenReady($.proxy(this.onReady, this));
		},

		isValidModuleConfig: function (config) {
			return config && config.name && config.api;
		},

		addModule: function (module) {
			this.moduleManager.add(module);
		},

		queueInitTask: function ($scope, moduleIds) {
			var task = new InitModulesTask($scope, moduleIds, this.dynamicModuleRegistry.modules);

			this.taskQueues.initDynamicModules.add(task);
			this.taskRunner.executeNext();

			return task.promise;
		},

		queueFinalizeTask: function ($scope) {
			var task = new FinalizeModulesTask($scope, this.dynamicModuleRegistry.finalizableModules);

			this.taskQueues.finalizeDynamicModules.add(task);
			this.taskRunner.executeNext();

			return task.promise;
		},

		whenReady: function (delegate) {
			$(document).ready(delegate);
		},

		isReady: function () {
			return this.ready;
		},

		onReady: function () {
			this.ready = true;
		},

		initializeTaskRunner: function () {
			var taskRunner = new TaskRunner(),
				queues = this.taskQueues;

			taskRunner.addQueue(queues.initStaticModule);

			var dynamicModulesQueue = new CompositeTaskQueue();
			dynamicModulesQueue.addQueue(queues.initDynamicModules);
			dynamicModulesQueue.addQueue(queues.finalizeDynamicModules);

			taskRunner.addQueue(dynamicModulesQueue);

			return taskRunner;
		},

		initializeModuleManager: function () {
			var staticModuleRegistry = new StaticModuleRegistry(this.taskRunner, this.taskQueues.initStaticModule),
				dynamicModuleRegistry = new DynamicModuleRegistry();

			return new ModuleManager(staticModuleRegistry, dynamicModuleRegistry);
		}

	})).create().instance();


	/**
	 * diagnostic/default/Diagnostic.js
	 */

	/**
	 * /api/logger.js
	 */

	var logger = LoggerFactory.create('CogJS', 3);

	/**
	 * /api/Type.js
	 */

	api.Type = {
		/**
		 * Defines a class
		 * @param properties properties and methods of a new class
		 */
		define: Type.define,
		/**
		 * Extends a class
		 * @param Type a base class
		 * @param overrides properties and methods of a new class
		 * @returns {Function} a new class
		 */
		extend: Type.extend,
		asSingleton: Type.asSingleton
	};


	/**
	 * /api/Modules.js
	 */

	/**
	 * Register new static module - a module initialized instantly exactly once when all dependencies are resolved.
	 * This type of modules should require API of static modules only.In other case dependencies won't be resolved
	 * correctly. Other types of modules can require API of static modules.
	 * @param options - an object with required and optional properties of a module:
	 *  name - name of the module (required)
	 *  api - API object of the module (required); requires init method. Other will be ignored.
	 *  api.init - init function for module (optional, executed once)
	 *  sharedApi - object with intenal API (API shared with other modules)
	 *  extetnalApi - object where all required API (shared by other modules) will be inject; it also will be injected
	 *                into api object as external property.
	 *  requires - an array with names of required components or objects with two properties: name (name of the required
	 *             module) and apiId (property name under which API shared by the required module will be injected).
	 *  Note: If component A requires component B, component B cannot require component A.
	 */
	api.registerStatic = function (options) {
		if (Core.isValidModuleConfig(options)) {
			Core.addModule(new StaticModule(options));
		}
		else {
			logger.error('Invalid StaticModule config', options);
		}
	};

	/**
	 * Register new module
	 * @param options - an object with required and optional properties of a module:
	 *  name - name of the module (required)
	 *  api - API object of the module (required)
	 *  api.init - init function for module
	 *  api.beforeInit - beforeInit function for module
	 *  sharedApi - object with intenal API (API shared with other modules)
	 *  extetnalApi - object where all required API (shared by other modules) will be inject; it also will be injected
	 *                into api object as external property.
	 *  requires - an array with names of required components or objects with two properties: name (name of the required
	 *             module) and apiId (property name under which API shared by the required module will be injected).
	 *  selector - a jQuery selector
	 *  Note: If component A requires component B, component B cannot require component A.
	 */
	api.register = function (options) {
		if (Core.isValidModuleConfig(options)) {
			Core.addModule(new DynamicModule(options));
		}
		else {
			logger.error('Invalid DynamicModule config', options);
		}
	};

	/**
	 * Register new component module - a module with {@link ComponentManager} attached to init and finalize methods
	 * @param options - an object with required and optional properties of a module:
	 *  name - name of the module (required)
	 *  api - API object of the module (required); requires onRegister method,
	 *        finalize and onUnregister are optional.
	 *  api.init - init function for module (optional, executed after api.onRegister)
	 *  api.beforeInit - beforeInit function for module
	 *  api.onRegister - executed when component is created (required)
	 *  api.onUnregister - executed when component is destroyed (optional)
	 *  sharedApi - object with intenal API (API shared with other modules)
	 *  extetnalApi - object where all required API (shared by other modules) will be inject; it also will be injected
	 *                into api object as external property.
	 *  requires - an array with names of required components or objects with two properties: name (name of the required
	 *             module) and apiId (property name under which API shared by the required module will be injected).
	 *  selector - a jQuery selector
	 *  Note: If component A requires component B, component B cannot require component A.
	 */
	api.registerComponent = function (options) {
		if (Core.isValidModuleConfig(options) && $.isFunction(options.api.onRegister)) {
			Core.addModule(new ComponentModule(options));
		}
		else {
			logger.error('Invalid ComponentModule config', options);
		}
	};

	/**
	 * /api/Lifecycle.js
	 */

	/**
	 * Finalizes all dynamic modules bound with elements and all component modules in $scope if passed,
	 * globally otherwise
	 */
	api.finalize = function ($scope) {
		return Core.isReady() ? Core.queueFinalizeTask($scope || $(defaults.globalScopeSelector)) : null;
	};

	/**
	 *
	 * @param {object} option - Optional config object. It can contain '$element' property with jQuery object
	 * of a container element and/or 'modules' property - array with modules to init
	 */
	api.init = (function (options) {

		function scopeFrom(options) {
			return options.$element || $(defaults.globalScopeSelector);
		}

		function moduleIdsFrom(options) {
			return $.isArray(options.modules) ? options.modules : null;
		}

		function queueInitTask(options) {
			var promise = null;

			if (Core.isReady()) {
				if (options && options instanceof Cog.jQuery()) {
					// support shorthand syntax; Cog.init( $myElement );
					options = {$element: options};
				}
				options = options || {};
				promise = Core.queueInitTask(scopeFrom(options), moduleIdsFrom(options));
			}

			return promise;
		}

		return queueInitTask;
	}());

	/**
	 * /api/Events.js
	 */

	/**
	 * Attaches event listener to any event
	 * @param {string} moduleName Name of the module that registered the event
	 * @param {string} eventName Name of the event to attach the listener to
	 * @param {function} fn reference to the listener
	 * @param {object} options Optional object with special options of attaching listener.
	 *   This might contain scope property which enables to control the 'scope' of the
	 *   listener and/or 'data' property - an object with parameters passed to the listener
	 *   and/or 'disposable' property - listener will be removed after first event
	 * @returns {object} metadata object, which can be used to remove the listener or null
	 */

	api.addListener = function (moduleName, eventName, fn, options) { /* jshint ignore:line */ //backward compatibility
		var dispatcher = $.isFunction(fn) ? Core.eventManager.dispatcherFor(moduleName, eventName) : null,
			metadata = null;

		if (dispatcher != null) {
			metadata = dispatcher.addHandler(fn, options);
		}
		else {
			logger.error('Invalid EventHandler config', arguments);
		}

		return metadata;
	};

	/**
	 * Removes event listener
	 * @param {object} metadata listener metadata returned by addListener method.
	 * @returns {boolean} true if listener has been found, false otherwise
	 */
	api.removeListener = function (metadata) {
		var dispatcher = null,
			removed = false;

		if (metadata) {
			dispatcher = Core.eventManager.dispatcherFor(metadata.module, metadata.event);
			removed = dispatcher.removeHandler(metadata.id);
		}

		return removed;
	};

	/**
	 *    Fires any defined event
	 *    @param {string} moduleName Name of the module that registered the event
	 *    @param {string} eventName Name of the event to attach the listener to
	 *    @param {object} eventData Optional object containing special parameters passed to listeners
	 */
	api.fireEvent = function (moduleName, eventName, eventData) {
		var dispatcher = Core.eventManager.dispatcherFor(moduleName, eventName);

		if (dispatcher != null) {
			dispatcher.dispatch(eventData);
		}
	};

	/**
	 *    Fires any defined event asynchronously
	 *    @param {string} moduleName Name of the module that registered the event
	 *    @param {string} eventName Name of the event to attach the listener to
	 *    @param {object} eventData Optional object containig special parameters passed to listeners
	 */
	api.fireEventAsync = function (moduleName, eventName, eventData) {
		var dispatcher = Core.eventManager.dispatcherFor(moduleName, eventName);

		if (dispatcher != null) {
			dispatcher.dispatchAsync(eventData);
		}
	};

	/**
	 * /api/Utils.js
	 */

	/**
	 * Wrapper around $(document).ready - fires given function when (or if) document is ready.
	 */
	api.ready = function (fn) {
		Core.whenReady(fn);
	};

	/**
	 * Checks if $scope is a parent of $element.
	 * @param {object} $scope jQuery object representing a scope.
	 * @param {object} $element jQuery object.
	 * @return true if $scope is a parent of $container , false otherwise
	 */
	api.isInScope = function ($scope, $element) {
		return ElementsUtil.isInScope($scope, $element);
	};

	/**
	 * Finds all children objects matching selector and adds $scope if it matches selector
	 * @param {object} $scope jQuery object representing a scope.
	 * @param {object} selector jQuery selector.
	 * @return a set of matching elements
	 */
	api.find = function ($scope, selector) {
		return ElementsUtil.find($scope, selector);
	};

	/**
	 * Returns jQuery used by the framework
	 */
	api.jQuery = function () {
		return $;
	};

	/**
	 * Wrapper around $(document).ready - fires given function when (or if) document is ready.
	 */
	api.logger = function (source, maxDepth) {
		var logger = null;

		if (source) {
			logger = WrapperFactory.create(LoggerFactory.create(source, maxDepth), ['error', 'debug', 'info']);
		}

		return logger;
	};

	/**
	 * /api/Cookie.js
	 */
// inspired by http://www.quirksmode.org/js/cookies.html
	api.Cookie = {

		create: function (name, value, days) {
			var expires = '',
				date;

			if (days) {
				date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = '; expires=' + date.toGMTString();
			}

			document.cookie = name + '=' + value + expires + '; path=/';
		},

		read: function (name) {
			var nameEQ = name + '=',
				ca = document.cookie.split(';'),
				c = null,
				i;

			for (i = 0; i < ca.length; i++) {
				c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1, c.length);
				}
				if (c.indexOf(nameEQ) === 0) {
					return c.substring(nameEQ.length, c.length);
				}
			}
			return null;
		},

		erase: function (name) {
			api.Cookie.create(name, '', -1);
		}

	};

	/**
	 * /api/default/Diagnostic.js
	 */

	/**
	 * /init.js
	 */
	Core.whenReady(api.init);


	return api;
}(document, jQuery.noConflict()));
