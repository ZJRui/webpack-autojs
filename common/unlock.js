//console.show()

const { waitTime } = require("./common");
const { packageName } = require("./douyinUtils");

//定义屏幕类
function _Screen() {}

_Screen.prototype.getxy = function (num) {
  let arr = Array();
  arr[1] = [250, 1335];
  arr[2] = [540, 1335];
  arr[3] = [830, 1335];

  arr[4] = [250, 1625];
  arr[5] = [540, 1625];
  arr[6] = [830, 1625];

  arr[7] = [250, 1915];
  arr[8] = [540, 1915];
  arr[9] = [830, 1915];

  return arr[num];
};

_Screen.prototype.unlock = function () {
  // console.log("checking Screen")
  if (!device.isScreenOn()) {
    //console.log("Screen is off, going to unlock")
    //唤醒手机
    device.wakeUp();
    sleep(500);
    //下拉状态栏
    swipe(500, 10, 500, 1000, 200);
    sleep(300);
    //点击时间
    click(100, 120);
    //swipe(250,1335,540,1335,1000)
    sleep(200);
    //滑动手势进行解锁
    gesture(
      1000,
      this.getxy(2),
      this.getxy(4),
      this.getxy(5),
      this.getxy(3),
      this.getxy(6),
      this.getxy(8)
    );
    sleep(1000);
    home();
  } else {
    //下拉状态栏
    swipe(500, 10, 500, 1000, 200);
    sleep(300);
    //点击时间
    click(100, 120);
    //swipe(250,1335,540,1335,1000)
    sleep(300);
    var c = className("TextView").text("闹钟2").find();
    console.log(c);

    //滑动手势进行解锁
    gesture(
      1000,
      this.getxy(2),
      this.getxy(4),
      this.getxy(5),
      this.getxy(3),
      this.getxy(6),
      this.getxy(8)
    );
    sleep(1000);
    home();
  }
};

function tryMUIUnlock() {
  if (!device.isScreenOn()) {
    //设备息屏
    device.wakeUp();
    waitTime(1);
  }
  //滑动手势进行解锁
  let gestureTimes = 0;
  while (gestureTimes < 5) {
    gesture(500, [600, 100], [600, 2200]);
    gestureTimes++;
  }
  //下拉滑动状态栏
  // swipe(600, 100, 600, 2200, 1000);
  waitTime(1);
  //点击时间
  click(130, 230);
  waitTime(1, "等待点击时间");
  //给下面的返回值定义一个变量名称 alarmClockTextView
  let systemLock = false;
  let alarmClockTextView = className("TextView").text("闹钟").find();
  //判断是否存在闹钟
  if (alarmClockTextView.length > 0) {
    systemLock = true;
  }
  if (!systemLock) {
    //解锁 密码
    desc(2).findOne().click();
    desc(8).findOne().click();
    desc(7).findOne().click();
    desc(9).findOne().click();
    desc(3).findOne().click();
    desc(1).findOne().click();
    //等待解锁完成,等待屏幕上出现符合条件的控件；在满足该条件的控件出现之前，该函数会一直保持阻塞。
    waitTime(1);
    //解锁完成之后不一定是home首页，这里需要判断一下
    let onDesktop = false;
    let i = 0;
    while (i < 5) {
      home();
      waitTime(3, "执行home()等待返回主页");
      onDesktop = checkOnDesktop();
      if (onDesktop) {
        console.log("解锁完成,检测到处于桌面");
        break;
      } else {
        //
      }
      i++;
    }

    if (onDesktop) {
      //判断首页的设置应用是否存在
      toastLog("检测到位于桌面，解锁完成");
      console.log("检测到位于桌面，解锁完成");
    } else {
      //判断首页的设置应用是否存在
      toastLog("没有检测到位于桌面，默认解锁完成");
      console.log("没有检测到位于桌面，默认解锁完成");
    }
    //返回主页
    home();
  } else {
    toastLog("无需解锁");
  }
}
/**
 * 检查是否处于桌面
 */
function checkOnDesktop() {
  let settingTextView = className("android.widget.TextView")
    .packageName("com.miui.home")
    .text("设置")
    .findOne(6000);
  if (settingTextView) {
    return true;
  }
  settingTextView = className("android.widget.TextView")
    .packageName("com.miui.home")
    .text("应用商店")
    .findOne(6000);
  if (settingTextView) {
    return true;
  }
  settingTextView = className("android.widget.TextView")
    .packageName("com.miui.home")
    .text("QQ邮箱")
    .findOne(6000);
  if (settingTextView) {
    return true;
  }
  settingTextView = className("android.widget.TextView")
    .packageName("com.miui.home")
    .text("交通银行")
    .findOne(6000);
  if (settingTextView) {
    return true;
  }
  settingTextView = className("android.widget.TextView")
    .packageName("com.miui.home")
    .text("招商银行")
    .findOne(6000);
  if (settingTextView) {
    return true;
  }

  settingTextView = className("android.widget.TextView")
    .packageName("com.miui.home")
    .text("随申办市民云")
    .findOne(6000);
  if (settingTextView) {
    return true;
  }
  settingTextView = className("android.widget.TextView")
    .packageName("com.miui.home")
    .text("抖音")
    .findOne(6000);
  if (settingTextView) {
    return true;
  }

  return false;
}

//setTimeout(function(){p.unlock()},3000)

module.exports = _Screen;
module.exports.tryMUIUnlock = tryMUIUnlock;
