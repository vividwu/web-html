function TableInit() {
    return $("#tbTableList").DataTable({
        sAjaxSource: SysConfig.Api.host+"/webserver/hooks/page?page2dt=y",
        fnServerData: function ( sUrl, aoData, fnCallback, oSettings ) {
            setSearchParams(aoData);
            $.ajax( {
                type: "GET",
                url: sUrl,
                dataType:'json',
                headers:vipspa.Auth.getHeaderToken(),
                data : aoData,
                success:  fnCallback
            });
        },
        aoColumns: [
            { mData: "hookCode" },
            { mData: "category" },
            { mData: "hookType" },
            { mData: "processName" },
            { mData: "remark" },
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "20%", "targets": 0,"render": function (data, type, row, meta) {
                    var link = '<a href="tid='+row.hookCode+'">'+row.hookCode+'</a>';
                    return link;
                }},
            {"width": "10%", "targets": 1},
            {"width": "10%", "targets": 2},
            {"width": "10%", "targets": 3},
            {"width": "40%", "targets": 4},
            {"width": "10%", "targets": 5,
                "render": function (data, type, row, meta) {
                    var link = '<button class="add btn btn-primary btn-xs" onclick="btnEditHookClick(\''+data.processName+"','"+data.hookCode+'\')">编辑</button>&nbsp;&nbsp;';
                    link += "<button class='add btn btn-danger btn-xs' onclick='btnDeleteDictClick()'>删除</button>";
                    return link;
                }
            }
        ]
    });
};
function setSearchParams(params){
}
var dataTable;
var editorScript;
$(document).ready(function(){
    //1.初始化Table
    dataTable = TableInit();
    /*$("#isNewScript").change(function(e){
        if(isScriptElem.element.checked)
        {
            $("#newCategory").val("script_const");
            $("#newCategory").attr("disabled","disabled");
        }else{
            $("#newCategory").val("");
            $("#newCategory").removeAttr("disabled");
        }
    })*/
});
function btnNewTableClick(){
    $('#newTableDlg').modal('show');
    $('#processName').typeahead({  //key值是空会导致异常
        source: function (query, process) {
            $Ajax(SysConfig.Api.host+"/api/common/dictionary/process_cates", function (res) {
                process(res);
            });
        }
        // ,displayText:function (item) {  //或者默认.name
        //     return item.category;
        // }
    });
    setNewDlgForm();
}
function setNewDlgForm() {
    $("#dlgModelSave").show();
    $("#dlgModelUpdate").hide();
    $("#bizType").removeAttr("disabled");
    $("#hookType").removeAttr("disabled");
    $("#hookCode").removeAttr("disabled");
    $("#processName").removeAttr("disabled");
    $("#bizType").val("办公类");
    $("#hookType").val("before_url");
    $("#hookCode").val("");
    $("#processName").val("");
    $("#remark").val("");
    $("#hookUrl").val("");
    $("#scriptCode").val("");
    $("#txbScriptText").val("");
    if (editorScript != undefined) {
        $(editorScript.getWrapperElement()).hide();
    }
}
function setEditDlgForm(obj) {
    $("#dlgModelSave").hide();
    $("#dlgModelUpdate").show();
    $("#bizType").val(obj.bizType);
    $("#bizType").attr("disabled","disabled");
    $("#hookType").val(obj.category+"_"+obj.hookType);
    $("#hookType").attr("disabled","disabled");
    $("#hookCode").val(obj.hookCode);
    $("#hookCode").attr("disabled","disabled");
    $("#processName").val(obj.processName);
    $("#processName").attr("disabled","disabled");

    var type = obj.hookType;
    if(type == "url"){
        $("#hookUrl").show();
        $(editorScript.getWrapperElement()).hide();
        $("#hookUrl").val(obj.scriptContent);
    }else if(type == "script"){
        $("#hookUrl").hide();
        editorSetValue(obj.scriptContent);
        $(editorScript.getWrapperElement()).show();
    }
    $("#txbScriptText").val(obj.testContent);
    $("#remark").val(obj.remark);
}
function hookTypeChanged(obj) {
    if(obj.value == "before_script") {
        $("#hookUrl").hide();
        editorSetValue("let BeforeHook=fn(ctx){\n\n}");
        $(editorScript.getWrapperElement()).show();
    }else if(obj.value == "after_script") {
        $("#hookUrl").hide();
        editorSetValue("let AfterHook=fn(ctx){\n\n}");
        $(editorScript.getWrapperElement()).show();
    }else if(obj.value == "before_url") {
        $("#hookUrl").show();
        $(editorScript.getWrapperElement()).hide();
    }else if(obj.value == "after_url") {
        $("#hookUrl").show();
        $(editorScript.getWrapperElement()).hide();
    }
}
function editorSetValue(val) {
    if(editorScript == undefined) {
        editorScript = initEditor(editorScript, "scriptCode");
    }
    editorScript.setValue(val);
    setTimeout(function() {
        editorScript.refresh();
        console.log("refresh")
    },300);
}
function allowNullCheck(obj) {

}
function saveTableHook(){
    var data = getDlgData();
    $Post(SysConfig.Api.host+"/webserver/hook/create",data,function(res){
        if(res.success){
            toastr.success('创建成功');
            $('#newTableDlg').modal('hide');
            dataTable.ajax.reload();
        }else{
            toastr.error(res.message);
        }
    })
}
function getDlgData(){
    var ht = $("#hookType").val().split('_');  //before_url
    var cate = ht[0];  //before
    var type = ht[1];  //url
    var ctx = type=="url"?$("#hookUrl").val():$("#scriptCode").val();
    return {bizType:$("#bizType").val(),category:cate,processName:$("#processName").val(),
        hookType:type,hookCode:$("#hookCode").val(),remark:$("#remark").val(),scriptContent:ctx,testContent:$("#txbScriptText").val()};
}
function saveEditHook(){
    var data = getDlgData();
    $Post(SysConfig.Api.host+'/webserver/hook/update',data,function(res){
        if(res.success){
            toastr.success('修改成功');
            $('#newTableDlg').modal('hide');
            dataTable.ajax.reload();
        }else{
            toastr.error(res.message);
        }
    })
}
function btnEditHookClick(pname,code){
    $Ajax(SysConfig.Api.host+"/webserver/hook/"+pname+"/"+code, function (res) {
        if(res.success) {
            $('#newTableDlg').modal('show');
            setEditDlgForm(res.data);
        }else{
            toastr.error(res.message);
        }
    });
}
function saveEditTable(){
    $Post(SysConfig.Api.host+'/dict/update_code/'+$('#editCategory').val()+'/'+$('#editCode').val(),{code:$("#editCode").val(),
        parentCode:$("#editParentCode").val(),text:$("#editText").val(),sort:$("#editSort").val(),category:$("#editCategory").val(),
        remark:$("#editRemark").val()},function(res){
        if(res.success){
            toastr.success('修改成功');
            $('#editDictDlg').modal('hide');
            dataTable.ajax.reload();
        }else{
            toastr.error(res.message);
        }
    })
}
function btnDeleteDictClick(){
    toastr.error("待实现");
}
//新增字段编辑框
function createNewModel() {
    var model = [];
    $("#tableData tbody tr").each(function () {
        model.push({
            "fieldName": $(this).find("[name='fieldName']").val(), "memo": $(this).find("[name='memo']").val(),"dataType": $(this).find("[name='dataType']").val(),
            "dataConfig": $(this).find("[name='dataConfig']").val(), "tableName": $("#tableName").val(),"required":$(this).find("[name='allowNull']").is(':checked')?"y":"n"
        });
    });
    $Post(SysConfig.Api.host+"/biz/table_info/model/create",
        {
            info: {name: $("#tableName").val(), memo: $("#tableMemo").val()},
            fields: model
        }, function (res) {
            if (res.success) {
                // var row = '<tr role="row" class="even"><td>' + $("#tableName").val() + '</td><td>' + $("#tableMemo").val() + '</td><td></td><td><button class="add btn btn-primary btn-xs" onclick="deleteTableLink(\''+$("#tableName").val()+'\')">删除</button></td></tr>';
                // $("#modelTable tbody").append($(row));
                toastr.success("创建成功");
                $("#newTableDlg").modal('hide');
                $("#tableData").find("tbody").html("");  //清空原有的
                $("#tableName").val("");
                $("#tableMemo").val("");
                dataTable.ajax.reload();
            } else {
                toastr.error(res.message);
            }
        });
}