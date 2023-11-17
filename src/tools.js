import fa_comment from "@fortawesome/fontawesome-free/svgs/solid/comment.svg";
import fa_paper_plane from "@fortawesome/fontawesome-free/svgs/solid/paper-plane.svg";
import fa_user_circle from "@fortawesome/fontawesome-free/svgs/solid/circle-user.svg";
import fa_street_view from "@fortawesome/fontawesome-free/svgs/solid/street-view.svg";
import fa_camera_retro from "@fortawesome/fontawesome-free/svgs/solid/camera-retro.svg";
import fa_info_circle from "@fortawesome/fontawesome-free/svgs/solid/circle-info.svg";
import fa_xmark from "@fortawesome/fontawesome-free/svgs/solid/xmark.svg";

import showMessage from "./message.js";     //发消息工具类

//人物导航栏类

//1.随机获取一条hitokoto.cn一言上的一句话
function showHitokoto() {
    // 增加 hitokoto.cn 的 API
    fetch("https://v1.hitokoto.cn")
        .then(response => response.json())
        .then(result => {
            // const text = `这句一言来自 <span>「${result.from}」</span>，是 <span>${result.creator}</span> 在 hitokoto.cn 投稿的。`;
            showMessage(result.hitokoto, 6000, 9);
            // setTimeout(() => {
            //     showMessage(text, 4000, 9);
            // }, 6000);
        });
}

//tools类
const tools = {
    "hitokoto": {                    //一言
        icon: fa_comment,
        callback: showHitokoto
    },
    "asteroids": {                  //小游戏
        icon: fa_paper_plane,
        callback: () => {
            if (window.Asteroids) {
                if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
                window.ASTEROIDSPLAYERS.push(new Asteroids());
            } else {
                const script = document.createElement("script");
                script.src = "https://fastly.jsdelivr.net/gh/stevenjoezhang/asteroids/asteroids.js";
                document.head.appendChild(script);
            }
        }
    },
    "switch-model": {                //切换模型
        icon: fa_user_circle,
        callback: () => {}
    },
    "switch-texture": {             //切换装扮
        icon: fa_street_view,
        callback: () => {}
    },
    "photo": {                     //拍照
        icon: fa_camera_retro,
        callback: () => {
            showMessage("照好了嘛，是不是很可爱呢？", 6000, 9);
            Live2D.captureName = "photo.png";
            Live2D.captureFrame = true;
        }
    },
    "info": {                     //个性信息
        icon: fa_info_circle,
        callback: () => {
            open("https://github.com/stevenjoezhang/live2d-widget");
        }
    },
    "quit": {                    //收起
        icon: fa_xmark,
        callback: () => {
            //设置收起时间
            localStorage.setItem("waifu-display", Date.now());
            showMessage("我先藏起来啦。", 2000, 11);
            document.getElementById("waifu").style.bottom = "-500px";
            //隐藏人物和工具栏
            setTimeout(() => {
                document.getElementById("waifu").style.display = "none";      //隐藏人物模型
                //显示用于显示人物的工具栏
                document.getElementById("waifu-toggle").classList.add("waifu-toggle-active"); 
            }, 1000);
        }
    }
};

export default tools;
