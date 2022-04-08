var ORDER_NO;
function getPageOrderNo() {
    // if(ORDER_NO){
    //     return ORDER_NO;
    // }
    var orderNo;
    for(var k in $$Controls.controls){
        if($$Controls.controls[k].type == "OrderNo")
        {
            orderNo = new OrderNoControl(k).getData();
            break;
        }
    }
    // ORDER_NO = orderNo;
    // if(!ORDER_NO){
    //     console.log("页面控件没找到orderNo")
    // }
    if(!orderNo){
        console.log("页面控件没找到orderNo")
    }
    return orderNo;
}
function showHistory() {
    $("#historyDlg").modal('show');
    var orderNo = getPageOrderNo();
    
    $Ajax(SysConfig.Api.host+"/api/approve/history/"+orderNo,function(res){
        var data = res.data;
        var tpl = document.getElementById('HistoryRow_Tpl').innerHTML; //读取模版
        laytpl(tpl).render(data, function(render) {
            $("#historyDlg").find(".modal-body").html("");
            $("#historyDlg").find(".modal-body").append($(render));
        });
    });
}
function showFlow(){
    var orderNo = getPageOrderNo();
    getConfigData(orderNo);
}
function getConfigData(orderNo){
     var pname = Request.QueryString("pname");
     $Ajax(SysConfig.Api.host+"/api/config/process/"+pname,function(res){
         if(res.success){
             //显示弹框
             $("#flowDlg").modal('show');
             var jsonLayout = res.data.flowDesignLayout;
             loadFlowView(orderNo,jsonLayout);  //加载保存的图形
         }
     });
}