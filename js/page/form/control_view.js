function controlClick(obj) {
    console.log('view',obj.name);
}
function $ViewControls(config) {
    $('.tagsinput').tagsinput({
        tagClass: 'label label-primary'
    });
    $('.input-group2.date').datepicker({
        language: "zh-CN",
        autoclose: true,//选中之后自动隐藏日期选择框
        clearBtn: true,//清除按钮
        todayBtn: true,//今日按钮
        todayHightlight:true,
        format: "yyyy-mm-dd"
    });
    // $("[type='checkbox']").iCheck({
    //     checkboxClass: 'icheckbox_flat-blue',
    // });
    //渲染配置数据
    var CONF = config.controls;
    $$Controls.controls = CONF;
    var orderNoControl;
    for (k in CONF) {
        if (CONF[k].type == "Radio") {
            new RadioControl(k).draw();
        } else if (CONF[k].type == "UserInfo") {
            new UserInfoControl(k).init(CONF[k].dataurl);
        } else if (CONF[k].type == "Select") {
            new SelectControl(k).init(CONF[k].dataurl);
        } else if (CONF[k].type == "Table") {
              //表格内嵌套处理外部绑定数据
            for (var i = 0; i < CONF[k].columns.length; i++) {
                if (CONF[k].columns[i].type == "Select") {
                    var idx = i;
                    var tk = k;
                    $Ajax(CONF[k].columns[i].dataurl, function (res) {

                        CONF[tk].columns[idx].options = res;
                    });
                }
            }
        } else if (CONF[k].type == "OrderNo") {
            orderNoControl = new OrderNoControl(k);
            orderNoControl.init(CONF[k].dataurl);
        } else if (CONF[k].type == "DeptTree") {
            new DeptTreeControl(k).init(CONF[k].dataurl);
        } else if (CONF[k].type == "UserSelect") {
            new UserSelectControl(k).init(CONF[k].dataurl);
        } else if (CONF[k].type == "UserDeptSelect") {
            new UserDeptSelectControl(k).init(CONF[k].dataurl);
        } else if (CONF[k].type == "FileUpload") {
            new FileUploadControl(k).init(orderNoControl);
        }
    }
}
function addTableRow(obj,key) {
    var table = $$Controls.getControl(key);
    var tpl = document.getElementById('TableRow_Tpl').innerHTML; //读取模版
    console.log(tpl)
    laytpl(tpl).render(table, function(render){
        //document.getElementById('view').innerHTML = render;
        $("[name='"+key+"']").find("tbody").append($(render));
        var last = $("[name='"+key+"']").find("tbody").find("tr").last();
        //重新绑定控件事件
        bindAllEvent(last);
    });
}
function delTableRow(obj,key) {
	$(obj).parent().parent().remove();
}
function addTableRowBind(obj,key,rowData) {
    var table = $$Controls.getControl(key);
    var tpl = document.getElementById('TableRow_Tpl').innerHTML; //读取模版
    console.log(tpl);
    table.row = rowData;
    console.log(rowData);
    laytpl(tpl).render(table, function(render){
        //document.getElementById('view').innerHTML = render;
        $("[name='"+key+"']").find("tbody").append($(render));
        var last = $("[name='"+key+"']").find("tbody").find("tr").last();
        //重新绑定控件事件
        bindAllEvent(last);
    });
}
//加载控件配置，并设置值
function $BindDate2Controls(CONF,DATA) {
    $$Controls.controls = CONF;
    var orderNo;
    for (k in CONF){
        var arr = k.split("$");
        var dbVal;
        if(arr.length==2) {
            dbVal = DATA.main[arr[0]][arr[1]];
        }
        if(CONF[k].type == "TextBox"){
            var control = new TextBoxControl(k)
            control.bindData(dbVal);
        }if(CONF[k].type == "UserInfo"){
            var user = new UserInfoControl(k);
            user.dataurl = CONF[k].dataurl;
            user.bindData(dbVal);
        }else if(CONF[k].type == "Select"){
            var sc = new SelectControl(k);
            sc.value = dbVal
            sc.init(CONF[k].dataurl);
        }else if(CONF[k].type == "Date"){
            var dc = new DateControl(k);
            dc.bindData(dbVal);
        }else if(CONF[k].type == "Table"){  //表格内嵌套处理外部绑定数据
            for(var i=0;i<CONF[k].columns.length;i++){
                if(CONF[k].columns[i].type == "Select"){
                    var tk = k;
                    var idx = i;
                    $Ajax(CONF[k].columns[i].dataurl,function (res) {
                        CONF[tk].columns[idx].options = res;
                        $$Controls.controls = CONF;
                        bindTableRow(tk,DATA);
                    });
                }
            }
        }else if(CONF[k].type == "OrderNo") {
            //new OrderNoControl(k).init(CONF[k].dataurl);
            new OrderNoControl(k).bindData(dbVal);
            orderNo = dbVal;
        }else if(CONF[k].type == "DeptTree") {
            var tree = new DeptTreeControl(k)
            tree.dataurl = CONF[k].dataurl;
            tree.bindData(dbVal);
        }else if(CONF[k].type == "TextArea") {
            var control = new TextAreaControl(k)
            control.bindData(dbVal);
        } else if(CONF[k].type == "TBCellSum"){
            new TBCellSumControl(k).bindData(dbVal);
        } else if(CONF[k].type == "UserDeptSelect"){
            var uds = new UserDeptSelectControl(k)
            uds.value = dbVal;
            uds.init(CONF[k].dataurl);
        } else if(CONF[k].type == "FileUpload"){
            new FileUploadControl(k).bindData(orderNo,true);
            //$(".dropzone").css("pointer-events","none");  //禁用
        }
    }
}
function bindTableRow(tableKey,DATA) {
    for (tk in DATA.detail) {  //表
        var tbName = tk;
        for (var i = 0; i < DATA.detail[tk].length; i++) {  //行
            var rowData = {}
            for (col in DATA.detail[tk][i]) {  //属性
                rowData[tk + "$" + col] = DATA.detail[tk][i][col];  //构造 table$field
            }
            addTableRowBind(null, tableKey, rowData);
        }
    }
}