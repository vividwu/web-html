function TableInit() {
    return $("#tbAccountList").DataTable({
        paging: false,  //分页
        info: false,  //去掉底部文字
        //ajax:  {url:"http://10.1.8.109:6600/csm-api/admin/account/total?page2dt=y",dataSrc:'data'},
        sAjaxSource: SysConfig.Api.host+"/supplier/statistics/month",
        fnServerData: function ( sUrl, aoData, fnCallback, oSettings ) {
            
            //aoData.push();
            setSearchParams(aoData);
            
            $.ajax( {
                type: "GET",
                url: sUrl,
                dataType:'json',
                data : aoData,
                success:  fnCallback
            });
        },
        aoColumns: [
            { mData: "sn","render": function (data, type, row, meta) {return (data == null?"":data);}},
            { mData: "md" },
            { mData: "days" },
            { mData: "total" },
            { mData: null, defaultContent: ''}
        ],
        columnDefs: [//自定义处理行数据，和行样式
            {"width": "20%", "targets": 0},
            {"width": "20%", "targets": 1},
            {"width": "20%", "targets": 2},
            {"width": "20%", "targets": 3},
            {"width": "20%", "targets": 4, "render": function (data, type, row, meta) {return "<a href='#'>查看明细</a>"}}
        ]
    });
};

$(document).ready(function(){
    //1.初始化Table
    var dataTable = TableInit();
    $('#btnSearch').click(function () {
        dataTable.ajax.reload();
    });
    $(".datepicker").datepicker({
        language: "cn",
        todayHighlight: true, //是否今日高亮
        format: 'yyyy-mm', //点击月份后显示在input中的格式
        autoclose: true, //是否开启自动关闭
        startView: 'months', //开始视图层，为月视图层
        maxViewMode:'years', //最大视图层，为年视图层
        minViewMode:'months', //最小视图层，为月视图层
        startDate:moment().subtract(11,'month').toDate(), //控制可选的最早月份，为前12个月（含当前月）
        endDate:moment().toDate() //控制可选的最晚月份，为当前月
    });
});

function setSearchParams(params) {
    var begin = '2019-01';
    var end = moment().add(1,'months').format('YYYY-MM');
    var endStr = $('#txtMonth').val();
    if(endStr != "") {
        begin = moment(endStr).format('YYYY-MM');
        end = moment(endStr).add(1, 'months').format('YYYY-MM');
    }

    params.push(
        {"name": "begin", "value": begin},
        {"name": "end", "value": end}
    );
    
}