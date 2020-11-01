
//定义要编译的项目，你可以增加或减少数组，达到控制要编译那个项目
var projects = [ //项目数组，放的是每一个要编译的项目，
  {
    id: 1, //项目号
    compile: false, //是否编译
    name: "demo1", //项目名称，需要和文件夹名相同
    main: "./main.js" //主入文件，入口文件，按autojs目录，一般和project.json 同级
  },
  { id: 2, compile: true, name: "dy", main: "./main.js" },
  { id: 3, compile: true, name: "快捷输入", main: "./main.js" },
  { id: 4, compile: false, name: "demo", main: "./main.js" },
]

var config = {
  watch: "rerun", //watch模式的时候，是自动deploy（部署）、或 rerun（重新运行）、还是none（不操作），
  baseDir: "./work", //放置多个项目的工作目录，每一个项目独立文件夹，
  base64: false,
  projectPrefix: "", //项目编译后，项目目录的前缀，如配置为b_ 则demo项目编译后名称为b_demo ，当希望项目的源码和编译和的代码都保存在手中，就有必要配置这个
  advancedEngines: true,
  header: "header.txt",  //这个文件中放了你可以放一些声明、说明等注释内容
  base64RandomStrLength: 100,
  target: "node", // web || node
  projects: projects,
};

module.exports = config;
