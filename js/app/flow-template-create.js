var isMainElem;
$(document).ready(function(){
    var elem = document.querySelector('.js-switch')
    isMainElem = new Switchery(elem, { size: 'small' });

    $('#modelTab>li>a').each(function(){
        $(this).on('show.bs.tab', function(e) {
            // if($(this).parent().hasClass("disabled"))
                e.preventDefault();  //阻止a链接的跳转行为
            // else {
            //     $(this).tab('show');
            // }
            var idx = $(this).attr("href").split("_")[1];
            if(!$(this).parent().hasClass("disabled")){
                $('#modelTab>li').each(function(){
                   $(this).removeClass("active");
                });
                $("div[id^='tabDefine_']").each(function(){
                    $(this).removeClass("active");
                });
                $('#modelTab>li').eq(idx-1).addClass("active");
                $('#tabDefine_' + idx).addClass("active");
            }
        });
    });
    initTabData();
});
var PROCESS_CONF={};
function initTabData(){
    var pname = Request.QueryString("pname");
    if(pname) {
        $Ajax(SysConfig.Api.host+'/api/config/process/' + pname, function (res) {
            for(var i=1;i<=res.data.step;i++){
                activeTab(i);
            }
            //activeTab(1);
            setProcessTab(res.data);
            //全局
            PROCESS_CONF.pname = res.data.processName;
            PROCESS_CONF.name = res.data.name;
        });
    }
}
function setProcessTab(data){
    $("#processName").val(data.processName);
    $("#processDisplayName").val(data.name);
    $("#processDisplayName").val(data.processName);
    $("#processIcon").val(data.icon);
    $("#processRemark").val(data.remark);
}
function tabDefine_2Click(){
    var pname = Request.QueryString("pname");
    loadModelTab(pname);
}
function tabDefine_3Click(){
    var pname = Request.QueryString("pname");
    loadFormTab(pname);
}
//绑定激活标签页的数据
function bindActivedTabData(){
    
}
function loadFormTab(pname){
    $("#formTable").DataTable({
        paging: false,
        bInfo:false,
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/api/config/process/form/table_list?pname="+pname,
        fnServerData: function ( sUrl, aoData, fnCallback, oSettings ) {

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
            { mData: "formCode" },
            { mData: "formMemo" },
            { mData: "createTime" },
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "20%", "targets": 0},
            {"width": "20%", "targets": 1},
            {"width": "20%", "targets": 2},
            {"width": "30%", "targets": 3,
                "render": function (data, type, row, meta) {
                    var link = "<button class='btn btn-danger btn-xs' onclick='deleteForm(\""+data.formCode+"\")'>删除</button>&nbsp;&nbsp;";
                    link += "<button class='btn btn-primary btn-xs' onclick='editForm(\""+data.formCode+"\")'>编辑</button>";
                    return link;
                }
            }
        ]
    });
}
function loadModelTab(pname){
    $("#modelTable").DataTable({
        paging: false,
        bInfo:false,
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/api/config/process/model/table_list?pname="+pname,
        fnServerData: function ( sUrl, aoData, fnCallback, oSettings ) {

            $.ajax( {
                type: "GET",
                url: sUrl,
                dataType:'json',
                headers:vipspa.Auth.getHeaderToken(),
                data : aoData,
                success:  fnCallback,
                dataSrc:function(json){
                    if(json.data==null || json.data==undefined){
                        json.data = [];
                        return;
                    }
                }
            });
        },
        aoColumns: [
            { mData: "name" },
            { mData: "memo" },
            { mData: "createTime" },
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "20%", "targets": 0},
            {"width": "20%", "targets": 1},
            {"width": "20%", "targets": 2},
            {"width": "30%", "targets": 3,
                "render": function (data, type, row, meta) {
                    var link = "<button class='add btn btn-primary btn-xs' onclick='deleteTableLink(\""+data.name+"\")'>删除</button>";
                    return link;
                }
            }
        ]
    });
}
function onNewProcessClick(idx) {
    $Post(SysConfig.Api.host+"/api/config/process/define/create",
    {processName:$("#processName").val(),name:$("#processDisplayName").val(),remark:$("#processRemark").val(),icon:$("#processIcon").val()},function(res){
        if(res.success){
            $('#modelTab>li').eq(idx - 1).removeClass("active");
            $('#modelTab>li').eq(idx).removeClass("disabled");
            $('#modelTab>li').eq(idx).addClass("active");
            $('#tabDefine_' + idx).removeClass("active");
            $('#tabDefine_' + (idx + 1)).addClass("active");//.addClass("in");

            PROCESS_CONF.pname = $("#processName").val();
            PROCESS_CONF.name = $("#processDisplayName").val();
        }else{
            toastr.error(res.message);
        }
    });
}
function goFormDesignClick(idx){
    $('#modelTab>li').eq(idx - 1).removeClass("active");
    $('#modelTab>li').eq(idx).removeClass("disabled");
    $('#modelTab>li').eq(idx).addClass("active");
    $('#tabDefine_' + idx).removeClass("active");
    $('#tabDefine_' + (idx + 1)).addClass("active");//.addClass("in");
}
function goTransDesignClick(idx){
    $('#modelTab>li').eq(idx - 1).removeClass("active");
    $('#modelTab>li').eq(idx).removeClass("disabled");
    $('#modelTab>li').eq(idx).addClass("active");
    $('#tabDefine_' + idx).removeClass("active");
    $('#tabDefine_' + (idx + 1)).addClass("active");//.addClass("in");
}
function activeTab(idx) {
    //$('#modelTab>li').eq(idx - 1).removeClass("active");
    $('#modelTab>li').eq(idx).removeClass("disabled");
    //$('#modelTab>li').eq(idx).addClass("active");
    ///$('#tabDefine_' + idx).removeClass("active");
    //$('#tabDefine_' + (idx + 1)).addClass("active");//.addClass("in");
}
function modelConfClick(){
    $("#modelDlg").modal('show');
    $("#dialogDisplayName").text(PROCESS_CONF.pname);
    $("#dialogName").text(PROCESS_CONF.name);
    var tpl = document.getElementById('ModleRow_Tpl').innerHTML; //读取模版
    var data = [{"fieldName":"order_no","memo":"申请单编号","dataType":"nvarchar","allowNull":false},
        {"fieldName":"emp_id","memo":"申请人ID","dataType":"nvarchar","allowNull":false},
        {"fieldName":"dept_code","memo":"所在部门编码","dataType":"int","allowNull":false}];
    laytpl(tpl).render(data, function(render) {
        $("#tableData").find("tbody").append($(render));
    });

}
function addData(){
    var tpl = document.getElementById('ModleRow_Tpl').innerHTML; //读取模版
    var data = [{"fieldName":"","memo":"","dataType":"nvarchar","allowNull":true}]
    laytpl(tpl).render(data, function(render) {
        $("#tableData").find("tbody").append($(render));
    });
}
function deleteData(obj,idx){
    $(obj).parent().parent().remove();
}
//新增字段编辑框
function createNewModel() {
    var model = [];
    $("#tableData tbody tr").each(function () {
        model.push({
            "fieldName": $(this).find("[name='fieldName']").val(), "memo": $(this).find("[name='memo']").val(),
            "dataType": $(this).find("[name='dataType']").val(), "tableName": $("#tableName").val(),"required":$(this).find("[name='allowNull']").is(':checked')?"y":"n"
        });
    });
    $Post(SysConfig.Api.host+"/api/config/process/model/create",
        {
            processName: PROCESS_CONF.pname,
            info: {name: $("#tableName").val(), memo: $("#tableMemo").val()},
            fields: model,
            category: isMainElem.element.checked ? "main" : "detail"
        }, function (res) {
            if (res.success) {
                if (this.modelTableData == null) {
                    this.modelTableData = [];  //可能初始化绑定接口数据时赋值了null
                }
                // var row = '<tr role="row" class="even"><td>' + $("#tableName").val() + '</td><td>' + $("#tableMemo").val() + '</td><td></td><td><button class="add btn btn-primary btn-xs" onclick="deleteTableLink(\''+$("#tableName").val()+'\')">删除</button></td></tr>';
                // $("#modelTable tbody").append($(row));
                loadModelTab(PROCESS_CONF.pname);
                $("#modelDlg").modal('hide');
				$("#tableData").find("tbody").html("");  //清空原有的
				$("#tableName").val("");
				$("#tableMemo").val("");
            } else {
                toastr.error(res.message);
            }
        });
}
function deleteTableLink(tbname) {
    bootbox.confirm({
        size: "small",
        message: "确认仅删除模型关系?",
        buttons: {confirm: {label: '确认'}, cancel: {label: '放弃'}},
        callback: function(result){
            if(result){
                $Post(SysConfig.Api.host+"/api/config/process/model/del_link?modelName=" + tbname + "&processName=" + PROCESS_CONF.pname, {}, function (res) {
                    if (res.success) {
                        toastr.success("删除成功");
                        tabDefine_2Click();
                    }
                    else
                        toastr.error(res.message);
                });
            }
        }
    });
}
function formConfClick(){
    $("#formConfDlg").modal('show');
    $('.selectpicker').selectpicker();
}
function addData2DesignClick() {
    var code = $("#formCode").val();
    var data = {
        processName: PROCESS_CONF.pname,
        formCode: code,
        formMemo: $("#formMemo").val(),
        operation: $("#oprationBtns").val().join(",")
    };
    $Post(SysConfig.Api.host+"/api/config/process/form/create", data, function (res) {
        if (res.success) {
            toastr.success("添加新表单成功");
            // var row = '<tr role="row" class="even"><td>' + code + '</td><td>' + $("#formMemo").val() + '</td>&nbsp;&nbsp;<td>' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '</td><td><button class="btn btn-danger btn-xs" onclick="deleteForm(\'' + code + '\')">删除</button><button class="btn btn-primary btn-xs" onclick="editForm(\'' + code + '\')">编辑</button></td></tr>';
            // $("#formTable tbody").append($(row));
            loadFormTab(PROCESS_CONF.pname);
            $("#formConfDlg").modal('hide');
			$("#formCode").val("");  //清空已内容
			$("#formMemo").val("");
            window.open("pages/form_design.html?pname="+PROCESS_CONF.pname+"&code="+code,"_blank");
        } else {
            toastr.error(res.message);
        }
    });
}
function deleteForm(fcode) {
    bootbox.confirm({
        size: "small",
        message: "确认仅删除表单关系?",
        buttons: {confirm: {label: '确认'}, cancel: {label: '放弃'}},
        callback: function (result) {
            if (result) {
                $Post(SysConfig.Api.host+"/api/config/process/form/status?status=-1&formCode=" + fcode + "&processName=" + PROCESS_CONF.pname, {}, function (res) {
                    if (res.success) {
                        toastr.success("删除成功");
                        tabDefine_3Click();
                    }else{
                        toastr.error(res.message)
                    }
                });
            }
        }
    });
}
function editForm(fcode){
    window.open("pages/form_design.html?pname="+PROCESS_CONF.pname+"&code="+fcode,"_blank");
}
function editFlowDesign(idx){
    window.open("pages/diagram_design.html?pname="+PROCESS_CONF.pname,"_blank");
}
function tabDefine_1Click(){

}
function publishProcess(){
    $Post(SysConfig.Api.host+'/api/config/process/publish?processName='+PROCESS_CONF.pname+'&processDisplayName='+PROCESS_CONF.name,{},function(res){
        if(res.success){
            toastr.success("发布成功");
        }else{
            toastr.error(res.message);
        }
    })
}