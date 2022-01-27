$(document).ready(function(){
    var oid = Request.QueryString("oid");
    $Ajax(SysConfig.Api.host+"/api/form/config/view/"+oid,function(response){
        if(response.data){
            console.log("html",response.data.content,"data",response.data.config);
            $("#con").append($(response.data.content));
            $Ajax(SysConfig.Api.host+"/api/order_info/order/"+oid,function(res){
                var conf = eval("("+response.data.config+")");
                $BindDate2Controls(conf.controls,res.data);  //control_view.js
            });
        }else{
            toastr.error("没有找到表单配置");
        }
    });
});