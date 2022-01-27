function TableInit() {
    return $("#tbDictList").DataTable({
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/dict/allcode_by_cate?page2dt=y",
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
            { mData: "code" },
            { mData: "parentCode" },
            { mData: "text" },
            { mData: "sort" },
            { mData: "category" },
            { mData: "remark"},
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "10%", "targets": 0},
            {"width": "10%", "targets": 1},
            {"width": "50%", "targets": 2},
            {"width": "5%", "targets": 3},
            {"width": "5%", "targets": 4},
            {"width": "10%", "targets": 5},
            {"width": "10%", "targets": 6,
                "render": function (data, type, row, meta) {
                    var link = '<button class="add btn btn-primary btn-xs" onclick="btnEditDictClick(\''+data.code+"','"+(data.parentCode==null?"":data.parentCode)
                        +"','"+data.text+"','"+(data.sort==null?"":data.sort)+"','"+data.category+"','"+(data.remark==null?"":data.remark)+"'"+')">编辑</button>&nbsp;&nbsp;';
                    link += "<button class='add btn btn-danger btn-xs' onclick='btnDeleteDictClick()'>删除</button>";
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
    $(".spin").TouchSpin({
        initval: 1,
        min: 1,
        max: 100
    });
});
function btnNewDictClick(){
    $('#newDictDlg').modal('show');
}
function saveNewDict(){
    $Post(SysConfig.Api.host+"/dict/create_code",{code:$("#newCode").val(),parentCode:$("#newParentCode").val(),text:$("#newText").val(),
        sort:$("#newSort").val(),category:$("#newCategory").val(),remark:$("#newRemark").val()},function(res){
        if(res.success){
            toastr.success('创建成功');
            $('#newDictDlg').modal('hide');
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