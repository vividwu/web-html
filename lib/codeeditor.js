function initEditor(editor,txtId) {
    editor = CodeMirror.fromTextArea(document.getElementById(txtId), {
        theme: "monokai",//"night",
        extraKeys: {"Alt-/": "autocomplete"},
        lineNumbers: true,
        matchBrackets: true,
        autofocus: true,
        //hintOptions:{completeSingle: false}
        mode: "text/x-vivid"
    });
    //editor.setOption("readOnly", true);	alt+/

    editor.on('keyup', function (cm, name, Event) {
        //定义按哪些键时弹出提示框
        if (isShow(name.keyCode)) {
            
            var datas = {};
            var cur = cm.getCursor();
            var ch = cur.ch;
            var line = cur.line;
            var lineStr = cm.getLine(line);
            //var fromS = lineStr.lastIndexOf("_");
            var fromSD = lineStr.lastIndexOf(".");
            var endS = lineStr.length;
            //console.log("lineStr:",lineStr,"fromS:",fromS,"fromSD:",fromSD)
            console.log("lineStr:", lineStr, "fromSD:", fromSD)
            var token = cm.getTokenAt(cur);
            console.log("tk:", token);
            var obj = {};
            var dont = {};
            //自定义的API关键字
            obj.DbOpen = ["DbOpen(connStr)"];
            obj.HttpOpen = ["HttpOpen(method,url,header,param,timeout)"];
            obj.println = ["println(obj)"];
            obj.len = ["len(obj)"];
            obj.type = ["type(obj)"];
            obj.$dot = ["tostring()", "toint()", "split(separater)", "string()", "json()", "select(sql,params)"];

            var packgeArrary = ["db", "cache", "log", "http", "security", "timer", "webTools", "webParams", "collectionTools", "mail", "vm"];

            if (token.string.indexOf(".") == 0) {  //点完提示
                var list = obj["$dot"];
                if (token.string.length == 1) {

                    datas.list = list;
                    datas.from = {};
                    datas.from.line = line;
                    datas.from.ch = token.start + 1; //ch; 选中替换token开始位置
                    datas.to = {};
                    datas.to.line = line;
                    datas.to.ch = ch;

                    editor.showHint1({completeSingle: false}, datas);
                    return;
                } else {  //继续输入
                    var functioStr = token.string.substring(1, token.string.length).toLowerCase();
                    var showList = [];
                    var showList2 = [];
                    for (var a = 0; a < list.length; a++) {
                        var info = list[a];
                        if (info.toLowerCase().lastIndexOf(functioStr) > -1) {
                            showList.push(info);
                            showList2.push(a);
                            console.log(info, a);
                        }
                    }
                    datas.list = showList;
                    datas.showList = showList2;
                    datas.key = list[0];
                    datas.from = {};
                    datas.from.line = line;
                    datas.from.ch = token.start + 1;
                    datas.to = {};
                    datas.to.line = line;
                    datas.to.ch = ch;
                    editor.showHint1({completeSingle: false}, datas);
                    return;
                }
            }

            if (token.string.length > 1) {
                //处理分号 ;
                var curToken = token.string;
                var tokenStart = token.start;
                if (token.string[0] == ";") {
                    curToken = curToken.substr(1, curToken.length - 1);
                    tokenStart = tokenStart + 1;
                }

                for (var k in obj) {
                    console.log("k:", k, "cur:", curToken);
                    if (k.indexOf(curToken) > -1) {
                        lineStr = k;  //lineStr.substring(token.start,token.end);
                        var list = obj[lineStr];

                        datas.list = list;
                        datas.from = {};
                        datas.from.line = line;
                        datas.from.ch = tokenStart; //ch; 选中替换token开始位置
                        datas.to = {};
                        datas.to.line = line;
                        datas.to.ch = ch + 1;

                        editor.showHint1({completeSingle: false}, datas);
                        return;
                    } else {
                        editor.showHint();
                    }
                }
            }
        }
    });
    return editor;
}
function isShow(z) {
    if(z == "8" ||z == "173"||z == "190"||z == "189" ||z == "110" ||z == "65" || z == "66" ||z == "67" ||z == "68" ||z == "69" ||z == "70" ||z == "71" ||z == "72" ||z == "73" ||z == "74" ||z == "75" ||z == "76" ||
        z == "77" || z == "78" ||z == "79" ||z == "80" ||z == "81" ||z == "82" ||z == "83" ||z == "84" ||z == "85" ||z == "86" ||z == "87" ||z == "88" ||z == "89" ||z == "90" )
    {
        return true;
    }else{
        return false;
    }
}