import showMessage from "./message.js";            //发送消息工具类
import randomSelection from "./utils.js";          //随机工具类

//模型类
class Model {
    //构造器
    constructor(config) {
        let { apiPath, cdnPath } = config;           //提取配置文件中的api或cdn路径
        let useCDN = false;
        //处理api或cdn的路径
        if (typeof cdnPath === "string") {
            useCDN = true;
            if (!cdnPath.endsWith("/")) cdnPath += "/";
        } else if (typeof apiPath === "string") {
            if (!apiPath.endsWith("/")) apiPath += "/";
        } else {
            throw "Invalid initWidget argument!";
        }
        this.useCDN = useCDN;
        this.apiPath = apiPath;
        this.cdnPath = cdnPath;
    }

    //获取模型集合
    async loadModelList() {
        const response = await fetch(`${this.cdnPath}model_list.json`);
        this.modelList = await response.json();
        console.log(this.modelList.models);     //打印模型列表
        console.log('打印模型列表')
    }

    //加载模型
    async loadModel(modelId, modelTexturesId, message) {
        localStorage.setItem("modelId", modelId);
        localStorage.setItem("modelTexturesId", modelTexturesId);
        showMessage(message, 4000, 10);
        if (this.useCDN) {               //如果使用cdn
            if (!this.modelList) await this.loadModelList();
            //随机获取一个模型id信息
            const target = randomSelection(this.modelList.models[modelId]);
            console.log(target)              //打印模型信息
            localStorage.setItem("modelTarget",target);
            loadlive2d("live2d", `${this.cdnPath}model/${target}/index.json`);
        } else {
            loadlive2d("live2d", `${this.apiPath}get/?id=${modelId}-${modelTexturesId}`);
            console.log(`Live2D 模型 ${modelId}-${modelTexturesId} 加载完成`);
        }
    }

    //换装
    async loadRandModel() {
        const modelId = localStorage.getItem("modelId"),
            modelTexturesId = localStorage.getItem("modelTexturesId");
        if (this.useCDN) {
            //如果模型列表未获取值则获取模型
            if (!this.modelList) await this.loadModelList();
            //不止一条衣服(去掉当前衣服)
            let modelArray = this.modelList.models[modelId];
            if(modelArray.length > 1){
                var nowTarget = localStorage.getItem("modelTarget");
                modelArray = modelArray.filter(item => item !== nowTarget);
            }
            const target = randomSelection(modelArray);
            console.log(target)              //打印模型信息
            loadlive2d("live2d", `${this.cdnPath}model/${target}/index.json`);
            showMessage("我的新衣服好看嘛？", 4000, 10);
        } else {
            // 可选 "rand"(随机), "switch"(顺序)
            fetch(`${this.apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`)
                .then(response => response.json())
                .then(result => {
                    if (result.textures.id === 1 && (modelTexturesId === 1 || modelTexturesId === 0)) showMessage("我还没有其他衣服呢！", 4000, 10);
                    else this.loadModel(modelId, result.textures.id, "我的新衣服好看嘛？");
                });
        }
    }

    //换模型
    async loadOtherModel() {
        let modelId = localStorage.getItem("modelId");
        if (this.useCDN) {
            if (!this.modelList) await this.loadModelList();
            const index = (++modelId >= this.modelList.models.length) ? 0 : modelId;
            //获取其他模型加载
            this.loadModel(index, 0, this.modelList.messages[index]);
        } else {
            fetch(`${this.apiPath}switch/?id=${modelId}`)
                .then(response => response.json())
                .then(result => {
                    this.loadModel(result.model.id, 0, result.model.message);
                });
        }
    }
}

export default Model;
