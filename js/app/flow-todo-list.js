function TableInit() {
    return $("#tbTodoList").DataTable({
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/api/workflow/todo?page2dt=y",
        fnServerData: function ( sUrl, aoData, fnCallback, oSettings ) {
            
            //aoData.push();
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
            { mData: "orderNo" },
            { mData: "processDisplayName" },
            { mData: "orderCreateTime" },
            { mData: "taskName" },
            { mData: "taskCreateTime" },
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
        {"width": "20%", "targets": 0},
        {"width": "20%", "targets": 1},
        {"width": "20%", "targets": 2},
        {"width": "20%", "targets": 3},
        {"width": "20%", "targets": 4},
        {"width": "30%", "targets": 5,
            "render": function (data, type, row, meta) {
                var link = "<button class='add btn btn-primary btn-xs' onclick='goApprove(\""+data.id+"\",\""+data.processName+"\")'>审批</button>";
                return link;
            }
        }
        ],
        drawCallback: function (settings) {  //1
            $("[data-toggle='popover']").popover({html : true });
        }
});
};
function approvedTabClick(){
    $("#tbApprovedList").DataTable({
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/api/workflow/complete_list?page2dt=y",
        fnServerData: function ( sUrl, aoData, fnCallback, oSettings ) {
            
            //aoData.push();
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
            { mData: "orderNo" },
            { mData: "processDisplayName" },
            { mData: "orderCreateTime" },
            { mData: "taskName" },
            { mData: "taskCreateTime" },
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "20%", "targets": 0},
            {"width": "20%", "targets": 1},
            {"width": "20%", "targets": 2},
            {"width": "20%", "targets": 3},
            {"width": "20%", "targets": 4},
            {"width": "30%", "targets": 5,
                "render": function (data, type, row, meta) {
                    var link = "<button class='add btn btn-primary btn-xs' onclick='goView(\""+data.orderId+"\",\""+data.processName+"\")'>查看</button>";
                    return link;
                }
            }
        ],
        drawCallback: function (settings) {  //1
            $("[data-toggle='popover']").popover({html : true });
        }
    });
}
function submitedTabClick(){
    $("#tbSubmitedList").DataTable({
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/api/workflow/my_list?page2dt=y",
        fnServerData: function ( sUrl, aoData, fnCallback, oSettings ) {
            
            //aoData.push();
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
            { mData: "orderNo" },
            { mData: "processDisplayName" },
            { mData: "orderCreateTime" },
            { mData: "taskName" },
            { mData: "taskCreateTime" },
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "20%", "targets": 0},
            {"width": "20%", "targets": 1},
            {"width": "20%", "targets": 2},
            {"width": "20%", "targets": 3},
            {"width": "20%", "targets": 4},
            {"width": "30%", "targets": 5,
                "render": function (data, type, row, meta) {
                    var link = "<button class='add btn btn-primary btn-xs' onclick='goView(\""+data.orderId+"\",\""+data.processName+"\")'>查看</button>";
                    return link;
                }
            }
        ],
        drawCallback: function (settings) {  //1
            $("[data-toggle='popover']").popover({html : true });
        }
    });
}
function setSearchParams(params){
}
//http://10.1.8.109:6600/csm-api/admin/account/total?pageNum=1
function saveOrUpdate(btn){
    var data = getPageData();
    if($("#btnSave").val() == "修改") {
        data.id = $("#menuId").val();
        data.parentMenuId = $("#menuPId").val();
    }
    else if($("#btnSave").val() == "新增"){
        var currId = $("#menuId").val();
        data.parentMenuId = currId;  //新增新结点的parentId=当前选中的结点id
    }

    saveData(data);
};

function saveData(dataTable){
    //var data = {qty:parseInt($("#txtDeposit").val()),empCode:$("#hdeEmpNo").val()};
    var deduct = $(".modal-title").text().indexOf("扣除饭点");
    var op = "deposit";
    if(deduct >= 0)
        op = "deduct";

    $.ajax({
        "url": SysConfig.Api.host+"/admin/account/"+op+"?qty="+$("#txtDeposit").val()+"&empCode="+$("#hdeEmpNo").val(),
        //"contentType": "application/json;charset=utf-8",
        //"data": JSON.stringify(data),
        "type": "post",
        "headers":getAuthHeader(),
        "error": function (a,b,c) {
            toastr.error(a);
        },
        "success": function (response) {
            
            if (response != null && response != "") {
                //刷新
                if(response.success){
                    toastr.success("保存成功!");
                    $('#depositDlg').modal('hide');
                    dataTable.ajax.reload();
                }else{
                    toastr.warning(response.message);
                }
            } else {
                toastr.error("提交错误!");
            }
        }
    });
}

function tempAddSave(dataTable){
    if($("#txtTempMail").val() == "" || $("#txtTempName").val() == "") {
        toastr.error("邮箱和姓名必须填写!");
    }

    var param = encodeURI("qty="+$("#txtTempDeposit").val()+"&mail="+$("#txtTempMail").val()+"&empName="+$("#txtTempName").val()+"&memo="+$("#txaTempMemo").val());
    $.ajax({
        "url": SysConfig.Api.host+"/admin/account/temp_emp?"+param,
        "type": "post",
        "headers":getAuthHeader(),
        "error": function (a,b,c) {
            toastr.error(a);
        },
        "success": function (response) {
            
            if (response != null && response != "") {
                //刷新
                if(response.success){
                    toastr.success("保存成功!");
                    $('#addTempDlg').modal('hide');
                    dataTable.ajax.reload();
                }else{
                    toastr.warning(response.message);
                }
            } else {
                toastr.error("提交错误!");
            }
        }
    });
}

$(document).ready(function(){
    //1.初始化Table
    var dataTable = TableInit();
    $('#btnSearch').click(function () {
        dataTable.ajax.reload();
    });
    $('#dlgSave').click(function () {
        saveData(dataTable);
    });
    $('#btnTempAdd').click(function () {
        tempAddShow();
    });
    $('#dlgTempSave').click(function () {
        tempAddSave(dataTable);
    });
});

function goApprove(tid,pname){
    location.href = "#flow-approve-create?pname="+pname+"&tid="+tid;  //pname流程图打开时脚本需要
}
function goView(oid,pname){
    location.href = "#flow-apply-view?pname="+pname+"&oid="+oid;  //pname流程图打开时脚本需要
}
function tempAddShow() {
    $('#addTempDlg').modal('show');
}