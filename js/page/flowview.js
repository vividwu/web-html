var myDiagram;
function loadFlowView(orderNo,jsonStr) {
    if(myDiagram == undefined) {
        initGojs();
    }
    myDiagram.model = go.Model.fromJson(jsonStr);///整合服务端go.Model.fromJson(document.getElementById("mySavedModel").value);
    loadDiagramProperties();  // do this after the Model.modelData has been brought into memory
    getHistory(orderNo);
}
function loadDiagramProperties(e) {
    // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
    var pos = myDiagram.model.modelData.position;
    if (pos)myDiagram.initialPosition = go.Point.parse(pos);
}
function getHistory(orderNo){
    $Ajax(SysConfig.Api.host+"/api/approve/history/"+orderNo,function(res){
        if(!res){
            this.$msg.error('获取审批历史失败');
        }else{
            drawHistoryLine(res);
        }
    })
}
function drawHistoryLine(res){
    var tasks = [];
    for(var k in res.data){
        tasks.push(res.data[k].taskKey);
    }
//     res.data.map(task => {
//         tasks.push(task.taskKey);
// });
    console.log(tasks)
    setLinkTextBg();
    animateFlowPath(tasks,res.data[res.data.length-1].taskKey=='end');
}

/**
 * 更改所有连线中间的文本背景色
* */
function setLinkTextBg() {
    myDiagram.links.each(function (link) {
        myDiagram.startTransaction("vacate");
        if (link.data.text) {
            myDiagram.model.setDataProperty(link.data, "pFill", window.go.GraphObject.make(go.Brush, "Radial", {
                0: "rgb(240, 240, 240)",
                0.3: "rgb(240, 240, 240)",
                1: "rgba(240, 240, 240, 0)"
            }));
        }
        myDiagram.commitTransaction("vacate");
    });
}

//历史连线
function animateFlowPath(stepKeys,isCompleted) {
    //var stepKeys = ['submitApply','decision1','driectLeaderApprove'];
    // 查找所有【已完成】步骤：【开始】-> 【已完成】（N个）isCompleted
    var steps = findFinishedSteps(stepKeys, isCompleted);
    // 高亮所有“已完成”步骤
    showFinishedNodes(steps);
    //【开始】-> 【已完成】（N个）->【待处理】
    // 或
    //【开始】-> 【已完成】（N个）->【结束】isCompleted
    var lastStep = findLastStep(stepKeys, steps, isCompleted);
    steps.push(lastStep);
    if (!isCompleted) {
        // “待处理”步骤，加上闪烁动画
        loopRunningNode(lastStep);
    }
    // 在连线上加闪烁动画
    var links = findFinishedLinks(steps);
    loopLinks(links);
}
/**
 * 返回所有【已完成】的步骤
 * @param stepKeys
 * @param isCompleted
 * @returns {Array}
 */
function findFinishedSteps(stepKeys, isCompleted) {
    var arrStep = [];
    if (!stepKeys) return arrStep;
    var startStep = findStartStep();// 【开始】步骤
    arrStep.push(startStep);
    // 【已完成】的步骤
    var finishedCount = stepKeys.length - 1;// 不包含最后一个“待处理“步骤
    if (isCompleted) {
        finishedCount = stepKeys.length;// 包含所有步骤
    }
    for (var i = 0; i < finishedCount; i++) {
        var stepKey = stepKeys[i];
        var step = myDiagram.findNodeForKey(stepKey);
        if (!step) continue;
        //任务节点前面的决策节点，要串起来
        var intoNode = step.findNodesInto();
        if(intoNode.count>0){  //进入任务的决策可能有多个，取最早的那个
            intoNode.each(function(n){
                if(n.data.type == 'decision'){
                    arrStep.push(n);
                    return;
                }
            })
        }
        // if(intoNode.value.data.type == 'decision'){
        //     arrStep.push(intoNode.value);
        // }
        arrStep.push(step);  //本节点
        //任务后一个决策节点，要串起来
        var outofNode = step.findNodesOutOf();
        if(outofNode.value.data.type == 'decision'){
            arrStep.push(outofNode.value);
        }
    }
    return arrStep;
}
/**
 * 高亮“已完成”步骤
 * @param steps
 */
function showFinishedNodes(steps) {
    if (!steps) return;
    for (var i = 0; i < steps.length; i++) {
        var step = steps[i];
        // 步骤
        myDiagram.startTransaction("vacate");
        myDiagram.model.setDataProperty(step.data, "fill", "#4fba4f");
        myDiagram.commitTransaction("vacate");
    }
}
/**
 * 查找步骤之间的连线
 * @param steps
 * @returns {Array}
 */
function findFinishedLinks(steps) {
    var arrLinks = [];
    if (!steps || steps.length < 1) return arrLinks;
    var currStep = steps[0];// 【开始】步骤
    for (var i = 0; i < steps.length; i++) {
        var step = steps[i];
        // 连线
        var link = currStep.findLinksBetween(step).first();
        if (!link) continue;
        arrLinks.push(link);
        currStep = step;
    }
    return arrLinks;
}
/**
 * 循环闪烁“已完成”步骤之间的连线
 * @param links
 */
function loopLinks(links) {
    setTimeout(function () {
        showFinishedLinks(links);// “已完成”连线
        loopLinks(links);
    }, 300);
}
/**
 *
 * 查找【开始】节点
 * @param {} steps
 * @returns {}
 */
function findStartStep() {
    var startStep = null;
    myDiagram.nodes.each(function(step) {

        if (step.data.hasOwnProperty('type') && step.data.type == 'begin') {
            startStep = step;
            return false;
        }
    });
    return startStep;
}
/**
 * 循环闪烁“待处理”步骤
 * @param node
 */
function loopRunningNode(node) {
    setTimeout(function () {
        showRunningNode(node);
        loopRunningNode(node);
    }, 200);
}
/**
 * 高亮“待处理”步骤
 * @param node
 */
function showRunningNode(node) {
    if (!node) return;

    myDiagram.startTransaction("vacate");
    myDiagram.model.setDataProperty(node.data, "fill", (node.data.fill === "#ff9001") ? "#ffB001" : "#ff9001");
    myDiagram.commitTransaction("vacate");

    // 边框加上流水动画
    var shape = node.findObject("PIPE");
    var off = shape.strokeDashOffset - 2;
    shape.strokeDashOffset = (off <= 0) ? 20 : off;
}
/**
 * 获取最后一个步骤（【待处理】或【结束】）
 * @param stepKeys
 * @param steps
 * @param isCompleted
 * @returns {*}
 */
function findLastStep(stepKeys, steps, isCompleted) {
    var lastStep;
    if (!isCompleted) {
        // 获取“待处理”步骤
        var lastKey = stepKeys[stepKeys.length - 1];
        var step = this.myDiagram.findNodeForKey(lastKey);
        myDiagram.startTransaction("vacate");
        myDiagram.model.setDataProperty(step.data, "stroke", "red");
        myDiagram.model.setDataProperty(step.data, "strokeWidth", 2);
        myDiagram.model.setDataProperty(step.data, "strokeDashArray", [10, 10]);
        myDiagram.commitTransaction("vacate");

        //【开始】-> 【已完成】（N个）->【待处理】
        lastStep = step;
    } else {
        // 用最后一根连线获取【结束】步骤
        var lastFinishedStep = steps[steps.length - 1];

        var it = lastFinishedStep.findLinksOutOf();
        var lastLink = it.first();
        var endStep = lastLink.toNode;

        //【开始】-> 【已完成】（N个）->【结束】
        lastStep = endStep;
    }

    return lastStep;
}
/**
 * 高亮所有“已完成”步骤的连线
 * @param links
 */
function showFinishedLinks(links) {
    if (!links) return;

    for (var i = 0; i < links.length; i++) {
        // 连线
        var link = links[i];
        myDiagram.startTransaction("vacate");
        myDiagram.model.setDataProperty(link.data, "stroke", (link.data.stroke === "#4fba4f" ? "red" : "#4fba4f"));
        myDiagram.model.setDataProperty(link.data, "fill", (link.data.fill === "#4fba4f" ? "red" : "#4fba4f"));
        myDiagram.model.setDataProperty(link.data, "zOrder", 999);
        myDiagram.commitTransaction("vacate");

        // 置于最上层，防止被遮挡
        myDiagram.startTransaction('modified zOrder');
        myDiagram.model.setDataProperty(link.data, "zOrder", 1);
        myDiagram.commitTransaction('modified zOrder');

        //连线加上流水动画
        var shape = link.findObject("PIPE");
        var off = shape.strokeDashOffset - 2;
        shape.strokeDashOffset = (off <= 0) ? 20 : off;
    }
}

/**#######初始化图形对象########*/
function initGojs(){
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;
    myDiagram =
        $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
            {
                grid: $(go.Panel, "Grid",
                    $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
                    $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
                    $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
                    $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
                ),
                "draggingTool.dragsLink": true,
                "draggingTool.isGridSnapEnabled": true,
                "linkingTool.isUnconnectedLinkValid": true,
                "linkingTool.portGravity": 20,
                "relinkingTool.isUnconnectedLinkValid": true,
                "relinkingTool.portGravity": 20,
                "relinkingTool.fromHandleArchetype":
                    $(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "tomato", stroke: "darkred" }),
                "relinkingTool.toHandleArchetype":
                    $(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "darkred", stroke: "tomato" }),
                "linkReshapingTool.handleArchetype":
                    $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
                "rotatingTool.handleAngle": 270,
                "rotatingTool.handleDistance": 30,
                "rotatingTool.snapAngleMultiple": 15,
                "rotatingTool.snapAngleEpsilon": 15,
                "undoManager.isEnabled": true
            });
    //
    //步骤图的样式模板
    myDiagram.nodeTemplate =
        $(go.Node, "Spot",
            { locationSpot: go.Spot.Center },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            ///{ selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
            ///不需要{ resizable: true, resizeObjectName: "PANEL", resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
            ///不需要{ rotatable: true, rotateAdornmentTemplate: nodeRotateAdornmentTemplate },
            new go.Binding("angle").makeTwoWay(),
            // the main object is a Panel that surrounds a TextBlock with a Shape
            $(go.Panel, "Auto",
                { name: "PANEL" },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                $(go.Shape, "RoundedRectangle",  // default figure
                    {
                        portId: "", // the default port: if no spot on link data, use closest side
                        name: "PIPE",
                        fromLinkable: true, toLinkable: true, cursor: "pointer",
                        fill: "#7e7e7f", // 默认背景色
                        stroke: "#DDDDDD",  //去掉了边框...
                        strokeWidth: 1   //图形边框描线
                    },
                    new go.Binding("figure"),
                    new go.Binding("stroke"),
                    new go.Binding("strokeDashArray"),
                    new go.Binding("strokeWidth"),
                    new go.Binding("fill")),
                $(go.TextBlock,
                    {
                        font: "bold 11pt Helvetica, Arial, sans-serif",
                        margin: 8,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.TextBlock.WrapFit
                        ///图形双击后不允许直接修改文字,editable: true
                    },
                    new go.Binding("text").makeTwoWay()),
                {
                    toolTip: $(go.Adornment, "Auto",
                        $(go.Shape, { fill: "#FFFFCC" }),
                        $(go.TextBlock, { margin: 4 },
                            new go.Binding("text", "",  nodeInfo))
                    )
                }
            ),
            // four small named ports, one on each side:
            makePort("T", go.Spot.Top, false, true),
            makePort("L", go.Spot.Left, true, true),
            makePort("R", go.Spot.Right, true, true),
            makePort("B", go.Spot.Bottom, true, false),
            { /* handle mouse enter/leave events to show/hide the ports*/}
        );

    //连接线装饰模板
    var linkSelectionAdornmentTemplate =
        $(go.Adornment, "Link",
            $(go.Shape,
                // 声明此形状共享链接。
                { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 })  // 使用选择对象的频宽
        );
    myDiagram.linkTemplate =
        $(go.Link,  // 整个链路面板
            { selectable: true },
            { relinkableFrom: true, relinkableTo: true, reshapable: true },
            {
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5,
                toShortLength: 4
            },
            new go.Binding("layerName", "color"),
            new go.Binding("zOrder"),
            //new go.Binding("points").makeTwoWay(),
            $(go.Shape, { isPanelMain: true, stroke: "black", strokeWidth: 3 }, new go.Binding("stroke"),new go.Binding("zOrder")),    //设置连线的颜色stroke: "red"
            $(go.Shape, { isPanelMain: true, stroke: "gray", strokeWidth: 2 }),
            $(go.Shape, { isPanelMain: true, stroke: "white", strokeWidth: 1, name: "PIPE", strokeDashArray: [10, 10] }),
            $(go.Shape,
                { toArrow: "standard", stroke: null }, new go.Binding("stroke"), new go.Binding("fill"), new go.Binding("zOrder")),
            $(go.TextBlock,new go.Binding('text', 'text'))  //这个表示linkDataArray中属性为text的值，即使连线上的文字
        );
}

function makePort(name, spot, output, input) {
    // the port is basically just a small transparent square
    return go.GraphObject.make(go.Shape, "Circle",
        {
            fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
            stroke: null,
            desiredSize: new go.Size(7, 7),
            alignment: spot,  // align the port on the main Shape
            alignmentFocus: spot,  // just inside the Shape
            portId: name,  // declare this object to be a "port"
            fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
            fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
            cursor: "pointer"  // show a different cursor to indicate potential link point
        });
}
function nodeInfo(d) {
    if (!d.key) return "无key";
    if(d.type == 'decision' && d.hasOwnProperty('conf')){
        return d.conf.displayName;
    }
    return "编号：" + d.key;
}