import Model from "./model.js";                 //模型类
import showMessage from "./message.js";         //发送消息类
import randomSelection from "./utils.js";       //筛选工具类
import tools from "./tools.js";             

// console.log('index.js被加载')
//加载部件
function loadWidget(config) {
    //创建模型类
    const model = new Model(config);
    localStorage.removeItem("waifu-display");      //清除人物不显示信息
    sessionStorage.removeItem("waifu-text");       //清除消息优先级信息
    //添加人物模型waifu、工具栏waifu-tool、消息框waifu-tips
    document.body.insertAdjacentHTML("beforeend", `<div id="waifu">
            <div id="waifu-tips"></div>
            <canvas id="live2d" width="800" height="800"></canvas>
            <div id="waifu-tool"></div>
        </div>`);
    // https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
    setTimeout(() => {       //设置初始人物位置
        document.getElementById("waifu").style.bottom = 0;
    }, 0);

    //1.立即执行函数注册工具栏
    (function registerTools() {
        //设置换装和换人物工具的回调函数
        tools["switch-model"].callback = () => model.loadOtherModel();     //换模型
        tools["switch-texture"].callback = () => model.loadRandModel();   //换装
        //把工具类转换为数组
        if (!Array.isArray(config.tools)) {
            config.tools = Object.keys(tools);
        }
        //设置工具的回调函数和图标
        for (let tool of config.tools) {
            if (tools[tool]) {
                const { icon, callback } = tools[tool];
                document.getElementById("waifu-tool").insertAdjacentHTML("beforeend", `<span id="waifu-tool-${tool}">${icon}</span>`);
                document.getElementById(`waifu-tool-${tool}`).addEventListener("click", callback);
            }
        }
    })();

    //2.获取欢迎语句
    function welcomeMessage(time) {
        if (location.pathname === "/") { // 如果是主页
            for (let { hour, text } of time) {
                const now = new Date(),
                    after = hour.split("-")[0],
                    before = hour.split("-")[1] || after;
                if (after <= now.getHours() && now.getHours() <= before) {
                    return text;
                }
            }
        }
        const text = `欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
        let from;
        if (document.referrer !== "") {
            const referrer = new URL(document.referrer),
                domain = referrer.hostname.split(".")[1];
            const domains = {
                "baidu": "百度",
                "so": "360搜索",
                "google": "谷歌搜索"
            };
            if (location.hostname === referrer.hostname) return text;

            if (domain in domains) from = domains[domain];
            else from = referrer.hostname;
            return `Hello！来自 <span>${from}</span> 的朋友<br>${text}`;
        }
        return text;
    }

    //3.注册用户监听
    function registerEventListener(result) {
        // 检测用户活动状态，并在空闲时显示消息
        let userAction = false,
            userActionTimer,
            messageArray = result.message.default,         //随机获取消息
            lastHoverElement;
        window.addEventListener("mousemove", () => userAction = true);
        window.addEventListener("keydown", () => userAction = true);
        //设置每秒检测用户状态
        setInterval(() => {
            if (userAction) {     //用户在活动清除定时器
                userAction = false;
                clearInterval(userActionTimer);
                userActionTimer = null;
            } else if (!userActionTimer) { 
                userActionTimer = setInterval(() => {     //用户不在活动激活定时器
                    showMessage(messageArray, 6000, 9);
                }, 20000);
            }
        }, 1000);
        showMessage(welcomeMessage(result.time), 7000, 11);
        window.addEventListener("mouseover", event => {
            for (let { selector, text } of result.mouseover) {
                if (!event.target.closest(selector)) continue;
                if (lastHoverElement === selector) return;
                lastHoverElement = selector;
                text = randomSelection(text);
                text = text.replace("{text}", event.target.innerText);
                showMessage(text, 4000, 8);
                return;
            }
        });
        window.addEventListener("click", event => {
            for (let { selector, text } of result.click) {
                if (!event.target.closest(selector)) continue;
                text = randomSelection(text);
                text = text.replace("{text}", event.target.innerText);
                showMessage(text, 4000, 8);
                return;
            }
        });
        result.seasons.forEach(({ date, text }) => {
            const now = new Date(),
                after = date.split("-")[0],
                before = date.split("-")[1] || after;
            if ((after.split("/")[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split("/")[0]) && (after.split("/")[1] <= now.getDate() && now.getDate() <= before.split("/")[1])) {
                text = randomSelection(text);
                text = text.replace("{year}", now.getFullYear());
                messageArray.push(text);
            }
        });

        const devtools = () => { };
        console.log("%c", devtools);
        devtools.toString = () => {
            showMessage(result.message.console, 6000, 9);
        };
        window.addEventListener("copy", () => {
            showMessage(result.message.copy, 6000, 9);
        });
        window.addEventListener("visibilitychange", () => {
            if (!document.hidden) showMessage(result.message.visibilitychange, 6000, 9);
        });
    }

    //执行加载模型
    (function initModel() {
        //获取本地模型信息
        let modelId = localStorage.getItem("modelId"),
            modelTexturesId = localStorage.getItem("modelTexturesId");
        if (modelId === null) {
            // 首次访问加载 指定模型 的 指定材质
            modelId = 1; // 模型 ID
            modelTexturesId = 53; // 材质 ID
        }
        //加载模型
        model.loadModel(modelId, modelTexturesId);
        fetch(config.waifuPath)
            .then(response => response.json())
            .then(registerEventListener);               //创建监听
    })();
}

//加载组件
function initWidget(config, apiPath) {
    if (typeof config === "string") {
        config = {
            waifuPath: config,
            apiPath
        };
    }
    //添加用于显示人物的工具栏标签并添加单击事件响应
    document.body.insertAdjacentHTML("beforeend", `<div id="waifu-toggle">
            <span>税海学堂</span>
        </div>`);
    const toggle = document.getElementById("waifu-toggle");
    toggle.addEventListener("click", () => {           //添加事件响应
        toggle.classList.remove("waifu-toggle-active");
        if (toggle.getAttribute("first-time")) {            //是否未为加载，重新加载
            loadWidget(config);
            toggle.removeAttribute("first-time");
        } else {                                            //加载了但被隐藏了，直接显示
            localStorage.removeItem("waifu-display");
            document.getElementById("waifu").style.display = "";
            setTimeout(() => {
                document.getElementById("waifu").style.bottom = 0;
            }, 0);
        }
    });
    //判断助手是否被隐藏了，判断人物的上一次关闭是否小于1天时间，否则直接重新加载
    if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
        toggle.setAttribute("first-time", true);       //标记为未加载
        setTimeout(() => {
            toggle.classList.add("waifu-toggle-active");    //显示用于显示人物的工具栏
        }, 0);
    } else {
        //使用配置加载组件
        loadWidget(config);
    }
}

export default initWidget;
