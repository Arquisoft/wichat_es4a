import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18next.js';
import { Badge } from 'react-bootstrap';
import { Calendar, CheckCircle } from 'lucide-react';


/** 
 * This component represents the button with the game info that appears on the user's profile.
 * Clicking on it will show the history of the game it describes.
 */
export const GameHistoryButton = ( {points, correctAnswers, totalQuestions, date, onClick, gameMode}  ) => {

    const { t } = useTranslation();

    return (
        <Button 
            variant="outline-primary" 
            className="w-100 my-2 d-flex justify-content-between align-items-center p-3 shadow-sm rounded"
            onClick={onClick}
            style={{ fontSize: '1rem', fontWeight: '500' }}
        >
            <span className="d-flex align-items-center">
                <CheckCircle size={20} className="me-2 text-success" />
                {correctAnswers} / {totalQuestions}
            </span>
            <span
                className={`d-flex align-items-center ${
                    gameMode === 'normal'
                    ? 'text-success'
                    : gameMode === 'caos'
                    ? 'text-danger'
                    : ''
                }`}
                >
                {gameMode.toUpperCase()}
            </span>
            <Badge bg="secondary" className="fs-5 text-white fw-bold p-2">
                {points} pts
            </Badge>
            <span className="d-flex align-items-center">
                <Calendar size={20} className="me-2 text-muted" />
                {date && !isNaN(new Date(date).getTime()) 
                ? new Date(date).toLocaleDateString() 
                : t('invalid-game-date')}
            </span>
        </Button>
    );
}