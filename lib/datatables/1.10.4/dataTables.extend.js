$.extend($.fn.dataTable.defaults, {
        lengthMenu: [10, 20, 30, 40],//定义在每页显示记录数的select中显示的选项。
        lengthChange: false,
        processing: true,//是否显示表格加载状态，在数据量大的时候需要
        destroy: true,//允许销毁替换，在表格重新查询时，可以自动销毁以前的data
        paging: true,//分页
        serverSide: true,//开启后端分页
        height: 500,
        pagingType: "full_numbers",//分页样式的类型
        ordering: false,//是否启用排序
        searching: false,
        language: {
            "lengthMenu": "10",//默认每页小时条数
            "sZeroRecords": "没有匹配结果",
            "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
            "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
            "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
            "sInfoPostFix": "",
            "sSearch": "搜索:",
            "sUrl": "",
            "sEmptyTable": "表中数据为空",
            "sInfoThousands": ",",
            "paginate": {
                "first": "首页",
                "previous": "上页",
                "next": "下页",
                "last": "末页",
                "processing": "正在处理中。。。"
            },
        }
});