$(document).ready(function(){
    var pname = QuerySearchString("pname");
    var code = QuerySearchString("code");
    if(pname && code){
        console.log('开始编辑')
        getFormConfig(pname,code);
        getFormFields(pname,code);
    }
});
function getFormConfig(pname,code) {
    $Ajax(SysConfig.Api.host+'/api/form/config/code?pname='+pname+'&code='+code,function(res){
        if(!res.success){
            toastr.error(res.message);
            return;
        }
        if(res.data.content == null){
            console.log("创建后第一次进入编辑");
            return;
        }
        var $con = $("#con");
        $con[0].outerHTML = res.data.content;
        $con = $("#con");
        $con.find(".elem-delete").show();
        $con.find(".ibox-tools").show();
        //$con.removeAttr("draggable");
        if(res.data.config != null) {
            var conf = eval('(' + res.data.config + ')');
            initFormData(conf.controls, conf.settings);
        }
    });
}
function getFormFields(pname,code){
    $Ajax(SysConfig.Api.host+'/api/config/process/form/fields_tree?pname='+pname+'&code='+code,function(res){
        if(res.success && res.data!=null){
            CONF_DATA = res.data;
        }
    });
}
function saveLayout(){
    var html = $("#con")[0].outerHTML;
    var $con = $(html);
    //$con.find(".elem-delete").remove();
    $con.find(".elem-delete").hide();
    //$con.find(".citem").removeAttr("onclick");
    //$con.find(".ibox-tools").remove();
    $con.find(".ibox-tools").hide();
    console.log($con[0].outerHTML);
    var conf = JSON.stringify($$Controls);
    console.log(conf);
    var pname = QuerySearchString("pname");
    var code = QuerySearchString("code");
    $Post(SysConfig.Api.host+"/api/config/process/form/layout",
        {processName:pname,formCode:code,content:$con[0].outerHTML,config:conf},
        function(res) {
            if(res.success)
                toastr.success("保存成功");
            else
                toastr.error(res.message);
        });
}
function QuerySearchString(item) {
    var result = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]+)","i"));
    if(result == null || result.length < 1){
        return "";
    }
    return result[1];
}
function initFormData(data,settings) {
    //$$Controls.controls = data;
    $$Controls.settings = settings;
    //全局样式
    $("#settingCss").text(".labelwidth{width:"+$$Controls.settings.labelwidth+";}");
    //先获取DB的数据，在DB API回调后，然后绑定配置后赋值DB数据
    //test data获取DB数据
    redrawControls(data);
    //jquery控件初始化
    $('.input-group2.date').datepicker({
        format: "yyyy-mm-dd"
    });
}
function redrawControls(conf) {
    //从服务端获取的顶层div -> con，重新设置拖拽
    var topCon = document.getElementById('con');
    new Sortable(topCon, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65
    });
    
    var CONF = conf;
    for(k in CONF) {
        if (CONF[k].type == "Table") {
            var table = new TableControl(k);
            //属性
            for (p in CONF[k]) {
                table[p] = CONF[k][p];
            }
            table.columns = [];  //清空属性设置的数据，只添加控件对象
            CONF[k].columns.forEach(function (v) {
                console.log("反向构造表头类型", v.type);
                var col = eval("new " + v.type + "Control('" + v.key + "')");
                for (cp in v) {
                    col[cp] = v[cp];
                }
                table.addColumn(col);
            });
            $$Controls.addControl(table);
            continue
        }
        var control = eval("new " + CONF[k].type + "Control('" + k + "')");
        //属性
        for (p in CONF[k]) {
            control[p] = CONF[k][p];
        }
        //处理外层Card的拖动层级，否则内部不能独立拖动 id="Drag_Card1629105092936"
        if (CONF[k].type == "Card") {
            var container0 = document.getElementById("Drag_" + k);
            new Sortable(container0, {
                draggable: '.citem',
                group: 'nested',
                animation: 150,
                fallbackOnBody: true,
                swapThreshold: 0.65
            });
        }
        $$Controls.addControl(control);
    }
}
function isFieldUsed(fName){
    var used = false;
    //控件
    var cons = $("#con").find("[name*='$']");
    cons.each(function(i,v){
        if($(v).attr("name") == fName){
            used = true;
            return;
        }
    });
    if(used)
        return used;
    //表格
    var tks = $("#con").find("[tk*='$']");
    tks.each(function(i,v){
        if($(v).attr("tk") == fName){
            used = true;
            return;
        }
    });
    return used;
}