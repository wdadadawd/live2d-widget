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
        const response = await fetch(`http://47.120.8.186/live2d-widget/model_list.json`);
        this.modelList = await response.json();
        console.log(this.modelList.models);     //打印模型列表
    }

    //加载模型
    async loadModel(modelId, modelTargetId,modelTexturesId, message) {
        localStorage.setItem("modelId", modelId);
        localStorage.setItem("modelTexturesId", modelTexturesId);
        localStorage.setItem("modelTargetId",modelTargetId);
        showMessage(message, 4000, 10);
        if (this.useCDN) {               //如果使用cdn
            if (!this.modelList) await this.loadModelList();
            //随机获取一个模型id信息
            // const target = randomSelection(this.modelList.models[modelId]);
            // const index = (++modelTargetId >= this.modelList.models.length) ? 0 : modelId;
            const target = this.modelList.models[modelId][modelTargetId];
            localStorage.setItem("modelTarget",target);     //设置皮肤target
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
        var modelTargetId = localStorage.getItem("modelTargetId");
        if (this.useCDN) {
            //如果模型列表未获取值则获取模型
            if (!this.modelList) await this.loadModelList();
            
            let modelArray = this.modelList.models[modelId];
            if(modelArray.length > 1 && modelTargetId <= modelArray.length){   //不止一条衣服
                //获取下一个皮肤索引
                modelTargetId++;
            }else{
                showMessage("没有新衣服啦!", 4000, 10);
                modelTargetId = 0;
            }
            console.log(modelArray)
            const target = modelArray[modelTargetId];
            localStorage.setItem("modelTargetId",modelTargetId);
            localStorage.setItem("modelTarget",target);
            loadlive2d("live2d", `${this.cdnPath}model/${target}/index.json`);
            showMessage("我的新衣服好看嘛?", 4000, 10);
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
            //获取其他模型加载,默认第一套皮肤
            this.loadModel(index, 0,0, this.modelList.messages[index]);
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
