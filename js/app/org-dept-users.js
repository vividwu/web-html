var POST_LIST;
function TableInit(id) {
    return $("#userList").DataTable({
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/user/full/dept/"+id+"?page2dt=y",
        fnServerData: function ( sUrl, aoData, fnCallback, oSettings ) {
            
            //aoData.push();
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
            { mData: "num" },
            { mData: "displayName" },
            { mData: "createTime" },
            { mData: "posts" },
            { mData: null, defaultContent: ''},
        ],
        columnDefs: [//自定义处理行数据，和行样式
        {"width": "10%", "targets": 0},
        {"width": "10%", "targets": 1},
        {"width": "10%", "targets": 2},
        {"width": "10%", "targets": 3},
        {"width": "10%", "targets": 4},
        {"width": "30%", "targets": 5,
            "render": function (data, type, row, meta) {
                var posts = "";
                row.posts.forEach(function(v){
                    posts += '<span class="badge badge-info">'+v.fullPathName+' - <b class="text-success">'+v.name+'</b></span> ';
                })
                return posts;
            }
        },
        {"width": "20%", "targets": 6,
            "render": function (data, type, row, meta) {
                var link = "<button class='add btn btn-primary btn-xs' onclick='handleOpenUserEdit(\""+row.id+"\",this)'>编辑</button>&nbsp;&nbsp;";
                link += "<button class='add btn btn-warning btn-xs' onclick='openCopy2dept(\""+row.id+"\",\""+row.displayName+"\")'>复制</button>&nbsp;&nbsp;";
                if(row.posts.length>1)  //一人多岗
                    link += "<button class='add btn btn-danger btn-xs' onclick='remove2dept(\""+row.id+"\")'>移除</button>&nbsp;&nbsp;";
                return link;
            }
        }
        ],
        drawCallback: function (settings) {  //1
            $("[data-toggle='popover']").popover({html : true });
            $("#usersQty").text(settings._iRecordsTotal);
        }
});
};

function setSearchParams(params){
}
//http://10.1.8.109:6600/csm-api/admin/account/total?pageNum=1
function saveOrUpdate(btn){
    var data = getPageData();
    if($("#btnSave").val() == "修改") {
        data.id = $("#menuId").val();
        data.parentMenuId = $("#menuPId").val();
    }
    else if($("#btnSave").val() == "新增"){
        var currId = $("#menuId").val();
        data.parentMenuId = currId;  //新增新结点的parentId=当前选中的结点id
    }

    saveData(data);
};

function saveData(dataTable){
    //var data = {qty:parseInt($("#txtDeposit").val()),empCode:$("#hdeEmpNo").val()};
    var deduct = $(".modal-title").text().indexOf("扣除饭点");
    var op = "deposit";
    if(deduct >= 0)
        op = "deduct";

    $.ajax({
        "url": SysConfig.Api.host+"/admin/account/"+op+"?qty="+$("#txtDeposit").val()+"&empCode="+$("#hdeEmpNo").val(),
        //"contentType": "application/json;charset=utf-8",
        //"data": JSON.stringify(data),
        "type": "post",
        "headers":getAuthHeader(),
        "error": function (a,b,c) {
            toastr.error(a);
        },
        "success": function (response) {
            
            if (response != null && response != "") {
                //刷新
                if(response.success){
                    toastr.success("保存成功!");
                    $('#depositDlg').modal('hide');
                    dataTable.ajax.reload();
                }else{
                    toastr.warning(response.message);
                }
            } else {
                toastr.error("提交错误!");
            }
        }
    });
}

$(document).ready(function(){
    //1.初始化Tree
    bindTreeLevel1();
    loadPostList();
    //var dataTable = TableInit();
    $('#btnSearch').click(function () {
        dataTable.ajax.reload();
    });
    $('#dlgSave').click(function () {
        saveData(dataTable);
    });
});
function loadPostList(){
    $Ajax(SysConfig.Api.host+"/user/list/all_post",function(res){
        POST_LIST = res.data;
    })
}
function bindTreeLevel1(){
    $Ajax(SysConfig.Api.host+"/dept/list/p/0",function(res){
        if(!res.success || res.data == null){
            return;
        }
        var tree=[];
        res.data.forEach(function(item){
            tree.push({id:item.id,text:item.name,parentId:item.parentId,isLeaf:true,nodes:[]});
        });
        $("#tree").treeview({
            data:tree,
            color: "#000",                         // 每一级通用的 节点字体颜色
            backColor: "#fff",                     // 每一级通用的 节点字背景色
            onhoverColor: "skyblue",               // 选中浮动颜色
            showBorder: false,                     // 不显示边框
            showTags: true,                        // 是否在每个节点的右侧显示标签。 其值必须在每个节点的数据结构中提供
            highlightSelected: true,               // 是否突出显示选定的节点
            selectedColor: "#fff",                 // 设置选定节点的前景色
            selectedBackColor: "skyblue",          // 设置选定节点的背景色
            expandIcon: 'fa fa-angle-right',// 展开图标
            collapseIcon: 'fa fa-angle-down',// 收缩图标
            onNodeExpanded :function (event,node) {
                console.log("exp",node);
                if(node.nodes.length>0)  //已经挂载过子节点
                    return;
                loadChildNodes(node);
            },
            onNodeSelected :function (event,node) {
                $("#selectedDeptId").val(node.id);
                $('#newParentDeptName').val(node.text);
                $('#newUserDeptName').val(node.text);
                console.log("sel",node);
                getDataTable(node);
            }
        });
    });
}
function loadChildNodes(parentNode) {
    $Ajax(SysConfig.Api.host+"/dept/list/p/" + parentNode.id, function (res) {
        if (!res.success || res.data == null) {
            return;
        }
        res.data.forEach(function (item) {
            var newNode = {id: item.id, text: item.name, parentId: item.parentId, isLeaf: false, nodes: []};
            $("#tree").treeview("addNode", [parentNode.nodeId, {node: newNode}]);
        });
    });
}
function getDataTable(node){
    $("#usersQty").text("0");
    TableInit(node.id)
}
function goApprove(tid){
    location.href = "#flow-approve-create?pname=bx1&tid="+tid;
}
function deduct(obj){
    var empNo = $(obj).parent().parent().find('.flag-empno').text();
    $(".modal-title").text(empNo+" - 扣除饭点");
    $("#hdeEmpNo").val(empNo);
    $('#depositDlg').modal('show');
}
function tempAddShow() {
    $('#addTempDlg').modal('show');
}
function handleOpenUserEdit(id,obj){
    var data = $(obj).attr("data");
    $("#editUserDlg").modal('show');
    $("#editId").val(id);
    if($("#editPosts option").length == 0) {
        POST_LIST.forEach(function (v) {
            $("#editPosts").append('<option value="' + v.code + '">' + v.name + '</option>');
        });
    }
    //$('.selectpicker').selectpicker();

    $Ajax(SysConfig.Api.host+"/user/edit/user_info/"+id,function(res){
        if(res.success){
            $("#editDisplayName").val(res.data.displayName);
            $("#editNum").val(res.data.num);
            $("#editName").val(res.data.name);
            $("#editPassword").val("");
            // var posts=[];
            // res.data.posts.forEach(function(v){
            //     if($("#selectedDeptId").val() == (v.deptId+"")) {  //选中部门下的岗位
            //         $("#editDepts").text(v.fullPathName);
            //         posts.push(v.code);
            //     }
            // })
            // $("#editPosts").val(posts);
            // $("#editPosts").selectpicker('refresh');
            var tpl = document.getElementById('EditUserPosts_Tpl').innerHTML; //读取模版
            res.data.options = POST_LIST;
            laytpl(tpl).render(res.data, function(render) {
                $("#editDepts").html("");
                $("#editDepts").append($(render));
            });
        }
    })
}
function editIsManagerChange(obj){
    // var id = obj.id;//$(obj).attr("for");
    // var val = $("#"+id).is(":checked");
    // //$("#"+id).prop("checked",val);
    // if(val)
    //     $("#"+id).removeAttr("checked");
    // else
    //     $("#"+id).prop("checked",true);
}
function updateUser(){
    var selectedPosts=[];
    $("#editDepts").find(".form-group").each(function(i,v){
        var did = $(v).attr("data");
        var pcode = $(v).find("select").val();
        var dept = {userId:$("#editId").val(),deptId:did,code:pcode};
        selectedPosts.push(dept);
    })
    var userInfo = {id:$("#editId").val(),name:$("#editName").val(),displayName:$("#editDisplayName").val(),
        num:$("#editNum").val(),password:$("#editPassword").val(), posts:selectedPosts};

    $Post(SysConfig.Api.host+"/user/info/update",userInfo,function(res){
        if(res.success){
            toastr.success('修改成功');
            $('#editUserDlg').modal('hide');
        }else{
            toastr.error(res.message);
        }
    })
}
function handleNewDeptClick(){
    if($("#selectedDeptId").val()) {
        $('#newDeptDlg').modal('show');
    }else{
        toastr.error('未选中左侧部门节点');
    }
}
function saveNewDept(){
    $Post(SysConfig.Api.host+"/dept/info/create",{parentId:$("#selectedDeptId").val(),name:$("#newDeptName").val()},function(res){
        if(res.success){
            toastr.success('创建成功');
            $('#newDeptDlg').modal('hide');
        }else{
            toastr.error(res.message);
        }
    })
}
function handleOpenCreateUser(){
    if($("#selectedDeptId").val()) {
        $('#newUserDlg').modal('show');
        if($("#newPosts option").length == 0) {
            POST_LIST.forEach(function (v) {
                $("#newPosts").append('<option value="' + v.code + '">' + v.name + '</option>');
            });
        }
        $("#newPosts").selectpicker('refresh');
    }else{
        toastr.error('未选中左侧部门节点');
    }
}
function saveNewUser(){
    var selectedPosts=[];
    $('#newPosts').find('option:selected').each(function(i,v){
        selectedPosts.push({code:v.value,deptId:$("#selectedDeptId").val()});
    })
    var userInfo = {name:$("#newName").val(),displayName:$("#newDisplayName").val(),
        num:$("#newNum").val(),posts:selectedPosts}
    $Post(SysConfig.Api.host+"/user/info/create",userInfo,function(res){
        if(res.success){
            toastr.success('创建成功');
            $('#newUserDlg').modal('hide');
        }else{
            toastr.error(res.message);
        }
    })
}
function openCopy2dept(id,displayName){
    $('#copyUserDlg').modal('show');
    $("#selectedUserId").val(id);
    $("#copyUserDlg").find("b").text(displayName);
    new DeptTreeControl("deptTree").init(SysConfig.Api.host+"/dept/list/all");
    if($("#copyPosts option").length == 0) {
        POST_LIST.forEach(function (v) {
            $("#copyPosts").append('<option value="' + v.code + '">' + v.name + '</option>');
        });
    }
    $("#copyPosts").selectpicker('refresh');
}
function handleCopyUser(){
    var tree = $("[name='deptTree']")
    var copy2DeptId = tree.find("input[type=hidden]").val();
    if(!copy2DeptId) {
        toastr.error('请选择一个部门');
        return;
    }
    var selectedPosts=[];
    $('#copyPosts').find('option:selected').each(function(i,v){
        selectedPosts.push(v.value);//({code:v.value,deptId:copy2DeptId});
    });
    if(selectedPosts.length == 0) {
        toastr.error('至少选择一个岗位');
        return;
    }
    var posts = selectedPosts.join(",");
    $Post(SysConfig.Api.host+"/dept/user/copy?userId="+$("#selectedUserId").val()+"&deptId="+copy2DeptId+"&posts="+posts,{},function(res){
        if(res.success){
            toastr.success('复制成功');
            $('#copyUserDlg').modal('hide');
        }else{
            toastr.error(res.message);
        }
    })
}
function sideShow(obj){
    if($(obj).hasClass("aside-toggle-show")){
        $(obj).removeClass("aside-toggle-show").addClass("aside-toggle-hide");
        $(".aside-left").width("0px");
    }else{
        $(obj).removeClass("aside-toggle-hide").addClass("aside-toggle-show");
        $(".aside-left").width("200px");
    }
}
function delUserPost(obj,deptId,userId,code){
    if($("#editDepts").find(".form-group").length<=1){
        toastr.error("不能删除唯一的人岗关系，请添加新的再删除");
        return false;
    }
    bootbox.confirm({
        size: "small",
        message: "确认删除人岗关系?",
        buttons: {confirm: {label: '确认'}, cancel: {label: '放弃'}},
        callback: function(result){
            if(result){
                $Post(SysConfig.Api.host+"/dept/post/remove?deptId=" + deptId + "&userId=" + userId+"&postCode="+code, {}, function (res) {
                    if (res.success) {
                        $("#"+code+deptId+userId).remove();
                        toastr.success("删除成功");
                    }
                    else
                        toastr.error(res.message);
                });
                console.log(deptId,userId,code);
            }
        }
    });
}