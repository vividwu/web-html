/*******************/
var $$Controls = {
    settings:{labelwidth:"60px"},
    controls:{},
    addControl:function (obj) {
        this.controls[obj.key] = obj;
    },
    deleteControl:function(key){
        delete this.controls[key];
    },
    deleteTableCol:function(tbKey,colKey){
        for(var i=0;i<this.controls[tbKey].columns.length;i++){
            if(this.controls[tbKey].columns[i].key == colKey){
                this.controls[tbKey].columns.splice(i,1);  //删除第i个元素
                return;
            }
        }
    },
    getControls:function () {
        return this.controls;
    },
    getControl:function (key) {
        return this.controls[key];
    },
    changeProperty:function (key,obj) {
        this.controls[key] = obj;
    },
    changeKey:function (oldKey,newKey) {
        console.log('old/new key:',oldKey,newKey)
        var newCon;
        if(this.controls[oldKey]) {
            console.log('外层组件')
            this.controls[newKey] = this.controls[oldKey];
            this.controls[newKey].key = newKey;
            delete this.controls[oldKey];
            newCon = this.controls[newKey];
        } else {
            console.log('内层组件');
            for(tk in this.controls){
                if(tk.indexOf('Table')==0){  //表格控件内的
                    for(var i=0;i<this.controls[tk].columns.length;i++){
                        if(this.controls[tk].columns[i].key == oldKey){
                            this.controls[tk].columns[i].key = newKey;
                            newCon = this.controls[tk].columns[i];
                            break;
                        }
                    }
                }
            }
        }
        console.log('return new con:',newCon);
        return newCon;
    }
};
/*************/
// function SplitControl() {
//     this.type = "Split";
//     this.col = 12;
//     // this.label = "文字";
//     this.key = 'Split'+new Date().getTime();
//     this.getType = function () {
//         return this.type;
//     }
//     this.getProperty = function () {
//         return ['col','key']
//     }
// };
function TextBoxControl(key) {
    this.type = "TextBox";
    this.col = 12;
    this.label = "文本框";
    this.key = key?key:'TextBox'+new Date().getTime();
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','placeholder']
    }
    this.bindData = function (res) {
        var dom = $("[name='"+that.key+"']");
        dom.find("input").val(res);
    }
};
function SelectControl(key) {
    this.type = "Select";
    this.col = 12;
    this.label = "下拉框";
    this.key = key?key:'Select'+new Date().getTime();
    this.dataurl = "";
    this.options = [];
    this.value = "";
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','dataurl']
    }
    this.init = function (url) {
        var durl = url?url:that.dataurl;
        //dataurl获取绑定
        $Ajax(durl,this.bindData)
    }
    this.bindData = function (res) {
        
        var sel = $("[name='" + that.key + "']").find("select");
        res.forEach(function (v) {
            sel.append('<option ' + (that.value == v.value?"selected":"") + ' value="' + v.value + '">' + v.label + '</option>');
        });
    }
};
function CascaderControl(key){
    this.type = "Cascader";
    this.col = 12;
    this.label = "级联下拉";
    this.key = key?key:'Cascader'+new Date().getTime();
    this.dataurl = "";
    this.options = [];
    this.value = "";
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','dataurl']
    }
    this.init = function (url,domScope) {
        
        that.dataurl = url;
        var id = that.value ? that.value : vipspa.Auth.getAuthUser().uid;
        var controlNameObj = domScope == undefined ? $("[name='" + that.key + "']") : domScope.find("[name='" + that.key + "']");
        bindCascaderData(that, controlNameObj, that.dataurl,that.options);
    }
    this.bindData = function (res,domScope) {
        var controlNameObj = domScope == undefined ? $("[name='" + that.key + "']") : domScope.find("[name='" + that.key + "']");
        bindCascaderData(that,controlNameObj,that.dataurl,that.options,res);
    }
}
function UserDeptSelectControl(key){
    this.type = "UserDeptSelect";
    this.col = 12;
    this.label = "用户部门";
    this.key = key?key:'UserDeptSelect'+new Date().getTime();
    this.dataurl = "";
    this.options = [];
    this.value = "";
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','dataurl']
    }
    this.init = function (url) {
        that.dataurl = url;
        var id = that.value?that.value : vipspa.Auth.getAuthUser().uid;
        $Ajax(that.dataurl+"?uid="+id,this.bindData)
    }
    this.bindData = function (res) {
        
        var sel = $("[name='" + that.key + "']").find("select");
        res.forEach(function (v) {
            sel.append('<option ' + (that.value == v.value?"selected":"") + ' value="' + v.value + '">' + v.label + '</option>');
        });
    }
}
function OrderNoControl(key) {
    this.type = "OrderNo";
    this.col = 12;
    this.label = "申请单号";
    this.key = key?key:'OrderNo'+new Date().getTime();
    this.dataurl = "";
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','dataurl']
    }
    this.init = function (url) {
        var durl = url?url:that.dataurl;
        //dataurl获取绑定
        $Ajax(durl,this.bindData)
    }
    this.bindData = function (res) {
        
        var dom = $("[name='"+that.key+"']").find("input");
        dom.val(res);
        if(that.event == undefined){
            return;
        }
        for(var i=0;i<that.event.length;i++){
            that.event[i](res);
        }
    }
	this.getData = function(){
		var dom = $("[name='"+that.key+"']").find("input");
		return dom.val();
	}
	this.registEvent = function(func){
        if (that.event == undefined) {
            that.event = [];
        }
        that.event.push(func)
    }
};
function DeptTreeControl(key) {
    this.type = "DeptTree";
    this.col = 12;
    this.label = "下拉部门";
    this.key = key?key:'DeptTree'+new Date().getTime();
    this.dataurl = "";
    this.options = [];
    this.value = "";
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','dataurl']
    }
    this.init = function (url) {
        var durl = url?url:that.dataurl;
        var dom = $("[name='"+that.key+"']");
        dom.find("input").val("");  //清空默认
        // //dataurl获取绑定
        // $Ajax(durl,this.bindData)
        dom.find(".depttree").click(function () {
            showDeptTree(that,that.key,durl);
        });
    }
    this.bindData = function (res) {
        if(!that.dataurl){
            console.log("[control-error]","加载下拉部门数据没有设置url")
        }
        var dom = $("[name='"+that.key+"']");
        dom.find("input[type=hidden]").val(res);
        $Ajax(that.dataurl,function(response){
            for(var i=0;i<response.length;i++){
                if(response[i]["id"] == res) {
                    var name = response[i]["fullPathName"];
                    dom.find("input[type=text]").val(name);
                    break;
                }
            }
        });
    }
};
function UserInfoControl(key) {
    this.type = "UserInfo";
    this.col = 12;
    this.label = "用户信息";
    this.key = key?key:'UserInfo'+new Date().getTime();
    this.dataurl = "";
    var that = this
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','dataurl']
    }
    this.init = function (url) {
        that.dataurl = url;
        var id = vipspa.Auth.getAuthUser().uid;
        this.bindData(id);
    }
    this.bindData = function (res) {
        if(!that.dataurl){
            console.log("[control-error]","加载单号数据没有设置url")
        }
        $Ajax(that.dataurl+"?uid="+res,function(response){
            var dom = $("[name='"+that.key+"']");
            dom.find(".badge").text(response.displayName+"-"+response.num);
            dom.find("input").val(res);
        });
    }
};
function UserSelectControl(key) {
    this.type = "UserSelect";
    this.col = 12;
    this.label = "人员选择";
    this.key = key?key:'UserSelect'+new Date().getTime();
    this.dataurl = "";
    this.options = [];
    this.value = "";
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','dataurl']
    }
    this.init = function (url) {
        var durl = url?url:that.dataurl;
        if(!durl){
            console.log("[control-error]","加载人员选择数据没有设置url")
        }
        var dom = $("[name='"+that.key+"']");
        dom.find("input").val("");  //清空默认
        // //dataurl获取绑定
        // $Ajax(durl,this.bindData)
        dom.find(".emptree").click(function () {
            $(document.getElementById(that.key)).modal('show');
            showEmpTree(that,that.key,durl);
        });
    }
    this.bindData = function (res) {

    }
};
function DateControl(key) {
    this.type = "Date";
    this.col = 12;
    this.label = "日期";
    this.key = key?key:'Date'+new Date().getTime();
    this.value = "";
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label']
    }
    this.init = function (url) {

    }
    this.bindData = function (res) {
        var dom = $("[name='"+that.key+"']");
        dom.find("input").val(res);
    }
};
function TextAreaControl(key) {
    this.type = "TextArea";
    this.col = 12;
    this.label = "多行文本";
    this.key = key?key:'TextArea'+new Date().getTime();
    this.value = "";
    this.rows = 5;
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','rows']
    }
    this.init = function (url) {

    }
    this.bindData = function (res) {
        var dom = $("[name='"+that.key+"']");
        dom.find("textarea").val(res);
    }
}
function RadioControl(key) {
    this.type = "Radio";
    this.col = 12;
    this.label = "单选";
    this.key = key?key:'Radio'+new Date().getTime();
    this.value = "";
    this.rawoptions = [];
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label']
    }
    this.draw = function(){
    }
    this.init = function (url) {

    }
    this.bindData = function (res) {
    }
}
function CheckControl(key) {
    this.type = "Check";
    this.col = 12;
    this.label = "多选";
    this.key = key?key:'Check'+new Date().getTime();
    this.value = "";
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label']
    }
    this.draw = function(){
    }
    this.init = function (url) {

    }
    this.bindData = function (res) {
    }
}
function TBCellSumControl(key){
    this.type = "TBCellSum";
    this.col = 12;
    this.label = "合计";
    this.key = key?key:'TBCellSum'+new Date().getTime();
    this.value = "";
    this.refkey = "";
    this.options = [];  //{label:"",valve:""}
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function () {
        return ['col','key','label','refkey']
    }
    this.init = function (url) {

    }
    this.bindData = function (res) {
        var dom = $("[name='"+that.key+"']");
        dom.find("input").val(res);
    }
}
function FileUploadControl(key) {
    this.type = "FileUpload";
    //this.col = 12;
    this.label = "文件上传";
    this.key = key?key:'FileUpload'+new Date().getTime();
    this.value = "";
    var that = this;
    this.getType = function () {
        return this.type;
    }
    this.getProperty = function(){
        return ['key','label']
    }
    this.init = function(orderNo){
        orderNo.registEvent(this.bindData);
    }
    this.bindData = function (orderNoStr,isView) {
        var dropz = createUploadElem(that.key,orderNoStr,isView);
        // if(isView){
        //     $(".dz-hidden-input").prop("disabled",true);
        //     //dropz.options.clickable = false;
        // }
    }
}
function flat2tree(jsonData,idKey,pidKey,txtKey,newChildKey){
    newChildKey = newChildKey == undefined?"nodes":newChildKey;
    var result = [], temp = {}, i = 0, j = 0, len = jsonData.length
    for(; i < len; i++){
        temp[jsonData[i][idKey]] = jsonData[i] // 以id作为索引存储元素，可以无需遍历直接定位元素
    }
    for(; j < len; j++){
        var currentElement = jsonData[j]
        currentElement["text"] = currentElement[txtKey]  //设置显示字段 text 树控件固定绑定
        currentElement["id"] = currentElement[idKey]  //id 树控件固定绑定
        if(currentElement["id"] == 7){
            currentElement["state"] = {"selected":true};
        }
        var tempCurrentElementParent = temp[currentElement[pidKey]] // 临时变量里面的当前元素的父元素
        if (tempCurrentElementParent) { // 如果存在父元素
            if (!tempCurrentElementParent[newChildKey]) { // 如果父元素没有chindren键
                tempCurrentElementParent[newChildKey] = [] // 设上父元素的children键
            }
            tempCurrentElementParent[newChildKey].push(currentElement) // 给父元素加上当前元素作为子元素
        } else { // 不存在父元素，意味着当前元素是一级元素
            result.push(currentElement);
        }
    }
    return result;
}
function showDeptTree(obj,name,url) {
    // if($(this).next().hasClass("stv")){  //点击时，不能重复创建
    //     $(this).next().show();
    //     return;
    // }
    var $div = $("[name='"+name+"']").find(".stv");
    // if($div.is(':visible')){
    //     $div.hide();
    //     return;
    // }
    if($div.is(':hidden') && $div.find("ul").length>0){  //有数据，直接显示
        $div.show();
        return;
    }
    //var url = "http://localhost:8880/dept/list/all";
    //获取数据
    var nodeData = null;
    $Ajax(url,function(response){
        nodeData = flat2tree(response,"id","parentId","name");
        console.log("tree data",nodeData);
        if(nodeData == null){
            toastr.error("没有任何树形数据!");
            return;
        }
        //$(this).after($div);
        var tv = $div.treeview({
            data: nodeData,                        // 节点数据
            levels: 1,                             // 节点层级数
            color: "#000",                         // 每一级通用的 节点字体颜色
            backColor: "#fff",                     // 每一级通用的 节点字背景色
            onhoverColor: "skyblue",               // 选中浮动颜色
            showBorder: false,                     // 不显示边框
            showTags: true,                        // 是否在每个节点的右侧显示标签。 其值必须在每个节点的数据结构中提供
            highlightSelected: true,               // 是否突出显示选定的节点
            selectedColor: "#fff",                 // 设置选定节点的前景色
            selectedBackColor: "skyblue",          // 设置选定节点的背景色
            expandIcon: 'fa fa-angle-right',// 展开图标
            collapseIcon: 'fa fa-angle-down',// 收缩图标
            onNodeSelected: function (event, data) {
                $(event.target).parent().find(".taginput").val(data.fullPathName);  //text);
                $(event.target).parent().find("input[type=hidden]").val(data.id);
                $(event.currentTarget).hide();
            }
        });
        $div.show();
        tv.treeview("search",[7,{explicitResults:true}]);
    })
}
function showEmpTree(obj,key,url) {
    var $dialog = $(document.getElementById(key));
    var $dept = $dialog.find(".emptree");
    if($dept.find("li").length>0){
        console.log("已有人员树");
        return;
    }
    //var url = "http://localhost:8880/dept/list/all";

    $Ajax(url,function(response) {
        nodeData = flat2tree(response, "id", "parentId", "name");
        console.log("tree data", nodeData);
        if (nodeData == null) {
            toastr.error("没有任何树形数据!");
            return;
        }
        var tv = $dept.treeview({
            data: nodeData,                        // 节点数据
            levels: 1,                             // 节点层级数
            color: "#000",                         // 每一级通用的 节点字体颜色
            backColor: "#fff",                     // 每一级通用的 节点字背景色
            onhoverColor: "skyblue",               // 选中浮动颜色
            showBorder: false,                     // 不显示边框
            showTags: true,                        // 是否在每个节点的右侧显示标签。 其值必须在每个节点的数据结构中提供
            highlightSelected: true,               // 是否突出显示选定的节点
            selectedColor: "#fff",                 // 设置选定节点的前景色
            selectedBackColor: "skyblue",          // 设置选定节点的背景色
            expandIcon: 'fa fa-angle-right',// 展开图标
            collapseIcon: 'fa fa-angle-down',// 收缩图标
            onNodeSelected: function (event, data) {
                //$(event.target).parent().find(".taginput").text(data.fullPathName);  //text);
                //$(event.target).parent().find("input").val(data.id);
                var $emp = $dialog.find(".tree-wrapper.emp");
                $Ajax(SysConfig.Api.host+"/user/full/dept/"+data.id,function(res){
                    if(res.data){
                        var html = "<ul>";
                        res.data.list.forEach(function(v){
                            html += '<li class="badge badge-success" onclick="selectEmp(this,\''+key+'\',\''+v.id+'\')">'+v.displayName+"-"+v.num+'</li>';
                        });
                        $emp.html(html+"</ul>");
                    }else{
                        $emp.html("<h5 style='text-align:center'>nodata</h5>")
                    }
                });
            }
        });
    });
}
function selectEmp(obj,key,selectedId) {
    var dialogEmp = $(document.getElementById(key)).find(".modal-footer").find(".badge");
    dialogEmp.text($(obj).text());
    dialogEmp.attr("data",selectedId);
    // $("[name='fm_bx_info$occurs_dept_code22']").find("taginput").html($(obj).text());
    // $("[name='fm_bx_info$occurs_dept_code22']").find("input").val();
}
function onUserSelect(obj) {
    var $dialog = $(obj).parent().parent().parent().parent();
    var name = $dialog.attr("id");
    var dialogEmp = $dialog.find(".modal-footer").find(".badge");
    if(!dialogEmp.text()){
        toastr.error("未选择任何人员");
        return;
    }
    $("[name='"+name+"']").find(".taginput").html('<span class="badge badge-primary">'+dialogEmp.text()+'</span>');
    $("[name='"+name+"']").find("input").val(dialogEmp.attr("data"));
    $dialog.modal('hide');
}
//所有事件重新绑定
function bindAllEvent(newRow,tableConfigData) {
    $('.input-group2.date').datepicker({
        language: "zh-CN",
        autoclose: true,//选中之后自动隐藏日期选择框
        clearBtn: true,//清除按钮
        todayBtn: true,//今日按钮
        todayHightlight:true,
        format: "yyyy-mm-dd"
    });
    //来自新行addTableRow/加载数据库addTableRowBind，区别：挂载row
    if(tableConfigData.row == undefined){
        tableConfigData.columns.forEach(function(x){
            if(x.type == "Cascader"){
                new CascaderControl(x.key).init(x.dataurl,newRow.find(".cascaderinput").parent().parent());  //td
            }
        });
    } else {
        var row = tableConfigData.row;
        tableConfigData.columns.forEach(function(x){
            if(x.type == "Cascader"){
                var cas = new CascaderControl(x.key);
                cas.options = x.options;
                cas.bindData(row[x.key],newRow.find(".cascaderinput").parent().parent());  //td
            }
        });
    }
    addEventTableCellSum(newRow);
}
function $SubmitForm() {
	//清空历史错误
	$("div").removeClass("has-error");
    //外层
    var data = {};
	var valid = true;
    $("div [name*='$']").each(function(i,v) {
        
        var $v = $(v);
        if ($v.hasClass("table-field")) {  //忽略表格内元素
            return;
        }
        var dom = $v.find("select");
        if (dom.length > 0) {
			valid = valid & isRequired($v,dom.val());
            data[$v.attr("name")] = dom.val();
            return;
        }
        dom = $v.find("textarea");
        if(dom.length > 0){
			valid = valid & isRequired($v,dom.val());
            data[$v.attr("name")] = dom.val();
            return;
        }
        dom = $v.find("checkbox");
        if(dom.length > 0){
            data[$v.attr("name")] = dom.prop("checked");
            return;
        }
        //input  优先找hidden值
        dom = ($v.find("[type=hidden]").length > 0) ? $v.find("[type=hidden]") : $v.find("input");
        var val = dom.val();
		valid = valid & isRequired($v,dom.val());
        if (dom.attr("format") == "i") {
            if(val==''){
                console.log('移除属性【'+$v.attr("name")+'】:int类型没有获取到原始数据');
                return;
            }
            val = parseInt(val);
        }
        data[$v.attr("name")] = val;
    });
    console.log("form data:",data);
    //表格
    var table = $("[name^='Table']");
    if(table.length==0){
        return {formValid:valid,formData:data};
    }
    var tbName = table.attr("name");
    data[tbName] = [];
    var trs = table.find("tbody tr");
    trs.each(function(i,v) {
        var cons = $(v).find("[name*='$']");
        var rowData = {};
        cons.each(function(i2,v2) {
            //input  优先找hidden值
            var colVal = $(v2);
            colVal = (colVal.find("[type=hidden]").length > 0) ? colVal.find("[type=hidden]") : colVal;
            rowData[$(v2).attr("name")] = colVal.val();  //$(v2).val();
        });
        data[tbName].push(rowData);
    });
    console.log("form table data:",data);
    return {formValid:valid,formData:data};
}
function $BuildFlowData(formData){
    
    console.log('create form save()',formData);
    //适配工作流引擎定义的结构
    let flowData = {store_keys:[],store_list_keys:[],args:{}};
    for(let key in formData){
        if(key===undefined)
        {continue;}
        //先排除不是列表
        if(key.indexOf('Table')>=0){
			flowData.args[key] = formData[key];  //处理表格字段给流程变量
            for(let i=0;i<formData[key].length;i++){  //循环多个表格行
                console.log("tb:",i,formData[key]);
                let rowData = {model:'',store_keys:[]};
                for(let tkey in formData[key][i]){ //表格内的行
                    console.log(formData[key][i]);
                    //行内的列
                    let arr = tkey.split('$');
                    if(arr.length<=1){
                        console.log("忽略子表:",key,",key:",tkey);
                        continue;
                    }
                    rowData.model = arr[0];  //会被最后一行的表名字覆盖
                    let row = {key:arr[1],val:formData[key][i][tkey]}
                    rowData.store_keys.push(row);
                }
                //是否有有效行
                if(rowData.store_keys.length>0)
                    flowData.store_list_keys.push(rowData);
                //  for(let ckey in ){
                //     let arr = key.split('$');
                //     if(arr.length<=1){
                //       console.log("忽略列表key:",key);
                //       continue;
                //     }
                //  }
            }
        }

        let arr = key.split('$');
        if(arr.length<=1){
            console.log("忽略主表key:",key);
            continue;
        }
        //处理表单上的order_no
        if(arr[1] == "order_no"){
            flowData.args.wf_order_no = formData[key];
        }
        flowData.store_keys.push({model:arr[0],key:arr[1],val:formData[key]});
        //处理表单流程变量(收集主表单，仅绑定的数据库字段)x 220322加上表格字段
        flowData.args[key] = formData[key];
    }
    //构造表格外联接，默认都是order_no
    for(let i=0;i<flowData.store_list_keys.length;i++){
        flowData.store_list_keys[i].store_keys.push({key:"order_no",val:flowData.args.wf_order_no});
    }
    console.log("flow data:",flowData);
    return flowData;
}
/*必填*/
function isRequired(dom,val){
    if(dom.hasClass("required") && (val==''||val==null)){
        dom.addClass("has-error");
        toastr.error(dom.find("label").text()+"必填");
        return false;
    }
    return true;
}
function addEventTableCellSum(newRow) {
    for(var k in $$Controls.controls){
        var c = $$Controls.controls[k];
        if(c.type == "TBCellSum"){
            newRow.find("[name='"+c.refkey+"']").attr("onblur","cellSum(this,'"+c.refkey+"','"+c.key+"')");
        }
    }
    // $$Controls.
    // $(fm_bx_detail$amount)
}
function cellSum(obj,refkey,key) {
    var total = 0;
    $("#con").find("[name='"+refkey+"']").each(function(i,v){
        var val = parseFloat($(v).val());
        if(isNaN(val)){
            $(v).addClass("has-tb-error");
            return;
        }
        total += val;
        $(v).removeClass("has-tb-error");
    });
    new TBCellSumControl(key).bindData(total);
    //$("[name='"+key+"']").find("input").(total);
}
/*附件上传*/
function createUploadElem(uploadKey,bizId,isView){
    var elem = $("[name='"+uploadKey+"']").find(".dropzone")[0];
    var dropz = new Dropzone(elem,{
        autoProcessQueue: true,
        addRemoveLinks: (isView==undefined),
        addViewLinks: true,
        maxFiles: 5,// 一次性上传的文件数量上限
        maxFilesize: 2, // 文件大小，单位：MB
        acceptedFiles: ".jpg,.gif,.png,.jpeg", // 上传的类型
        parallelUploads: 1,// 一次上传的文件数量
        dictDefaultMessage: '拖动文件至此或者点击上传',
        dictMaxFilesExceeded: "您最多只能上传"+this.maxFiles+"个文件！",
        dictResponseError: '文件上传失败!',
        dictInvalidFileType: "文件类型只能是*.jpg,*.gif,*.png,*.jpeg",
        dictFallbackMessage: "浏览器不受支持",
        dictFileTooBig: "文件过大上传文件最大支持.",
        dictRemoveFile: "删除",
        dictCancelUpload: "取消",
        clickable:(isView==undefined),
        //id: "#my-dropzone",
        url: SysConfig.Api.host+"/file/open/form/upload?bill_code="+bizId,
        init: function () {
            var that = this;
            $Ajax(SysConfig.Api.host+"/file/open/form/file_list?bizId="+bizId,function(res){
               
                res.forEach(function (v) {
                    var mf = {id: v.fileId, name: v.fileName, size: v.fileSize};
                    that.files.push(mf);  //不加remove时files为0会被rest，显示上传提示
                    that.emit("addedfile", mf);
                    
                    $(mf.previewElement).find(".dz-details").attr("href",SysConfig.Api.host+"/file/open/form/file?img="+v.fileId+v.fileType);
                    that.createThumbnailFromUrl(mf, SysConfig.Api.host+"/file/open/form/file?img=" + v.fileId + v.fileType, function (thumbnail) {
                        that.emit("complete", mf);
                        $(".dz-details").colorbox({rel: "dz-details"});
                    }, true);
                })
            });
            this.on("success", function (file, data) {
                //获取后台传回的文件名，放入输入框
                //$("#logowebpath").val(data.fileName);
                console.log(data.fileName)
                file.id = data.fileId;
                $(file.previewElement).find(".dz-details").attr("href",SysConfig.Api.host+"/file/open/form/file?img="+data.fileName);
                $(".dz-details").colorbox({rel:"dz-details"});
            });
            this.on("maxfilesexceeded", function (file, data) {
                //由于文件数量达到 maxFiles 限制数量被拒绝时调用
                this.removeFile(file);
                alert("5张上限");
            });
            this.on("removedfile", function (file, data) {  //file.name
                  //file.id
                var that = this;
                $Post(SysConfig.Api.host+"/file/open/form/remove?fileId="+file.id,null,function(res){
                    that.removeFile(file);
                })
            });
            this.on("addedfile", function (file, data) {
                  //file.id
            });
        }
    });
    return dropz;
}
function bindCascaderData(obj,controlNameObj,url,options,value) {
    var cascader = controlNameObj.find(".cascaderinput");
    cascader.text('');
    cascader.removeClass('cascaderinput');
    var rawDs;
    cascader.bsCascader({
        openOnHover: true,
        splitChar: ' / '
        ,loadData: function (openedItems, callback) {
            var operationFn = function(response) {
                console.log("cascader data", response);
                var treeData = flat2tree(response,"code","parent","name","data");
                console.log("tree data",treeData);
                callback(treeData);
                if(value != undefined){
                    var selectedVal = getCascaderFullPath(response,value);
                    console.log("tree path",selectedVal);
                    setTimeout(function () {
                        cascader.bsCascader('setValue',selectedVal);
                    },100);
                }
            };
            if(options.length==0) {
                $Ajax(url, operationFn);
            }else {
                operationFn(options)
            }
        }
    }).on({
        'bs.cascader.change': function (e, oldValue, newValue) {
            controlNameObj.find("[type=hidden]").val(newValue[newValue.length-1].code);  //(JSON.stringify(newValue));
        }
    });
}
function getCascaderFullPath(response,val) {
    var path = [];
    for(var i=0;i<response.length;i++){
        if(response[i].code == val){
            path.push(response[i]);
            var parent = response[i]
            while (parent != undefined){
                parent = getCascaderParent(parent,response);
                if(parent == undefined){
                    break;
                }
                path.unshift(parent);
            }
        }
    }
    return path;
}
function getCascaderParent(val,response) {
    var code;
    for(var i=0;i<response.length;i++){
        if(val.parent == response[i].code){
            code = response[i];
            break;
        }
    }
    return code;
}