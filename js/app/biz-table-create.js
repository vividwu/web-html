function TableInit() {
    return $("#tbTableList").DataTable({
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/biz/table_info/page?page2dt=y",
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
            { mData: "id" },
            { mData: "name" },
            { mData: "memo" },
            { mData: "createTime" },
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "20%", "targets": 0},
            {"width": "10%", "targets": 1,"render": function (data, type, row, meta) {
                    var link = '<a href="#biz-data-info?tid='+row.id+'">'+row.name+'</a>';
                    return link;
                }},
            {"width": "40%", "targets": 2},
            {"width": "10%", "targets": 3},
            {"width": "20%", "targets": 4,
                "render": function (data, type, row, meta) {
                    var link = '<button class="add btn btn-primary btn-xs" onclick="btnEditDictClick(\''+data.code+"','"+(data.parentCode==null?"":data.parentCode)
                        +"','"+data.text+"','"+(data.sort==null?"":data.sort)+"','"+data.category+"','"+(data.remark==null?"":data.remark)+"'"+')">编辑</button>&nbsp;&nbsp;';
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
$(document).ready(function(){
    //1.初始化Table
    dataTable = TableInit();
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
var isScriptElem;
function btnNewTableClick(){
    $('#newTableDlg').modal('show');
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
function dataTypeChanged(obj) {
    var $tr = $(obj).parent().parent();
    if (["cascader","select","depttree"].indexOf(obj.value)>=0)
        $tr.find("[name='dataConfig']").removeAttr("disabled");
    else {
        $tr.find("[name='dataConfig']").attr("disabled", "disabled");
        $tr.find("[name='dataConfig']").val("");
    }
}
function allowNullCheck(obj) {

}
function saveTableDict(){
    $Post(SysConfig.Api.host+"/dict/create_code",{code:$("#newCode").val(),parentCode:$("#newParentCode").val(),text:$("#newText").val(),
        sort:$("#newSort").val(),category:$("#newCategory").val(),remark:$("#newRemark").val()},function(res){
        if(res.success){
            toastr.success('创建成功');
            $('#newDictDlg').modal('hide');
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
function addData(){
    var tpl = document.getElementById('ModleRow_Tpl').innerHTML; //读取模版
    var data = [{"fieldName":"","memo":"","dataType":"nvarchar","allowNull":true,"dataConfig":""}]
    laytpl(tpl).render(data, function(render) {
        $("#tableData").find("tbody").append($(render));
    });
}
function deleteData(obj,idx){
    $(obj).parent().parent().remove();
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