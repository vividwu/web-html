// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var HINT_ELEMENT_CLASS        = "CodeMirror-hint";
  var ACTIVE_HINT_ELEMENT_CLASS = "CodeMirror-hint-active";

  // This is the old interface, kept around for now to stay
  // backwards-compatible.
  CodeMirror.showHint = function(cm, getHints, options) {
    if (!getHints) return cm.showHint(options);
    if (options && options.async) getHints.async = true;
    var newOpts = {hint: getHints};
    if (options) for (var prop in options) newOpts[prop] = options[prop];
    return cm.showHint(newOpts);
  };

  CodeMirror.defineExtension("showHint", function(options) {
    options = parseOptions(this, this.getCursor("start"), options);
    var selections = this.listSelections()
    if (selections.length > 1) return;
    // By default, don't allow completion when something is selected.
    // A hint function can have a `supportsSelection` property to
    // indicate that it can handle selections.
    if (this.somethingSelected()) {
      if (!options.hint.supportsSelection) return;
      // Don't try with cross-line selections
      for (var i = 0; i < selections.length; i++)
        if (selections[i].head.line != selections[i].anchor.line) return;
    }

    if (this.state.completionActive) this.state.completionActive.close();
    var completion = this.state.completionActive = new Completion(this, options);
    if (!completion.options.hint) return;

    CodeMirror.signal(this, "startCompletion", this);
    completion.update(true);
  });
  CodeMirror.defineExtension("showHint1", function(options,datas) {
    options = parseOptions(this, this.getCursor("start"), options);
    var selections = this.listSelections()
    if (selections.length > 1) return;
    // By default, don't allow completion when something is selected.
    // A hint function can have a `supportsSelection` property to
    // indicate that it can handle selections.
    if (this.somethingSelected()) {
      if (!options.hint.supportsSelection) return;
      // Don't try with cross-line selections
      for (var i = 0; i < selections.length; i++)
        if (selections[i].head.line != selections[i].anchor.line) return;
    }

    if (this.state.completionActive) this.state.completionActive.close();
    var completion = this.state.completionActive = new Completion(this, options);
    if (!completion.options.hint) return;

    CodeMirror.signal(this, "startCompletion", this);

    completion.update1(true,datas);
  });
  function Completion(cm, options) {
    this.cm = cm;
    this.options = options;
    this.widget = null;
    //this.widget1 = null;
    this.debounce = 0;
    this.tick = 0;
    this.startPos = this.cm.getCursor("start");
    this.startLen = this.cm.getLine(this.startPos.line).length - this.cm.getSelection().length;

    var self = this;
    cm.on("cursorActivity", this.activityFunc = function() { self.cursorActivity(); });
  }

  var requestAnimationFrame = window.requestAnimationFrame || function(fn) {
    return setTimeout(fn, 1000/60);
  };
  var cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;

  Completion.prototype = {
    close: function() {
      if (!this.active()) return;
      this.cm.state.completionActive = null;
      this.tick = null;
      this.cm.off("cursorActivity", this.activityFunc);

      if (this.widget && this.data) CodeMirror.signal(this.data, "close");
      if (this.widget) {
        this.widget.close();
       }
      /*if (this.widget1) {
         this.widget1.close();
      }*/
      CodeMirror.signal(this.cm, "endCompletion", this.cm);
    },

    active: function() {
      return this.cm.state.completionActive == this;
    },

    pick: function(data, i) {
      var completion = data.list[i];
      if (completion.hint) completion.hint(this.cm, data, completion);
      else this.cm.replaceRange(getText(completion), completion.from || data.from,
                                completion.to || data.to, "complete");
      CodeMirror.signal(data, "pick", completion);
      this.close();
    },

    cursorActivity: function() {
      if (this.debounce) {
        cancelAnimationFrame(this.debounce);
        this.debounce = 0;
      }

      var pos = this.cm.getCursor(), line = this.cm.getLine(pos.line);
      if (pos.line != this.startPos.line || line.length - pos.ch != this.startLen - this.startPos.ch ||
          pos.ch < this.startPos.ch || this.cm.somethingSelected() ||
          (pos.ch && this.options.closeCharacters.test(line.charAt(pos.ch - 1)))) {
        this.close();
      } else {
        var self = this;
        this.debounce = requestAnimationFrame(function() {self.update();});
        if (this.widget)
        {
          this.widget.disable();
         }
        /*if (this.widget1)
        {
           this.widget1.disable();
        }*/
      }
    },

    update: function(first) {
      if (this.tick == null) return;
      if (!this.options.hint.async) {
        this.finishUpdate(this.options.hint(this.cm, this.options), first);
      } else {
        var myTick = ++this.tick, self = this;
        this.options.hint(this.cm, function(data) {
          if (self.tick == myTick) self.finishUpdate(data, first);
        }, this.options);
      }
    },
    update1: function(first,datas) {
      if (this.tick == null) return;
      if (!this.options.hint.async) {
        //
        //datas = JSON.parse(datas);
        this.finishUpdate1(datas, first);
      } else {
        var myTick = ++this.tick, self = this;
        this.options.hint(this.cm, function(data) {
          if (self.tick == myTick) self.finishUpdate(data, first);
        }, this.options);
      }
    },
    finishUpdate1: function(data, first) {
      if (this.data)
      {
        CodeMirror.signal(this.data, "update");
      }

      var picked = (this.widget && this.widget.picked) || (first && this.options.completeSingle);
      if (this.widget)
      {
        this.widget.close();
       }
   /*   if (this.widget1)
      {
         this.widget1.close();
      }*/
      if (data && this.data && isNewCompletion(this.data, data))
      {
        return;
      }
      this.data = data;


      if (data && data.list.length) {
        if (picked && data.list.length == 1) {
          this.pick(data, 0);
        } else {
          this.widget = new Widget1(this, data);
          //new Widget1(this, data);
          CodeMirror.signal(data, "shown");
        }
      }
    },
    finishUpdate: function(data, first) {
      if (this.data)
      {
        CodeMirror.signal(this.data, "update");
      }

      var picked = (this.widget && this.widget.picked) || (first && this.options.completeSingle);
      if (this.widget)
      {
        this.widget.close();
      }

      if (data && this.data && isNewCompletion(this.data, data))
      {
        return;
      }
      this.data = data;


      if (data && data.list.length) {
        if (picked && data.list.length == 1) {
          this.pick(data, 0);
        } else {
          this.widget = new Widget(this, data);
          CodeMirror.signal(data, "shown");
        }
      }
    }
  };

  function isNewCompletion(old, nw) {
    var moved = CodeMirror.cmpPos(nw.from, old.from)
    return moved > 0 && old.to.ch - old.from.ch != nw.to.ch - nw.from.ch
  }

  function parseOptions(cm, pos, options) {
    var editor = cm.options.hintOptions;
    var out = {};
    for (var prop in defaultOptions) out[prop] = defaultOptions[prop];
    if (editor) for (var prop in editor)
      if (editor[prop] !== undefined) out[prop] = editor[prop];
    if (options) for (var prop in options)
      if (options[prop] !== undefined) out[prop] = options[prop];
    if (out.hint.resolve) out.hint = out.hint.resolve(cm, pos)
    return out;
  }

  function getText(completion) {
    if (typeof completion == "string") return completion;
    else return completion.text;
  }

  function buildKeyMap(completion, handle) {
    var baseMap = {
      Up: function() {handle.moveFocus(-1);},
      Down: function() {handle.moveFocus(1);},
      PageUp: function() {handle.moveFocus(-handle.menuSize() + 1, true);},
      PageDown: function() {handle.moveFocus(handle.menuSize() - 1, true);},
      Home: function() {handle.setFocus(0);},
      End: function() {handle.setFocus(handle.length - 1);},
      Enter: handle.pick,
      Tab: handle.pick,
      Esc: handle.close
    };
    var custom = completion.options.customKeys;
    var ourMap = custom ? {} : baseMap;
    function addBinding(key, val) {
      var bound;
      if (typeof val != "string")
        bound = function(cm) { return val(cm, handle); };
      // This mechanism is deprecated
      else if (baseMap.hasOwnProperty(val))
        bound = baseMap[val];
      else
        bound = val;
      ourMap[key] = bound;
    }
    if (custom)
      for (var key in custom) if (custom.hasOwnProperty(key))
        addBinding(key, custom[key]);
    var extra = completion.options.extraKeys;
    if (extra)
      for (var key in extra) if (extra.hasOwnProperty(key))
        addBinding(key, extra[key]);
    return ourMap;
  }

  function getHintElement(hintsElement, el) {
    while (el && el != hintsElement) {
      if (el.nodeName.toUpperCase() === "LI" && el.parentNode == hintsElement) return el;
      el = el.parentNode;
    }
  }
  //api文档说明
  var objContent = {};
  objContent.createDatabase = ["创建数据库 createDatabase() 说明：创建一个当前应用的默认数据库，如果已经存在，则不做任何操作 返回值：Map对象",
    "创建新数据库 方法：createDatabase(String databaseName) 说明：创建一个新的数据库，如果已经存在，则不做任何操作 返回值：Map对象",
    "默认数据库内创建表 方法：createTable(String tableName) 说明：在应用默认数据库内创建表，如果已经有同名表，则不作处理 返回值：Map对象",
    "创建一张新的表 方法：createTable(String databaseName,String tableName) 说明：创建一张新的表，如果数据库不存在则按照指定数据库名字创建这个数据库 返回值：Map对象",
    "根据id删除当前app的表数据 方法：deleteData(String tableName,String id) 说明：根据id删除当前app的表数据 返回值：Map对象",
    "根据id删除指定app表数据 方法：deleteData(String databaseName,String tableName,String id) 说明：根据id删除指定appid的表数据 返回值：Map对象",
      "删除指定库 方法：dropDatabase(String databaseName) 说明：删除一个指定名称数据库，并且删除以下所有表及数据 返回值：void",
      "删除指定库指定表 方法： dropTable(String databaseName, String tableName) 说明：删除指定数据库的数据表 返回值：void",
      "当前app根据id查数据存在 方法： exist(String tableName, String id) 说明：根据id查询当前app中某个表中是否存在某条数据 返回值：boolean",
      "当前app根据列值查数据存在 方法： exist(String tableName, String[] columns, String[] values) 说明：根据字段名称和对应值查询表中数据是否存在 返回值：boolean",
      "指定库根据id查数据存在 方法： exist(String databaseName, String tableName, String id) 说明：根据id判断是否在指定数据库内表数据是否存在 返回值：boolean",
      "指定库表数据是否存在 方法： exist(String databaseName, String tableName, String[] columns, String[] values) 说明：判断是否在指定数据库内表数据是否存在 返回值：boolean",
      "当前app复杂条件查询 方法： findData(String tableName, String[] columns, String[] values, String[] fqColumns, String[] fqValues, String startRowKey, long maxRecord) 说明：默认查询当前app，根据字段名，字段值，复杂查询条件，起始记录和结束记录查询，返回Map集合 返回值：Map",
      "当前app列值查询 方法： findData(String tableName, String[] columns, String[] values, String startRowKey, long maxRecord) 说明：默认查询当前app，根据字段名，字段值，组合复杂查询条件，起始记录和结束记录查询，返回Map集合 返回值：Map",
      "当前app起始记录查询 方法：findData(String tableName, String startRowKey, int maxRecord) 说明：默认查询当前app，根据表名，开始记录数，记录数目查询 返回值：Map",
      "指定库表按主键查询 方法： findData(String databaseName, String tableName, String id) 说明：在应用指定数据库内按照主键查找数据 返回值：Map",
      "指定库复杂条件查询 方法：findData(String databaseName, String tableName, String[] columns, String[] values, String[] fqColumns, String[] fqValues, String startRowKey, long maxRecord)说明：指定查询数据库，根据字段名，字段值，组合复杂查询条件，起始记录和记录数目查询，返回Map集合 返回值：Map",
      "指定库表数据列值查询 方法： findData(String databaseName, String tableName, String[] columns, String[] values, String startRowKey, long maxRecord) 说明：指定查询数据库，根据字段名，字段值，起始记录和记录数目查询，返回Map集合 返回值：Map",
      "指定库起止记录查询 方法： findData(String databaseName, String tableName, String startRowKey, int maxRecord) 说明：指定查询数据库，根据起始记录和记录数目查询，返回Map集合 返回值：Map",
      "当前app复合条件查询 方法： findDataByComplexCondition(String tableName, String[][] columnOpValues, String[][] fqColumnOpValues, String startRowKey, long maxRecord) 说明：复合条件查询，默认当前app 返回值：Map",
      "指定库复合条件查询 方法： findDataByComplexCondition(String databaseName, String tableName, String[][] columnOpValues, String[][] fqColumnOpValues, String startRowKey, long maxRecord) 说明：复合条件查询，指定app数据库名称 返回值：Map",
      "当前app列值组合查询 方法：findDataFQ(String tableName, String[] columns, String[] values, String startRowKey, long maxRecord) 说明：默认当前app，根据字段名，字段值，起始记录和记录数目查询 返回值：Map",
      "指定库列值组合查询 方法： findDataFQ(String databaseName, String tableName, String[] columns, String[] values, String startRowKey, long maxRecord) 说明：指定app数据库名称，根据字段名，字段值，起始记录和记录数目查询 返回值：Map",
      "当前app更新表数据 方法： updateData(String tableName, String[] columns, Object[] values) 说明：在指定应用默认数据库内更新表数据，如果数据库和表均为建立，则直接建立数据库和表之后插入数据，id可包含在 @param columns 内，用于更新某条记录，如果无id则系统自动生成并插入新纪录 返回值：Map",
      "指定库更新表数据 方法： updateData(String databaseName, String tableName, String[] columns, Object[] values) 说明：在指定数据库内更新表数据，如果数据库和表均为建立，则直接建立数据库和表之后插入数据，如果数据库或者表不存在，则创建数据库或者表之后再行插入数据，id可包含在 @param columns 内，用于更新某条记录，如果无id则系统自动生成并插入新纪录 返回值：Map",
      "指定库根据id更新表数据 方法： updateData(String databaseName, String tableName, String id, String[] columns, String[] values) 说明：指定app数据库名称，根据id根据表的数据，字段和表不存在则创建 返回值：Map",
      "当前app根据id更新表数据 方法： updateDataById(String tableName, String id, String[] columns, String[] values) 说明：在应用默认数据库内更新表数据，如果数据库和表均为建立，则直接建立数据库和表之后插入数据，如果数据库或者表不存在，则创建数据库或者表之后再行插入数据，可以指定id，用于更新某条记录，如果id为null则系统自动生成，并插入新数据 返回值：Map",
      "指定库根据id列值更新表数据 方法： updateDataById(String databaseName, String tableName, String id, String[] columns, String values) 说明：在指定数据库内更新表数据，如果数据库和表均为建立，则直接建立数据库和表之后插入数据，如果数据库或者表不存在，则创建数据库或者表之后再行插入数据，可以指定id，用于更新某条记录，如果id为null则系统自动生成，并插入新数据 返回值：Map"
  ];
  objContent.getCacheEntrycacheNamecacheKey = ["获取缓存 方法：getCacheEntry(String cacheName, String cacheKey) 说明：根据缓存的name和key获取缓存的数据实体 返回值：Map对象",
      "获取永久缓存 方法：getEternalCacheEntry(String cacheName, String cacheKey) 说明：根据缓存的name和key获取永久缓存的数据实体 返回值：Map对象",
      "设置缓存 方法：putCacheEntry(String cacheName, String cacheKey, String cacheValue) 说明：根据缓存的name、key和value设置缓存数据 返回值：Map对象",
      "设置永久缓存 方法：putEternalCacheEntry(String cacheName, String cacheKey, String cacheValue) 说明：根据缓存的name、key和value设置永久缓存数据 返回值：Map对象",
      "移除缓存 方法：removeCacheEntry(String cacheName, String cacheKey) 说明：根据缓存的name和key移除缓存数据 返回值：Map对象",
      "移除永久缓存 方法：removeEternalCacheEntry(String cacheName, String cacheKey) 说明：根据缓存的name和key移除永久缓存数据 返回值：Map对象"
  ];

  objContent.DEBUGObjectLog = ["调试级别-对象 方法：DEBUG(Object log) 说明：调试级别，输出对象 返回值：void",
      "调试级别-字符串 方法：DEBUG(String log) 说明：调试级别，输出字符串 返回值：void",
      "调试级别-模板-数组 方法：DEBUG(String template, String[] vars) 说明：调试级别，输出模板，数组变量 返回值：void",
      "错误级别-对象 方法：ERROR(Object log) 说明：错误级别，输出对象 返回值：void",
      "错误级别-字符串 方法：ERROR(String log) 说明：错误级别，输出字符串 返回值：void",
      "错误级别-模板-数组 方法：ERROR(String template, String[] vars) 说明：错误级别，输出模板，数组变量 返回值：void",
      "FINAL级别-对象 方法：FINAL(Object log) 说明：FINAL级别，输出对象 返回值：void",
      "FINAL级别-字符串 方法：FINAL(String log) 说明：FINAL级别，输出字符串 返回值：void",
      "FINAL级别-模板-数组 方法：FINAL(String template, String[] vars) 说明：FINAL级别，输出模板，数组变量 返回值：void",
      "普通级别-对象 方法：INFO(Object log) 说明：普通级别，输出对象 返回值：void",
      "普通级别-字符串 方法：INFO(String log) 说明：普通级别，输出字符串 返回值：void",
      "普通级别-模板-数组  方法：INFO(String template, String[] vars) 说明：普通级别，输出模板，数组变量 返回值：void",
      "警告级别-对象 方法：WARN( Object log) 说明：警告级别，输出对象 返回值：void",
      "警告级别-字符串 方法：WARN(String log) 说明：警告级别，输出字符串 返回值：void",
      "警告级别-模板-数组 方法：WARN(String template, String[] vars) 说明：警告级别，输出模板，数组变量 返回值：void"
  ];

  objContent.sendGeturl = ["GET获取方式 方法：sendGet(String url) 说明：get方法获取远程地址内容 返回值：Map对象",
      "带header的Get获取方式 方法：sendGet(String url, MaphttpHeaderMap) 说明：get方法获取远程地址内容，指定http的header部分 返回值：Map对象",
      "Post方式提交数据 方法：sendPost(String url, MapformParams) 说明：post方法发送表单给远程地址 返回值：Map对象",
      "带header的Post方式 方法：sendPost(String url, MapformParams, MaphttpHeaderMap) 说明：post方法发送表单给远程地址，指定http的header部分 返回值：Map对象",
      "Post方式提交json数据 方法：sendPost(String url, String jsonString, MapformParams, MaphttpHeaderMap) 说明：支持json字符串方式post至远程服务器 返回值：Map对象",
      "HTTPS协议GET获取方式 方法：sendHttpsGet(String url) 说明：使用https协议安全的get方法获取远程地址内容 返回值：String",
      "带header的HTTPS协议的GET获取方式 方法：sendHttpsGet(String url, MaphttpHeaderMap) 说明：带http头的https安全的get方法获取远程地址内容 返回值：String",
      "HTTPS协议带header的Post方式提交json数据 方法：sendHttpsJsonPost(String url, String jsonString, MaphttpHeaderMap) 说明：HTTPS协议的安全的带header的Post方式提交json数据 返回值：String",
      "HTTPS协议form表单Post提交数据 方法：sendHttpsPost(String url,  MapformParams) 说明：HTTPS协议下，使用form表单的方式Post提交数据 返回值：String",
      "HTTPS协议带header的form表单Post提交数据 方法：sendHttpsPost(String url, MapformParams, MaphttpHeaderMap) 说明：HTTPS协议下，带header的使用form表单的方式Post提交数据 返回值：Map对象",
      "带header的Post方式提交json数据 方法：sendJsonPost(String url, String jsonString, MaphttpHeaderMap) 说明：带header的Post方式提交json数据 返回值：Map对象"
  ];

  objContent.decryptencryptStrpassword = ["AES 解密 方法：decrypt(String encryptStr, String password) 说明：AES 解密，解密字符串，密码 返回值：String",
      "UrlSafe的Base64反编码 方法：decryptBASE64ToString(String key) 说明：UrlSafe的Base64反编码同 decryptUrlSafeBASE64 返回值：String",
      "UrlSafe的Base64反编码 方法：decryptUrlSafeBASE64(String key) 说明：UrlSafe的Base64反编码 返回值：String",
      "AES 加密 方法：encrypt(String content, String password) 说明：AES 加密，加密内容，密码 返回值：String",
      "HMAC加密 方法：encryptHMAC(String content, String key) 说明：HMAC加密 返回值：String",
      "HMac-SHA1 编码 方法：encryptHMACSHA1(String data, String key) 说明：HMac-SHA1 编码 返回值：String",
      "MD5加密 方法：encryptMD5(String content) 说明：对内容进行MD5加密 返回值：String",
      "SHA加密 方法：encryptSHA(String content) 说明：对内容进行SHA加密 返回值：String",
      "SHA1加密 方法：encryptSHA1(String content) 说明：对内容进行SHA1加密 返回值：String",
      "MD5纯加密 方法：encryptSimpleMD5(String content) 说明：MD5纯加密 返回值：String",
      "SHA纯加密 方法：encryptSimpleSHA(String content)  说明：SHA纯加密 返回值：String"
  ];

  objContent.pauseAllTimer = ["暂停所有计时器 方法：pauseAllTimer() 说明：暂停所有计时器 返回值：void",
      "添加一个定时器 方法：addTimer(String timerName, String appId, String version, String driverName, String cronExpression) 说明：添加一个定时器 返回值：void",
      "暂停指定计时器 方法：pauseTimer(String timerName) 说明：暂停指定计时器 返回值：void",
      "删除一个定时器 方法：removeTimer(String timerName) 说明：删除一个定时器 返回值：void",
      "恢复所有计时器 方法： resumeAllTimer() 说明：恢复所有计时器 返回值：void",
      "恢复一个计时器 方法： resumeTimer(String timerName) 说明：恢复一个计时器 返回值：void",
      "更新一个定时器时间 方法： updateTimer(String timerName, String cronExpression) 说明：更新一个定时器时间 返回值：void"
  ];

  objContent.getUUID = ["取得UUID 方法：getUUID() 说明：取得uuid 返回值：String",
      "返回Json数据 方法： getJsonMessage(boolean result,   String code, Object data,   String exception, String message) 说明：返回给前端的json数据 返回值：Map",
      "封装html数据 方法： htmlEscape(String escapeString) 说明：封装html数据 返回值：String",
      "解析html数据 方法： htmlUnEscape(String escapeString) 说明：解析html数据 返回值：String",
      "json字符串转为map对象 方法：jsonStringToMap(String jsonString) 说明：json字符串转为map对象 返回值：Map",
      "对象转为json字符串 方法： objectToJsonString(Object obj) 说明：对象转为json字符串 返回值：String",
      "解析xml数据 方法：parseXML(String xml) 说明：解析xml数据 返回值：String",
      "指定位数随机数 方法：randomAlphabetic(int size) 说明：指定位数随机数 返回值：String",
      "指定位数随机数  方法： randomAlphanumeric(int size) 说明：指定位数随机数 返回值：String",
      "指定字符分割字符串 方法：split(String string,   String separatorChars) 说明：指定字符分割字符串 返回值：String",
      "utf编码解析html 方法：utf8UnEscape(String escapeString) 说明：utf编码解析html 返回值：String",
      "验证验证码的正确性 方法：validateCaptcha(WebParamObject webParamObject,   String captchaCode) 说明：验证验证码的正确性 返回值：boolean"
  ];

  objContent.getDomain = ["取得网站域名 方法：getDomain() 说明：取得网站域名 返回值：String",
      "取得网站siteId 方法：getSiteId()  说明： 取得网站siteId 返回值：String",
      "获取网站服务id 方法：getServiceId() 说明：获取网站服务id 返回值：String",
      "获取网站请求参数 方法： MapgetParamValues(); 说明：获取网站请求参数 返回值：Map",
      "获取多参数值 方法：Map getMultiParamValues() 说明：获取多个请求参数的值 返回值：String",
      "获取网站服务url 方法：String getServiceUrl() 说明：获取网站服务url 返回值：String",
      "获取App发布版本id 方法：String getServiceId() 说明：获取App发布版本id 返回值：String",
      "获取AppId 方法：String getAppId() 说明：获取AppId 返回值：String",
      "获取Session项 方法：com.ms.security.model.SecurityObjectContext getSessionItem() 说明：获取Session项  返回值：SecurityObjectContext",
      "获取网站url后面部分 方法： String getAfterSiteUrl() 说明：获取网站url后面部分 返回值：String",
      "获取网站服务url后面部分 方法：String getAfterServiceUrl() 说明：获取网站服务url后面部分 返回值：String"
  ];

  objContent.getList = ["取得List集合 方法：getList() 说明：取得List集合 返回值：ArrayList",
      "取得Map集合 方法：getMap() 说明：取得Map集合 返回值：HashMap",
      "获取Set对象 方法：getSet() 说明：获取Set对象 返回值：HashSet",
      "获取Object对象数组 方法：getObjectArray(Object... objects) 说明：获取Object对象数组 返回值：Object[]",
      "获取字符串数组 方法：getStringArray(String... strings) 说明：获取字符串数组对象 返回值：String[]"
  ];

  objContent.assemblecontentcharsetdataMap = ["组装模板 方法：assemble(String content,String charset,Map dataMap) 说明：组装模板 返回值：String"
  ];
  objContent.sendMail = ["发送邮件 说明：发送邮件，传递参数账号名称，账户密码，server地址，端口号，是否SSL，发件人邮箱，收件人邮箱，主题， 邮件内容html消息，邮件内容文本消息 返回值：void"
  ];
  function Widget1(completion, data) {
    this.completion = completion;
    this.data = data;
    this.picked = false;
    var widget = this, cm = completion.cm;

    var winW = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth);
    var hints = this.hints = document.createElement("ul");
      var hints2 = this.hints2 = document.createElement("ul");

    //文档说明提示框
    var completions = data.list;
    try{
      if(completions.toString().indexOf("vm")<0)
      {
        hints2.className = "CodeMirror-hints";

        //for (var i = 0; i < 1; ++i) {
          var elt = hints2.appendChild(document.createElement("li")), cur = completions[0];
          var key = data.key;
          var index = 0;
          if(typeof(key) != "undefined")
          {
            key = key.replace(",","").replace(",","").replace("(","").replace(")","").replace(" ","");
            var showList = data.showList;
            index = showList[0];
          }else{
            if((cur.displayText || getText(cur)).indexOf("sendMail")>-1)
            {
              key = "sendMail";
            }else{
              key = (cur.displayText || getText(cur)).replace(",","").replace(",","").replace("(","").replace(")","").replace(" ","");
            }
          }

          if (cur.render) cur.render(elt, data, cur);
          else elt.appendChild(document.createTextNode(objContent[key][index]));
          elt.hintId = i;
        //}

        var pos = cm.cursorCoords(completion.options.alignWithWord ? data.from : null);
        var left = pos.left, top = pos.bottom, below = true;

        hints2.style.left =  207+ left + "px";
        hints2.style.width =  200 + "px";
        hints2.style.height =  200 + "px";
        hints2.style.top = top + "px";
        (completion.options.container || document.body).appendChild(hints2);
        //结束
        hints.style.width =  200 + "px";
      }else{
        hints.style.width =  130 + "px";

      }
    }catch(e)
    {
    }

    hints.className = "CodeMirror-hints";
    this.selectedHint = data.selectedHint || 0;

    var completions = data.list;
    for (var i = 0; i < completions.length; ++i) {
      var elt = hints.appendChild(document.createElement("li")), cur = completions[i];
      var className = HINT_ELEMENT_CLASS + (i != this.selectedHint ? "" : " " + ACTIVE_HINT_ELEMENT_CLASS);
      if (cur.className != null) className = cur.className + " " + className;
      elt.className = className;
      if (cur.render) cur.render(elt, data, cur);
      else elt.appendChild(document.createTextNode(cur.displayText || getText(cur)));
      elt.hintId = i;
    }

    var pos = cm.cursorCoords(completion.options.alignWithWord ? data.from : null);
    var left = pos.left, top = pos.bottom, below = true;
    hints.style.left = left + "px";
    hints.style.top = top + "px";


    // If we're at the edge of the screen, then we want the menu to appear on the left of the cursor.
   // var winW = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth);
    var winH = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
    (completion.options.container || document.body).appendChild(hints);

    var box = hints.getBoundingClientRect();
    var overlapY = box.bottom - winH;
    if (overlapY > 0) {
      var height = box.bottom - box.top, curTop = pos.top - (pos.bottom - box.top);
      if (curTop - height > 0) { // Fits above cursor
        hints.style.top = (top = pos.top - height) + "px";
        hints2.style.top = (top = pos.top - height) + "px";
          below = false;
      } else if (height > winH) {
        hints.style.height = (winH - 5) + "px";
        hints.style.top = (top = pos.bottom - box.top) + "px";
        hints2.style.top = (top = pos.bottom - box.top) + "px";
        var cursor = cm.getCursor();
        if (data.from.ch != cursor.ch) {
          pos = cm.cursorCoords(cursor);
          hints.style.left = (left = pos.left) + "px";
          box = hints.getBoundingClientRect();
        }
      }
    }
    var overlapX = box.right - winW;
    if (overlapX > 0) {
      if (box.right - box.left > winW) {
        hints.style.width = (winW - 5) + "px";
        overlapX -= (box.right - box.left) - winW;
      }
      hints.style.left = (left = pos.left - overlapX) + "px";
    }

    cm.addKeyMap(this.keyMap = buildKeyMap(completion, {
      moveFocus: function(n, avoidWrap) { widget.changeActive(widget.selectedHint + n, avoidWrap); },
      setFocus: function(n) { widget.changeActive(n); },
      menuSize: function() { return widget.screenAmount(); },
      length: completions.length,
      close: function() { completion.close(); },
      pick: function() { widget.pick(); },
      data: data
    }));

    if (completion.options.closeOnUnfocus) {
      var closingOnBlur;
      cm.on("blur", this.onBlur = function() { closingOnBlur = setTimeout(function() { completion.close(); }, 100); });
      cm.on("focus", this.onFocus = function() { clearTimeout(closingOnBlur); });
    }

    var startScroll = cm.getScrollInfo();
    cm.on("scroll", this.onScroll = function() {
      var curScroll = cm.getScrollInfo(), editor = cm.getWrapperElement().getBoundingClientRect();
      var newTop = top + startScroll.top - curScroll.top;
      var point = newTop - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
      if (!below) point += hints.offsetHeight;
      if (point <= editor.top || point >= editor.bottom) return completion.close();
      hints.style.top = newTop + "px";
      hints.style.left = (left + startScroll.left - curScroll.left) + "px";
    });
    CodeMirror.on(hints, "dblclick", function(e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {widget.changeActive(t.hintId); widget.pick();}
    });

    CodeMirror.on(hints, "click", function(e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {
        widget.changeActive(t.hintId);
        if (completion.options.completeOnSingleClick) widget.pick();
      }
    });

    CodeMirror.on(hints, "mousedown", function() {
      setTimeout(function(){cm.focus();}, 20);
    });

    CodeMirror.signal(data, "select", completions[0], hints.firstChild);
    return true;
  }
  function Widget(completion, data) {
    this.completion = completion;
    this.data = data;
    this.picked = false;
    var widget = this, cm = completion.cm;

    var hints = this.hints = document.createElement("ul");
    hints.className = "CodeMirror-hints";
    this.selectedHint = data.selectedHint || 0;

    var completions = data.list;
    for (var i = 0; i < completions.length; ++i) {
      var elt = hints.appendChild(document.createElement("li")), cur = completions[i];
      var className = HINT_ELEMENT_CLASS + (i != this.selectedHint ? "" : " " + ACTIVE_HINT_ELEMENT_CLASS);
      if (cur.className != null) className = cur.className + " " + className;
      elt.className = className;
      if (cur.render) cur.render(elt, data, cur);
      else elt.appendChild(document.createTextNode(cur.displayText || getText(cur)));
      elt.hintId = i;
    }

    var pos = cm.cursorCoords(completion.options.alignWithWord ? data.from : null);
    var left = pos.left, top = pos.bottom, below = true;
    hints.style.left = left + "px";
    hints.style.top = top + "px";

    // If we're at the edge of the screen, then we want the menu to appear on the left of the cursor.
    var winW = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth);
    var winH = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
    (completion.options.container || document.body).appendChild(hints);
    var box = hints.getBoundingClientRect(), overlapY = box.bottom - winH;
    if (overlapY > 0) {
      var height = box.bottom - box.top, curTop = pos.top - (pos.bottom - box.top);
      if (curTop - height > 0) { // Fits above cursor
        hints.style.top = (top = pos.top - height) + "px";
        below = false;
      } else if (height > winH) {
        hints.style.height = (winH - 5) + "px";
        hints.style.top = (top = pos.bottom - box.top) + "px";
        var cursor = cm.getCursor();
        if (data.from.ch != cursor.ch) {
          pos = cm.cursorCoords(cursor);
          hints.style.left = (left = pos.left) + "px";
          box = hints.getBoundingClientRect();
        }
      }
    }
    var overlapX = box.right - winW;
    if (overlapX > 0) {
      if (box.right - box.left > winW) {
        hints.style.width = (winW - 5) + "px";
        overlapX -= (box.right - box.left) - winW;
      }
      hints.style.left = (left = pos.left - overlapX) + "px";
    }

    cm.addKeyMap(this.keyMap = buildKeyMap(completion, {
      moveFocus: function(n, avoidWrap) { widget.changeActive(widget.selectedHint + n, avoidWrap); },
      setFocus: function(n) { widget.changeActive(n); },
      menuSize: function() { return widget.screenAmount(); },
      length: completions.length,
      close: function() { completion.close(); },
      pick: function() { widget.pick(); },
      data: data
    }));

    if (completion.options.closeOnUnfocus) {
      var closingOnBlur;
      cm.on("blur", this.onBlur = function() { closingOnBlur = setTimeout(function() { completion.close(); }, 100); });
      cm.on("focus", this.onFocus = function() { clearTimeout(closingOnBlur); });
    }

    var startScroll = cm.getScrollInfo();
    cm.on("scroll", this.onScroll = function() {
      var curScroll = cm.getScrollInfo(), editor = cm.getWrapperElement().getBoundingClientRect();
      var newTop = top + startScroll.top - curScroll.top;
      var point = newTop - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
      if (!below) point += hints.offsetHeight;
      if (point <= editor.top || point >= editor.bottom) return completion.close();
      hints.style.top = newTop + "px";
      hints.style.left = (left + startScroll.left - curScroll.left) + "px";
    });

    CodeMirror.on(hints, "dblclick", function(e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {widget.changeActive(t.hintId); widget.pick();}
    });

    CodeMirror.on(hints, "click", function(e) {
      var t = getHintElement(hints, e.target || e.srcElement);
      if (t && t.hintId != null) {
        widget.changeActive(t.hintId);
        if (completion.options.completeOnSingleClick) widget.pick();
      }
    });

    CodeMirror.on(hints, "mousedown", function() {
      setTimeout(function(){cm.focus();}, 20);
    });

    CodeMirror.signal(data, "select", completions[0], hints.firstChild);
    return true;
  }
  Widget.prototype = {
    close: function() {
      if (this.completion.widget != this) return;
      this.completion.widget = null;
      this.hints.parentNode.removeChild(this.hints);
      try{
        this.hints2.parentNode.removeChild(this.hints2);//此处消失
      }catch(e){

      }
      this.completion.cm.removeKeyMap(this.keyMap);

      var cm = this.completion.cm;
      if (this.completion.options.closeOnUnfocus) {
        cm.off("blur", this.onBlur);
        cm.off("focus", this.onFocus);
      }
      cm.off("scroll", this.onScroll);
    },

    disable: function() {
      this.completion.cm.removeKeyMap(this.keyMap);
      var widget = this;
      this.keyMap = {Enter: function() { widget.picked = true; }};
      this.completion.cm.addKeyMap(this.keyMap);
    },

    pick: function() {
      this.completion.pick(this.data, this.selectedHint);
    },

    changeActive: function(i, avoidWrap) {
      if (i >= this.data.list.length)
        i = avoidWrap ? this.data.list.length - 1 : 0;
      else if (i < 0)
        i = avoidWrap ? 0  : this.data.list.length - 1;
      if (this.selectedHint == i) return;
      var node = this.hints.childNodes[this.selectedHint];
      node.className = node.className.replace(" " + ACTIVE_HINT_ELEMENT_CLASS, "");
      node = this.hints.childNodes[this.selectedHint = i];
      node.className += " " + ACTIVE_HINT_ELEMENT_CLASS;
      if (node.offsetTop < this.hints.scrollTop)
        this.hints.scrollTop = node.offsetTop - 3;
      else if (node.offsetTop + node.offsetHeight > this.hints.scrollTop + this.hints.clientHeight)
        this.hints.scrollTop = node.offsetTop + node.offsetHeight - this.hints.clientHeight + 3;
      CodeMirror.signal(this.data, "select", this.data.list[this.selectedHint], node);
    },

    screenAmount: function() {
      return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1;
    }
  };
  Widget1.prototype = {
    close: function() {
      if (this.completion.widget != this) return;
      this.completion.widget = null;
      this.hints.parentNode.removeChild(this.hints);
      try{
        this.hints2.parentNode.removeChild(this.hints2);//此处消失
      }catch(e){

      }
      this.completion.cm.removeKeyMap(this.keyMap);
      var cm = this.completion.cm;
      if (this.completion.options.closeOnUnfocus) {
        cm.off("blur", this.onBlur);
        cm.off("focus", this.onFocus);
      }
      cm.off("scroll", this.onScroll);
    },

    disable: function() {
      this.completion.cm.removeKeyMap(this.keyMap);
      var widget = this;
      this.keyMap = {Enter: function() { widget.picked = true; }};
      this.completion.cm.addKeyMap(this.keyMap);
    },

    pick: function() {
      this.completion.pick(this.data, this.selectedHint);
    },

    changeActive: function(i, avoidWrap) {
      try{

        var length = this.data.list.length;
        if(length == i)
        {
          i = 0;
        }
        if(-1 == i)
        {
          i = length-1;
        }
        this.hints2.innerHTML = "";
        var elt = this.hints2.appendChild(document.createElement("li"));


        var key = this.data.key;
        var index = i;
        if(typeof(key) != "undefined")
        {
          key = key.replace(",","").replace(",","").replace("(","").replace(")","").replace(" ","");
          var showList = this.data.showList;
          index = showList[i];
        }else{
          //var key = "";
          if(this.data.list[0].indexOf("sendMail")>-1)
          {
            key = "sendMail";
          }else{
            key = this.data.list[0].replace(",","").replace("(","").replace(",","").replace(")","").replace(" ","");
          }
        }

        elt.appendChild(document.createTextNode(objContent[key][index]));
      }catch(e){

      }

      if (i >= this.data.list.length)
        i = avoidWrap ? this.data.list.length - 1 : 0;
      else if (i < 0)
        i = avoidWrap ? 0  : this.data.list.length - 1;
      if (this.selectedHint == i) return;
      var node = this.hints.childNodes[this.selectedHint];
      node.className = node.className.replace(" " + ACTIVE_HINT_ELEMENT_CLASS, "");
      node = this.hints.childNodes[this.selectedHint = i];
      node.className += " " + ACTIVE_HINT_ELEMENT_CLASS;
      if (node.offsetTop < this.hints.scrollTop)
        this.hints.scrollTop = node.offsetTop - 3;
      else if (node.offsetTop + node.offsetHeight > this.hints.scrollTop + this.hints.clientHeight)
        this.hints.scrollTop = node.offsetTop + node.offsetHeight - this.hints.clientHeight + 3;
      CodeMirror.signal(this.data, "select", this.data.list[this.selectedHint], node);
    },

    screenAmount: function() {
      return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1;
    }
  };

  function applicableHelpers(cm, helpers) {
    if (!cm.somethingSelected()) return helpers
    var result = []
    for (var i = 0; i < helpers.length; i++)
      if (helpers[i].supportsSelection) result.push(helpers[i])
    return result
  }

  function resolveAutoHints(cm, pos) {
    var helpers = cm.getHelpers(pos, "hint"), words
    if (helpers.length) {
      var async = false, resolved
      for (var i = 0; i < helpers.length; i++) if (helpers[i].async) async = true
      if (async) {
        resolved = function(cm, callback, options) {
          var app = applicableHelpers(cm, helpers)
          function run(i, result) {
            if (i == app.length) return callback(null)
            var helper = app[i]
            if (helper.async) {
              helper(cm, function(result) {
                if (result) callback(result)
                else run(i + 1)
              }, options)
            } else {
              var result = helper(cm, options)
              if (result) callback(result)
              else run(i + 1)
            }
          }
          run(0)
        }
        resolved.async = true
      } else {
        resolved = function(cm, options) {
          var app = applicableHelpers(cm, helpers)
          for (var i = 0; i < app.length; i++) {
            var cur = app[i](cm, options)
            if (cur && cur.list.length) return cur
          }
        }
      }
      resolved.supportsSelection = true
      return resolved
    } else if (words = cm.getHelper(cm.getCursor(), "hintWords")) {
      return function(cm) { return CodeMirror.hint.fromList(cm, {words: words}) }
    } else if (CodeMirror.hint.anyword) {
      return function(cm, options) { return CodeMirror.hint.anyword(cm, options) }
    } else {
      return function() {}
    }
  }

  CodeMirror.registerHelper("hint", "auto", {
    resolve: resolveAutoHints
  });

  CodeMirror.registerHelper("hint", "fromList", function(cm, options) {
    var cur = cm.getCursor(), token = cm.getTokenAt(cur);
    var to = CodeMirror.Pos(cur.line, token.end);
    if (token.string && /\w/.test(token.string[token.string.length - 1])) {
      var term = token.string, from = CodeMirror.Pos(cur.line, token.start);
    } else {
      var term = "", from = to;
    }
    var found = [];
    for (var i = 0; i < options.words.length; i++) {
      var word = options.words[i];
      if (word.slice(0, term.length) == term)
        found.push(word);
    }

    if (found.length) return {list: found, from: from, to: to};
  });

  CodeMirror.commands.autocomplete = CodeMirror.showHint;

  var defaultOptions = {
    hint: CodeMirror.hint.auto,
    completeSingle: true,
    alignWithWord: true,
    closeCharacters: /[\s()\[\]{};:>,]/,
    closeOnUnfocus: true,
    completeOnSingleClick: true,
    container: null,
    customKeys: null,
    extraKeys: null
  };

  CodeMirror.defineOption("hintOptions", null);
});