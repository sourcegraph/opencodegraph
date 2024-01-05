
export interface Tool {
    name: string,
    description: string,
    website_url: string,
    open_source: boolean,
    hosted_saas: boolean,
    category: string,
    sub_category: string,
    image_url: string,
    detection_source: string,
    last_updated_by: string,
    last_updated_on: string
}

export interface TSF {
    repo_name: string,
    report_id: string,
    version: number,
    repo_type: string,
    timestamp: string,
    requested_by: string,
    provider: string,
    branch: string,
    detected_tools_count: number,
    tools: Array<Tool>
}

export default TSF