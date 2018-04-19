var REGEX_DOT_G = /\./g,
    BSLASH_DOT = '\.',
    REGEX_STAR_G = /\*/g,
    ID_LENGTH = 16,
    // static export
    JSDS,
    // private props
    randoms = [],
    // private functions
    storeIt,
    update,
    mergeArraysIntoSet,
    arrayContains,
    arrayRemoveItem,
    fire,
    listenerApplies,
    removeListener,
    getCompleteKey,
    pullOutKeys,
    toRegex,
    valueMatchesKeyString,
    clone,
    getValue,
    getRandomId,
    generateRandomId;

/*************************/
/* The JSDataStore Class */
/*************************/

function JSDataStore(id) {
    // data stores
    this._s = {};
    // event listeners
    this._l = {};
    this.id = id;
}

JSDataStore.prototype = {

    /**
     * Stores data
     *
     * key {String}: the key to be used to store the data. The same key can be used to retrieve
     *               the data
     * val {Object}: Any value to be stored in the store
     * opts {Object} (optional): options to be used when storing data:
     *                          'update': if true, values already existing within objects and
     *                                    arrays will not be clobbered
     * returns {Object}: The last value stored within specified key or undefined
     *
     * (fires 'store' event)
     */
    set: function(key, val, opts /*optional*/) {
        var result;
        opts = opts || { update: false };
        fire.call(this, 'set', {
            key: key,
            value: val,
            id: this.id,
            when: 'before',
            args: Array.prototype.slice.call(arguments, 0, arguments.length)
        });
        result = storeIt(this._s, key, opts, val);
        fire.call(this, 'set', {
            key: key,
            value: val,
            id: this.id,
            when: 'after',
            result: this.get(key, {quiet: true})
        });
        return result;
    },

    /**
     * Gets data back out of store
     *
     * key {String}: the key of the data you want back
     * returns {Object}: the data or undefined if key doesn't exist
     *
     * (fires 'get' event)
     */
    get: function(key) {
        var s = this._s, keys, i=0, j=0, opts, result, splitKeys,
            args = Array.prototype.slice.call(arguments, 0, arguments.length);

        opts = args[args.length-1];
        if (typeof opts === 'string') {
            opts = {};
        } else {
            args.pop();
        }

        if (! opts.quiet) {
            fire.call(this, 'get', {
                key: key,
                when: 'before',
                args: args
            });
        }

        if (args.length === 1 && key.indexOf(BSLASH_DOT) < 0) {
            result = s[key];
        } else {
            if (args.length > 1) {
                keys = [];
                for (i=0; i<args.length; i++) {
                    if (args[i].indexOf(BSLASH_DOT) > -1) {
                        splitKeys = args[i].split(BSLASH_DOT);
                        for (j=0; j<splitKeys.length; j++) {
                            keys.push(splitKeys[j]);
                        }
                    } else {
                        keys.push(args[i]);
                    }
                }
            } else if (key.indexOf(BSLASH_DOT) > -1) {
                keys = key.split(BSLASH_DOT);
            }

            result = getValue(s, keys);
        }

        if (! opts.quiet) {
            fire.call(this, 'get', {
                key:key,
                value: result,
                when: 'after',
                result: result
            });
        }
        return result;
    },

    /**
     * Adds a listener to this store. The listener will be executed when an event of
     * the specified type is emitted and all the conditions defined in the parameters
     * are met.
     *
     * type {String}: the type of event to listen for ('store', 'get', 'clear', etc.)
     * options {object}: an object that contains one or more of the following configurations:
     *                  'callback': the function to be executed
     *                  'scope': the scope object for the callback execution
     *                  'key': the storage key to listen for. If specified only stores into this key will
     *                          cause callback to be executed
     *                  'when': 'before' or 'after' (default is 'after')
     */
    on: function(type, opts) {
        var me = this,
            cbid = getRandomId(),
            key = opts.key,
            fn = opts.callback,
            scope = opts.scope || this,
            when = opts.when || 'after';
        if (!this._l[type]) {
            this._l[type] = [];
        }
        this._l[type].push({id: cbid, callback:fn, scope:scope, key: key, when: when});
        return {
            id: cbid,
            remove: function() {
                removeListener(me._l[type], cbid);
            }
        };
    },

    before: function(type, key, cb, scpe) {
        var callback = cb, scope = scpe;
        // key is optional
        if (typeof key === 'function') {
            callback = key;
            scope = cb;
            key = undefined;
        }
        return this.on(type, {
            callback: callback,
            key: key,
            when: 'before',
            scope: scope
        });
    },

    after: function(type, key, cb, scpe) {
        var callback = cb, scope = scpe;
        // key is optional
        if (typeof key === 'function') {
            callback = key;
            scope = cb;
            key = undefined;
        }
        return this.on(type, {
            callback: callback,
            key: key,
            when: 'after',
            scope: scope
        });
    },

    /**
     * Removes all data from store
     *
     * (fires 'clear' event)
     */
    clear: function() {
        this._s = {};
        fire.call(this, 'clear');
    },

    /**
     * Removes all internal references to this data store. Note that to entirely release
     * store object for garbage collection, you must also set any local references to the
     * store to null!
     *
     * (fires 'remove' and 'clear' events)
     */
    remove: function() {
        var ltype, optsArray, opts, i;
        this.clear();
        delete JSDS._stores[this.id];
        arrayRemoveItem(randoms, this.id);
        fire.call(this, 'remove');
    }
};

/*************************/
/* Global JSDS namespace */
/*************************/

JSDS = {

    _stores: {},

    /**
     * Create a new data store object. If no id is specified, a random id will be
     * generated.
     *
     * id {String} (optional): to identify this store for events and later retrieval
     */
    create: function(id) {

        id = id || getRandomId();

        if (this._stores[id]) {
            throw new Error('Cannot overwrite existing data store "' + id + '"!');
        }

        this._stores[id] = new JSDataStore(id);

        return this._stores[id];
    },

    /**
     * Retrieves an existing data store object by id
     *
     * id {String}: the id of the store to retrieve
     * returns {JSDataStore} the data store
     */
    get: function(id) {
        return this._stores[id];
    },

    /**
     * Removes all data stores objects. Specifically, each JSDataStore object's remove()
     * method is called, and all local references to each are deleted.
     */
    clear: function() {
        var storeId;
        for (storeId in this._stores) {
            if (this._stores.hasOwnProperty(storeId)) {
                this._stores[storeId].remove();
                delete this._stores[storeId];
            }
        }
        this._stores = {};
    },

    /**
     * Returns a count of the existing data stores in memory
     */
    count: function() {
        var cnt = 0, p;
        for (p in this._stores) {
            if (this._stores.hasOwnProperty(p)) {
                cnt++;
            }
        }
        return cnt;
    },

    /**
     * Returns a list of ids [String] for all data store obects in memory
     */
    ids: function() {
        var id, ids = [];
        for (id in this._stores) {
            if (this._stores.hasOwnProperty(id)) {
                ids.push(id);
            }
        }
        return ids;
    }
};

/*****************/
/* PRIVATE STUFF */
/*****************/

// recursive store function
storeIt = function(store, key, opts, val, oldVal /*optional*/) {
    var result, keys, oldKey;
    if (key.indexOf(BSLASH_DOT) >= 0) {
        keys = key.split('.');
        oldVal = store[keys[0]] ? clone(store[keys[0]]) : undefined;
        oldKey = keys.shift();
        if (store[oldKey] === undefined) {
            store[oldKey] = {};
        }
        return storeIt(store[oldKey], keys.join('.'), opts, val, oldVal);
    }
    result = oldVal ? oldVal[key] : store[key];
    // if this is an update, and there is an old value to update
    if (opts.update) {
        update(store, val, key);
    }
    // if not an update, just overwrite the old value
    else {
        store[key] = val;
    }
    return result;
};

// recursive update function used to overwrite values within the store without
// clobbering properties of objects
update = function(store, val, key) {
    var vprop;
    if (typeof val !== 'object' || val instanceof Array) {
        if (store[key] && val instanceof Array) {
            mergeArraysIntoSet(store[key], val);
        } else {
            store[key] = val;
        }
    } else {
        for (vprop in val) {
            if (val.hasOwnProperty(vprop)) {
                if (!store[key]) {
                    store[key] = {};
                }
                if (store[key].hasOwnProperty(vprop)) {
                    update(store[key], val[vprop], vprop);
                } else {
                    store[key][vprop] = val[vprop];
                }
            }
        }
    }
};

// merge two arrays without duplicate values
mergeArraysIntoSet = function(lhs, rhs) {
    var i=0;
    for (; i<rhs.length; i++) {
        if (!arrayContains(lhs, rhs[i])) {
            lhs.push(rhs[i]);
        }
    }
};

// internal utility function
arrayContains = function(arr, val, comparator /* optional */) {
    var i=0;
    comparator = comparator || function(lhs, rhs) {
        return lhs === rhs;
    };
    for (;i<arr.length;i++) {
        if (comparator(arr[i], val)) {
            return true;
        }
    }
    return false;
};

arrayRemoveItem = function(arr, item) {
    var i, needle;
    for (i = 0; i< arr.length; i++) {
        if (arr[i] === item) {
            needle = i;
            break;
        }
    }
    if (needle) {
        arr.splice(needle, 1);
    }
};

// fire an event of 'type' with included arguments to be passed to listeners functions
// WARNING: this function must be invoked as fire.call(scope, type, args) because it uses 'this'.
// The reason is so this function is not publicly exposed on JSDS instances
fire = function(type, fireOptions) {
    var i, opts, scope, listeners, pulledKeys,
        listeners = this._l[type] || [];

    fireOptions = fireOptions || {};

    if (listeners.length) {
        for (i=0; i<listeners.length; i++) {
            opts = listeners[i];
            if (listenerApplies.call(this, opts, fireOptions)) {
                scope = opts.scope || this;
                if (opts.key && fireOptions) {
                    if (opts.key.indexOf('*') >= 0) {
                        pulledKeys = pullOutKeys(fireOptions.value);
                        fireOptions.value = {};
                        fireOptions.value.key = fireOptions.key + pulledKeys;
                        fireOptions.value.value = getValue(this._s, fireOptions.value.key.split('.'));
                    } else {
                        fireOptions.value = getValue(this._s, opts.key.split('.'));
                    }
                }
                if (fireOptions.args) {
                    opts.callback.apply(scope, fireOptions.args);
                } else if (fireOptions.result) {
                    opts.callback.call(scope, fireOptions.result);
                } else {
                    opts.callback.call(scope, type, fireOptions);
                }
            }
        }
    }
};

// WARNING: this function must be invoked as listenerApplies.call(scope, listener, crit) because it uses 'this'.
// The reason is so this function is not publicly exposed on JSDS instances
listenerApplies = function(listener, crit) {
    // console.log(
    //         "Event %s:%s ... does %s:%s apply?",
    //         crit.when, crit.key, listener.when, listener.key
    //     )
    var result = false, last, sub, k, replacedKey, breakout = false;
    if (listener.when && crit.when) {
        if (listener.when !== crit.when) {
            return false;
        }
    }
    if (!listener.key || !crit) {
        return true;
    }
    if (!crit.key || crit.key.match(toRegex(listener.key))) {
        return true;
    }
    last = crit.key.length;
    while (!breakout) {
        sub = crit.key.substr(0, last);
        last = sub.lastIndexOf(BSLASH_DOT);
        if (last < 0) {
            k = sub;
            breakout = true;
        } else {
            k = sub.substr(0, last);
        }
        if (listener.key.indexOf('*') === 0) {
            return valueMatchesKeyString(crit.value, listener.key.replace(/\*/, crit.key).substr(crit.key.length + 1));
        } else if (listener.key.indexOf('*') > 0) {
            replacedKey = getCompleteKey(crit);
            return toRegex(replacedKey).match(listener.key);
        }
        return valueMatchesKeyString(crit.value, listener.key.substr(crit.key.length+1));
    }
    return result;
};

removeListener = function(listeners, id) {
    var i, l, needle;
    for (i=0; i < listeners.length; i++) {
        l = listeners[i];
        if (l.id && l.id === id) {
            needle = i;
            break;
        }
    }
    if (typeof needle !== 'undefined') {
        listeners.splice(needle, 1);
    }
};

getCompleteKey = function(o) {
    var val = o.value, key = o.key;
    return key + pullOutKeys(val);
};

pullOutKeys = function(v) {
    var p, res = '';
    for (p in v) {
        if (v.hasOwnProperty(p)) {
            res += '.' + p;
            if (typeof v[p] === 'object' && !(v[p] instanceof Array)) {
                res += pullOutKeys(v[p]);
            }
        }
    }
    return res;
};

toRegex = function(s) {
    return s.replace(REGEX_DOT_G, '\\.').replace(REGEX_STAR_G, '\.*');
};

valueMatchesKeyString = function(val, key) {
    var p, i=0, keys = key.split('.');
    for (p in val) {
        if (val.hasOwnProperty(p)) {
            if (keys[i] === '*' || p === keys[i]) {
                if ((typeof val[p] === 'object') && !(val[p] instanceof Array)) {
                    return valueMatchesKeyString(val[p], keys.slice(i+1).join('.'));
                } else {
                    return true;
                }
            }
        }
        i++;
    }
    return false;
};

// used to copy branches within the store. Object and array friendly
clone = function(val) {
    var newObj, i, prop;
    if (val instanceof Array) {
        newObj = [];
        for (i=0; i<val.length; i++) {
            newObj[i] = clone(val[i]);
        }
    } else if (typeof val === 'object'){
        newObj = {};
        for (prop in val) {
            if (val.hasOwnProperty(prop)) {
                newObj[prop] = clone(val[prop]);
            }
        }
    } else {
        return val;
    }
    return newObj;
};

// returns a value from a store given an array of keys that is meant to describe depth
// within the storage tree
getValue = function(store, keys) {
    var key = keys.shift(), endKey, arrResult, p,
        keysClone;
    if (key === '*') {
        arrResult = [];
        for (p in store) {
            if (store.hasOwnProperty(p)) {
                keysClone = clone(keys);
                arrResult.push(getValue(store[p], keysClone));
            }
        }
        return arrResult;
    }
    if (keys[0] && store[key] && (store[key][keys[0]] || keys[0] === '*')) {
        return getValue(store[key], keys);
    } else {
        if (keys.length) {
            endKey = keys[0];
        } else {
            endKey = key;
        }
        return store[endKey];
    }
};

generateRandomId = function(length) {
    var text = "", i,
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for(i = 0; i < length; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

getRandomId = function() {
    var id = generateRandomId(ID_LENGTH);
    // no duplicate ids allowed
    while (arrayContains(randoms, id)) {
        id = generateRandomId(ID_LENGTH);
    }
    randoms.push(id);
    return id;
};

module.exports = JSDS
