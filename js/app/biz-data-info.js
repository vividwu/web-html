function TableInit(tid,codes) {
    return $("#tbDataList").DataTable({
        sAjaxSource: SysConfig.Api.host+"/biz/data_info/page?page2dt=y&tid="+tid,
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
        aoColumns: codes
    });
};
function setSearchParams(params){
}
var dataTable;
var fieldsInfo;
$(document).ready(function(){
    //1.初始化Table
    //dataTable = TableInit();
    var tid = Request.QueryString("tid");
    $Ajax(SysConfig.Api.host+"/biz/data_info/fields?tid="+tid,function(res){
        var codes = [];
        var $tr = $("#tbDataList").find("thead tr");
        fieldsInfo = res.data;
        res.data.forEach(function (v){
            $tr.append("<th>"+v.memo+"</th>");
            codes.push({mData:v.fieldName});
        })
        console.log(codes)
        dataTable = TableInit(tid,codes);
    });
    var elem = document.querySelector('.js-switch')
    isScriptElem = new Switchery(elem, { size: 'small' });
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
function createFormControls() {
    $("#newDataDlgForm")[0].innerHTML = "";
    if(fieldsInfo === undefined) {
        toaster.error("没有找到模型定义");
        return;
    }
    fieldsInfo.forEach(function (v) {
        var data = {key: v.tableName+"$"+v.fieldName, label: v.memo};
        if (v.dataType == "cascader") {
            drawControls('Cascader_Tpl',data,function () {
                var control = new CascaderControl(data.key);
                control.init(v.dataConfig);
            });
        } else if (v.dataType == "select") {

        } else if (v.dataType == "depttree") {

        } else {
            drawControls('TextBox_Tpl',data,function () {
                var control = new TextBoxControl(data.key);
                control.label = v.memo;
            });
        }
    });
}
function drawControls(tempName,data,callback) {
    var tpl = document.getElementById(tempName).innerHTML; //读取模版
    laytpl(tpl).render(data, function (render) {
        $("#newDataDlgForm").append(render);
        callback();
    });
}
var isScriptElem;
function btnDataClick(){
    $('#newDataDlg').modal('show');
    createFormControls();
    //         $.ajax({
    //             type: "Get",
    //             url: "http://localhost:8880/api/common/dictionary/dict_cates?query="+$("#newCate").val(),
    //             contentType: "application/json;charset=utf-8",
    //             dataType: "json",
    //             timeout: 50000,
    //             // data: JSON.stringify({ 'name': $("#local_object_data").val() }),
    //
    //             success: function (data) {
    //                 console.log(data);
    //                 var datas = eval("(" + data.d + ")");
    //                 process(datas);
    //                 },
    //
    //     }
    // });
}
function saveNewData(){
    var kvs = $SubmitForm();
    var tid = Request.QueryString("tid");
    $Post(SysConfig.Api.host+"/biz/table_data/model/"+tid,kvs.formData,function(res){
        if(res.success){
            toastr.success('创建成功');
            $('#newDataDlg').modal('hide');
            dataTable.ajax.reload();
        }else{
            toastr.error(res.message);
        }
    })
}
function btnEditTableClick(code,parentCode,text,sort,category,remark){
    $('#editDictDlg').modal('show');
    $('#editCode').val(code);
    $('#editParentCode').val(parentCode);
    $('#editText').val(text);
    $('#editSort').val(sort);
    $('#editCategory').val(category);
    $('#editRemark').val(remark);
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