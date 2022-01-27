$(document).ready(function(){
    $Ajax(SysConfig.Api.host+"/api/config/process/list_page",function(res){
        var tpl = document.getElementById('Box_Tpl').innerHTML; //重新构造模版
        laytpl(tpl).render(res.data.list, function (render) {
            $("#processList")[0].innerHTML = render;
        });
    })
});

function goApply(pname){
    location.href = "#flow-apply-create?pname="+pname;
}
function tempAddShow() {
    $('#addTempDlg').modal('show');
}