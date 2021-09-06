export interface FBNode {
    id?: number;
    name: string;
    children?: Array<FBNode>;
}

export interface FBLink {
    id?: number;
    source: number;
    target: number;
}
