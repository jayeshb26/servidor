export class BaseListResponse {
    current_page: number;
    next_page_url: string;
    data: Array<any>;
    code: number;
    msg: string;
}