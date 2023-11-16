//工具类
function randomSelection(obj) {     //获取obj数组中一个随机元素，如果不是数组返回自身
    return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
}

export default randomSelection;
