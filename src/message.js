import randomSelection from "./utils.js";         //随机工具类

let messageTimer;       //消息定时器

//展示消息(内容、展示时间、优先级)
function showMessage(text, timeout, priority) {
    //如果消息为空或当前显示的消息大于目前的消息请求，则结束
    if (!text || (sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") > priority)) 
        return;
    //如果当前存在消息，则清除当前优先级低的消息
    if (messageTimer) {
        clearTimeout(messageTimer);
        messageTimer = null;
    }
    //在text中随机选择一条消息
    text = randomSelection(text);
    //设置当前消息优先级
    sessionStorage.setItem("waifu-text", priority);
    //获取消息框,填充内容并添加样式使其显示
    const tips = document.getElementById("waifu-tips");
    tips.innerHTML = text;
    tips.classList.add("waifu-tips-active");
    //设置消息定时器清楚消息显示
    messageTimer = setTimeout(() => {
        sessionStorage.removeItem("waifu-text");
        tips.classList.remove("waifu-tips-active");
    }, timeout);
}

export default showMessage;
