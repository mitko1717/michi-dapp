import React from "react";

type Props = {
    img: string;
    title: string;
    description: string;
    action?: React.ReactNode;
}
const Placeholder: React.FC<Props> = ({img, title, description, action}) => {
    return (
        <div className="placeholder">
            <h2 className="text-white text-3xl">{title}</h2>
            <img src={img} alt={title} className="mt-6 mb-6"/>
            <p className="text-lg font-medium">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

export default Placeholder;
