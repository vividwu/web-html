$(function(){
	vipspa.start({
        view: '#ui-view',
        errorTemplateId: '#error', // 可选
        debug: true,
        beforeLoadFunc: function(path){

            var isLg = vipspa.Auth.isLogin();
            //alert(path+"....");
            if(!isLg)
                return "login";  //?redirect="+path;  如果是其他界面切换到login lash还会是上一个地址

            return path;
        },  //不要去中断加载,去替换view
		//login是中转页
        router: {
            'home': {
                templateUrl: 'views/home.html',
                controller: 'js/app/home.js',
            },
            'admin-csm-account': {
                templateUrl: 'views/admin-csm-account.html',
                controller: 'js/app/admin-csm-account.js'
            },
            'admin-csm-detail': {
                templateUrl: 'views/admin-csm-detail.html',
                controller: 'js/app/admin-csm-detail.js'
            },
            'admin-supplier-list': {
                templateUrl: 'views/admin-supplier-list.html',
                controller: 'js/app/admin-supplier-list.js'
            },
            'admin-supplier-device': {
                templateUrl: 'views/admin-supplier-device.html',
                controller: 'js/app/admin-supplier-device.js'
            },
            'admin-device-log': {
                templateUrl: 'views/admin-device-log.html',
                controller: 'js/app/admin-device-log.js'
            },
            'supplier-month-statistics': {
                templateUrl: 'views/supplier-month-statistics.html',
                controller: 'js/app/supplier-month-statistics.js'
            },
            'admin-emp-role': {
                templateUrl: 'views/admin-emp-role.html',
                controller: 'js/app/admin-emp-role.js'
            },
            'login': {
                templateUrl: 'views/unauth.html',
                controller: 'js/app/unauth.js'
            },
            'contact': {
                templateUrl: 'views/contact.html',
                controller: 'js/app/contact.js'
            },
			'flow-todo-list': {
                templateUrl: 'views/flow-todo-list.html',
                controller: 'js/app/flow-todo-list.js'
            },
			'flow-apply-create': {
                templateUrl: 'views/flow-apply-create.html',
                controller: 'js/app/flow-apply-create.js'
            },
			'flow-approve-create': {
                templateUrl: 'views/flow-approve-create.html',
                controller: 'js/app/flow-approve-create.js'
            },
			'flow-apply-view': {
                templateUrl: 'views/flow-apply-view.html',
                controller: 'js/app/flow-apply-view.js'
            },
			'flow-process-list': {
                templateUrl: 'views/flow-process-list.html',
                controller: 'js/app/flow-process-list.js'
            },
			'model-flow-list': {
                templateUrl: 'views/model-flow-list.html',
                controller: 'js/app/model-flow-list.js'
            },
			'flow-template-create': {
                templateUrl: 'views/flow-template-create.html',
                controller: 'js/app/flow-template-create.js'
            },
			'flow-surrogate-create': {
                templateUrl: 'views/flow-surrogate-create.html',
                controller: 'js/app/flow-surrogate-create.js'
            },
			'org-dept-users': {
                templateUrl: 'views/org-dept-users.html',
                controller: 'js/app/org-dept-users.js'
            },
			'org-post-create': {
                templateUrl: 'views/org-post-create.html',
                controller: 'js/app/org-post-create.js'
            },
			'sys-dict-create': {
                templateUrl: 'views/sys-dict-create.html',
                controller: 'js/app/sys-dict-create.js'
            },
            'biz-table-create': {
                templateUrl: 'views/biz-table-create.html',
                controller: 'js/app/biz-table-create.js'
            },
            'biz-data-info': {
                templateUrl: 'views/biz-data-info.html',
                controller: 'js/app/biz-data-info.js'
            },
            'flow-hook-create': {
                templateUrl: 'views/flow-hook-create.html',
                controller: 'js/app/flow-hook-create.js'
            },
            'user': {
                templateUrl: 'views/user.html',
                controller: 'js/app/user.js',
                subView: '#ui-sub-view',
                children: [
                    //{
                    //    name: 'login',
                    //    templateUrl: 'views/login.html',
                    //    controller: 'js/app/login.js',
                    //},
                    {
                        name: 'regist',
                        templateUrl: 'views/regist.html',
                        controller: 'js/app/regist.js',
                    }
                ]
            },
            'defaults': 'home' //默认路由
        }
    });

});
