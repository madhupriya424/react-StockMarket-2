import React from 'react';
import dateFns from "date-fns";

const Day = (props) => {

    const dateFormat = "dddd";
    const days = [];

    let startDate = dateFns.startOfWeek(props.currentMonth);

    for (let i = 0; i < 7; i++) {
        days.push(
            <div className="col col-center" key={i}>
                {dateFns.format(dateFns.addDays(startDate, i), dateFormat)}
            </div>
        );
    }

    return <div className="days row">{days}</div>
}

export default Day;

