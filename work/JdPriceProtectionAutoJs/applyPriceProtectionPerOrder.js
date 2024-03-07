const { tryMUIUnlock } = require("../../common/unlock.js");
const { waitTime } = require("../../common/common.js");
const common = require("../../common/common.js");
const moment = require("../../common/moment.min.js");

/**
 * 建议使用`auto.waitFor()`和`auto.setMode()`代替该函数，因为`auto()`函数如果无障碍服务未启动会停止脚本；而`auto.waitFor()`则会在在无障碍服务启动后继续运行。
 */

auto.waitFor();

// MUI10 解锁
function unlock() {
  tryMUIUnlock();
}

var JD_NAME = "com.jingdong.app.mall";
let defaultEnterOrderClickPoint = {
  x: 720,
  y: 600,
};
let enterOrderClickPoint = defaultEnterOrderClickPoint;
//370  890
let orderItemHeight = 520; //dy -580
//将一个订单滚动出页面手指向上滑动的高度
let scrollY = -580;

function beforeInit() {
  //强制关闭同名脚本
  let currentEngine = engines.myEngine();
  console.log("currentEngine:", currentEngine);
  let runningEngines = engines.all();
  let currentSource = currentEngine.getSource();
  if (runningEngines.length > 1) {
    runningEngines.forEach((compareEngine) => {
      let compareEngineSource = compareEngine.getSource();
      if (
        currentSource.id !== compareEngineSource.id &&
        compareEngineSource === currentSource
      ) {
        compareEngine.forceStop();
      }
    });
  }

  //unlock之前必须要确保无障碍模式打开，否则unlock无法执行息屏/手势/点击等
  unlock();

  //安卓版本高于Android 9
  if (device.sdkInt > 28) {
    //等待截屏权限申请并同意
    threads.start(function () {
      //等待某一个控件的出现
      //SystemUI属于系统级的apk，位置在frameworks\base\packages\SystemUI，主要功能有：状态栏/通知/壁纸/截图
      packageName("com.android.systemui").text("立即开始").waitFor();
      text("立即开始").click();
    });
  }
  if (!requestScreenCapture()) {
    toast("请求 要开始使用录制或投射内容吗 失败");
    console.log("请求 要开始使用录制或投射内容吗 失败,脚本退出");
    exit();
  }
  sleep(1000);
  toastLog("脚本外部代码已经执行");
}

//初始化方法
function init() {
  beforeInit();

  closeJDApp();

  var options = options || {};
  // common.resetConsole();
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
function closeJDApp() {
  // eslint-disable-next-line no-undef
  openAppSetting(JD_NAME);
  //返回是否点击成功。当屏幕中并未包含该文本，或者该文本所在区域不能点击时返回 false，否则返回 true。
  waitTime(3, "等待打开应用设置页面");
  /**
   *  //NOTE：`click()` 点击。点击一个控件，前提是这个控件的 clickable 属性为 true, 注意某些TextView或者View的clickable属性为false，所以  text("结束运行").click() 写法是错误的，无法响应点击.但是click(”结束运行“)是正确的： 因为click会点击文本所在的区域，文本所在区域指的是，从文本处向其父视图寻找，直至发现一个可点击的部件为止。
   */
  // while (!click("结束运行"));
  makesureClick("结束运行", 30);
  waitTime(2, "等待点击结束运行按钮");
  click("确定");
  back();
  back();
  waitTime(1, "等待返回桌面");
}
//打开京东
function openJD(name) {
  var launchRes = launch(name);
  waitTime(5, "等待jd启动");
  return launchRes;
}

//找‘我的’
function findMyBtn() {
  console.log("exec findMyBtn");
  // let myBtn = id("xk").className("android.widget.TextView").text("我的").findOne();
  let myBtn = className("android.view.View").desc("我的").findOne(10000);
  console.log("=====》myBtn:", myBtn);
  if (!myBtn) {
    toastLog("找不到“我的”按钮");
    exit();
    return;
  }
  return myBtn;
}

function needToEnterOrder(lastOrderCreateTime) {
  let res = {
    enterItem: true,
    exit: false,
  };

  enterOrderClickPoint = defaultEnterOrderClickPoint;

  if (lastOrderCreateTime) {
    //分析是否超过了40天
    // 两个日期
    const date1 = moment(lastOrderCreateTime);
    const date2 = moment();
    // 计算两个日期之间的天数
    const diffDays = date2.diff(date1, "days");
    console.log("diffDays:", diffDays);
    if (diffDays > 40) {
      console.log("订单创建时间超过40天，不需要进入该订单,退出整个循环");
      res.exit = true;
      return res;
    }
  } else {
    //
  }

  //判断订单右上角是否存在完成， 对于已经取消的订单和广告占位 则不需要进入订单
  let viewPager = id("com.jd.lib.ordercenter.feature:id/atk").findOne(6000);
  console.log("viewPager by FullId:", viewPager);
  let recyclerViewOrderList;
  if (!viewPager) {
    viewPager = className("androidx.viewpager.widget.ViewPager")
      .scrollable(true)
      .findOne(6000);
    console.log("viewPager by className & scrollable:", viewPager);
  }
  if (viewPager) {
    viewPager.children().forEach((child) => {
      //调用## UiObject的findOne 不具备阻塞行。UiSelector的findOne方法会阻塞线程，直到找到匹配的元素。
      let target = child.findOne(
        className("androidx.recyclerview.widget.RecyclerView").scrollable(true)
      );
      if (target) {
        recyclerViewOrderList = target;
      }
    });
  }
  console.log(
    "recyclerViewOrderList find by viewPager:",
    recyclerViewOrderList
  );
  //下面的代码存在问题，不能直接使用className寻找RecyclerView,因为很多页面都有这个RecyclerView，如果当前页面
  //不是订单页面就会找到 其他页面的RecyclerView，导致后面 滚动的的时候没有在订单页面滚动
  // if (!recyclerViewOrderList) {
  //     recyclerViewOrderList = className("androidx.recyclerview.widget.RecyclerView").scrollable(true).findOne(6000)
  //     console.log("recyclerViewOrderList by className:", recyclerViewOrderList)
  // }
  if (!recyclerViewOrderList) {
    console.log(
      "找不到订单列表RecyclerView,考虑当前显示的页面不是订单列表页面，因此退出申请！"
    );
    toastLog(
      "找不到订单列表RecyclerView,考虑当前显示的页面不是订单列表页面，因此退出申请！"
    );
    res.exit = true;
    return res;
  }
  let enterOrderIndex = 0;
  //RevyclerView是一个寻乱利用ListItem的view，一般情况下页面显示4个，极少数情况下页面显示5个。
  //如果页面显示5个，则将第二个作为要进入的订单
  if (recyclerViewOrderList.children().length > 4) {
    enterOrderIndex = 1;
  }
  let nextEnterOrder = recyclerViewOrderList.children()[enterOrderIndex];
  console.log("nextEnterOrder:", nextEnterOrder);

  let oderStatusCompleteTextView;
  if (nextEnterOrder) {
    let orderCenterArea_Wz;
    nextEnterOrder.children().forEach((child) => {
      let target = child.findOne(
        className("android.widget.TextView").text("完成")
      );
      if (!target)
        target = child.findOne(
          className("android.widget.TextView").text("已完成")
        );
      //获取这个订单中心区域的控件 用于计算点击的坐标位置
      orderCenterArea_Wz = child.find(
        id("com.jd.lib.ordercenter.feature:id/wz").className(
          "android.widget.RelativeLayout"
        )
      );
      if (target) {
        oderStatusCompleteTextView = target;
      }
    });
    if (!oderStatusCompleteTextView) {
      console.log("订单右上角不存在完成，不需要进入该订单");
      res.enterItem = false;
      waitTime(1);
    } else {
      //确定 进入该订单时点击的区域 坐标。 在订单列表中，每一个订单ListItem的布局是
      //第一行：店铺名称 和订单状态
      //第二行：商品图片+ 商品标题+订单价格  其中有些订单 点击店铺名称右边的空白区域会进入 某些活动页面，所以准确的点击区域是
      //第二行的中心区域

      if (!orderCenterArea_Wz || orderCenterArea_Wz.empty()) {
        //
      } else {
        //TODO 待定
        console.log("orderCenterArea_Wz", orderCenterArea_Wz);
        enterOrderClickPoint.x = orderCenterArea_Wz[0].bounds().centerX();
        enterOrderClickPoint.y = orderCenterArea_Wz[0].bounds().centerY();
        // console.log("计算得到的点击的坐标位置==================>：", enterOrderClickPoint)
    
        // waitTime(5, "等待计算得到的点击的坐标位置")
        //如果小于400 则表示 虽然页面显示了小于等于4个订单，但是第一个订单已经快移除屏幕了，此时应该使用第二个订单的中心区域作为点击的区域
        if (enterOrderClickPoint.y < 400) {
          enterOrderClickPoint.x = orderCenterArea_Wz[1].bounds().centerX();
          enterOrderClickPoint.y = orderCenterArea_Wz[1].bounds().centerY();
        }
      }
    }
  }
  // console.log("订单状态组件oderStatusCompleteTextView:", oderStatusCompleteTextView);
  return res;
}
function applyPriceProtectionPerOrder() {
  init();
  if (!openJD(JD_NAME)) {
    toastLog("未安装京东哦!");
    return;
  }
  //因为"我的"这个TextView本身并不能点击，且他的父组件也不能点击，所以这里使用click("我的")是不行的
  //能被点击的是 "我的" 这个TextView的兄弟组件
  findMyBtn().click();
  waitTime(3, "等待我的页面加载");
  //"我的订单"这个TextView不能点击，但其父级元素可以点击
  let clickMyOrderRes = click("我的订单");
  console.log("clickMyOrderRes:", clickMyOrderRes);
  waitTime(3, "等待订单页面加载");

  let enterTimes = 0;
  let lastOrderCreateTime;
  while (true) {
    toastLog("处理尝试第" + (enterTimes + 1) + "次进入订单");
    let deduceEnterRes = needToEnterOrder(lastOrderCreateTime);
    if (deduceEnterRes.exit) {
      home();
      exit();
      return;
    } else if (deduceEnterRes.enterItem) {
      lastOrderCreateTime = enterOrder();
    } else {
      toastLog("不需要进入该订单，继续向下滚动");
    }
    enterTimes++;
    if (enterTimes > 40 || !checkJDIsInForeground()) {
      //当用户打开其他app的时候无法进入订单，所以需要退出
      exit();
      return;
    }
    waitTime(1, "等待返回订单页面");
    swipe(600, 1200, 600, 1200 + scrollY, 1000);
    waitTime(2, "等待滚动结束");
  }
  exit();
}
//## scrollUp scrollForward

function enterOrder() {
  let clickY = enterOrderClickPoint.y;
  if (clickY < 400) {
    clickY = 410;
  }

  let enterOrderClickRes = click(enterOrderClickPoint.x, clickY);

  waitTime(2, "等待进入详情订单页面");
  //稍微往下滑动一点,订单Item比较多的时候去申请可能在下面
  // id("recent_chat_list").className("AbsListView").findOne().scrollForward();
  swipe(600, 1500, 600, 800, 1000);
  let targetTextViewToApply;

  let recyclerView = id("com.jd.lib.ordercenter.feature:id/uu")
    .className("androidx.recyclerview.widget.RecyclerView")
    .findOne(6000);
  console.log("recyclerView by fullId:", recyclerView);
  if (!recyclerView) {
    recyclerView = id("uu")
      .className("androidx.recyclerview.widget.RecyclerView")
      .findOne(3000);
    console.log("recyclerView by id:", recyclerView);
    if (!recyclerView) {
      recyclerView = className("androidx.recyclerview.widget.RecyclerView")
        .scrollable(true)
        .depth(5)
        .findOne(3000);
      console.log("recyclerView  only by className:", recyclerView);
    }
  }
  console.log("最终的recyclerView:", recyclerView);

  if (recyclerView) {
    recyclerView.children().forEach((child) => {
      var target = child.findOne(
        className("android.widget.TextView").text("去申请")
      );
      if (target) {
        targetTextViewToApply = target;
      }
    });
  }
  console.log("targetTextViewToApply:", targetTextViewToApply);
  if (targetTextViewToApply) {
    enterToApply();
  } else {
    console.log("订单详情页面找不到去申请按钮");
    waitTime(2, "订单详情页面找不到去申请按钮");
  }
  waitTime(1);
  //获取订单时间
  let orderCreateTime = getOrderCreateTime();
  back();
  return orderCreateTime;
}

function getOrderCreateTime() {
  let allOrderInfoBtn = className("android.widget.TextView")
    .clickable(true)
    .text("全部订单信息")
    .findOne(3000);
  if (allOrderInfoBtn) {
    allOrderInfoBtn.click();
    waitTime(1);

    //根据这个fullId找到多个TextView,订单信息和订单创建时间是这个fullId
    let orderCreateTimeTextView_all = id("com.jd.lib.ordercenter.feature:id/xq")
      .className("android.widget.TextView")
      .find();
    let orderCreateTimeTextView;
    if (orderCreateTimeTextView_all.empty()) {
      //
    } else {
      orderCreateTimeTextView_all.forEach((item) => {
        console.log("item:", item.text());
        if (item.text().includes("-") && item.text().includes(":")) {
          orderCreateTimeTextView = item;
        }
      });
    }

    if (!orderCreateTimeTextView) {
      orderCreateTimeTextView = id("xq")
        .className("android.widget.TextView")
        .findOne(3000);
    }
    if (orderCreateTimeTextView) {
      console.log("orderCreateTimeTextView:", orderCreateTimeTextView);
      console.log(
        "getOrderCreateTime订单创建时间:",
        orderCreateTimeTextView.text()
      );
      return orderCreateTimeTextView.text();
    }
  } else {
    return getOrderCreateTimeAnotherWay();
  }
}
function getOrderCreateTimeAnotherWay() {
  let orderInfoLayout = id("com.jd.lib.ordercenter.feature:id/wf").findOne(
    3000
  );
  if (!orderInfoLayout) {
    orderInfoLayout = id("wf").findOne(6000);
    if (!orderInfoLayout) {
      orderInfoLayout = className("android.widget.LinearLayout")
        .clickable(true)
        .findOne(3000);
    }
  }
  let orderInfoExpandedBtn;
  if (orderInfoLayout) {
    let orderInfoTextView = orderInfoLayout.findOne(
      className("android.widget.TextView").textContains("订单信息")
    );
    let btn = orderInfoLayout.findOne(
      className("android.widget.TextView").clickable(true).text("展开")
    );
    if (orderInfoTextView) {
      orderInfoExpandedBtn = btn;
    }
  }
  if (orderInfoExpandedBtn) {
    orderInfoExpandedBtn.click();
    waitTime(1);
  }
  //根据这个fullId找到多个TextView,订单信息和订单创建时间是这个fullId
  let orderCreateTimeTextView_all = id("com.jd.lib.ordercenter.feature:id/xq")
    .className("android.widget.TextView")
    .find();
  let orderCreateTimeTextView;
  if (orderCreateTimeTextView_all.empty()) {
    //
  } else {
    orderCreateTimeTextView_all.forEach((item) => {
      console.log("item:", item.text());
      if (item.text().includes("-") && item.text().includes(":")) {
        orderCreateTimeTextView = item;
      }
    });
  }
  if (orderCreateTimeTextView) {
    console.log("orderCreateTimeTextView:", orderCreateTimeTextView);
    console.log(
      "getOrderCreateTimeAnotherWay 订单创建时间:",
      orderCreateTimeTextView.text()
    );
    return orderCreateTimeTextView.text();
  }
}
function enterToApply() {
  let clicckRes = makesureClick("去申请");
  if (!clicckRes) {
    return;
  }
  waitTime(3, "等待进入申请页面");
  let applyBtn;
  applyBtn = className("android.view.View").text("申请").findOne(6000);
  console.log('className("android.view.View").text("申请")', applyBtn);
  if (!applyBtn) {
    let dataListView = id("dataList0").findOne(6000);
    console.log('dataListView by id("dataList0"):', dataListView);
    if (!dataListView) {
      dataListView = className("android.widget.ListView").findOne(6000);
      console.log(
        'dataListView by className("android.widget.ListView"):',
        dataListView
      );
    }
    console.log(
      "最后一步的申请页面的dataListView(其中包含了申请按钮):",
      dataListView
    );
    if (dataListView) {
      dataListView.children().forEach((child) => {
        let target = child.findOne(className("android.view.View").text("申请"));
        if (target) {
          applyBtn = target;
          console.log(
            'applyBtn by child.findOne(className("android.view.View").text("申请")); ',
            applyBtn
          );
        }
      });
    }
  }

  //点击申请按钮
  console.log("applyBtn:", applyBtn);
  if (applyBtn) {
    applyBtn.click();
    waitTime(6, "申请按钮已经点击，等待申请结果");
  } else {
    console.log("找不到申请按钮");
  }
  waitTime(1, "");
  back();
}
function makesureClick(clickText, untilTimes = 20) {
  let times = 0;
  while (true) {
    //去申请的父组件 存在clickable=true
    let clickRes = click(clickText);
    console.log("clickRes:", clickRes, "times:", times);
    if (clickRes) {
      return true;
    }
    waitTime(1);
    times++;
    if (times > untilTimes) {
      return false;
    }
  }
}

function checkJDIsInForeground() {
  if (!device.isScreenOn()) {
    console.log("屏幕未点亮 checkJDIsInForeground return false");
    return false;
  }
  let screenView = className("android.view.View").findOne(6000);
  if (screenView) {
    //packageName: com.miui.home;
    console.log("screenView:", screenView);
    if (screenView.packageName() === JD_NAME) {
      return true;
    } else {
      toastLog("检测到当前活动应用非京东，因此退出本地价格保护申请！");
      return false;
    }
  }
  toastLog("检测到当前活动应用非京东，因此退出本地价格保护申请！");

  return false;
}
exports.applyPriceProtectionPerOrder = applyPriceProtectionPerOrder;
