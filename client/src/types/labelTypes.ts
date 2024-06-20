export type LabelColor = {
    id: string;
    color: string;
    text: string;
    color_text: string;
}

export type LeadLabel = {
    id: string;
    color: string;
    text: string;
    color_text?: string;
    user_id: string;
    label_colors: LabelColor
};