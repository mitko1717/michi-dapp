import moment from "moment/moment";
import Moment from "react-moment";
import React from "react";

type Duration = {
    days?: number;
    weeks?: number;
    months?: number;
};

type DateCalculatorProps = {
    duration: Duration;
};

export const DateCalculator: React.FC<DateCalculatorProps> = ({duration}) => {
    const initialDate = moment();
    let newDate = initialDate.clone();
    if (duration.days) {
        newDate = newDate.add(duration.days, "days");
    } else if (duration.weeks) {
        newDate = newDate.add(duration.weeks, "weeks");
    } else if (duration.months) {
        newDate = newDate.add(duration.months, "months");
    }
    return <Moment format="MMMM D [at] hA">{newDate}</Moment>;
};