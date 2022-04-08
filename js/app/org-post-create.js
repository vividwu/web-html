function TableInit() {
    return $("#tbPostList").DataTable({
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/dept/post/list?page2dt=y",
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
            { mData: "code" },
            { mData: "flag" },
            { mData: "createTime" },
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "5%", "targets": 0},
            {"width": "15%", "targets": 1},
            {"width": "30%", "targets": 2},
            {"width": "15%", "targets": 3,
                "render": function (data, type, row, meta) {
                    return '<span class="badge badge-info">'+row.flag+'</span>'
                }
            },
            {"width": "15%", "targets": 4},
            {"width": "10%", "targets": 5,
                "render": function (data, type, row, meta) {
                    var link = '<button class="add btn btn-primary btn-xs" onclick="btnEditPostClick(\''+data.id+"','"+data.name
                        +"','"+data.code+"','"+data.flag+"','"+(data.createTime==null?"":data.createTime)+"'"+')">编辑</button>&nbsp;&nbsp;';
                    link += "<button class='add btn btn-danger btn-xs' onclick='btnDeletePostClick()'>删除</button>";
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
});
function btnNewPostClick(){
    $('#newPostDlg').modal('show');
}
function saveNewPost(){
    $Post(SysConfig.Api.host+"/dept/post/create",{code:$("#code").val(),name:$("#name").val(),flag:$("#flag").val()},function(res){
        if(res.success){
            toastr.success('创建成功');
            $('#newPostDlg').modal('hide');
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
function btnDeleteDictClick(){
    toastr.error("待实现");
}