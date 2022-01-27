$(document).ready(function(){
    var tid = Request.QueryString("tid");
    $Ajax(SysConfig.Api.host+"/api/form/config/approve/"+tid,function(response){
        if(response.data){
            console.log("html",response.data.content,"data",response.data.config);
            $("#con").append($(response.data.content));
            $Ajax(SysConfig.Api.host+"/api/order_info/task/"+tid,function(res){
                var conf = eval("("+response.data.config+")");
                $BindDate2Controls(conf.controls,res.data);  //control_view.js
            });
            if(response.data.operation.indexOf("agree")>=0){
                $("#agreeBtn").show();
                $("#agreeBtn").click(agreeClick);
            }
            if(response.data.operation.indexOf("reject")>=0){
                $("#rejectBtn").show();
                $("#rejectBtn").click(rejectClick);
            }
            if(response.data.operation.indexOf("add_task_before")>=0){
                $("#addTaskBeforeBtn").show();
                $("#addTaskBeforeBtn").click(addTaskBeforeClick);
            }
        }else{
            toastr.error("没有找到表单配置");
        }
    });
});
function agreeClick(e){
    approveOpration('agree');
}
function approveOpration(type) {
    var raw = $SubmitForm();
    var formData = $BuildFlowData(raw);  //control.js
    console.log(type+' approve:',formData);
    var flowData = {store_keys:[],store_list_keys:[],args:{}};  //todo 审批时，不修改新增，暂不赋值formData
    approveData(flowData,type);
}
function rejectClick(e){
    approveOpration('reject');
}
function approveData(flowData,type) {
    var tid = Request.QueryString("tid");
    var approveData = flowData;
    approveData.approve_type = type;
    approveData.reason = $("#approveReason").val();
    console.log("审批数据",approveData);
    $Post(SysConfig.Api.host+"/api/approve/" + tid, approveData, function (res) {
        if (res.success) {
            toastr.success("完成审批"+(type=="agree"?"同意":"拒绝"));
            window.location.href = "#flow-todo-list";
        } else {
            toastr.error(res.message);
        }
    });
}
function addTaskBeforeClick(){
    $('#addTaskBeforeDlg').modal('show');
}
function saveAddTaskBefore(){
    var tid = Request.QueryString("tid");
    var taskKey = $("#txbAddTaskBeforeTaskId").val();
    var userId = $("#txbAddTaskBeforeAssignee").val();
    $Post(SysConfig.Api.host+"/api/approve/add_task_before/"+tid,{before_task_id:taskKey,assginee_ids:userId},function(res){
        if(res.success){
            toastr.success("加签成功");
        }else{
            toastr.error(res.message);
        }
    })
}