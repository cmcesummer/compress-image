export interface IInput {
    size: number;
    type: string;
}

export interface IOutput {
    size: number;
    type: string;
    url: string;
    width: number;
    height: number;
}

export interface IItemSuccessParam {
    input: IInput;
    output: IOutput;
    pathname: string;
    saveName: string;
}

export interface ICsIMG {
    // 使用的压缩方式
    compressType: "local" | "tiny";
    // 压缩并复制到新的文件夹
    removePath?: string;
    // 是否递归
    recursion?: boolean;
    // 压缩完成一个的回调
    itemSuccess?: (opt: IItemSuccessParam) => any;
    // 全部压缩完成的回调
    allSuccess?: () => any;
}
