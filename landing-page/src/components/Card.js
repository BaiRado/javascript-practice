import React from "react";

const Card = (props) => (
    <section className={props.className}>
        <img src={props.image} alt="info" />
        <div className="card-info">
            <h3>{props.title}</h3>
            <p>{props.info}</p>
        </div>
    </section >
);

export default Card;