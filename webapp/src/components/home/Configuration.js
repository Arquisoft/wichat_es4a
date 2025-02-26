import React, { useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoXCircle } from "react-icons/go";
import { useTranslation } from "react-i18next";

const Configuration = ({ onClose }) => {
  const [questions, setQuestions] = useState(30);
  const [time, setTime] = useState(120);

  const { t } = useTranslation();

  const handleClose = () => {
    onClose();  
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg text-center position-relative" style={{ width: "325px" }}>
      <GoXCircle 
        onClick={handleClose} 
        style={{
          position: 'absolute', 
          top: '10px',           
          left: '10px',          
          color: 'red',          
          fontSize: '30px',      
          cursor: 'pointer'     
        }} 
      />
        <h2 className="mb-3">{t("title-configuration")}</h2>
        <div className="mb-3 d-flex align-items-center justify-content-between">
          <label className="me-2">{t("numberQuestions-configuration")}</label>
          <Dropdown onSelect={(value) => setQuestions(Number(value))}>
            <Dropdown.Toggle variant="light">{questions}</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey={10}>10</Dropdown.Item>
              <Dropdown.Item eventKey={20}>20</Dropdown.Item>
              <Dropdown.Item eventKey={30}>30</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="mb-3 d-flex align-items-center justify-content-between">
          <label className="me-2">{t("time-configuration")}</label>
          <Dropdown onSelect={(value) => setTime(Number(value))}>
            <Dropdown.Toggle variant="light">{time}s</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey={60}>60s</Dropdown.Item>
              <Dropdown.Item eventKey={120}>120s</Dropdown.Item>
              <Dropdown.Item eventKey={180}>180s</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="mb-3">
          <label className="d-block">Topics</label>
          <div className="d-flex flex-wrap justify-content-center gap-2">
          <Button className="px-3 py-1 text-white" style={{ backgroundColor: "purple", border: "none", fontSize: "0.8rem" }}>{t("history-configuration")}</Button>
            <Button className="px-3 py-1 text-white" style={{ backgroundColor: "green", border: "none", fontSize: "0.8rem" }}>{t("science-configuration")}</Button>
            <Button className="px-3 py-1 text-white" style={{ backgroundColor: "red", border: "none", fontSize: "0.8rem" }}>{t("art-configuration")}</Button>
            <Button className="px-3 py-1 text-white" style={{ backgroundColor: "orange", border: "none", fontSize: "0.8rem" }}>{t("sport-configuration")}</Button>
            <Button className="px-3 py-1 text-white" style={{ backgroundColor: "blue", border: "none", fontSize: "0.8rem" }}>{t("geography-configuration")}</Button>
          </div>
        </div>
        <Button variant="primary" className="w-100">{t("play-configuration")}</Button>
      </div>
    </div>
  );
};

export default Configuration;
