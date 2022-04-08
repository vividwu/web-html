(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
      "use strict";

      CodeMirror.defineMode("vivid", function(config, parserConfig) {
        var jsonldMode = parserConfig.jsonld;
        var isOperatorChar = /[+\-*&%=<>!?|~^@]/;

        function parseWords(str) {
          var obj = {},
            words = str.split(" ");
          for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
          return obj;
        }
        
  //关键字
  var keywords = parseWords("let fn if else for return"); //parseWords("s ss sss");
  var innerFuncs = parseWords("println .string DbOpen HttpOpen .toint .tostring len type split");
  var type, content;

  function ret(tp, style, cont)
  {
    type = tp;
    content = cont;
    return style;
  }

  function tokenBase(stream, state) {
    var beforeParams = state.beforeParams;
    state.beforeParams = false;
    var ch = stream.next();

    if (ch == '"' || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    } else if (ch == "." && stream.match(/^\d[\d_]*(?:[eE][+\-]?[\d_]+)?/)) {
      return ret("number", "number");
    } else if (ch == '[') {
      stream.skipTo(']');
      stream.eat(']');
      return ret("string", "string");
    } else if (/\d/.test(ch)) {
      stream.eatWhile(/[\w\.]/);
      return "number";
    } else {
      stream.eatWhile(/[\w\$_{}\xa1-\uffff]/);
      var word = stream.current();
      if (keywords && keywords.propertyIsEnumerable(word)) {
        state.beforeParams = true;
        return "keyword";
      }
    if (innerFuncs.propertyIsEnumerable(word)) return "atom";


      return null;
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false,
        next;
      if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)) {
        state.tokenize = tokenBase;
      return ret("jsonld-keyword", "meta");
    }
    while ((next = stream.next()) != null) {
      if (next == quote && !escaped) break;
      escaped = !escaped && next == "\\";
    }
    if (!escaped) state.tokenize = tokenBase;
    return ret("string", "string");
      };
    }

    return {
      startState: function() {
        return {
          tokenize: tokenBase,
          beforeParams: false,
          inParams: false
        };
        },
      token: function(stream, state) {
        if (stream.eatSpace()) return null;
        return state.tokenize(stream, state);
      }
    };
});

      CodeMirror.registerHelper("hint", "vivid", function(cm) {
        
        //自动补全
        var keywords = "let fn if else elseif for return";
        var hintList = keywords.split(' '); //['s', 'ss', 'sss'];
        var cur = cm.getCursor(),
          token = cm.getTokenAt(cur);
        var start = token.start,
          end = cur.ch
        var str = token.string

        var list = hintList.filter(function(item) {
          return item.indexOf(str) === 0
        })

        if (list.length) return {
          list: list,
          from: CodeMirror.Pos(cur.line, start),
          to: CodeMirror.Pos(cur.line, end)
        };
      });

      CodeMirror.defineMIME("text/x-vivid", "vivid"); });