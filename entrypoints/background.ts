// import sqlite from "sqlite3"
import { getbookmarks } from "@/utils/index";

export default defineBackground(() => {
    console.log("background loaded");

    /** 上传文件 */
    const updateUpload = async (uploadUrl: string, name: string, dbfile: string, uploadDir: string, completeUrl: string) => {
        let data = await getbookmarks(dbfile);
        let str = JSON.stringify(data);
        const fileContent = new File([str], name, { type: "" });
        console.log(data);
        const formdata = new FormData();
        formdata.append("file", fileContent);
        const request = new Request(completeUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formdata
        });
        console.log(request);
        await fetch(request);
        return true;
    };


    browser.runtime.onMessage.addListener((req, _sender, sendRes) => {
        // const { action, payload } = req
        console.log(req);
        sendRes("content got!");
    });

    browser.runtime.onConnect.addListener((port) => {
        console.log(port);
        if (port.name == "updateload") {
            port.onMessage.addListener(async msg => {
                console.log(msg);
                if (msg.type == "upload") {
                    await updateUpload(msg.uploadUrl, msg.name, msg.dbfile, msg.uploadDir, msg.completeUrl);
                    port.postMessage(`${new Date(new Date().getTime())}\n收藏夹上传成功`);
                }
                else if (msg.type == "test") {
                    let books = await browser.bookmarks.getTree();
                    console.log(books?.[0]?.children?.[0]);
                }
                // console.log(a)
            });

        }
        port.onDisconnect.addListener(_msg => {
            console.log("close");
        });
    });

});



