$(document).ready(function(){
    var pname = Request.QueryString("pname");
    $Ajax(SysConfig.Api.host+"/api/form/config/start/"+pname,function(response){
        if(response.data){
            console.log("html",response.data.content,"data",response.data.config);
            $("#con")[0].outerHTML = response.data.content;
            var conf = eval("("+response.data.config+")");
            $ViewControls(conf);  //control_view.js
            if(response.data.operation.indexOf("submit")>=0){
                $("#submitBtn").show();
                $("#submitBtn").click(submitClick);
            }
            if(response.data.operation.indexOf("save")>=0){
                $("#saveBtn").show();
            }
        }else{
            toastr.error("没有找到表单配置");
        }
    });
});
function submitClick(e) {
    var result = $SubmitForm();
    var valid = result.formValid;
    var raw = result.formData;
    if(!valid){
        toastr.error("请完善必填项！");
        return;
    }
    var data = $BuildFlowData(raw);  //control.js
    console.log('提交数据:',data);
    var pname = Request.QueryString("pname");
    $Post(SysConfig.Api.host+"/api/apply/"+pname+"/submit",data,function(res){
        if(res.success){
            toastr.success("提交表单成功");
            window.location.href = "#flow-process-list";
        }else{
            toastr.error(res.message);
        }
    })
}