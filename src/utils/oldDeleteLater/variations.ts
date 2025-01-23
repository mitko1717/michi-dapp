export const checkIfPanLeftOrRight = (type: string | undefined) => {
    return type === "pan_right" || type === "pan_left";
};

export const checkIfPanUpOrDown = (type: string | undefined) => {
    return type === "pang_up" || type === "pan_down";
};