### 简介

> 工作流工具，为被集成而生，易集成已有系统，不依赖组织架构数据结构来创建审批人。

<a href="http://101.43.138.169/wfhtml/" target="_blank">演示DEMO地址</a>

<font color=#f06431>测试账号wuwei2_m，密码123，测试默认用户密码都是123。</font>

### 安装部署
项目由两部分组成：
- **流程引擎:**  负责流程流转，包含动态脚本、流程推进等流程核心

- **后台配置:**  负责后台管理配置项目，包含组织、用户、登录、表单管理等，可自行扩展、修改代码

1、下载

包含几个文件：

1、flow.rar

2、engine.rar

3、all.sql

2、解压

flow.rar包含内容：

-flow_prod.jar

-application-prod.properties

engine.rar包含内容：

    -webapp.exe

    -res目录

        -00000000-0000-0000-0000-000000000001目录

            -common.vds

        -appkeys.json

    -config目录

        -settings.json

        -userinfo.vds

sql.rar包含内容：

-all.sql

3、运行

* 创建数据库wfengine，运行all.sql

* engine解压后config目录下的settings数据库连接为刚创建的数据库，执行webapp.exe运行流程引擎

* engine解压后application-prod.properties中修改数据库连接为刚创建的数据库，执行：

  java -jar -Dspring.config.location=application-prod.properties flow_prod.jar

### <a id="use_default">直接使用</a>

Demo后台自带一部分测试数据，包括部门/人员、几条测试流程的配置。

测试账号登录可以维护自己的部门人员数据，增加流程配置。

ou / 部门人员：增加部门、人员信息

model / 创建流程模板：分4步来创建一个流程模板

- **流程定义:**  创建流程标识（作为流程单号前缀）、名称、图标（自带10个图片0~9.png）

- **模型定义:**  创建流程中使用的数据模型（可以理解为单表数据存储表）

- **表单设计:**  创建表单，用于流程节点上挂的表单，表单控件元素可以绑定上一步骤的模型

- **流转设计:**  创建流程，绑定表单，编写候选人和路由的脚本

### <a id="interface_integration">接口集成</a>

可以调用以下接口来使用工作流引擎，业务数据自行存储，调用方需实现业务和引擎接口的事务：

- /api/ext/apply/{process_name}/submit_raw （创建申请单）:

```
  [POST]  header:

无（暂时没有鉴权限制）

{ args:{
  wf_order_no:  //申请单号
  emp_id:  //提交申请的用户Id
  emp_display:  //提交申请的用户姓名
  ...
  }
}

以上是必须传递的参数，如果需要在候选人/路由脚本中携带业务数据，则在args中新定义，在脚本执行时能获取到。

自定义key对应的value仅支持整型和字符串，按需在脚本中转换。

eg：{ args:{wf_order_no:"bx-20211121-00001",emp_id:"5",emp_display:"张三","days":3,"category":"year"} }

days和category将在脚本中能获取到，脚本使用参见下面<a href="#script">动态脚本</a>。
```

### 流程引擎

### <a id="create_flow">表单设计</a>

**表单设计器可以绑定模型，布局控件排版**

![表单](/pages/imgs/form.png)

*点击左侧控件，中间设计面板可以调整布局（为了保证表单样式统一，布局前先放入卡片控件，除了表格其他子控件放入其中）

*右侧选择字段可绑定模型字段，配置不同数据源，绑定的接口API按照指定格式返回动态数据

*设计完成点击“保存”

![控件](/pages/imgs/controls.png)

*默认自带基础控件，按照开发规则可拓展自定义控件

![属性](/pages/imgs/properties.png)

*属性面板配置控件绑定模型、数据源、栅格等

### <a id="create_flow">流程设计</a>

**流程设计器可以灵活配置流转和节点审批人**

![流程图](/pages/imgs/flow_design.png)

*拖入开始、结束节点，设置提交节点；配置任务和路由节点属性和脚本；*

- **设置节点连线文字:** 

![节点连线](/pages/imgs/transition.png)

- **设置任务节点:** 

![任务节点](/pages/imgs/task.png)

*可设置关联的表单、返回候选人的脚本、审批的类型*

- **编写任务节点候选人脚本:** 

![任务节点候选人脚本](/pages/imgs/task_script.png)

- **设置路由节点:** 

![路由节点](/pages/imgs/decision.png)

*可设置路由跳转的脚本返回任务节点 - 指定的taskId*

![路由节点候选人脚本](/pages/imgs/decision_script.png)

### <a id="script">动态脚本</a>
#### <a id="script_desc">脚本简介</a>
动态脚本组件有完整的语法解析、词法分析、解析树求值阶段；

实现了最小级类C编程语言，动态解析。附带了一些常用作为胶水语言特性、函数，如：字符串处理、数据访问、Http访问等。

能满足轻量级业务，语法支持定义、分支、循环、跳出；

内置数据结构包含字符串、整形、列表、字典对象；

对象上有不同内置函数，良好的设计框架让有能力扩展脚本功能的开发人员可以自定义语言特性；

#### <a id="lexer">脚本语法</a>
* 一共内置了9个保留关键字：**let**、**fn**、**true**、**false**、**return**、**if**、**else**、**elseif**、**for**

* 一共内置了3个全局函数：**println(对象)**、**len(对象)**、**type(对象)**

* 支持二元操作符：**+-\*/**

#### `let`
声明变量，可以是普通的字符串、数字、布尔值、列表、字典、函数

```
let myStr = "string";  #字符串

let myInt = 10;  #数字

let myBoolen = false;  #布尔值

let myArray = [10,9];  #列表

let myDict = {"id":10,"name":"test"};  #字典

let myFunction = fn(x,y){ return x+y; };  #函数
```

#### `fn`
定义函数

```
let myFunction = fn(x,y){   #定于函数
    return x+y; 
};

myFunction(1,2);  #调用函数

fn(x,y){  #匿名函数，返回3
    return x+y; 
}(1,2);  

#高阶函数
let add = fn(x,y){   #定于加法函数
    return x+y; 
};
let times = fn(x,y){   #定于乘法函数
    return x*y; 
};
let foo=fn(a,b,func){  #传递函数参数
    return add(a,b); 
};

#支持递归
let fib = fn(n) {
	if (n == 1) {
		return n;
	} else {
		return fib(n-1)+n;
	}
};
fib(100);
```
#### `true false`
布尔类型 - 真/假

#### `return`
函数返回值

#### `if/elseif/else`
判断语句

```
if(x){
    #语句块1
}elseif(y){
    #语句块2
}else{
    #语句块3
}
```

#### `for`
循环语句，不支持++、--操作

```
for(let i=0; i<10; i+1){  #注意：步长表达式仅支持二元运算符
    println(i); 
}
```

#### `#`
注释，#+内容 出现在一行语句末尾

```
#非法
let a = 1;#我是注释 println(a);

#合法
let a = 1; println(a); #我是注释

#合法
let a = 1;  #我是注释1
#我是注释2
#我是注释3
println(a); #我是注释4
#我是注释5
```

如果输入错误或非法关键字语法解析会提示错误:
> expected next token to be 'let', got 'bad' instead.

#### <a id="object">数据类型</a>
* 一共内置了7个数据类型：整型、字符串、布尔值、列表、字典、函数、[异常]

每种类型都有自带的内置函数：如下

#### `整型`
有符号整型，type函数，返回 INTEGR。整型对象上的函数：

|  函数名   | 说明  |  输入参数   | 返回结果  |
|  ----  | ----  | ----  | ----  |
| <font color=#090>tostring</font>  | 整型转字符串 | 无 | 字符串 |


```
let int = 10;
int.tostring();  #返回 "10"
```

#### `字符串`
字符串，type函数，返回 STRING。字符串对象上的函数：

|  函数名   | 说明  |  输入参数   | 返回结果  |
|  ----  | ----  | ----  | ----  |
| <font color=#090>toint</font>  | 字符串转整型 | 无 | 整型 |
| <font color=#090>split</font>  | 分割字符串 | 分隔符 | 字符串列表 |
| <font color=#090>indexof</font>  | 查找子字符串位置，不存在返回-1 | 子字符串 | 位置 |

```
let a2i = "100";
a2i.toint();  #返回 100

let str = "string-test";
str.split("-");  #返回 ["string","test"]

let str = "string-test";
str.indexof("g");  #返回 5
```

#### <a id="buildin">内置函数</a>

#### `println`
打印对象，支持所有对象输出字面量

```
let a = {"id":1,"name":"vivid"};
println(a);
#打印 { id:1, name:vivid }
```

#### `len`
对象长度，支持列表、字符串的长度，其他类型会提示错误

```
let a = [1,2];
len(a);
#返回2
```

#### `type`
对象类型，支持所有对象输出类型字符串

```
let str = "string";
type(str); #返回 STRING

let int = 1;
type(int); #返回 INTEGR

let array = [1,2,3];
type(array); #返回 ARRAY

let dict = {"id":1};
type(dict); #返回 HASH

let i = 10;
let e = 0/i;
type(e); #返回 ERROR

let function = fn(){};
type(function); #返回 FUNCTION
```

### 返回候选人

> 候选人脚本固定为TaskCall(ctx)函数，ctx为本次上下文+表单内参数

```
{
"creator":创建人ID,"operator":操作人ID,"name":任务节点Key,"parent_operator":上一任务节点操作人ID,"parent_name":上一任务节点Key,

"args":表单内的参数，默认是表单绑定的模型Key（eg：表单设计器内的字段名 fm_annual2_info$dept_code）

}
```

```
获取直接上级，UC_DB_CONN_SELF为数据库连接

let TaskCall=fn(ctx){
    let dept=ctx["args"]["fm_fybx_info$dept_code"]
    let db=DbOpen(UC_DB_CONN_SELF);
    let rows=db.select("select * from ou_user_dept_post udp left join ou_post_info pi on udp.post_code=pi.code where pi.flag='leader' and dept_id=?",dept);
    if(type(rows)=="ERROR"){
        return "";
    }else{
    	if(ctx["creator"] == rows[0]["user_id"].tostring()){
        	let rows=db.select("select * from ou_user_dept_post udp left join ou_post_info pi on udp.post_code=pi.code where pi.flag='leader' and dept_id=(select parent_id from ou_dept_info where id=?)",dept);
            return rows[0]["user_id"].tostring();
        }else{
        	return rows[0]["user_id"].tostring();
        }
    }
}
```
