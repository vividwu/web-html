function TableInit() {
    return $("#tbSurrogateList").DataTable({
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/api/surrogate/all?page2dt=y",
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
            { mData: "processName" },
            { mData: "operatorView" },
            { mData: "surrogateView" },
            { mData: "odate" },
            { mData: "sdate" },
            { mData: "edate" },
            { mData: "state"},
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "10%", "targets": 0},
            {"width": "10%", "targets": 1},
            {"width": "30%", "targets": 2},
            {"width": "10%", "targets": 3},
            {"width": "10%", "targets": 4},
            {"width": "10%", "targets": 5},
            {"width": "10%", "targets": 6},
            {"width": "10%", "targets": 7,
                "render": function (data, type, row, meta) {
                    var link = '<button class="add btn btn-primary btn-xs" onclick="btnEditDictClick(\''+data.code+"','"+(data.parentCode==null?"":data.parentCode)
                        +"','"+data.text+"','"+(data.sort==null?"":data.sort)+"','"+data.category+"','"+(data.remark==null?"":data.remark)+"'"+')">编辑</button>&nbsp;&nbsp;';
                    link += "<button class='add btn btn-danger btn-xs' onclick='btnDeleteSurrogateClick()'>删除</button>";
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
    $('.input-group2.date.begin').datepicker({
        language: "zh-CN",
        autoclose: true,//选中之后自动隐藏日期选择框
        clearBtn: true,//清除按钮
        todayBtn: true,//今日按钮
        todayHightlight:true,
        format: "yyyy-mm-dd 00:00:00"
    });
    $('.input-group2.date.end').datepicker({
        language: "zh-CN",
        autoclose: true,//选中之后自动隐藏日期选择框
        clearBtn: true,//清除按钮
        todayBtn: true,//今日按钮
        todayHightlight:true,
        format: "yyyy-mm-dd 23:59:59"
    });
});
function btnNewSurrogateClick(){
    new UserSelectControl("newSurrogateUser").init(SysConfig.Api.host+"/dept/list/all")
    new UserSelectControl("newSurrogateNew").init(SysConfig.Api.host+"/dept/list/all")
    $('#newSurrogateDlg').modal('show');
}
function saveNewSurrogate(){
    var op = $("[name='newSurrogateUser']").find("input").val();
    var su = $("[name='newSurrogateNew']").find("input").val();
    $Post(SysConfig.Api.host+"/api/surrogate/create",{processName:$("#newProcessName").val(),operator:op,surrogate:su,
        sdate:$("#newSdate").val(),edate:$("#newEdate").val()}, function(res){
        if(res.success){
            toastr.success('创建成功');
            $('#newSurrogateDlg').modal('hide');
            dataTable.ajax.reload();
        }else{
            toastr.error(res.message);
        }
    })
}
function btnEditDictClick(code,parentCode,text,sort,category,remark){
    $('#editDictDlg').modal('show');
    $('#editCode').val(code);
    $('#editParentCode').val(parentCode);
    $('#editText').val(text);
    $('#editSort').val(sort);
    $('#editCategory').val(category);
    $('#editRemark').val(remark);
}
function saveEditDict(){
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
function btnDeleteSurrogateClick(){
    toastr.error("待实现");
}