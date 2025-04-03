<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storage } from "#imports";
import { browser } from "wxt/browser";

const stroageKey = `local:preference`;

type StroageType = {
    user: string;
    iconUrl: string;
    uploadUrl: string;
    fixUploadFilename: string;
    uploadDir: string;
};

const getUrl = (u: string) => {
    const userAgent = navigator.userAgent.toLowerCase();
    console.log(userAgent);

    const edgeStr = `Microsoft/Edge`;
    const chromeStr = `Google/Chrome`;
    const vivaldiStr = `vivaldi`;
    const str = userAgent.indexOf("edg") >= 0 ? edgeStr : userAgent.indexOf("vivaldi") >= 0 ? vivaldiStr : chromeStr;
    return `file:///C:/Users/${u}/AppData/Local/${str}/User Data/Default/Favicons`;
};

const getfilename = () => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return `favorites_${year}_${month}_${day}.json`;
};

const updateFilename = async (v: boolean) => {
    if (v) {
        fixUploadFilename.value = fixUploadFilenameCache.value;
    }
    if (!fixUploadFilename.value) {
        uploadFilename.value = getfilename();
        return uploadFilename.value;
    } else {
        uploadFilename.value = `${fixUploadFilename.value}.json`;
    }
    if (v) {
        await saveLocalStorage();
    }
    return uploadFilename.value;
};

const user = ref("administrator");
const iconUrl = ref(getUrl(user.value));
const uploadUrl = ref("");
const uploadDir = ref("");
const completeUrl = ref("");
const msg = ref("当前状态");
const uploadFilename = ref(getfilename());
const fixUploadFilenameCache = ref("");
const fixUploadFilename = ref("");

const getCompleteUrl = () => {
    const url = uploadUrl.value[uploadUrl.value.length - 1] == "/" ? uploadUrl.value : uploadUrl.value + "/";
    return `${url}upload?folder=${encodeURI(uploadDir.value)}&forcefilename=${encodeURI(uploadFilename.value)}`;
};

const saveLocalStorage = async () => {
    await updateFilename(false);
    completeUrl.value = getCompleteUrl();
    await storage.setMeta<StroageType>(stroageKey, {
        user: user.value,
        iconUrl: iconUrl.value,
        uploadUrl: uploadUrl.value,
        fixUploadFilename: fixUploadFilename.value,
        uploadDir: uploadDir.value
    });
    return;
};

const loadLocalStorage = async () => {
    let s = await storage.getMeta<StroageType>(stroageKey);
    console.log(s);
    if (s.user != undefined) {
        user.value = s.user;
    }
    if (s.iconUrl != undefined) {
        iconUrl.value = s.iconUrl;
    }
    if (s.uploadUrl != undefined) {
        uploadUrl.value = s.uploadUrl;
    }
    if (s.uploadDir != undefined) {
        uploadDir.value = s.uploadDir;
    }
    if (s.fixUploadFilename != undefined) {
        fixUploadFilenameCache.value = s.fixUploadFilename;
        fixUploadFilename.value = s.fixUploadFilename;
    }

    await updateFilename(false);
    completeUrl.value = getCompleteUrl();
    return;
};

onMounted(async () => {
    await loadLocalStorage();
    return;
});

const port = browser.runtime.connect({ name: "updateload" });

const testUser = async () => {
    let url = getUrl(user.value);

    try {
        await fetch(url);
        msg.value = `用户名:${user.value}的图标路径存在`;
    } catch {
        msg.value = `用户名:${user.value}的图标路径不存在!!!`;
    }
};

const userUpdateIconUrl = async () => {
    let url = getUrl(user.value);
    iconUrl.value = url;
    await saveLocalStorage();
    msg.value = `图片路径更新成功\n${url}`;
};

const updateUpload = async () => {
    msg.value = "开始执行程序!";
    let name = await updateFilename(false);
    msg.value = `${name} 文件已经生成,开始上传!`;
    port.postMessage({ type: "upload", uploadUrl: uploadUrl.value, name: name, dbfile: iconUrl.value, uploadDir: uploadDir.value, completeUrl: completeUrl.value });
    msg.value = `${name} 文件正在上传!`;
};

// const ontest = () => {
//   port.postMessage({ type: "test" })
// }

port.onMessage.addListener((m) => {
    msg.value = m;
});
</script>

<template>
    <div>
        <div>用户名:</div>
        <input type="text" v-model="user" />
    </div>
    <div>
        <div>图标db路径:</div>
        <input type="text" v-model="iconUrl" />
    </div>
    <div>
        <button @click="testUser">用户名测试</button>
    </div>
    <div>
        <button @click="userUpdateIconUrl">用户名更新图标路径</button>
    </div>
    <div>上传文件名称:</div>
    <div>
        <input type="text" v-model="fixUploadFilenameCache" @change="updateFilename(true)" />
    </div>
    <div>{{ uploadFilename }}</div>
    <div>
        <div>上传外网路径:</div>
        <input type="text" v-model="uploadUrl" @change="saveLocalStorage" />
    </div>

    <div>
        <div>上传外网文件夹:</div>
        <input type="text" v-model="uploadDir" @change="saveLocalStorage" />
    </div>
    <div>url全拼</div>
    <div>{{ completeUrl }}</div>
    <div>
        <button @click="updateUpload">更新上传</button>
        <!-- <button @click="ontest">测试</button> -->
    </div>
    <div>{{ msg }}</div>
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}

div {
    white-space: pre-line;
    margin: 10px;
}
</style>
