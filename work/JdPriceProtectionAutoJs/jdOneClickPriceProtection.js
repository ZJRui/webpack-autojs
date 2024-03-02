
const libs = require("../../common/lib.js");
const { waitTime } = require("../../common/common.js");
const common = require("../../common/common.js");
const { applyPriceProtectionPerOrder } = require("./applyPriceProtectionPerOrder.js");
const { tryMUIUnlock } = require("../../common/unlock.js");





/**
 * 建议使用`auto.waitFor()`和`auto.setMode()`代替该函数，因为`auto()`函数如果无障碍服务未启动会停止脚本；而`auto.waitFor()`则会在在无障碍服务启动后继续运行。
 */
auto.waitFor()

var JD_NAME = "com.jingdong.app.mall"

var myPoint = {
    x: 972,
    y: 2272
}

var customerServicePoint = {
    x: 168,
    y: 1610
}
var priceProtectionPoint = {
    x: 356,
    y: 575
}

function closeJDApp() {
    // eslint-disable-next-line no-undef
    openAppSetting(JD_NAME);
    //返回是否点击成功。当屏幕中并未包含该文本，或者该文本所在区域不能点击时返回 false，否则返回 true。
    waitTime(3, "等待打开应用设置页面")
    /**
     *  //NOTE：`click()` 点击。点击一个控件，前提是这个控件的 clickable 属性为 true, 注意某些TextView或者View的clickable属性为false，所以  text("结束运行").click() 写法是错误的，无法响应点击.但是click(”结束运行“)是正确的： 因为click会点击文本所在的区域，文本所在区域指的是，从文本处向其父视图寻找，直至发现一个可点击的部件为止。
     */
    // while (!click("结束运行"));
    makesureClick("结束运行", 30)
    waitTime(2, "等待点击结束运行按钮")
    click("确定")
    back();
    back();
    waitTime(1, "等待返回桌面")

}
function makesureClick(clickText, untilTimes = 20) {
    let times = 0;
    while (true) {
        //去申请的父组件 存在clickable=true
        let clickRes = click(clickText)
        console.log("clickRes:", clickRes, "times:", times)
        if (clickRes) {
            return true
        }
        times++;
        if (times > untilTimes) {
            return false;
        }
    }
}


// MUI10 解锁
function unlock() {
    tryMUIUnlock();
}
function beforeInit() {


    //强制关闭同名脚本
    let currentEngine = engines.myEngine();
    console.log("currentEngine:", currentEngine)
    let runningEngines = engines.all();
    let currentSource = currentEngine.getSource();
    if (runningEngines.length > 1) {
        runningEngines.forEach(compareEngine => {
            let compareEngineSource = compareEngine.getSource();
            if (currentSource.id !== compareEngineSource.id && compareEngineSource === currentSource) {
                compareEngine.forceStop()
            }
        })
    }


    //unlock之前必须要确保无障碍模式打开，否则unlock无法执行息屏/手势/点击等
    unlock();

    //安卓版本高于Android 9
    if (device.sdkInt > 28) {
        //等待截屏权限申请并同意
        threads.start(function () {
            //等待某一个控件的出现
            //SystemUI属于系统级的apk，位置在frameworks\base\packages\SystemUI，主要功能有：状态栏/通知/壁纸/截图
            packageName('com.android.systemui').text('立即开始').waitFor();
            text('立即开始').click();
        });
    }
    if (!requestScreenCapture()) {
        toast("请求 要开始使用录制或投射内容吗 失败");
        console.log("请求 要开始使用录制或投射内容吗 失败,脚本退出")
        exit();

    }
    sleep(1000)
    toastLog("脚本外部代码已经执行")
}

//初始化方法
function init() {

    beforeInit();
    closeJDApp();

    var options = options || {};
    common.resetConsole();
    common.init(options);
    /**
     * ## events.observeKey() 启用按键监听，例如音量键、Home 键。按键监听使用无障碍服务实现，如果无障碍服务未启用会抛出异常并提示开启。
     * 只有这个函数成功执行后, `onKeyDown`, `onKeyUp`等按键事件的监听才有效。该函数在安卓 4.3 以上才能使用。
     */
    events.observeKey();
    events.on("key", function (keyCode, event) {
        if (keyCode == keys.volume_up) {
            toastLog("音量上键按下,结束脚本");
            exit();
        }
    });
}

//打开京东
function openJD(name) {
    var launchRes = launch(name);
    waitTime(5, "等待jd启动")
    return launchRes;
}
//弹框
function myAlert(val) {
    alert('温馨提示', val);
}
//找‘我的’
function findMyBtn() {
    console.log("exec findMyBtn")
    // let myBtn = id("xk").className("android.widget.TextView").text("我的").findOne();
    let myBtn = className("android.view.View").desc("我的").findOne(10000);
    console.log("=====》myBtn:", myBtn)
    if (!myBtn) {
        toastLog('找不到“我的”按钮');
        exit();
        return;
    }
    return myBtn;
}
//循环滑动函数
function mySwipe(num, time) {
    var xpi = device.width / 2;
    var ypi = device.height * 2 / 3;
    var ypi2 = 200;
    for (var i = 0; i <= num; i++) {
        swipe(xpi, ypi, xpi, ypi2, 800);
        sleep(time);
    }
}
function clickCustomerService() {
    return makesureClick("客户服务")
}

function clickPriceProtection() {
    let priceProtectionBtn = className("android.view.View").desc("价格保护").findOne(10000);
    if (!priceProtectionBtn) {
        return false;
    }
    console.log("===>priceProtectionBtn", priceProtectionBtn)
    priceProtectionBtn.click();
    return true;
}

function checkClickRes(clickRes, btnName) {
    if (!clickRes) {
        toastLog(btnName + '按钮不存在，所以不可点击');
        exit();
        return;
    }
}
function doOneClickPriceProtection() {
    let oneClickPriceProtectionBtn = className("android.view.View").text('一键价保').findOne(6000);
    if (!oneClickPriceProtectionBtn) {
        return false;
    }
    oneClickPriceProtectionBtn.click();
    return true;
}
function needToWait() {
    //id:one-btn-dis
    let oneBtnDis = id("one-btn-dis").findOne(6000);
    //判断 clickable 和text "后在使用"
    console.log("====>oneBtnDis", oneBtnDis)
    if (oneBtnDis) {
        return true;
    }
    //如果根据id找不到，然后再根据文字查找一下
    let findRes = false;
    className("android.view.View").find().forEach(function (view) {
        //findByText : 返回 [UiCollection](#uicollection), 即便找不到也会返回一个空对象{}，所以不用判断是否为空
        let byTextTargetBtn = view.parent().findByText("后再使用一键价保功能")
        /**
         * 01:22:08.114/D: ====>byTextTargetBtn [com.stardust.automator.UiObject@177f6b; boundsInParent: Rect(16, 6 - 377, 47); boundsInScreen: Rect(44, 2069 - 1036, 2182); packageName: com.jingdong.app.mall; className: android.view.View; text: 请在7分钟59秒后再使用一键价保功能; contentDescription: null; viewId: one-btn-dis; checkable: false; checked: false; focusable: false; focused: false; selected: false; clickable: false; longClickable: false; enabled: true; password: false; scrollable: false; [ACTION_NEXT_HTML_ELEMENT, ACTION_PREVIOUS_HTML_ELEMENT, ACTION_SHOW_ON_SCREEN, ACTION_CONTEXT_CLICK, ACTION_NEXT_AT_MOVEMENT_GRANULARITY, ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY, ACTION_ACCESSIBILITY_FOCUS]]
         */
        console.log("====>byTextTargetBtn", byTextTargetBtn)
        if (byTextTargetBtn.length > 0) {
            findRes = true;
        }
    });
    if (findRes) {
        return true;
    }
    return false

}
function isNumberFollowedByYuan(price) {
    price = price.replace(/\s/g, '');
    // 定义匹配格式的正则表达式
    const regex = /^\d+(\.\d+)?元$/;
    // 使用正则表达式进行匹配
    return regex.test(price);
}

function getPriceProtectionRefund() {
    let findRes = "";
    className("android.view.View").find().forEach(function (view) {
        //findByText : 返回 [UiCollection](#uicollection), 即便找不到也会返回一个空对象{}，所以不用判断是否为空
        let byTextTargetBtn = view.parent().findByText("元")
        /**
         * 01:22:08.114/D: ====>byTextTargetBtn [com.stardust.automator.UiObject@177f6b; boundsInParent: Rect(16, 6 - 377, 47); boundsInScreen: Rect(44, 2069 - 1036, 2182); packageName: com.jingdong.app.mall; className: android.view.View; text: 请在7分钟59秒后再使用一键价保功能; contentDescription: null; viewId: one-btn-dis; checkable: false; checked: false; focusable: false; focused: false; selected: false; clickable: false; longClickable: false; enabled: true; password: false; scrollable: false; [ACTION_NEXT_HTML_ELEMENT, ACTION_PREVIOUS_HTML_ELEMENT, ACTION_SHOW_ON_SCREEN, ACTION_CONTEXT_CLICK, ACTION_NEXT_AT_MOVEMENT_GRANULARITY, ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY, ACTION_ACCESSIBILITY_FOCUS]]
         */
        console.log("====>byTextTargetBtn", byTextTargetBtn)
        if (byTextTargetBtn.length > 0) {
            // view的文字必须是 2.3元这种格式。不能含有其他文字
            let priceStr = byTextTargetBtn[0].text();
            if (isNumberFollowedByYuan(priceStr)) {
                findRes = priceStr;
                console.log("申请到的价保价格：", findRes)
            }

        }
    });

    return findRes;
}

function oneClickPriceProtection() {
    init();
    if (!openJD(JD_NAME)) {
        myAlert('未安装京东哦!');
        return;
    }
    toastLog("京东启动成功")
    //找到‘我的’
    let myBtn = findMyBtn();
    myBtn.click();
    //点击我的
    // click(myPoint.x, myPoint.y)
    waitTime(3, "我的页面 加载")

    //客户服务
    let clickRes = clickCustomerService()
    checkClickRes(clickRes, "客户服务");
    clickRes = clickPriceProtection();
    checkClickRes(clickRes, "价格保护");
    //一键价保 或者 检测是否需要等待价保

    //确认是可以一键价保 还是需要等待指定时间后价保
    let wait = needToWait()
    if (wait) {
        //等待价保
        toastLog("需要等待价保");

        exit();
        return;
    }
    doOneClickPriceProtection();
    checkClickRes(clickRes, "一键价保");
    //等待价保计算结果
    waitTime(6, "正在价保，请等待结果")
    //文字提示
    let failedPromptMsgView = className("android.view.View").text("您购买的时候已是较划算的价格，当前无差价").findOne(6000)
    console.log("===>failedPromptMsgView", failedPromptMsgView)
    if (failedPromptMsgView) {
        //价保失败
        let iKnowBtn = className("android.view.View").text("我知道了").findOne(6000);
        if (iKnowBtn) {
            iKnowBtn.click();
        }
        //点击按钮我知道了
        toastLog("您购买的时候已是较划算的价格，当前无差价");

        exit();
        return;
    } else {
        //价保成功
        let priceProtectionSuccessTipText = className("android.view.View").text("恭喜您价保成功").findOne()
        if (priceProtectionSuccessTipText) {
            let priceProtectionRefund = getPriceProtectionRefund()
            toastLog("恭喜您价保成功,", priceProtectionRefund);

        }
        //价保成功或者重复价保的时候会提您每天最多申请8次 和我知道了按钮
        let iKnowBtn = className("android.view.View").textContains("我知道").findOne(6000);
        if (iKnowBtn) {
            iKnowBtn.click();
        }
        exit();
    }
}

// oneClickPriceProtection();

module.exports.oneClickPriceProtection = oneClickPriceProtection;



