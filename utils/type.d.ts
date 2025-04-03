export type folderType = {
    type: "folder" | "url";
    icon?: string;
    name: string;
    url?: string;
    children?: folderType[];
};